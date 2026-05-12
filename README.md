# HarvestAlert MVP

An AI-powered Climate & Nutrition Early Warning Platform that predicts crop failure and malnutrition risk using climate data.

## Overview

HarvestAlert is a full-stack web application designed to help humanitarian workers and decision-makers identify regions at risk of crop failure and food insecurity. The system uses climate data (temperature and rainfall) to generate risk predictions and displays them on an interactive map interface.

### Key Features

- **Real-time Risk Assessment**: Rule-based prediction engine calculates crop and nutrition risk levels
- **Interactive Map Dashboard**: Visual representation of risk data with color-coded markers
- **Low-Bandwidth Optimized**: Designed for deployment in resource-constrained environments
- **RESTful API**: Well-documented endpoints for integration with other systems
- **Extensible Architecture**: Built to support future ML model integration

### System Components

HarvestAlert consists of two main components:
- **Backend API** (FastAPI/Python): REST endpoints for climate data, risk predictions, and region information
- **Frontend Dashboard** (Next.js/React): Interactive map-based interface for visualizing risk data

## Project Structure

```
HarvestAlert/
├── backend/                 # FastAPI backend
│   ├── routes/             # API route handlers
│   │   ├── climate.py      # Climate data endpoints
│   │   ├── predict.py      # Risk prediction endpoints
│   │   └── regions.py      # Region data endpoints
│   ├── models/             # Database models (SQLAlchemy)
│   │   ├── region.py       # Region model with risk data
│   │   └── climate_data.py # Climate measurements model
│   ├── services/           # Business logic layer
│   │   ├── prediction_service.py  # Risk calculation logic
│   │   ├── climate_service.py     # Climate data retrieval
│   │   └── region_service.py      # Region data management
│   ├── tests/              # Backend tests (pytest)
│   ├── database.py         # Database configuration
│   ├── init_db.py          # Database initialization script
│   ├── main.py             # FastAPI application entry point
│   └── requirements.txt    # Python dependencies
├── frontend/               # Next.js frontend
│   ├── app/                # Next.js app router pages
│   │   ├── page.tsx        # Main dashboard page
│   │   └── layout.tsx      # Root layout
│   ├── components/         # React components
│   │   ├── Map.tsx         # Interactive Leaflet map
│   │   ├── RegionMarker.tsx       # Map marker component
│   │   ├── RiskSummaryCard.tsx    # Risk statistics display
│   │   ├── ErrorMessage.tsx       # Error display component
│   │   └── LoadingSpinner.tsx     # Loading indicator
│   ├── lib/                # Utility functions and API client
│   │   ├── api.ts          # API client with error handling
│   │   ├── types.ts        # TypeScript type definitions
│   │   └── utils.ts        # Helper functions
│   ├── __tests__/          # Frontend tests (Jest)
│   ├── package.json        # Node.js dependencies
│   └── next.config.js      # Next.js configuration
└── README.md               # This file
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.9 or higher** - [Download Python](https://www.python.org/downloads/)
- **Node.js 18 or higher** - [Download Node.js](https://nodejs.org/)
- **PostgreSQL** (recommended) or **SQLite** (for development) - [Download PostgreSQL](https://www.postgresql.org/download/)
- **Git** - [Download Git](https://git-scm.com/downloads)

## Quick Start

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**
   
   On macOS/Linux:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
   
   On Windows:
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and configure your database connection:
   ```env
   # For PostgreSQL (recommended for production)
   DATABASE_URL=postgresql://username:password@localhost:5432/harvestalert
   
   # OR for SQLite (good for development/testing)
   DATABASE_URL=sqlite:///./harvestalert.db
   
   # API Configuration
   API_PORT=8000
   CORS_ORIGINS=http://localhost:3000
   ```

5. **Initialize the database:**
   
   This creates tables and loads sample data for 3 regions:
   ```bash
   python init_db.py
   ```
   
   You should see output confirming:
   - Database tables created
   - Sample regions inserted (Sahel Region, East Africa Highlands, Southern Africa Plains)
   - Sample climate data inserted

6. **Start the backend server:**
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   
   The API will be available at `http://localhost:8000`
   
   You can verify it's running by visiting:
   - API docs: `http://localhost:8000/docs` (Swagger UI)
   - Health check: `http://localhost:8000/health`

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```
   
   This will install all required packages including Next.js, React, Leaflet, and testing libraries.

3. **Set up environment variables:**
   
   Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and configure the API base URL:
   ```env
   # Backend API URL
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   The dashboard will be available at `http://localhost:3000`
   
   The page will automatically reload when you make changes to the code.

