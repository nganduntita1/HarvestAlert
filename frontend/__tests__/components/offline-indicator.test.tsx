/**
 * Unit tests for OfflineIndicator component
 * 
 * Tests the offline indicator display, timestamp formatting,
 * and refresh functionality.
 * 
 * Validates: Requirements 17.3, 17.4
 */

import { render, screen, fireEvent } from '@testing-library/react'
import OfflineIndicator from '@/components/OfflineIndicator'

describe('OfflineIndicator', () => {
  describe('Display behavior', () => {
    it('does not render when showing live data', () => {
      const { container } = render(
        <OfflineIndicator
          isShowingCachedData={false}
          lastUpdated={Date.now()}
          onRefresh={() => {}}
        />
      )
      
      expect(container.firstChild).toBeNull()
    })

    it('does not render when lastUpdated is null', () => {
      const { container } = render(
        <OfflineIndicator
          isShowingCachedData={true}
          lastUpdated={null}
          onRefresh={() => {}}
        />
      )
      
      expect(container.firstChild).toBeNull()
    })

    it('renders when showing cached data with valid timestamp', () => {
      render(
        <OfflineIndicator
          isShowingCachedData={true}
          lastUpdated={Date.now() - 60000} // 1 minute ago
          onRefresh={() => {}}
        />
      )
      
      expect(screen.getByText('Cached Data')).toBeInTheDocument()
      expect(screen.getByText(/Showing cached data from your last visit/i)).toBeInTheDocument()
    })
  })

  describe('Timestamp formatting', () => {
    it('displays "just now" for very recent timestamps', () => {
      render(
        <OfflineIndicator
          isShowingCachedData={true}
          lastUpdated={Date.now() - 30000} // 30 seconds ago
          onRefresh={() => {}}
        />
      )
      
      expect(screen.getByText(/Last updated: just now/i)).toBeInTheDocument()
    })

    it('displays minutes for timestamps less than 1 hour old', () => {
      render(
        <OfflineIndicator
          isShowingCachedData={true}
          lastUpdated={Date.now() - 5 * 60000} // 5 minutes ago
          onRefresh={() => {}}
        />
      )
      
      expect(screen.getByText(/Last updated: 5 minutes ago/i)).toBeInTheDocument()
    })

    it('displays singular "minute" for 1 minute ago', () => {
      render(
        <OfflineIndicator
          isShowingCachedData={true}
          lastUpdated={Date.now() - 60000} // 1 minute ago
          onRefresh={() => {}}
        />
      )
      
      expect(screen.getByText(/Last updated: 1 minute ago/i)).toBeInTheDocument()
    })

    it('displays hours for timestamps less than 24 hours old', () => {
      render(
        <OfflineIndicator
          isShowingCachedData={true}
          lastUpdated={Date.now() - 3 * 3600000} // 3 hours ago
          onRefresh={() => {}}
        />
      )
      
      expect(screen.getByText(/Last updated: 3 hours ago/i)).toBeInTheDocument()
    })

    it('displays singular "hour" for 1 hour ago', () => {
      render(
        <OfflineIndicator
          isShowingCachedData={true}
          lastUpdated={Date.now() - 3600000} // 1 hour ago
          onRefresh={() => {}}
        />
      )
      
      expect(screen.getByText(/Last updated: 1 hour ago/i)).toBeInTheDocument()
    })

    it('displays days for timestamps 24+ hours old', () => {
      render(
        <OfflineIndicator
          isShowingCachedData={true}
          lastUpdated={Date.now() - 2 * 86400000} // 2 days ago
          onRefresh={() => {}}
        />
      )
      
      expect(screen.getByText(/Last updated: 2 days ago/i)).toBeInTheDocument()
    })

    it('displays singular "day" for 1 day ago', () => {
      render(
        <OfflineIndicator
          isShowingCachedData={true}
          lastUpdated={Date.now() - 86400000} // 1 day ago
          onRefresh={() => {}}
        />
      )
      
      expect(screen.getByText(/Last updated: 1 day ago/i)).toBeInTheDocument()
    })
  })

  describe('Refresh functionality', () => {
    it('renders refresh button when onRefresh is provided', () => {
      render(
        <OfflineIndicator
          isShowingCachedData={true}
          lastUpdated={Date.now() - 60000}
          onRefresh={() => {}}
        />
      )
      
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument()
    })

    it('does not render refresh button when onRefresh is not provided', () => {
      render(
        <OfflineIndicator
          isShowingCachedData={true}
          lastUpdated={Date.now() - 60000}
        />
      )
      
      expect(screen.queryByRole('button', { name: /refresh/i })).not.toBeInTheDocument()
    })

    it('calls onRefresh when refresh button is clicked', () => {
      const mockRefresh = jest.fn()
      
      render(
        <OfflineIndicator
          isShowingCachedData={true}
          lastUpdated={Date.now() - 60000}
          onRefresh={mockRefresh}
        />
      )
      
      const refreshButton = screen.getByRole('button', { name: /refresh/i })
      fireEvent.click(refreshButton)
      
      expect(mockRefresh).toHaveBeenCalledTimes(1)
    })
  })

  describe('Visual elements', () => {
    it('displays the cached data badge', () => {
      render(
        <OfflineIndicator
          isShowingCachedData={true}
          lastUpdated={Date.now() - 60000}
          onRefresh={() => {}}
        />
      )
      
      const badge = screen.getByText('Cached Data')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveClass('bg-yellow-100', 'text-yellow-800')
    })

    it('displays the warning icon', () => {
      const { container } = render(
        <OfflineIndicator
          isShowingCachedData={true}
          lastUpdated={Date.now() - 60000}
          onRefresh={() => {}}
        />
      )
      
      // Check for SVG icon
      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })

    it('displays the refresh icon in button', () => {
      const { container } = render(
        <OfflineIndicator
          isShowingCachedData={true}
          lastUpdated={Date.now() - 60000}
          onRefresh={() => {}}
        />
      )
      
      // Check for multiple SVG icons (warning + refresh)
      const icons = container.querySelectorAll('svg')
      expect(icons.length).toBeGreaterThanOrEqual(2)
    })
  })
})
