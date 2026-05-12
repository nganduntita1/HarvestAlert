# Implementation Plan: HarvestAlert MVP

## Overview

This implementation plan breaks down the HarvestAlert MVP into discrete coding tasks. The system consists of a Python FastAPI backend and a Next.js/TypeScript frontend, with PostgreSQL/SQLite for data persistence. The implementation follows an incremental approach, building core functionality first, then adding features, testing, and bonus capabilities.

## Tasks

- [x] 1. Set up project structure and dependencies
  - Create root directory structure with `backend/` and `frontend/` folders
  - Create backend subdirectories: `routes/`, `models/`, `services/`, `tests/`
  - Create frontend subdirectories: `app/`, `components/`, `lib/`, `__tests__/`
  - Create `backend/requirements.txt` with FastAPI, SQLAlchemy, Uvicorn, Pydantic, pytest, hypothesis
  - Create `frontend/package.json` with Next.js, React, TypeScript, Tailwind CSS, Leaflet, React-Leaflet, fast-check, Jest
  - Create root-level `README.md` with setup instructions
  - Create `.env.example` files for both backend and frontend
  - _Requirements: 8.1, 8.2, 9.1, 9.2, 9.3, 11.1, 11.2, 11.3, 12.1, 12.2, 12.3, 19.4_

- [ ] 2. Set up database models and schema
  - [x] 2.1 Create database configuration and connection
    - Write `backend/database.py` with SQLAlchemy engine setup
    - Support both PostgreSQL and SQLite via environment variable
    - Include connection pooling and error handling
    - _Requirements: 10.1, 10.2, 19.2_
  
  - [x] 2.2 Implement Region model
    - Create `backend/models/region.py` with Region SQLAlchemy model
    - Define fields: id, name, latitude, longitude, crop_risk, nutrition_risk, last_updated
    - Add validation constraints for coordinates and risk levels
    - _Requirements: 3.2, 3.4, 10.3_
  
  - [x] 2.3 Implement ClimateData model
    - Create `backend/models/climate_data.py` with ClimateData SQLAlchemy model
    - Define fields: id, region_id, temperature, rainfall, drought_index, recorded_at
    - Add foreign key relationship to Region
    - Add validation constraints for climate data ranges
    - _Requirements: 1.3, 10.3_
  
  - [x] 2.4 Create database initialization script
    - Write `backend/init_db.py` to create tables and seed sample data
    - Include sample data for 3-5 regions with realistic values
    - _Requirements: 15.1, 15.2, 15.3, 15.4_

- [-] 3. Implement prediction engine core logic
  - [x] 3.1 Create prediction service with rule-based logic
    - Write `backend/services/prediction_service.py`
    - Implement `predict_crop_risk(temperature, rainfall)` function
    - Implement `predict_nutrition_risk(crop_risk, rainfall)` function
    - Implement `calculate_drought_index(temperature, rainfall)` function
    - Use thresholds: rainfall < 50mm AND temp > 30°C → high crop risk
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6, 14.1, 14.2, 14.4_
  
  - [ ]* 3.2 Write property test for prediction output validation
    - **Property 1: Prediction Engine Output Validation**
    - **Validates: Requirements 2.2, 2.3, 2.4**
    - Create `backend/tests/test_prediction_properties.py`
    - Use hypothesis to generate random valid temperature and rainfall values
    - Assert output contains valid risk levels ("low", "medium", "high")
    - Run minimum 100 iterations
  
  - [ ]* 3.3 Write property test for high risk threshold rule
    - **Property 2: High Risk Threshold Rule**
    - **Validates: Requirements 2.5**
    - Test that temp > 30 AND rainfall < 50 always produces "high" crop_risk
    - Use hypothesis to generate values in the high-risk range
  
  - [ ]* 3.4 Write property test for crop-nutrition risk relationship
    - **Property 3: Crop-Nutrition Risk Relationship**
    - **Validates: Requirements 2.6**
    - Test that high crop_risk never produces "low" nutrition_risk
    - Use hypothesis to generate inputs that produce high crop risk
  
  - [ ]* 3.5 Write unit tests for prediction service
    - Test specific examples: high risk (35°C, 30mm), low risk (25°C, 150mm), medium risk (32°C, 80mm)
    - Test edge cases: zero rainfall, extreme temperature, boundary values
    - Test drought index calculation formula
    - _Requirements: 2.2, 2.3, 2.4, 2.5, 2.6_

