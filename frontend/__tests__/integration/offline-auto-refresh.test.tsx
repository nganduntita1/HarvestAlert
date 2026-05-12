/**
 * Integration tests for offline auto-refresh functionality
 * 
 * Tests the auto-refresh behavior when connectivity is restored
 * and the offline indicator integration with the dashboard.
 * 
 * Validates: Requirements 17.3, 17.4
 */

import { render, screen, waitFor } from '@testing-library/react'
import { act } from 'react-dom/test-utils'
import Home from '@/app/page'

// Mock the API module
jest.mock('@/lib/api', () => ({
  fetchRegions: jest.fn(),
  getCacheTimestamp: jest.fn(),
}))

// Mock the Map component to avoid Leaflet issues in tests
jest.mock('@/components/Map', () => {
  return function MockMap() {
    return <div data-testid="mock-map">Map Component</div>
  }
})

import { fetchRegions, getCacheTimestamp } from '@/lib/api'

const mockFetchRegions = fetchRegions as jest.MockedFunction<typeof fetchRegions>
const mockGetCacheTimestamp = getCacheTimestamp as jest.MockedFunction<typeof getCacheTimestamp>

describe('Offline Auto-Refresh Integration', () => {
  const mockRegions = [
    {
      id: 1,
      name: 'Test Region',
      latitude: 0,
      longitude: 0,
      crop_risk: 'low' as const,
      nutrition_risk: 'low' as const,
      last_updated: '2024-01-01T00:00:00Z',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Connectivity restoration', () => {
    it('auto-refreshes data when online event is triggered', async () => {
      // Setup: Initial load with cached data
      const cacheTimestamp = Date.now() - 60000 // 1 minute ago
      mockGetCacheTimestamp.mockReturnValue(cacheTimestamp)
      mockFetchRegions.mockResolvedValue(mockRegions)

      render(<Home />)

      // Wait for initial load - check for Risk Summary instead of region name
      await waitFor(() => {
        expect(screen.getByText('Risk Summary')).toBeInTheDocument()
      })

      // Verify initial fetch was called
      expect(mockFetchRegions).toHaveBeenCalledTimes(1)

      // Simulate connectivity restoration
      act(() => {
        window.dispatchEvent(new Event('online'))
      })

      // Wait for auto-refresh to complete
      await waitFor(() => {
        expect(mockFetchRegions).toHaveBeenCalledTimes(2)
      })
    })

    it('displays offline indicator when using cached data', async () => {
      // Setup: Simulate cached data scenario
      const cacheTimestamp = Date.now() - 5 * 60000 // 5 minutes ago
      
      // First call returns timestamp (before fetch)
      // Second call returns same timestamp (after fetch, indicating cache was used)
      mockGetCacheTimestamp
        .mockReturnValueOnce(cacheTimestamp)
        .mockReturnValueOnce(cacheTimestamp)
      
      mockFetchRegions.mockResolvedValue(mockRegions)

      render(<Home />)

      // Wait for data to load - check for Risk Summary
      await waitFor(() => {
        expect(screen.getByText('Risk Summary')).toBeInTheDocument()
      })

      // Verify offline indicator is displayed
      expect(screen.getByText('Cached Data')).toBeInTheDocument()
      expect(screen.getByText(/Showing cached data from your last visit/i)).toBeInTheDocument()
      expect(screen.getByText(/Last updated: 5 minutes ago/i)).toBeInTheDocument()
    })

    it('does not display offline indicator when using fresh data', async () => {
      // Setup: Simulate fresh data scenario
      const oldTimestamp = Date.now() - 60000
      const newTimestamp = Date.now()
      
      // First call returns old timestamp (before fetch)
      // Second call returns new timestamp (after fetch, indicating fresh data)
      mockGetCacheTimestamp
        .mockReturnValueOnce(oldTimestamp)
        .mockReturnValueOnce(newTimestamp)
      
      mockFetchRegions.mockResolvedValue(mockRegions)

      render(<Home />)

      // Wait for data to load - check for Risk Summary
      await waitFor(() => {
        expect(screen.getByText('Risk Summary')).toBeInTheDocument()
      })

      // Verify offline indicator is NOT displayed
      expect(screen.queryByText('Cached Data')).not.toBeInTheDocument()
    })

    it('does not display offline indicator on first load with no cache', async () => {
      // Setup: No cache exists
      mockGetCacheTimestamp.mockReturnValue(null)
      mockFetchRegions.mockResolvedValue(mockRegions)

      render(<Home />)

      // Wait for data to load - check for Risk Summary
      await waitFor(() => {
        expect(screen.getByText('Risk Summary')).toBeInTheDocument()
      })

      // Verify offline indicator is NOT displayed
      expect(screen.queryByText('Cached Data')).not.toBeInTheDocument()
    })
  })

  describe('Event listener cleanup', () => {
    it('removes online event listener on unmount', async () => {
      const addEventListenerSpy = jest.spyOn(window, 'addEventListener')
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')

      mockGetCacheTimestamp.mockReturnValue(null)
      mockFetchRegions.mockResolvedValue(mockRegions)

      const { unmount } = render(<Home />)

      // Wait for initial load - check for Risk Summary
      await waitFor(() => {
        expect(screen.getByText('Risk Summary')).toBeInTheDocument()
      })

      // Verify event listener was added
      expect(addEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))

      // Unmount component
      unmount()

      // Verify event listener was removed
      expect(removeEventListenerSpy).toHaveBeenCalledWith('online', expect.any(Function))

      addEventListenerSpy.mockRestore()
      removeEventListenerSpy.mockRestore()
    })
  })
})
