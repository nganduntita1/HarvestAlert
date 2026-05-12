# End-to-End Tests for HarvestAlert MVP

This directory contains end-to-end (E2E) tests for the HarvestAlert dashboard using Playwright.

## Overview

The E2E tests validate critical user workflows:

- **Dashboard Loading**: Map displays with region markers
- **Region Interactions**: Clicking markers shows region details
- **Risk Summary**: Cards display correct counts and color coding
- **Error Handling**: API failures show error messages with retry
- **Loading States**: Spinner displays during data fetch
- **Responsive Design**: Works on mobile, tablet, and desktop
- **Accessibility**: Proper heading hierarchy and button labels

## Requirements Validated

- **Requirement 4.1**: Display interactive map using Leaflet
- **Requirement 4.2**: Fetch region data from /regions endpoint
- **Requirement 4.3**: Display each region as marker at correct coordinates
- **Requirement 4.5**: Display region details on marker click
- **Requirement 5.1**: Display risk summary cards
- **Requirement 5.2**: Show count of regions at each risk level
- **Requirement 6.3**: Display error message when API request fails

## Setup

### Install Dependencies

```bash
npm install
```

### Install Playwright Browsers

```bash
npx playwright install
```

## Running Tests

### Run All E2E Tests

```bash
npm run test:e2e
```

### Run Tests in UI Mode (Interactive)

```bash
npm run test:e2e:ui
```

### Run Tests in Headed Mode (See Browser)

```bash
npm run test:e2e:headed
```

### Debug Tests

```bash
npm run test:e2e:debug
```

### View Test Report

```bash
npm run test:e2e:report
```

## Test Structure

### `dashboard.spec.ts`

Main E2E test file containing:

1. **Successful Dashboard Load**
   - Loads dashboard and displays map with regions
   - Displays correct risk summary counts
   - Shows region details on marker click
   - Renders map within 3 seconds

2. **API Error Handling**
   - Displays error message when API fails
   - Retries API request when retry button clicked
   - Handles network timeout gracefully
   - Handles 404 error gracefully

3. **Loading States**
   - Displays loading spinner while fetching data

4. **Empty State**
   - Displays empty state when no regions available

5. **Responsive Design**
   - Works on mobile viewport (375x667)
   - Works on tablet viewport (768x1024)

6. **Map Interactions**
   - Allows map zoom and pan
   - Displays multiple region popups sequentially

7. **Risk Summary Cards**
   - Displays correct color coding for risk levels
   - Displays risk icons correctly

8. **Accessibility**
   - Has proper heading hierarchy
   - Has accessible button labels

## Configuration

The Playwright configuration is in `playwright.config.ts`:

- **Test Directory**: `./e2e`
- **Base URL**: `http://localhost:3000` (configurable via `PLAYWRIGHT_BASE_URL`)
- **Browsers**: Chromium (default), Firefox, WebKit (optional)
- **Web Server**: Automatically starts `npm run dev` before tests
- **Retries**: 2 retries on CI, 0 locally
- **Reporters**: HTML report
- **Screenshots**: On failure
- **Videos**: On failure

## Running with Backend

For full integration testing, ensure the backend is running:

```bash
# Terminal 1: Start backend
cd backend
uvicorn main:app --reload

# Terminal 2: Run E2E tests
cd frontend
npm run test:e2e
```

## Mocking API Responses

The tests use Playwright's route mocking to simulate API responses:

- **Success**: Returns mock region data
- **Error**: Returns 500 status with error message
- **Timeout**: Delays response beyond 5-second timeout
- **Empty**: Returns empty array

This allows testing without a running backend and ensures consistent test results.

## CI/CD Integration

To run tests in CI:

```bash
# Install dependencies
npm ci

# Install Playwright browsers
npx playwright install --with-deps

# Run tests
npm run test:e2e
```

## Troubleshooting

### Tests Fail with "Timeout"

- Increase timeout in test: `await expect(element).toBeVisible({ timeout: 15000 })`
- Check if dev server is running: `npm run dev`
- Verify API is accessible: `curl http://localhost:8000/regions`

### Map Not Loading

- Ensure Leaflet CSS is imported in components
- Check browser console for JavaScript errors
- Verify map container has height set

### Markers Not Clickable

- Wait for markers to be fully rendered: `await expect(markers.first()).toBeVisible()`
- Ensure markers are not covered by other elements
- Check z-index of map elements

## Best Practices

1. **Use Data Attributes**: Add `data-testid` to elements for stable selectors
2. **Wait for Elements**: Always wait for elements to be visible before interacting
3. **Mock API Calls**: Use route mocking for consistent test results
4. **Test User Flows**: Focus on critical user workflows, not implementation details
5. **Keep Tests Independent**: Each test should be able to run in isolation
6. **Use Page Objects**: For complex pages, consider using Page Object Model

## Future Enhancements

- Add visual regression testing with Playwright screenshots
- Test offline caching functionality (Requirement 17)
- Test SMS alert service (Requirement 16)
- Add performance testing with Lighthouse
- Test cross-browser compatibility (Firefox, Safari)
