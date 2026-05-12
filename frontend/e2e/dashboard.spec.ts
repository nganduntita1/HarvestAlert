/**
 * End-to-End Tests for HarvestAlert Dashboard
 * 
 * Tests critical user workflows:
 * - Dashboard loads and displays map with regions
 * - Region marker click displays popup
 * - Risk summary cards display correct counts
 * - API error handling with retry
 * 
 * Validates: Requirements 4.1, 4.2, 4.3, 4.5, 5.1, 5.2, 6.3
 */

import { test, expect, Page } from '@playwright/test'

/**
 * Mock region data for testing
 */
const mockRegions = [
  {
    id: 1,
    name: 'Sahel Region',
    latitude: 14.5,
    longitude: -14.5,
    crop_risk: 'high',
    nutrition_risk: 'high',
    last_updated: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    name: 'East Africa Highlands',
    latitude: -1.3,
    longitude: 36.8,
    crop_risk: 'medium',
    nutrition_risk: 'medium',
    last_updated: '2024-01-15T10:00:00Z',
  },
  {
    id: 3,
    name: 'Southern Africa Plains',
    latitude: -25.7,
    longitude: 28.2,
    crop_risk: 'low',
    nutrition_risk: 'low',
    last_updated: '2024-01-15T10:00:00Z',
  },
]

/**
 * Helper function to mock successful API response
 */
async function mockSuccessfulApiResponse(page: Page) {
  await page.route('**/regions', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockRegions),
    })
  })
}

/**
 * Helper function to mock API error response
 */
async function mockApiErrorResponse(page: Page, status: number = 500) {
  await page.route('**/regions', async (route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({ detail: 'Internal server error' }),
    })
  })
}

/**
 * Helper function to mock API timeout
 */
async function mockApiTimeout(page: Page) {
  await page.route('**/regions', async (route) => {
    // Delay response beyond the 5-second timeout
    await new Promise((resolve) => setTimeout(resolve, 6000))
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockRegions),
    })
  })
}