### Accessing the Application

Once both servers are running:

1. **Open your browser** and navigate to `http://localhost:3000`
2. **View the interactive map** showing regions with color-coded risk markers:
   - 🟢 Green = Low risk
   - 🟡 Yellow = Medium risk
   - 🔴 Red = High risk
3. **Click on markers** to see detailed region information
4. **View risk summary cards** showing aggregated statistics

### Troubleshooting

**Backend won't start:**
- Ensure Python 3.9+ is installed: `python --version`
- Check that virtual environment is activated (you should see `(venv)` in your terminal)
- Verify database connection in `.env` file
- Try deleting and recreating the database: `rm harvestalert.db && python init_db.py`

**Frontend won't start:**
- Ensure Node.js 18+ is installed: `node --version`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check that `.env.local` has the correct API URL
- Clear Next.js cache: `rm -rf .next`

**Map not loading:**
- Check browser console for errors (F12)
- Verify backend is running at `http://localhost:8000`
- Check network tab to see if API requests are succeeding
- Ensure CORS is configured correctly in backend `.env`

## Running Tests

### Backend Tests

The backend uses pytest for testing with support for property-based testing via hypothesis.

**Run all tests:**
```bash
cd backend
pytest
```

**Run with coverage report:**
```bash
pytest --cov=. --cov-report=html
```

**Run specific test files:**
```bash
# Test prediction service
pytest tests/test_prediction_service.py

# Test API routes
pytest tests/test_api_routes.py

# Test database operations
pytest tests/test_database.py
```

**Run tests in verbose mode:**
```bash
pytest -v
```

Coverage reports will be generated in `htmlcov/index.html`

### Frontend Tests

The frontend uses Jest and React Testing Library for unit and integration tests.

**Run all tests:**
```bash
cd frontend
npm test
```

**Run tests in watch mode (for development):**
```bash
npm run test:watch
```

**Run with coverage report:**
```bash
npm test -- --coverage
```

**Run specific test files:**
```bash
# Test API client
npm test -- api.test.ts

# Test components
npm test -- components/
```

### Test Structure

- **Unit Tests**: Test individual functions and components in isolation
- **Integration Tests**: Test API endpoints and database operations
- **Property-Based Tests**: Test universal properties across many inputs (using hypothesis/fast-check)

## API Documentation

### Base URL

```
http://localhost:8000
```

### Authentication

The MVP does not require authentication. Future versions may implement API keys or OAuth.

### Common Response Codes

- `200 OK` - Request succeeded
- `400 Bad Request` - Invalid input parameters
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Database temporarily unavailable

### Error Response Format

All error responses follow this format:

```json
{
  "detail": "Error message describing what went wrong"
}
```

For validation errors (400), additional error details may be included:

```json
{
  "detail": "Invalid request parameters",
  "errors": [
    {
      "loc": ["body", "temperature"],
      "msg": "ensure this value is less than or equal to 60",
      "type": "value_error"
    }
  ]
}
```

### Endpoints

#### GET /climate

Returns current climate data including temperature, rainfall, and drought index.

**Request:**
```bash
curl http://localhost:8000/climate
```

**Response:** `200 OK`
```json
{
  "temperature": 35.5,
  "rainfall": 45.2,
  "drought_index": 68.3,
  "recorded_at": "2024-01-15T10:30:00",
  "region_id": 1
}
```

