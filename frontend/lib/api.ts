/**
 * API Client Module for HarvestAlert MVP
 * 
 * Handles all communication with the backend API including:
 * - Error handling (network, timeout, HTTP errors)
 * - 5-second timeout for all requests
 * - Type-safe request/response handling
 * - Browser caching with localStorage (bonus feature)
 * 
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 17.1, 17.2
 */

import {
  Region,
  ClimateData,
  RiskPrediction,
  PredictParams,
  ApiError,
  TrendDataPoint,
  isValidRegion,
  isValidClimateData,
  isValidTrendDataPoint,
} from './types'

/**
 * Get API base URL from environment variable.
 * Falls back to the production Fly.io URL so the deployed Netlify site
 * works even if NEXT_PUBLIC_API_BASE_URL is not explicitly set.
 */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost'
    ? 'https://harvestalert-backend.fly.dev'
    : 'http://localhost:8000')

/**
 * Request timeout in milliseconds (5 seconds)
 * Validates: Requirement 6.4
 */
const REQUEST_TIMEOUT = 5000

/**
 * Cache expiration time in milliseconds (5 minutes)
 * Validates: Requirement 17.1
 */
const CACHE_EXPIRATION_MS = 5 * 60 * 1000 // 5 minutes

/**
 * Cache entry structure with timestamp
 */
interface CacheEntry<T> {
  data: T
  timestamp: number
}

/**
 * Check if code is running in browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined'
}

/**
 * Get cached data from localStorage if valid
 * 
 * @param key - Cache key
 * @returns Cached data if valid, null otherwise
 */
function getCachedData<T>(key: string): T | null {
  if (!isBrowser()) return null
  
  try {
    const cached = localStorage.getItem(key)
    if (!cached) return null
    
    const entry: CacheEntry<T> = JSON.parse(cached)
    const now = Date.now()
    
    // Check if cache is expired
    if (now - entry.timestamp > CACHE_EXPIRATION_MS) {
      return null // Don't remove, might be useful as stale fallback
    }
    
    return entry.data
  } catch (error) {
    // If parsing fails or localStorage is unavailable, return null
    console.warn(`Failed to read cache for key "${key}":`, error)
    return null
  }
}

/**
 * Get cached data from localStorage even if expired (for offline fallback)
 * 
 * @param key - Cache key
 * @returns Cached data regardless of expiration, null if doesn't exist
 */
function getStaleCache<T>(key: string): T | null {
  if (!isBrowser()) return null
  
  try {
    const cached = localStorage.getItem(key)
    if (!cached) return null
    
    const entry: CacheEntry<T> = JSON.parse(cached)
    return entry.data
  } catch (error) {
    console.warn(`Failed to read stale cache for key "${key}":`, error)
    return null
  }
}

/**
 * Store data in localStorage cache with timestamp
 * 
 * @param key - Cache key
 * @param data - Data to cache
 */
function setCachedData<T>(key: string, data: T): void {
  if (!isBrowser()) return
  
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    }
    localStorage.setItem(key, JSON.stringify(entry))
  } catch (error) {
    // If localStorage is full or unavailable, fail silently
    console.warn(`Failed to write cache for key "${key}":`, error)
  }
}

/**
 * Clear cached data for a specific key
 * 
 * @param key - Cache key to clear
 */
function clearCachedData(key: string): void {
  if (!isBrowser()) return
  
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.warn(`Failed to clear cache for key "${key}":`, error)
  }
}

/**
 * Get cache timestamp for a specific key
 * Returns null if cache doesn't exist or is invalid
 * 
 * @param key - Cache key
 * @returns Timestamp when data was cached, or null
 */
export function getCacheTimestamp(key: string): number | null {
  if (!isBrowser()) return null
  
  try {
    const cached = localStorage.getItem(key)
    if (!cached) return null
    
    const entry: CacheEntry<unknown> = JSON.parse(cached)
    return entry.timestamp
  } catch {
    return null
  }
}

