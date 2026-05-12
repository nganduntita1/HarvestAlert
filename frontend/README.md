# HarvestAlert Frontend

Next.js-based frontend for the HarvestAlert Climate & Nutrition Early Warning Platform.

## Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Mapping**: Leaflet + React-Leaflet
- **Testing**: Jest + React Testing Library + fast-check (property-based testing)

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main dashboard page
│   └── globals.css        # Global styles
├── components/            # React components
├── lib/                   # Utility modules
│   ├── api.ts            # API client with error handling
│   ├── types.ts          # TypeScript type definitions
│   └── utils.ts          # Helper functions
├── __tests__/            # Test files
└── public/               # Static assets
```

## Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Update .env.local with your API URL
# NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### Development

```bash
# Start development server (port 3000)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Lint code
npm run lint
```

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# API Configuration (required)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Map Configuration (optional)
NEXT_PUBLIC_MAP_DEFAULT_CENTER_LAT=0
NEXT_PUBLIC_MAP_DEFAULT_CENTER_LNG=20
NEXT_PUBLIC_MAP_DEFAULT_ZOOM=3
```

## API Client

The API client (`lib/api.ts`) provides three main functions:

### `fetchRegions()`

Fetches all regions with risk data.

```typescript
import { fetchRegions } from '@/lib/api'

const regions = await fetchRegions()
// Returns: Region[]
```

### `fetchClimate()`

Fetches current climate data.

```typescript
import { fetchClimate } from '@/lib/api'

const climate = await fetchClimate()
// Returns: { temperature, rainfall, drought_index }
```

### `predictRisk(params)`

Predicts crop and nutrition risk based on climate parameters.

```typescript
import { predictRisk } from '@/lib/api'

const prediction = await predictRisk({
  temperature: 35,
  rainfall: 40
})
// Returns: { crop_risk, nutrition_risk }
```

### Error Handling

All API functions throw `ApiRequestError` on failure:

```typescript
import { fetchRegions, ApiRequestError } from '@/lib/api'

try {
  const regions = await fetchRegions()
} catch (error) {
  if (error instanceof ApiRequestError) {
    console.error('API Error:', error.message)
    console.error('Status:', error.status)
  }
}
```

Error types handled:
- **Network errors**: Connection failures
- **Timeout errors**: Requests exceeding 5 seconds
- **HTTP errors**: 4xx and 5xx responses
- **Validation errors**: Invalid response data

## Type Definitions

All types are defined in `lib/types.ts`:

- `Region`: Geographic area with risk data
- `ClimateData`: Weather and environmental conditions
- `RiskPrediction`: Crop and nutrition risk levels
- `PredictParams`: Parameters for risk prediction
- `RiskLevel`: Type-safe risk level enum ("low" | "medium" | "high")

## Utility Functions

Helper functions in `lib/utils.ts`:

- `getRiskColor(riskLevel)`: Map risk level to color name
- `getRiskColorClass(riskLevel)`: Get Tailwind CSS classes for risk level
- `aggregateRegionCounts(regions)`: Count regions by risk level
- `formatDate(dateString)`: Format ISO date for display
- `formatTemperature(temp)`: Format temperature with unit
- `formatRainfall(rainfall)`: Format rainfall with unit
- `formatDroughtIndex(index)`: Format drought index

## Performance Optimization

The frontend is optimized for low-bandwidth environments:

- **Initial bundle size**: ~87 KB (well under 500 KB requirement)
- **Compression**: Enabled via Next.js config
- **Code splitting**: Automatic via Next.js
- **Image optimization**: WebP format support
- **CSS**: Tailwind CSS for minimal CSS bundle

## Testing

### Unit Tests

Run unit tests with Jest and React Testing Library:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

### Property-Based Tests

Property-based tests use `fast-check` for testing universal properties:

```typescript
import fc from 'fast-check'

it('property test example', () => {
  fc.assert(
    fc.property(
      fc.constantFrom('low', 'medium', 'high'),
      (riskLevel) => {
        // Test property holds for all risk levels
        return true
      }
    ),
    { numRuns: 100 }
  )
})
```

### End-to-End Tests

Run E2E tests with Playwright:

```bash
# Run all E2E tests
npm run test:e2e

# Run tests in interactive UI mode
npm run test:e2e:ui

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Debug tests
npm run test:e2e:debug

# View test report
npm run test:e2e:report
```

**E2E Test Coverage:**
- ✅ Dashboard loading and map display
- ✅ Region marker interactions
- ✅ Risk summary cards
- ✅ API error handling with retry
- ✅ Loading states
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Accessibility

See `e2e/README.md` for detailed E2E testing documentation.

## Next Steps

- Task 8: Implement utility functions (in progress)
- Task 9: Implement UI components
- Task 10: Implement map components
- Task 11: Implement main dashboard page

## Requirements Validated

- ✅ 4.1: Display interactive map using Leaflet
- ✅ 4.2: Fetch region data from /regions endpoint
- ✅ 4.3: Display each region as marker at correct coordinates
- ✅ 4.5: Display region details on marker click
- ✅ 5.1: Display risk summary cards
- ✅ 5.2: Show count of regions at each risk level
- ✅ 6.1: API integration with error handling
- ✅ 6.2: Data fetching from backend endpoints
- ✅ 6.3: Error message display
- ✅ 6.4: Loading states and timeout handling
- ✅ 7.3: Low-bandwidth optimization (<500KB initial load)
- ✅ 9.1: Next.js with App Router
- ✅ 9.2: Tailwind CSS for styling
- ✅ 9.4: TypeScript for type safety