**Response Fields:**
- `temperature` (float): Temperature in Celsius
- `rainfall` (float): Rainfall in millimeters
- `drought_index` (float): Drought severity index (0-100 scale, higher = more severe)
- `recorded_at` (string): ISO 8601 timestamp when data was recorded
- `region_id` (integer): ID of the region this data belongs to

**Error Responses:**
- `404 Not Found`: No climate data available in the database
- `500 Internal Server Error`: Database or server error

---

#### POST /predict

Predicts crop and nutrition risk based on climate parameters.

**Request:**
```bash
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "temperature": 35.5,
    "rainfall": 45.2
  }'
```

**Request Body:**
```json
{
  "temperature": 35.5,
  "rainfall": 45.2
}
```

**Request Parameters:**
- `temperature` (float, required): Temperature in Celsius (range: -50 to 60)
- `rainfall` (float, required): Rainfall in millimeters (range: 0 to 1000)

**Response:** `200 OK`
```json
{
  "crop_risk": "high",
  "nutrition_risk": "medium"
}
```

**Response Fields:**
- `crop_risk` (string): Crop failure risk level - one of: `"low"`, `"medium"`, `"high"`
- `nutrition_risk` (string): Malnutrition risk level - one of: `"low"`, `"medium"`, `"high"`

**Prediction Rules:**
- **High crop risk**: rainfall < 50mm AND temperature > 30°C
- **Medium crop risk**: rainfall < 100mm OR temperature > 35°C
- **Low crop risk**: otherwise
- **Nutrition risk**: derived from crop risk (high crop risk → high/medium nutrition risk)

**Error Responses:**
- `400 Bad Request`: Invalid temperature or rainfall values (outside valid ranges)
- `500 Internal Server Error`: Prediction calculation failed

**Example Error Response:**
```json
{
  "detail": "Temperature must be between -50 and 60 Celsius"
}
```

---

#### GET /regions

Returns list of all regions with risk data.

**Request:**
```bash
curl http://localhost:8000/regions
```

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "name": "Sahel Region",
    "latitude": 14.5,
    "longitude": -14.5,
    "crop_risk": "high",
    "nutrition_risk": "high",
    "last_updated": "2024-01-15T10:30:00"
  },
  {
    "id": 2,
    "name": "East Africa Highlands",
    "latitude": -1.3,
    "longitude": 36.8,
    "crop_risk": "medium",
    "nutrition_risk": "medium",
    "last_updated": "2024-01-15T10:30:00"
  },
  {
    "id": 3,
    "name": "Southern Africa Plains",
    "latitude": -25.7,
    "longitude": 28.2,
    "crop_risk": "low",
    "nutrition_risk": "low",
    "last_updated": "2024-01-15T10:30:00"
  }
]
```

**Response Fields (per region):**
- `id` (integer): Unique region identifier
- `name` (string): Human-readable region name
- `latitude` (float): Latitude coordinate (range: -90 to 90)
- `longitude` (float): Longitude coordinate (range: -180 to 180)
- `crop_risk` (string): Current crop failure risk level - `"low"`, `"medium"`, or `"high"`
- `nutrition_risk` (string): Current malnutrition risk level - `"low"`, `"medium"`, or `"high"`
- `last_updated` (string): ISO 8601 timestamp of last risk assessment update

**Error Responses:**
- `500 Internal Server Error`: Database or server error

---

#### GET /regions/{region_id}

Returns detailed information for a specific region.

**Request:**
```bash
curl http://localhost:8000/regions/1
```

**Path Parameters:**
- `region_id` (integer, required): ID of the region to retrieve

**Response:** `200 OK`
```json
{
  "id": 1,
  "name": "Sahel Region",
  "latitude": 14.5,
  "longitude": -14.5,
  "crop_risk": "high",
  "nutrition_risk": "high",
  "last_updated": "2024-01-15T10:30:00"
}
```

**Response Fields:** Same as GET /regions (single region object)

**Error Responses:**
- `404 Not Found`: Region with specified ID does not exist
- `500 Internal Server Error`: Database or server error

---

#### GET /climate/{region_id}

Returns climate data for a specific region.

**Request:**
```bash
curl http://localhost:8000/climate/1
```

**Path Parameters:**
- `region_id` (integer, required): ID of the region to retrieve climate data for

**Response:** `200 OK`
```json
{
  "temperature": 35.5,
  "rainfall": 45.2,
  "drought_index": 68.3,
  "recorded_at": "2024-01-15T10:30:00",
  "region_id": 1
}
```

**Response Fields:** Same as GET /climate

**Error Responses:**
- `404 Not Found`: No climate data available for the specified region
- `500 Internal Server Error`: Database or server error

---

#### GET /health

Health check endpoint for monitoring.

**Request:**
```bash
curl http://localhost:8000/health
```

**Response:** `200 OK`
```json
{
  "status": "healthy",
  "database": "connected"
}
```

**Response Fields:**
- `status` (string): Overall health status - `"healthy"` or `"degraded"`
- `database` (string): Database connection status - `"connected"` or `"disconnected"`

---

### Interactive API Documentation

FastAPI provides automatic interactive API documentation:

- **Swagger UI**: `http://localhost:8000/docs`
  - Interactive interface to test all endpoints
  - View request/response schemas
  - Try out API calls directly from the browser