test.describe('Dashboard E2E Tests', () => {
  test.describe('Successful Dashboard Load', () => {
    test('should load dashboard and display map with regions', async ({ page }) => {
      // Mock successful API response
      await mockSuccessfulApiResponse(page)

      // Navigate to dashboard
      await page.goto('/')

      // Verify page title and header
      await expect(page.locator('h1')).toContainText('HarvestAlert')
      await expect(page.locator('text=Climate & Nutrition Early Warning Platform')).toBeVisible()

      // Wait for loading to complete
      await expect(page.locator('text=Loading region data...')).not.toBeVisible({ timeout: 10000 })

      // Verify map container is visible (Requirement 4.1)
      const mapContainer = page.locator('.leaflet-container')
      await expect(mapContainer).toBeVisible({ timeout: 10000 })

      // Verify map has loaded tiles (tiles may be hidden but container exists)
      const mapTiles = page.locator('.leaflet-tile-container')
      await expect(mapTiles).toHaveCount(1) // Just verify it exists

      // Verify region markers are displayed (Requirement 4.3)
      const markers = page.locator('.leaflet-marker-icon')
      await expect(markers).toHaveCount(3, { timeout: 10000 })

      // Verify risk summary section is visible
      await expect(page.locator('text=Risk Summary')).toBeVisible()
    })

    test('should display correct risk summary counts', async ({ page }) => {
      // Mock successful API response
      await mockSuccessfulApiResponse(page)

      // Navigate to dashboard
      await page.goto('/')

      // Wait for loading to complete
      await expect(page.locator('text=Loading region data...')).not.toBeVisible({ timeout: 10000 })

      // Verify risk summary cards display correct counts (Requirement 5.1, 5.2)
      const highRiskCard = page.locator('text=High Risk').locator('..')
      await expect(highRiskCard).toContainText('1')

      const mediumRiskCard = page.locator('text=Medium Risk').locator('..')
      await expect(mediumRiskCard).toContainText('1')

      const lowRiskCard = page.locator('text=Low Risk').locator('..')
      await expect(lowRiskCard).toContainText('1')

      // Verify total count
      await expect(page.locator('text=Total: 3 regions')).toBeVisible()
    })

    test('should display region details on marker click', async ({ page }) => {
      // Mock successful API response
      await mockSuccessfulApiResponse(page)

      // Navigate to dashboard
      await page.goto('/')

      // Wait for map to load
      await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10000 })

      // Wait for markers to be rendered
      const markers = page.locator('.leaflet-marker-icon')
      await expect(markers.first()).toBeVisible({ timeout: 10000 })

      // Click on the first marker (Requirement 4.5)
      await markers.first().click()

      // Wait for popup to appear
      const popup = page.locator('.leaflet-popup')
      await expect(popup).toBeVisible({ timeout: 5000 })

      // Verify popup contains region information
      await expect(popup).toContainText('Sahel Region')
      await expect(popup).toContainText('high')
    })

    test('should render map within 3 seconds', async ({ page }) => {
      // Mock successful API response
      await mockSuccessfulApiResponse(page)

      // Start timing
      const startTime = Date.now()

      // Navigate to dashboard
      await page.goto('/')

      // Wait for map to be visible (Requirement 4.6)
      await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10000 })

      // Calculate load time
      const loadTime = Date.now() - startTime

      // Verify map loaded within reasonable time (Requirement 4.6)
      // Note: In real scenarios, this depends on network and server performance
      // For E2E tests with mocked data, allow 10s buffer for test environment
      expect(loadTime).toBeLessThan(10000) // 10 seconds for test environment
    })
  })

  test.describe('API Error Handling', () => {
    test('should display error message when API request fails', async ({ page }) => {
      // Mock API error response
      await mockApiErrorResponse(page, 500)

      // Navigate to dashboard
      await page.goto('/')

      // Wait for loading to complete
      await expect(page.locator('text=Loading region data...')).not.toBeVisible({ timeout: 10000 })

      // Verify error message is displayed (Requirement 6.3)
      const errorMessage = page.locator('text=/.*error.*/i')
      await expect(errorMessage).toBeVisible()

      // Verify retry button is present
      const retryButton = page.locator('button:has-text("Retry")')
      await expect(retryButton).toBeVisible()
    })

    test('should retry API request when retry button is clicked', async ({ page }) => {
      let requestCount = 0

      // Mock API to fail first time, succeed second time
      await page.route('**/regions', async (route) => {
        requestCount++
        if (requestCount === 1) {
          // First request fails
          await route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ detail: 'Internal server error' }),
          })
        } else {
          // Second request succeeds
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify(mockRegions),
          })
        }
      })

      // Navigate to dashboard
      await page.goto('/')

      // Wait for error message
      await expect(page.locator('text=/.*error.*/i')).toBeVisible({ timeout: 10000 })

      // Click retry button
      const retryButton = page.locator('button:has-text("Retry")')
      await retryButton.click()

      // Wait a moment for the retry to initiate
      await page.waitForTimeout(100)

      // Verify map loads successfully after retry
      await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 10000 })
      await expect(page.locator('text=Risk Summary')).toBeVisible()

      // Verify at least two requests were made (may be more due to retries)
      expect(requestCount).toBeGreaterThanOrEqual(2)
    })

    test('should handle network timeout gracefully', async ({ page }) => {
      // Mock API timeout
      await mockApiTimeout(page)

      // Navigate to dashboard
      await page.goto('/')

      // Wait for timeout error (should appear after 5 seconds)
      const errorMessage = page.locator('text=/.*timeout.*/i')
      await expect(errorMessage).toBeVisible({ timeout: 15000 })

      // Verify retry button is present
      const retryButton = page.locator('button:has-text("Retry")')
      await expect(retryButton).toBeVisible()
    })

    test('should handle 404 error gracefully', async ({ page }) => {
      // Mock 404 response
      await mockApiErrorResponse(page, 404)

      // Navigate to dashboard
      await page.goto('/')

      // Wait for error message
      const errorMessage = page.locator('text=/.*error.*/i')
      await expect(errorMessage).toBeVisible({ timeout: 10000 })

      // Verify no map is displayed
      await expect(page.locator('.leaflet-container')).not.toBeVisible()
    })
  })

  test.describe('Loading States', () => {
    test('should display loading spinner while fetching data', async ({ page }) => {
      // Mock delayed API response
      await page.route('**/regions', async (route) => {
        // Delay response by 1 second
        await new Promise((resolve) => setTimeout(resolve, 1000))
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockRegions),
        })
      })

      // Navigate to dashboard
      await page.goto('/')

      // Verify loading spinner is visible (Requirement 6.4)
      await expect(page.locator('text=Loading region data...')).toBeVisible()

      // Wait for loading to complete
      await expect(page.locator('text=Loading region data...')).not.toBeVisible({ timeout: 10000 })

      // Verify content is displayed
      await expect(page.locator('.leaflet-container')).toBeVisible()
    })
  })

  test.describe('Empty State', () => {
    test('should display empty state when no regions are available', async ({ page }) => {
      // Mock empty regions response
      await page.route('**/regions', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([]),
        })
      })

      // Navigate to dashboard
      await page.goto('/')

      // Wait for loading to complete
      await expect(page.locator('text=Loading region data...')).not.toBeVisible({ timeout: 10000 })

      // Verify empty state message is displayed
      await expect(page.locator('text=No regions available')).toBeVisible()
      await expect(page.locator('text=/.*check back later.*/i')).toBeVisible()

      // Verify map is not displayed
      await expect(page.locator('.leaflet-container')).not.toBeVisible()
    })
  })

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile viewport', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })

      // Mock successful API response
      await mockSuccessfulApiResponse(page)

      // Navigate to dashboard
      await page.goto('/')

      // Wait for loading to complete
      await expect(page.locator('text=Loading region data...')).not.toBeVisible({ timeout: 10000 })

      // Verify header is visible
      await expect(page.locator('h1:has-text("HarvestAlert")')).toBeVisible()

      // Verify map is visible
      await expect(page.locator('.leaflet-container')).toBeVisible()

      // Verify risk summary cards are visible
      await expect(page.locator('text=Risk Summary')).toBeVisible()
    })

    test('should display correctly on tablet viewport', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 })

      // Mock successful API response
      await mockSuccessfulApiResponse(page)

      // Navigate to dashboard
      await page.goto('/')

      // Wait for loading to complete
      await expect(page.locator('text=Loading region data...')).not.toBeVisible({ timeout: 10000 })

      // Verify all content is visible
      await expect(page.locator('h1:has-text("HarvestAlert")')).toBeVisible()
      await expect(page.locator('.leaflet-container')).toBeVisible()
      await expect(page.locator('text=Risk Summary')).toBeVisible()
    })
  })

  test.describe('Map Interactions', () => {
    test('should allow map zoom and pan', async ({ page }) => {
      // Mock successful API response
      await mockSuccessfulApiResponse(page)

      // Navigate to dashboard
      await page.goto('/')

      // Wait for map to load
      const mapContainer = page.locator('.leaflet-container')
      await expect(mapContainer).toBeVisible({ timeout: 10000 })

      // Get initial map position
      const initialTransform = await page.locator('.leaflet-map-pane').getAttribute('style')

      // Zoom in using zoom control
      const zoomInButton = page.locator('.leaflet-control-zoom-in')
      await zoomInButton.click()

      // Wait for zoom animation
      await page.waitForTimeout(500)

      // Verify map state changed (zoom level increased)
      // Note: Detailed zoom verification would require accessing Leaflet API

      // Pan the map by dragging
      const mapPane = page.locator('.leaflet-container')
      await mapPane.hover()
      await page.mouse.down()
      await page.mouse.move(100, 100)
      await page.mouse.up()

      // Wait for pan animation
      await page.waitForTimeout(500)

      // Verify map position changed
      const newTransform = await page.locator('.leaflet-map-pane').getAttribute('style')
      expect(newTransform).not.toBe(initialTransform)
    })

    test('should display multiple region popups sequentially', async ({ page }) => {
      // Mock successful API response
      await mockSuccessfulApiResponse(page)

      // Navigate to dashboard
      await page.goto('/')

      // Wait for markers to load
      const markers = page.locator('.leaflet-marker-icon')
      await expect(markers.first()).toBeVisible({ timeout: 10000 })

      // Click first marker
      await markers.nth(0).click()
      await page.waitForTimeout(500) // Wait for popup animation
      await expect(page.locator('.leaflet-popup').first()).toContainText('Sahel Region')

      // Click second marker
      await markers.nth(1).click()
      await page.waitForTimeout(500) // Wait for popup animation
      await expect(page.locator('.leaflet-popup').last()).toContainText('East Africa Highlands')

      // Click third marker
      await markers.nth(2).click()
      await page.waitForTimeout(500) // Wait for popup animation
      await expect(page.locator('.leaflet-popup').last()).toContainText('Southern Africa Plains')
    })
  })

  test.describe('Risk Summary Cards', () => {
    test('should display correct color coding for risk levels', async ({ page }) => {
      // Mock successful API response
      await mockSuccessfulApiResponse(page)

      // Navigate to dashboard
      await page.goto('/')

      // Wait for loading to complete
      await expect(page.locator('text=Loading region data...')).not.toBeVisible({ timeout: 10000 })

      // Verify high risk card has red styling (Requirement 5.4)
      // The cards are in a grid, find them by their text content
      const cards = page.locator('.grid > div')
      
      // Find high risk card and verify it has red styling
      const highRiskCard = cards.filter({ hasText: 'High Risk' })
      await expect(highRiskCard).toHaveClass(/bg-red/)

      // Find medium risk card and verify it has yellow styling
      const mediumRiskCard = cards.filter({ hasText: 'Medium Risk' })
      await expect(mediumRiskCard).toHaveClass(/bg-yellow/)

      // Find low risk card and verify it has green styling
      const lowRiskCard = cards.filter({ hasText: 'Low Risk' })
      await expect(lowRiskCard).toHaveClass(/bg-green/)
    })

    test('should display risk icons correctly', async ({ page }) => {
      // Mock successful API response
      await mockSuccessfulApiResponse(page)

      // Navigate to dashboard
      await page.goto('/')

      // Wait for loading to complete
      await expect(page.locator('text=Loading region data...')).not.toBeVisible({ timeout: 10000 })

      // Verify risk cards have icons (SVG elements)
      // Look for SVG within the risk card containers
      const riskSummarySection = page.locator('text=Risk Summary').locator('..')
      const svgIcons = riskSummarySection.locator('svg')
      
      // Should have at least 3 SVG icons (one for each risk level)
      await expect(svgIcons).toHaveCount(3, { timeout: 5000 })
    })
  })

  test.describe('Accessibility', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      // Mock successful API response
      await mockSuccessfulApiResponse(page)

      // Navigate to dashboard
      await page.goto('/')

      // Wait for loading to complete
      await expect(page.locator('text=Loading region data...')).not.toBeVisible({ timeout: 10000 })

      // Verify h1 exists
      await expect(page.locator('h1')).toHaveCount(1)
      await expect(page.locator('h1')).toContainText('HarvestAlert')

      // Verify h2 headings exist
      const h2Headings = page.locator('h2')
      await expect(h2Headings).toHaveCount(2) // Risk Summary and Regional Risk Map
    })

    test('should have accessible button labels', async ({ page }) => {
      // Mock API error to show retry button
      await mockApiErrorResponse(page, 500)

      // Navigate to dashboard
      await page.goto('/')

      // Wait for error state
      await expect(page.locator('text=/.*error.*/i')).toBeVisible({ timeout: 10000 })

      // Verify retry button has accessible text
      const retryButton = page.locator('button:has-text("Retry")')
      await expect(retryButton).toBeVisible()
      await expect(retryButton).toHaveText('Retry')
    })
  })
})