- [x] 4. Implement backend services
  - [x] 4.1 Create climate data service
    - Write `backend/services/climate_service.py`
    - Implement `get_current_climate()` to retrieve latest climate data
    - Implement `get_climate_by_region(region_id)` for region-specific data
    - _Requirements: 1.1, 1.2, 1.3_
  
  - [x] 4.2 Create region service
    - Write `backend/services/region_service.py`
    - Implement `get_all_regions()` to fetch all regions with risk levels
    - Implement `get_region_by_id(region_id)` for single region retrieval
    - Implement `update_region_risk(region_id, crop_risk, nutrition_risk)` for updates
    - _Requirements: 3.1, 3.2_
  
  - [ ]* 4.3 Write unit tests for services
    - Test climate service data retrieval
    - Test region service CRUD operations
    - Test error handling for invalid region IDs
    - _Requirements: 1.1, 1.2, 3.1, 3.2_

- [x] 5. Implement backend API routes
  - [x] 5.1 Create FastAPI application setup
    - Write `backend/main.py` with FastAPI app initialization
    - Configure CORS middleware for frontend integration
    - Add request logging middleware
    - Set up error handlers for common exceptions
    - _Requirements: 8.1, 8.4, 19.2_
  
  - [x] 5.2 Implement /climate endpoint
    - Create `backend/routes/climate.py`
    - Implement `GET /climate` route returning temperature, rainfall, drought_index
    - Add input validation and error handling
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [x] 5.3 Implement /predict endpoint
    - Create `backend/routes/predict.py`
    - Implement `POST /predict` route accepting temperature and rainfall
    - Return crop_risk and nutrition_risk predictions
    - Add input validation (temperature: -50 to 60, rainfall: 0 to 1000)
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_
  
  - [x] 5.4 Implement /regions endpoint
    - Create `backend/routes/regions.py`
    - Implement `GET /regions` route returning list of all regions
    - Include name, latitude, longitude, crop_risk, nutrition_risk, last_updated
    - _Requirements: 3.1, 3.2, 3.3, 3.4_
  
  - [ ]* 5.5 Write integration tests for API endpoints
    - Create `backend/tests/test_api_integration.py`
    - Test /climate endpoint returns valid data structure
    - Test /predict endpoint with valid and invalid inputs
    - Test /regions endpoint returns correct region count and structure
    - Test error responses (400, 404, 500, 503)
    - Test response time requirements (< 2 seconds for /climate and /regions, < 1 second for /predict)
    - _Requirements: 1.4, 2.7, 3.1, 3.2, 3.3, 3.4, 20.1_

- [x] 6. Checkpoint - Backend core functionality complete
  - Ensure all backend tests pass
  - Verify database connection and sample data loading
  - Test all API endpoints manually using curl or Postman
  - Ask the user if questions arise

- [x] 7. Set up frontend project structure
  - [x] 7.1 Initialize Next.js project with TypeScript
    - Create Next.js app with App Router in `frontend/` directory
    - Configure TypeScript with strict mode
    - Set up Tailwind CSS configuration
    - _Requirements: 9.1, 9.2, 9.4_
  
  - [x] 7.2 Create TypeScript type definitions
    - Create `frontend/lib/types.ts`
    - Define Region, ClimateData, RiskPrediction, PredictParams interfaces
    - Include validation for risk level enums
    - _Requirements: 3.2, 3.4, 9.4_
  
  - [x] 7.3 Create API client module
    - Create `frontend/lib/api.ts`
    - Implement `fetchRegions()` function with error handling and timeout
    - Implement `fetchClimate()` function
    - Implement `predictRisk(params)` function
    - Add 5-second timeout for all requests
    - Include network error, timeout, and HTTP error handling
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [ ]* 7.4 Write unit tests for API client
    - Create `frontend/__tests__/api.test.ts`
    - Mock fetch API
    - Test successful data fetching
    - Test network error handling
    - Test timeout error handling
    - Test HTTP error responses
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 8. Implement frontend utility functions
  - [x] 8.1 Create risk-to-color mapping function
    - Create `frontend/lib/utils.ts`
    - Implement `getRiskColor(riskLevel)` function
    - Map "low" → "green", "medium" → "yellow", "high" → "red"
    - _Requirements: 4.4, 5.4_
  
  - [x] 8.2 Create region aggregation function
    - Implement `aggregateRegionCounts(regions)` in `frontend/lib/utils.ts`
    - Count regions by risk level (low, medium, high)
    - Return object with counts for each level
    - _Requirements: 5.2_
  
  - [ ]* 8.3 Write property test for risk-to-color mapping
    - **Property 4: Risk Level Color Mapping**
    - **Validates: Requirements 4.4, 5.4**
    - Create `frontend/__tests__/properties.test.ts`
    - Use fast-check to test all valid risk levels
    - Assert correct color for each risk level
    - Run minimum 100 iterations
  
  - [ ]* 8.4 Write property test for region count aggregation
    - **Property 5: Region Count Aggregation**
    - **Validates: Requirements 5.2**
    - Use fast-check to generate random region arrays
    - Assert sum of counts equals total regions
    - Test with empty arrays and various risk distributions