/**
 * Check if cached data exists and is still valid
 * 
 * @param key - Cache key
 * @returns True if valid cache exists, false otherwise
 */
export function hasCachedData(key: string): boolean {
  if (!isBrowser()) return false
  
  try {
    const cached = localStorage.getItem(key)
    if (!cached) return false
    
    const entry: CacheEntry<unknown> = JSON.parse(cached)
    const now = Date.now()
    
    return now - entry.timestamp <= CACHE_EXPIRATION_MS
  } catch {
    return false
  }
}

/**
 * Clear all HarvestAlert caches
 */
export function clearAllCaches(): void {
  clearCachedData('harvestalert:regions')
  clearCachedData('harvestalert:climate')
}

/**
 * Custom error class for API errors
 */
export class ApiRequestError extends Error {
  constructor(
    message: string,
    public status?: number,
    public originalError?: unknown
  ) {
    super(message)
    this.name = 'ApiRequestError'
  }
}

/**
 * Generic fetch wrapper with timeout and error handling
 * 
 * @param endpoint - API endpoint path (e.g., '/regions')
 * @param options - Fetch options
 * @returns Parsed JSON response
 * @throws ApiRequestError for network, timeout, or HTTP errors
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`
  
  try {
    // Create AbortSignal with timeout (Requirement 6.4)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })
    
    clearTimeout(timeoutId)
    
    // Handle HTTP errors (Requirement 6.3)
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`
      
      try {
        const errorData: ApiError = await response.json()
        errorMessage = errorData.detail || errorMessage
      } catch {
        // If error response is not JSON, use default message
      }
      
      throw new ApiRequestError(errorMessage, response.status)
    }
    
    // Parse and return JSON response
    const data = await response.json()
    return data as T
    
  } catch (error) {
    // Handle timeout errors (Requirement 6.4)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiRequestError(
        'Request timeout: Server is not responding. Please try again.',
        undefined,
        error
      )
    }
    
    // Handle network errors (Requirement 6.3)
    if (error instanceof TypeError) {
      throw new ApiRequestError(
        'Network error: Please check your internet connection and try again.',
        undefined,
        error
      )
    }
    
    // Re-throw ApiRequestError as-is
    if (error instanceof ApiRequestError) {
      throw error
    }
    
    // Handle unexpected errors
    throw new ApiRequestError(
      `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      undefined,
      error
    )
  }
}

/**
 * Fetch all regions with risk data
 * 
 * Uses localStorage caching with 5-minute expiration.
 * Returns cached data if valid and fresh (< 5 minutes old).
 * Falls back to stale cached data if API request fails.
 * 
 * @returns Array of regions with risk levels
 * @throws ApiRequestError on failure (only if no cached data available)
 * 
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 17.1, 17.2
 */
export async function fetchRegions(): Promise<Region[]> {
  const cacheKey = 'harvestalert:regions'
  
  // Check if we have valid (non-expired) cached data
  const cachedData = getCachedData<Region[]>(cacheKey)
  
  // If we have valid cached data, return it immediately (avoids unnecessary API calls)
  if (cachedData) {
    return cachedData
  }
  
  // No valid cache, fetch from API
  try {
    const data = await apiFetch<Region[]>('/regions')
    
    // Validate response data
    if (!Array.isArray(data)) {
      throw new ApiRequestError('Invalid response: Expected array of regions')
    }
    
    // Validate each region object
    const validRegions = data.filter(isValidRegion)
    
    if (validRegions.length !== data.length) {
      console.warn(
        `Filtered out ${data.length - validRegions.length} invalid region(s)`
      )
    }
    
    // Cache the valid data
    setCachedData(cacheKey, validRegions)
    
    return validRegions
  } catch (error) {
    // If API request fails, check if we have any cached data (even if expired)
    // This provides offline fallback capability
    const staleCache = getStaleCache<Region[]>(cacheKey)
    if (staleCache) {
      console.warn('API request failed, using stale cached data:', error)
      return staleCache
    }
    
    // No cached data available at all, re-throw the error
    throw error
  }
}