- **ReDoc**: `http://localhost:8000/redoc`
  - Alternative documentation interface
  - Clean, readable format
  - Good for sharing with stakeholders

## Environment Variables

### Backend (.env)

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Database Configuration (Requirement 19.1)
# For PostgreSQL (recommended for production):
DATABASE_URL=postgresql://username:password@localhost:5432/harvestalert

# For SQLite (good for development/testing):
# DATABASE_URL=sqlite:///./harvestalert.db

# API Configuration (Requirement 19.2)
API_PORT=8000
API_HOST=0.0.0.0

# CORS Configuration (Requirement 19.3)
# Comma-separated list of allowed origins for CORS
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Environment Settings
ENVIRONMENT=development

# Logging Level (optional, defaults to INFO)
LOG_LEVEL=INFO

# PostgreSQL connection pool settings (optional, only for PostgreSQL)
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=10
DB_POOL_TIMEOUT=30
DB_POOL_RECYCLE=3600
```

**Configuration Notes:**
- Replace `username`, `password`, and database name in PostgreSQL URL
- SQLite creates a local file database (good for quick setup)
- Add production frontend URL to CORS_ORIGINS when deploying
- LOG_LEVEL can be: DEBUG, INFO, WARNING, ERROR, CRITICAL

### Frontend (.env.local)

Create a `.env.local` file in the `frontend/` directory:

```env
# Backend API URL (Requirement 19.4)
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000

# Optional: Map Configuration
NEXT_PUBLIC_MAP_DEFAULT_CENTER_LAT=0
NEXT_PUBLIC_MAP_DEFAULT_CENTER_LNG=20
NEXT_PUBLIC_MAP_DEFAULT_ZOOM=3