- [x] 9. Implement frontend UI components
  - [x] 9.1 Create LoadingSpinner component
    - Create `frontend/components/LoadingSpinner.tsx`
    - Display animated spinner during data loading
    - _Requirements: 6.4_
  
  - [x] 9.2 Create ErrorMessage component
    - Create `frontend/components/ErrorMessage.tsx`
    - Display user-friendly error messages
    - Include optional retry button
    - _Requirements: 6.3_
  
  - [x] 9.3 Create RiskSummaryCard component
    - Create `frontend/components/RiskSummaryCard.tsx`
    - Display count of regions by risk level
    - Use color coding (green, yellow, red)
    - Handle empty region list
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [ ]* 9.4 Write unit tests for RiskSummaryCard
    - Create `frontend/__tests__/components/RiskSummaryCard.test.tsx`
    - Test correct count display for each risk level
    - Test empty region list handling
    - Test color coding
    - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [x] 10. Implement map components
  - [x] 10.1 Create RegionMarker component
    - Create `frontend/components/RegionMarker.tsx`
    - Render Leaflet marker at region coordinates
    - Color-code marker by risk level
    - Display popup with region details on click
    - _Requirements: 4.3, 4.4, 4.5_
  
  - [x] 10.2 Create Map component
    - Create `frontend/components/Map.tsx`
    - Initialize Leaflet map with default center and zoom
    - Render RegionMarker for each region
    - Handle marker click events
    - Configure map tiles for low-bandwidth (use lightweight tile provider)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 7.2_
  
  - [ ]* 10.3 Write component tests for map components
    - Test RegionMarker renders at correct coordinates
    - Test marker color coding
    - Test popup display on click
    - _Requirements: 4.3, 4.4, 4.5_

- [x] 11. Implement main dashboard page
  - [x] 11.1 Create dashboard page component
    - Create `frontend/app/page.tsx`
    - Fetch region data on component mount
    - Manage loading, error, and success states
    - Render Map component with region data
    - Render RiskSummaryCard component
    - _Requirements: 4.1, 4.2, 4.6, 5.1, 6.1, 6.4_
  
  - [x] 11.2 Optimize for low-bandwidth
    - Minimize initial bundle size using dynamic imports for map
    - Configure Next.js image optimization
    - Add compression for API responses
    - Ensure initial load < 500KB (excluding map tiles)
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [ ]* 11.3 Write integration tests for dashboard
    - Test data fetching on page load
    - Test loading state display
    - Test error state display with retry
    - Test successful data rendering
    - _Requirements: 4.1, 4.2, 4.6, 6.1, 6.4_

- [x] 12. Checkpoint - Frontend core functionality complete
  - Ensure all frontend tests pass
  - Verify map renders with sample data
  - Test API integration with running backend
  - Verify low-bandwidth optimization (check bundle size)
  - Ask the user if questions arise

- [x] 13. Add comprehensive documentation
  - [x] 13.1 Create root README with setup instructions
    - Document prerequisites (Python 3.9+, Node.js 18+)
    - Document backend setup: virtual environment, dependencies, database initialization
    - Document frontend setup: npm install, environment variables
    - Document how to run backend (uvicorn) and frontend (npm run dev)
    - Include example API responses
    - _Requirements: 11.4, 12.3, 12.4_
  
  - [x] 13.2 Add code comments and docstrings
    - Add docstrings to all Python functions and classes
    - Add JSDoc comments to TypeScript functions
    - Document complex logic in prediction engine
    - _Requirements: 13.1, 13.2, 13.3, 13.4_
  
  - [x] 13.3 Create API documentation
    - Document all API endpoints with request/response examples
    - Include error response formats
    - Document validation rules
    - _Requirements: 12.4, 13.4_

- [x] 14. Implement deployment configuration
  - [x] 14.1 Create Docker configuration (optional)
    - Create `Dockerfile` for backend
    - Create `Dockerfile` for frontend
    - Create `docker-compose.yml` for full stack deployment
    - _Requirements: 12.5_
  
  - [x] 14.2 Create environment configuration
    - Create `.env.example` with all required variables
    - Document environment variables in README
    - Configure backend to read from environment (database URL, port, CORS origins)
    - Configure frontend to read API base URL from environment
    - _Requirements: 19.1, 19.2, 19.3, 19.4_

