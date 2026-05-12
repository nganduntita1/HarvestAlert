# HarvestAlert Backend API

FastAPI-based REST API for the HarvestAlert Climate & Nutrition Early Warning Platform.

## Overview

The HarvestAlert Backend API provides endpoints for:
- **Climate Data**: Retrieve current temperature, rainfall, and drought index
- **Risk Prediction**: Calculate crop and nutrition risk based on climate parameters
- **Region Information**: Access geographic regions with risk assessments

## Quick Start

### Prerequisites

- Python 3.9 or higher
- pip (Python package manager)

### Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set up environment variables (optional):
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Initialize the database:
```bash
python3 backend/init_db.py
```

### Running the Server

**Development mode:**
```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

**Production mode:**
```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at: `http://localhost:8000`

### API Documentation

Once the server is running, visit:
- **Interactive API docs (Swagger UI)**: http://localhost:8000/docs
- **Alternative API docs (ReDoc)**: http://localhost:8000/redoc

## API Endpoints

### Health Check

#### `GET /`
Root endpoint returning API information.

**Response:**
```json
{
  "name": "HarvestAlert API",
  "version": "1.0.0",
  "status": "operational"
}
```

#### `GET /health`
Health check endpoint for monitoring.

**Response:**
```json
{
  "status": "healthy",
  "database": "connected"
}
```

### Climate Data

#### `GET /climate`
Get current climate data (most recent record).

**Response:**
```json
{
  "temperature": 35.5,
  "rainfall": 45.2,
  "drought_index": 72.3,
  "recorded_at": "2024-01-15T10:30:00",
  "region_id": 1
}
```

**Status Codes:**
- `200`: Success
- `404`: No climate data available
- `500`: Server error

#### `GET /climate/{region_id}`
Get climate data for a specific region.

**Parameters:**
- `region_id` (path): Region ID

**Response:** Same as `GET /climate`

**Status Codes:**
- `200`: Success
- `404`: Region not found or no climate data
- `500`: Server error

### Risk Prediction

#### `POST /predict`
Predict crop and nutrition risk based on climate parameters.

**Request Body:**
```json
{
  "temperature": 35.5,
  "rainfall": 45.2
}
```

**Validation:**
- `temperature`: -50 to 60 (Celsius)
- `rainfall`: 0 to 1000 (millimeters)

**Response:**
```json
{
  "crop_risk": "high",
  "nutrition_risk": "medium"
}
```

**Risk Levels:** `"low"`, `"medium"`, `"high"`

**Prediction Rules:**
- **High crop risk**: rainfall < 50mm AND temperature > 30°C
- **Medium crop risk**: rainfall < 100mm OR temperature > 35°C
- **Low crop risk**: otherwise
- **Nutrition risk**: derived from crop risk

**Status Codes:**
- `200`: Success
- `400`: Invalid input parameters
- `422`: Validation error
- `500`: Server error

### Regions

#### `GET /regions`
Get all regions with risk assessments.

**Response:**
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
  }
]
```

**Status Codes:**
- `200`: Success
- `500`: Server error

#### `GET /regions/{region_id}`
Get a specific region by ID.

**Parameters:**
- `region_id` (path): Region ID

**Response:** Single region object (same structure as array item above)

**Status Codes:**
- `200`: Success
- `404`: Region not found
- `500`: Server error

## Testing

### Run Unit Tests
```bash
pytest backend/tests/ -v
```

### Run Integration Tests
```bash
pytest backend/tests/test_api_routes.py -v
```

### Run Manual API Tests
```bash
# Start the server first
uvicorn backend.main:app --reload

# In another terminal
python3 backend/test_api_manual.py
```

### Test Coverage
```bash
pytest backend/tests/ --cov=backend --cov-report=html
```

## Architecture

### Project Structure
```
backend/
├── main.py                 # FastAPI application setup
├── database.py             # Database configuration
├── models/                 # SQLAlchemy models
│   ├── region.py
│   └── climate_data.py
├── routes/                 # API route handlers
│   ├── climate.py
│   ├── predict.py
│   └── regions.py
├── services/               # Business logic
│   ├── climate_service.py
│   ├── prediction_service.py
│   └── region_service.py
└── tests/                  # Test files
```

### Technology Stack
- **Framework**: FastAPI 0.104+
- **Server**: Uvicorn (ASGI)
- **Database**: SQLAlchemy ORM with PostgreSQL/SQLite
- **Validation**: Pydantic
- **Testing**: pytest, hypothesis

### Middleware
- **CORS**: Configured for frontend integration (localhost:3000)
- **Request Logging**: Logs all requests with response times
- **Error Handling**: Global exception handlers for common errors

## Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=sqlite:///./harvestalert.db
# Or for PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost/harvestalert

# Database Pool (PostgreSQL only)
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=10
DB_POOL_TIMEOUT=30
DB_POOL_RECYCLE=3600

# Environment
ENVIRONMENT=development  # or production
```

### CORS Configuration

To add additional allowed origins, edit `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://your-production-domain.com",
    ],
    ...
)
```

## Performance

### Response Time Requirements
- `/climate`: < 2 seconds
- `/predict`: < 1 second
- `/regions`: < 2 seconds

### Optimization Tips
1. Use connection pooling for PostgreSQL
2. Add database indexes on frequently queried fields
3. Enable caching for static data
4. Use async database drivers for better concurrency

## Error Handling

### Error Response Format
```json
{
  "detail": "Error message describing what went wrong"
}
```

### Common Status Codes
- `200`: Success
- `400`: Bad Request (invalid input)
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error
- `503`: Service Unavailable (database issues)

## Logging

Logs are written to stdout with the following format:
```
2024-01-15 10:30:00 - backend.main - INFO - GET /regions - Status: 200 - Duration: 0.045s
```

### Log Levels
- `INFO`: Normal operations
- `WARNING`: Validation errors, missing data
- `ERROR`: Server errors, database failures

## Deployment

### Docker Deployment

Create a `Dockerfile`:
```dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ ./backend/

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:
```bash
docker build -t harvestalert-api .
docker run -p 8000:8000 harvestalert-api
```

### Production Checklist
- [ ] Set `ENVIRONMENT=production` in `.env`
- [ ] Use PostgreSQL instead of SQLite
- [ ] Configure proper CORS origins
- [ ] Set up SSL/TLS certificates
- [ ] Enable request rate limiting
- [ ] Configure monitoring and alerting
- [ ] Set up automated backups
- [ ] Use a process manager (systemd, supervisor)

## Troubleshooting

### Database Connection Issues
```bash
# Check database connection
python3 -c "from backend.database import check_db_connection; print(check_db_connection())"
```

### Import Errors
```bash
# Verify all dependencies are installed
pip install -r requirements.txt

# Check Python path
python3 -c "import sys; print(sys.path)"
```

### Port Already in Use
```bash
# Find process using port 8000
lsof -i :8000

# Kill the process
kill -9 <PID>
```

## Contributing

### Code Style
- Follow PEP 8 for Python code
- Use type hints for function signatures
- Add docstrings to all public functions
- Write tests for new features

### Running Tests Before Commit
```bash
# Run all tests
pytest backend/tests/ -v

# Check code style
flake8 backend/

# Type checking
mypy backend/
```

## License

[Your License Here]

## Support

For issues and questions:
- GitHub Issues: [Your Repo URL]
- Documentation: http://localhost:8000/docs
- Email: [Your Email]
