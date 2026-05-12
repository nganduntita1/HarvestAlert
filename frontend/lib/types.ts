/**
 * Type definitions for HarvestAlert MVP
 * 
 * These types match the backend API response structures and ensure
 * type safety across the frontend application.
 */

/**
 * Risk level enum - represents crop and nutrition risk severity
 * Validates: Requirements 3.2, 3.4
 */
export type RiskLevel = 'low' | 'medium' | 'high'

/**
 * Region data structure
 * Represents a geographic area with associated risk levels
 * Validates: Requirements 3.2, 3.4
 */
export interface Region {
  id: number
  name: string
  latitude: number
  longitude: number
  crop_risk: RiskLevel
  nutrition_risk: RiskLevel
  last_updated: string
}

/**
 * Climate data structure
 * Represents current weather and environmental conditions
 * Validates: Requirements 1.3
 */
export interface ClimateData {
  temperature: number  // Celsius
  rainfall: number     // millimeters
  drought_index: number // 0-100 scale
}

/**
 * Risk prediction result
 * Returned by the prediction endpoint
 * Validates: Requirements 2.3, 2.4
 */
export interface RiskPrediction {
  crop_risk: RiskLevel
  nutrition_risk: RiskLevel
}

/**
 * Parameters for risk prediction request
 * Validates: Requirements 2.1
 */
export interface PredictParams {
  temperature: number  // Celsius, range: -50 to 60
  rainfall: number     // millimeters, range: 0 to 1000
}

/**
 * API error response structure
 */
export interface ApiError {
  detail: string
  status?: number
}

/**
 * Type guard to validate risk level
 */
export function isValidRiskLevel(value: unknown): value is RiskLevel {
  return value === 'low' || value === 'medium' || value === 'high'
}

/**
 * Type guard to validate Region object
 */
export function isValidRegion(obj: unknown): obj is Region {
  if (typeof obj !== 'object' || obj === null) return false
  
  const region = obj as Record<string, unknown>
  
  return (
    typeof region.id === 'number' &&
    typeof region.name === 'string' &&
    typeof region.latitude === 'number' &&
    typeof region.longitude === 'number' &&
    region.latitude >= -90 && region.latitude <= 90 &&
    region.longitude >= -180 && region.longitude <= 180 &&
    isValidRiskLevel(region.crop_risk) &&
    isValidRiskLevel(region.nutrition_risk) &&
    typeof region.last_updated === 'string'
  )
}

/**
 * Type guard to validate ClimateData object
 */
export function isValidClimateData(obj: unknown): obj is ClimateData {
  if (typeof obj !== 'object' || obj === null) return false
  
  const climate = obj as Record<string, unknown>
  
  return (
    typeof climate.temperature === 'number' &&
    typeof climate.rainfall === 'number' &&
    typeof climate.drought_index === 'number' &&
    climate.drought_index >= 0 && climate.drought_index <= 100
  )
}

/**
 * Trend data point structure
 * Represents a single historical data point for trend visualization
 * Validates: Requirements 18.1, 18.2
 */
export interface TrendDataPoint {
  recorded_at: string  // ISO format timestamp
  temperature: number  // Celsius
  rainfall: number     // millimeters
  drought_index: number // 0-100 scale
  crop_risk: RiskLevel
  nutrition_risk: RiskLevel
}

/**
 * Type guard to validate TrendDataPoint object
 */
export function isValidTrendDataPoint(obj: unknown): obj is TrendDataPoint {
  if (typeof obj !== 'object' || obj === null) return false
  
  const trend = obj as Record<string, unknown>
  
  return (
    typeof trend.recorded_at === 'string' &&
    typeof trend.temperature === 'number' &&
    typeof trend.rainfall === 'number' &&
    typeof trend.drought_index === 'number' &&
    trend.drought_index >= 0 && trend.drought_index <= 100 &&
    isValidRiskLevel(trend.crop_risk) &&
    isValidRiskLevel(trend.nutrition_risk)
  )
}