# Environment
NODE_ENV=development
```

**Configuration Notes:**
- `NEXT_PUBLIC_` prefix makes the variable available in the browser
- Update API URL when deploying to production
- Never commit `.env.local` to version control (it's in .gitignore)

## Technology Stack

### Backend
- **FastAPI** - Modern, fast web framework for building APIs
- **SQLAlchemy** - SQL toolkit and ORM for database operations
- **PostgreSQL/SQLite** - Relational database for data persistence
- **Uvicorn** - Lightning-fast ASGI server
- **Pydantic** - Data validation using Python type annotations
- **pytest** - Testing framework with fixtures and parametrization
- **hypothesis** - Property-based testing library

### Frontend
- **Next.js 14** - React framework with App Router for server-side rendering
- **React 18** - UI library for building interactive interfaces
- **TypeScript** - Type-safe JavaScript for better developer experience
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **Leaflet** - Open-source JavaScript library for interactive maps
- **React-Leaflet** - React components for Leaflet maps
- **Jest** - JavaScript testing framework
- **React Testing Library** - Testing utilities for React components
- **fast-check** - Property-based testing for TypeScript

## Architecture Overview

### System Design

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Dashboard   │  │     Map      │  │  Risk Cards  │     │
│  │    Page      │──│  Component   │  │  Component   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                                                    │
│         │ HTTP/REST                                         │
│         ▼                                                    │
│  ┌──────────────────────────────────────────────────┐      │
│  │           API Client (with error handling)        │      │
│  └──────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ HTTP/REST (JSON)
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                         Backend API                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Climate    │  │   Predict    │  │   Regions    │     │
│  │   Routes     │  │   Routes     │  │   Routes     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                  │                  │             │
│         ▼                  ▼                  ▼             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Climate    │  │  Prediction  │  │   Region     │     │
│  │   Service    │  │   Service    │  │   Service    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│         │                                     │             │
│         └─────────────────┬───────────────────┘             │
│                           ▼                                 │
│                  ┌──────────────┐                           │
│                  │   Database   │                           │
│                  │    Layer     │                           │
│                  └──────────────┘                           │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
                  ┌──────────────┐
                  │  PostgreSQL  │
                  │  or SQLite   │
                  └──────────────┘
```

### Data Flow

1. **User Interaction**: User opens dashboard in browser
2. **Data Fetch**: Frontend fetches region data from `/regions` endpoint
3. **API Processing**: Backend queries database and returns JSON response
4. **Rendering**: Frontend displays regions on map with color-coded markers
5. **Risk Prediction**: User can trigger predictions via `/predict` endpoint
6. **Real-time Updates**: Dashboard updates when new data is available

### Prediction Engine

The MVP uses rule-based logic for risk assessment:

```python
# High Risk Conditions
if rainfall < 50mm AND temperature > 30°C:
    crop_risk = "high"
    
# Medium Risk Conditions  
elif rainfall < 100mm OR temperature > 35°C:
    crop_risk = "medium"
    
# Low Risk (Normal Conditions)
else:
    crop_risk = "low"

# Nutrition risk derived from crop risk
if crop_risk == "high":
    nutrition_risk = "high" if rainfall < 30mm else "medium"
elif crop_risk == "medium":
    nutrition_risk = "medium"
else:
    nutrition_risk = "low"
```

**Future Enhancement**: The architecture supports replacing rule-based logic with machine learning models without changing the API interface.

## Development Guidelines

### Code Style

**Python (Backend):**
- Follow PEP 8 style guide
- Use type hints for function parameters and return values
- Write docstrings for all public functions and classes
- Maximum line length: 100 characters
- Use meaningful variable names

**TypeScript (Frontend):**
- Use TypeScript strict mode
- Define interfaces for all data structures
- Write JSDoc comments for exported functions
- Use functional components with hooks
- Follow React best practices

### Git Workflow

1. Create a feature branch: `git checkout -b feature/your-feature-name`
2. Make your changes and commit: `git commit -m "Add feature description"`
3. Run tests before pushing: `pytest` (backend) and `npm test` (frontend)
4. Push to remote: `git push origin feature/your-feature-name`
5. Create a pull request for review

### Adding New Features

**Backend:**
1. Define data models in `backend/models/`
2. Implement business logic in `backend/services/`
3. Create API routes in `backend/routes/`
4. Write tests in `backend/tests/`
5. Update API documentation

**Frontend:**
1. Create reusable components in `frontend/components/`
2. Add API client functions in `frontend/lib/api.ts`
3. Define TypeScript types in `frontend/lib/types.ts`
4. Write tests in `frontend/__tests__/`
5. Update component documentation