- [x] 15. Performance optimization and testing
  - [ ]* 15.1 Write performance tests for backend
    - Create `backend/tests/test_performance.py`
    - Test /climate endpoint responds < 2 seconds
    - Test /predict endpoint responds < 1 second
    - Test /regions endpoint responds < 2 seconds
    - Test database queries complete < 500ms
    - _Requirements: 1.4, 2.7, 10.4, 20.1_
  
  - [x] 15.2 Optimize frontend performance
    - Implement code splitting for map component
    - Add React.memo for expensive components
    - Optimize re-renders with useMemo and useCallback
    - Verify page load < 3 seconds
    - _Requirements: 4.6, 20.2, 20.3_
  
  - [ ]* 15.3 Test concurrent user handling
    - Test backend handles 10 concurrent requests without degradation
    - _Requirements: 20.4_

- [x] 16. End-to-end testing
  - [ ]* 16.1 Set up E2E testing framework
    - Install Playwright or Cypress
    - Configure E2E test environment
    - Create `e2e/dashboard.spec.ts`
  
  - [ ]* 16.2 Write E2E tests for critical workflows
    - Test dashboard loads and displays map with regions
    - Test region marker click displays popup
    - Test risk summary cards display correct counts
    - Test API error handling with retry
    - _Requirements: 4.1, 4.2, 4.3, 4.5, 5.1, 5.2, 6.3_

- [x] 17. Checkpoint - Core MVP complete
  - Run full test suite (property tests, unit tests, integration tests, E2E tests)
  - Verify all requirements 1-15 are met
  - Test deployment with Docker (if implemented)
  - Perform manual testing of all features
  - Ask the user if questions arise

- [x] 18. Bonus Feature: SMS Alert Service
  - [x] 18.1 Implement SMS alert endpoint
    - Create `backend/routes/alerts.py`
    - Implement `POST /alerts/sms` route
    - Accept phone number and message parameters
    - Create mock SMS service (log to console for MVP)
    - Return success confirmation with mock message_id
    - _Requirements: 16.1, 16.2, 16.3, 16.4_
  
  - [ ]* 18.2 Write tests for SMS alert endpoint
    - Test endpoint accepts valid phone and message
    - Test endpoint returns success response
    - Test input validation

- [x] 19. Bonus Feature: Offline Caching
  - [x] 19.1 Implement browser caching for API responses
    - Add localStorage caching to API client functions
    - Cache region data with timestamp
    - Implement cache expiration (e.g., 5 minutes)
    - _Requirements: 17.1, 17.2_
  
  - [x] 19.2 Add offline indicator to UI
    - Display badge when showing cached data
    - Show "Last updated" timestamp
    - Auto-refresh when connectivity restored
    - _Requirements: 17.3, 17.4_
  
  - [ ]* 19.3 Write tests for offline caching
    - Test cache storage and retrieval
    - Test fallback to cached data on network failure
    - Test cache expiration

- [x] 20. Bonus Feature: Risk Trend Visualization
  - [x] 20.1 Create trend data endpoint
    - Add `GET /regions/{region_id}/trends` endpoint
    - Return historical risk data (last 7 data points)
    - _Requirements: 18.1, 18.2_
  
  - [x] 20.2 Create TrendChart component
    - Create `frontend/components/TrendChart.tsx`
    - Use lightweight charting library (e.g., recharts)
    - Display line or bar chart of risk levels over time
    - Allow region selection
    - _Requirements: 18.1, 18.2, 18.3, 18.4_
  
  - [ ]* 20.3 Write tests for trend visualization
    - Test chart renders with trend data
    - Test region selection
    - Test empty data handling

- [x] 21. Final checkpoint and deployment preparation
  - Run complete test suite including all bonus features
  - Verify all documentation is complete and accurate
  - Test full deployment process
  - Perform security review (input validation, SQL injection prevention, XSS protection)
  - Verify performance requirements under load
  - Create deployment guide for production environment
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Integration tests validate API endpoints and service interactions
- E2E tests validate critical user workflows
- Checkpoints ensure incremental validation and provide opportunities for user feedback
- Backend uses Python with FastAPI, SQLAlchemy, and pytest/hypothesis
- Frontend uses Next.js with TypeScript, React, Tailwind CSS, and fast-check
- Bonus features (tasks 18-20) can be implemented after core MVP is validated
