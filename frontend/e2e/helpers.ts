/**
 * E2E Test Helpers
 * 
 * Common utilities and mock data for end-to-end tests
 */

import { Page } from '@playwright/test'
import { Region } from '@/lib/types'

/**
 * Mock region data for testing
 */
export const mockRegions: Region[] = [
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
 * Mock climate data for testing
 */
export const mockClimateData = {
  temperature: 32.5,
  rainfall: 45.2,
  drought_index: 68.3,
}

/**
 * Helper function to mock successful regions API response
 */
export async function mockRegionsSuccess(page: Page, regions: Region[] = mockRegions) {
  await page.route('**/regions', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(regions),
    })
  })
}

/**
 * Helper function to mock API error response
 */
export async function mockApiError(
  page: Page,
  endpoint: string = '**/regions',
  status: number = 500,
  message: string = 'Internal server error'
) {
  await page.route(endpoint, async (route) => {
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify({ detail: message }),
    })
  })
}

/**
 * Helper function to mock API timeout
 */
export async function mockApiTimeout(
  page: Page,
  endpoint: string = '**/regions',
  delayMs: number = 6000
) {
  await page.route(endpoint, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, delayMs))
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockRegions),
    })
  })
}

/**
 * Helper function to mock delayed API response
 */
export async function mockDelayedResponse(
  page: Page,
  endpoint: string = '**/regions',
  delayMs: number = 1000,
  data: any = mockRegions
) {
  await page.route(endpoint, async (route) => {
    await new Promise((resolve) => setTimeout(resolve, delayMs))
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(data),
    })
  })
}

/**
 * Helper function to wait for dashboard to load
 */
export async function waitForDashboardLoad(page: Page) {
  // Wait for loading to complete
  await page.waitForSelector('text=Loading region data...', { state: 'hidden', timeout: 10000 })
  
  // Wait for either map or error message to appear
  await Promise.race([
    page.waitForSelector('.leaflet-container', { timeout: 10000 }),
    page.waitForSelector('text=/.*error.*/i', { timeout: 10000 }),
  ])
}

/**
 * Helper function to wait for map to be fully loaded
 */
export async function waitForMapLoad(page: Page) {
  // Wait for map container
  await page.waitForSelector('.leaflet-container', { timeout: 10000 })
  
  // Wait for map tiles to load
  await page.waitForSelector('.leaflet-tile-container', { timeout: 10000 })
  
  // Wait for markers to be rendered
  await page.waitForSelector('.leaflet-marker-icon', { timeout: 10000 })
}

/**
 * Helper function to click a region marker by index
 */
export async function clickMarker(page: Page, index: number = 0) {
  const markers = page.locator('.leaflet-marker-icon')
  await markers.nth(index).click()
  
  // Wait for popup to appear
  await page.waitForSelector('.leaflet-popup', { timeout: 5000 })
}

/**
 * Helper function to get risk summary counts
 */
export async function getRiskSummaryCounts(page: Page) {
  const highRiskText = await page.locator('text=High Risk').locator('..').textContent()
  const mediumRiskText = await page.locator('text=Medium Risk').locator('..').textContent()
  const lowRiskText = await page.locator('text=Low Risk').locator('..').textContent()
  
  // Extract numbers from text
  const highCount = parseInt(highRiskText?.match(/\d+/)?.[0] || '0')
  const mediumCount = parseInt(mediumRiskText?.match(/\d+/)?.[0] || '0')
  const lowCount = parseInt(lowRiskText?.match(/\d+/)?.[0] || '0')
  
  return { high: highCount, medium: mediumCount, low: lowCount }
}

/**
 * Helper function to verify error state
 */
export async function verifyErrorState(page: Page) {
  // Verify error message is visible
  await page.waitForSelector('text=/.*error.*/i', { timeout: 10000 })
  
  // Verify retry button is present
  await page.waitForSelector('button:has-text("Retry")', { timeout: 5000 })
  
  // Verify map is not displayed
  const mapVisible = await page.locator('.leaflet-container').isVisible().catch(() => false)
  return !mapVisible
}

/**
 * Helper function to verify empty state
 */
export async function verifyEmptyState(page: Page) {
  // Verify empty state message
  await page.waitForSelector('text=No regions available', { timeout: 10000 })
  
  // Verify map is not displayed
  const mapVisible = await page.locator('.leaflet-container').isVisible().catch(() => false)
  return !mapVisible
}

/**
 * Helper function to set viewport size
 */
export async function setViewport(
  page: Page,
  device: 'mobile' | 'tablet' | 'desktop'
) {
  const viewports = {
    mobile: { width: 375, height: 667 },
    tablet: { width: 768, height: 1024 },
    desktop: { width: 1920, height: 1080 },
  }
  
  await page.setViewportSize(viewports[device])
}

/**
 * Helper function to measure page load time
 */
export async function measureLoadTime(page: Page, url: string = '/'): Promise<number> {
  const startTime = Date.now()
  await page.goto(url)
  await waitForDashboardLoad(page)
  return Date.now() - startTime
}