/**
 * Fetch current climate data
 * 
 * Uses localStorage caching with 5-minute expiration.
 * Returns cached data if valid and fresh (< 5 minutes old).
 * Falls back to stale cached data if API request fails.
 * 
 * @returns Current climate conditions
 * @throws ApiRequestError on failure (only if no cached data available)
 * 
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4, 17.1, 17.2
 */
export async function fetchClimate(): Promise<ClimateData> {
  const cacheKey = 'harvestalert:climate'
  
  // Check if we have valid (non-expired) cached data
  const cachedData = getCachedData<ClimateData>(cacheKey)
  
  // If we have valid cached data, return it immediately (avoids unnecessary API calls)
  if (cachedData) {
    return cachedData
  }
  
  // No valid cache, fetch from API
  try {
    const data = await apiFetch<ClimateData>('/climate')
    
    // Validate response data
    if (!isValidClimateData(data)) {
      throw new ApiRequestError('Invalid response: Expected valid climate data')
    }
    
    // Cache the valid data
    setCachedData(cacheKey, data)
    
    return data
  } catch (error) {
    // If API request fails, check if we have any cached data (even if expired)
    // This provides offline fallback capability
    const staleCache = getStaleCache<ClimateData>(cacheKey)
    if (staleCache) {
      console.warn('API request failed, using stale cached data:', error)
      return staleCache
    }
    
    // No cached data available at all, re-throw the error
    throw error
  }
}

/**
 * Predict crop and nutrition risk based on climate parameters
 * 
 * @param params - Temperature and rainfall values
 * @returns Risk prediction with crop_risk and nutrition_risk
 * @throws ApiRequestError on failure
 * 
 * Validates: Requirements 6.1, 6.2, 6.3, 6.4
 */
export async function predictRisk(params: PredictParams): Promise<RiskPrediction> {
  // Validate input parameters
  if (params.temperature < -50 || params.temperature > 60) {
    throw new ApiRequestError(
      'Invalid temperature: Must be between -50 and 60 Celsius',
      400
    )
  }
  
  if (params.rainfall < 0 || params.rainfall > 1000) {
    throw new ApiRequestError(
      'Invalid rainfall: Must be between 0 and 1000 mm',
      400
    )
  }
  
  const data = await apiFetch<RiskPrediction>('/predict', {
    method: 'POST',
    body: JSON.stringify(params),
  })
  
  // Validate response data
  if (
    typeof data !== 'object' ||
    data === null ||
    !('crop_risk' in data) ||
    !('nutrition_risk' in data)
  ) {
    throw new ApiRequestError('Invalid response: Expected risk prediction object')
  }
  
  return data
}

/**
 * Fetch historical trend data for a specific region
 * 
 * Returns the most recent 7 climate data points with calculated risk levels
 * for trend visualization. Data is ordered from oldest to newest.
 * 
 * @param regionId - ID of the region to fetch trends for
 * @returns Array of trend data points
 * @throws ApiRequestError on failure
 * 
 * Validates: Requirements 18.1, 18.2
 */
export async function fetchRegionTrends(regionId: number): Promise<TrendDataPoint[]> {
  const data = await apiFetch<TrendDataPoint[]>(`/regions/${regionId}/trends`)
  
  // Validate response data
  if (!Array.isArray(data)) {
    throw new ApiRequestError('Invalid response: Expected array of trend data points')
  }
  
  // Validate each trend data point
  const validTrends = data.filter(isValidTrendDataPoint)
  
  if (validTrends.length !== data.length) {
    console.warn(
      `Filtered out ${data.length - validTrends.length} invalid trend data point(s)`
    )
  }
  
  return validTrends
}