## Performance Optimization

### Backend Optimizations

- **Database Indexing**: Indexes on `region_id` and `recorded_at` for fast queries
- **Connection Pooling**: SQLAlchemy connection pool for efficient database access
- **Response Compression**: GZip middleware compresses responses > 1KB
- **Query Optimization**: Efficient SQL queries with proper joins and filters

### Frontend Optimizations

- **Code Splitting**: Dynamic imports for map component (reduces initial bundle)
- **Image Optimization**: Next.js automatic image optimization
- **Caching**: API responses cached in browser for 5 minutes
- **Lazy Loading**: Map tiles loaded on-demand
- **Bundle Size**: Initial load < 500KB (excluding map tiles)

### Low-Bandwidth Considerations

- Lightweight tile provider for maps
- Minimal asset sizes using Tailwind CSS
- Compressed API responses
- Efficient data structures (no redundant data)
- Progressive loading (essential content first)

## Deployment

### Docker Deployment (Recommended)

HarvestAlert includes Docker configuration for easy deployment. See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

**Quick Start with Docker:**

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` and set your configuration:**
   ```bash
   nano .env
   ```
   
   **Important:** Change the default PostgreSQL password!

3. **Start all services:**
   ```bash
   docker-compose up -d
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

**Docker Commands:**
```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

### Manual Deployment

For manual deployment instructions, production considerations, and troubleshooting, see [DEPLOYMENT.md](DEPLOYMENT.md).

**Backend:**
1. Set up PostgreSQL database on production server
2. Configure environment variables in `.env`
3. Install dependencies: `pip install -r requirements.txt`
4. Initialize database: `python init_db.py`
5. Run with production server: `uvicorn main:app --host 0.0.0.0 --port 8000`

**Frontend:**
1. Build production bundle: `npm run build`
2. Start production server: `npm start`
3. Or deploy to Vercel/Netlify for automatic scaling

### Environment-Specific Configuration

- **Development**: Use SQLite, enable debug logging, hot reload
- **Staging**: Use PostgreSQL, moderate logging, test with production-like data
- **Production**: Use PostgreSQL with backups, minimal logging, enable monitoring

## Troubleshooting

### Common Issues

**"Module not found" errors:**
- Ensure virtual environment is activated (backend)
- Run `pip install -r requirements.txt` or `npm install`
- Check Python/Node version compatibility

**Database connection errors:**
- Verify DATABASE_URL in `.env` is correct
- Ensure PostgreSQL service is running: `sudo service postgresql status`
- Check database credentials and permissions
- For SQLite, ensure write permissions in directory

**CORS errors in browser:**
- Verify CORS_ORIGINS in backend `.env` includes frontend URL
- Check that backend is running and accessible
- Clear browser cache and try again

**Map not displaying:**
- Check browser console for JavaScript errors
- Verify Leaflet CSS is loaded (check Network tab)
- Ensure region data has valid coordinates
- Check that API is returning data: `curl http://localhost:8000/regions`

**Tests failing:**
- Ensure test database is set up correctly
- Check that all dependencies are installed
- Run tests in isolation: `pytest tests/test_specific.py`
- Clear test cache: `pytest --cache-clear`

### Getting Help

- Check the [FastAPI documentation](https://fastapi.tiangolo.com/)
- Check the [Next.js documentation](https://nextjs.org/docs)
- Review API docs at `http://localhost:8000/docs`
- Open an issue on the project repository

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Follow code style guidelines
6. Submit a pull request with clear description

## License

MIT License - See LICENSE file for details

## Acknowledgments

- Built with FastAPI and Next.js
- Map tiles provided by OpenStreetMap contributors
- Designed for humanitarian and development organizations

## Support

For issues, questions, or feature requests:
- Open an issue on the project repository
- Contact the development team
- Check the documentation at `http://localhost:8000/docs`

---

**Version**: 1.0.0 (MVP)  
**Last Updated**: 2024
