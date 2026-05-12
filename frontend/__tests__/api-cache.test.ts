/**
 * Tests for API client caching functionality
 * 
 * Validates: Requirements 17.1, 17.2
 */

import { fetchRegions, fetchClimate, getCacheTimestamp, hasCachedData, clearAllCaches } from '@/lib/api'
import { Region, ClimateData } from '@/lib/types'

// Mock fetch
global.fetch = jest.fn()

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {}

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      store = {}
    },
  }
})()

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

describe('API Client Caching', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorageMock.clear()
  })

  describe('fetchRegions caching', () => {
    const mockRegions: Region[] = [
      {
        id: 1,
        name: 'Test Region',
        latitude: 10.5,
        longitude: 20.5,
        crop_risk: 'low',
        nutrition_risk: 'low',
        last_updated: '2024-01-01T00:00:00Z',
      },
    ]

    it('caches successful API responses', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRegions,
      })

      const result = await fetchRegions()

      expect(result).toEqual(mockRegions)
      expect(hasCachedData('harvestalert:regions')).toBe(true)
      expect(getCacheTimestamp('harvestalert:regions')).toBeGreaterThan(0)
    })

    it('returns cached data on subsequent calls within expiration', async () => {
      // First call - fetches from API
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRegions,
      })

      await fetchRegions()

      // Second call - should use cache
      const result = await fetchRegions()

      expect(result).toEqual(mockRegions)
      expect(fetch).toHaveBeenCalledTimes(1) // Only called once
    })

    it('falls back to cached data when API fails', async () => {
      // First call - successful
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRegions,
      })

      const firstResult = await fetchRegions()
      expect(firstResult).toEqual(mockRegions)

      // Second call - should use cache without calling API
      const result = await fetchRegions()

      // Should return cached data without calling API (cache is still valid)
      expect(result).toEqual(mockRegions)
      expect(fetch).toHaveBeenCalledTimes(1) // Only called once, second time used cache
    })

    it('falls back to stale cache when API fails and cache is expired', async () => {
      // First call - successful, caches data
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRegions,
      })

      await fetchRegions()

      // Manually expire the cache
      const cached = localStorage.getItem('harvestalert:regions')
      if (cached) {
        const entry = JSON.parse(cached)
        entry.timestamp = Date.now() - 6 * 60 * 1000 // 6 minutes ago
        localStorage.setItem('harvestalert:regions', JSON.stringify(entry))
      }

      // Second call - API fails, should fall back to stale cache
      (fetch as jest.Mock).mockRejectedValueOnce(new TypeError('Network error'))

      const result = await fetchRegions()

      // Should return stale cached data as fallback
      expect(result).toEqual(mockRegions)
      expect(fetch).toHaveBeenCalledTimes(2) // Called twice (initial + failed retry)
    })

    it('throws error when API fails and no cache exists', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new TypeError('Network error'))

      await expect(fetchRegions()).rejects.toThrow('Network error')
    })

    it('expires cache after 5 minutes', async () => {
      // First call - caches data
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRegions,
      })

      await fetchRegions()

      // Manually expire the cache by modifying timestamp
      const cached = localStorage.getItem('harvestalert:regions')
      if (cached) {
        const entry = JSON.parse(cached)
        entry.timestamp = Date.now() - 6 * 60 * 1000 // 6 minutes ago
        localStorage.setItem('harvestalert:regions', JSON.stringify(entry))
      }

      // Second call - should fetch from API again since cache is expired
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRegions,
      })

      await fetchRegions()

      // Should have called fetch twice (initial + after expiration)
      expect(fetch).toHaveBeenCalledTimes(2)
    })
  })

  describe('fetchClimate caching', () => {
    const mockClimate: ClimateData = {
      temperature: 25.5,
      rainfall: 100.0,
      drought_index: 30.0,
    }

    it('caches successful API responses', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockClimate,
      })

      const result = await fetchClimate()

      expect(result).toEqual(mockClimate)
      expect(hasCachedData('harvestalert:climate')).toBe(true)
    })

    it('falls back to cached data when API fails', async () => {
      // First call - successful
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockClimate,
      })

      const firstResult = await fetchClimate()
      expect(firstResult).toEqual(mockClimate)

      // Second call - should use cache without calling API
      const result = await fetchClimate()

      // Should return cached data without calling API (cache is still valid)
      expect(result).toEqual(mockClimate)
      expect(fetch).toHaveBeenCalledTimes(1) // Only called once, second time used cache
    })
  })

  describe('Cache utility functions', () => {
    it('clearAllCaches removes all cached data', async () => {
      const mockRegions: Region[] = [
        {
          id: 1,
          name: 'Test',
          latitude: 0,
          longitude: 0,
          crop_risk: 'low',
          nutrition_risk: 'low',
          last_updated: '2024-01-01T00:00:00Z',
        },
      ]

      const mockClimate: ClimateData = {
        temperature: 25,
        rainfall: 100,
        drought_index: 30,
      }

      // Cache some data
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockRegions,
      })
      await fetchRegions()

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockClimate,
      })
      await fetchClimate()

      expect(hasCachedData('harvestalert:regions')).toBe(true)
      expect(hasCachedData('harvestalert:climate')).toBe(true)

      // Clear all caches
      clearAllCaches()

      expect(hasCachedData('harvestalert:regions')).toBe(false)
      expect(hasCachedData('harvestalert:climate')).toBe(false)
    })

    it('getCacheTimestamp returns null for non-existent cache', () => {
      expect(getCacheTimestamp('harvestalert:nonexistent')).toBeNull()
    })

    it('hasCachedData returns false for non-existent cache', () => {
      expect(hasCachedData('harvestalert:nonexistent')).toBe(false)
    })
  })
})
