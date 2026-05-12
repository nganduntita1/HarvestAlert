# HarvestAlert API Documentation

## Overview

The HarvestAlert API provides RESTful endpoints for climate data retrieval, risk prediction, and region management. This API is designed for humanitarian organizations, development agencies, and researchers working on food security and climate adaptation.

**Base URL**: `http://localhost:8000` (development)

**API Version**: 1.0.0

**Content Type**: `application/json`

**Authentication**: None required for MVP (future versions may implement API keys)

## Table of Contents

1. [Quick Start](#quick-start)
2. [Response Codes](#response-codes)
3. [Error Handling](#error-handling)
4. [Rate Limiting](#rate-limiting)
5. [Endpoints](#endpoints)
   - [Health Check](#health-check)
   - [Climate Data](#climate-data)
   - [Risk Prediction](#risk-prediction)
   - [Region Management](#region-management)
   - [SMS Alerts (Bonus)](#sms-alerts-bonus)
6. [Data Models](#data-models)
7. [Examples](#examples)
8. [Best Practices](#best-practices)

## Quick Start

### Making Your First Request

```bash
# Get all regions
curl http://localhost:8000/regions

# Get climate data
curl http://localhost:8000/climate

# Predict risk
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"temperature": 35, "rainfall": 45}'
```

### Using Python

```python
import requests

# Fetch regions
response = requests.get('http://localhost:8000/regions')
regions = response.json()

# Predict risk
response = requests.post(
    'http://localhost:8000/predict',
    json={'temperature': 35, 'rainfall': 45}
)
prediction = response.json()
print(f"Crop risk: {prediction['crop_risk']}")
```

### Using JavaScript/TypeScript

```typescript
// Fetch regions
const response = await fetch('http://localhost:8000/regions');
const regions = await response.json();

// Predict risk
const response = await fetch('http://localhost:8000/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ temperature: 35, rainfall: 45 })
});
const prediction = await response.json();
```

## Response Codes

| Code | Status | Description |
|------|--------|-------------|
| 200 | OK | Request succeeded |
| 400 | Bad Request | Invalid input parameters or malformed request |
| 404 | Not Found | Requested resource does not exist |
| 422 | Unprocessable Entity | Request validation failed |
| 500 | Internal Server Error | Unexpected server error |
| 503 | Service Unavailable | Database or external service temporarily unavailable |

## Error Handling

### Error Response Format

All errors return a JSON object with a `detail` field:

```json
{
  "detail": "Error message describing what went wrong"
}
```

### Validation Errors

For input validation errors (400/422), additional error details are provided:

```json
{
  "detail": "Invalid request parameters",
  "errors": [
    {
      "loc": ["body", "temperature"],
      "msg": "ensure this value is less than or equal to 60",
      "type": "value_error.number.not_le"
    }
  ]
}
```

### Error Examples

**Invalid Temperature:**
```json
{
  "detail": "Temperature must be between -50 and 60 Celsius"
}
```

**Resource Not Found:**
```json
{
  "detail": "Region with id 999 not found"
}
```

**Database Unavailable:**
```json
{
  "detail": "Database temporarily unavailable. Please try again later."
}
```

## Rate Limiting

**MVP**: No rate limiting implemented

**Future**: Rate limiting will be added in production:
- 100 requests per minute per IP address
- 1000 requests per hour per API key
- Burst allowance: 20 requests

## Endpoints

### Health Check

#### GET /

Root endpoint providing API information.

**Request:**
```bash
curl http://localhost:8000/
```

**Response:** `200 OK`
```json
{
  "name": "HarvestAlert API",
  "version": "1.0.0",
  "status": "operational"
}
```

---

#### GET /health

Health check endpoint for monitoring and load balancers.

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
- `status` (string): Overall health status
  - `"healthy"`: All systems operational
  - `"degraded"`: Some systems experiencing issues
- `database` (string): Database connection status
  - `"connected"`: Database is accessible
  - `"disconnected"`: Database connection failed

**Use Cases:**
- Kubernetes liveness/readiness probes
- Load balancer health checks
- Monitoring system integration
- Deployment verification

---

### Climate Data

#### GET /climate

Retrieve the most recent climate data across all regions.

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
  - Range: -50 to 60°C
  - Precision: 2 decimal places
- `rainfall` (float): Rainfall in millimeters
  - Range: 0 to 1000mm
  - Precision: 2 decimal places
- `drought_index` (float): Drought severity index
  - Range: 0 to 100
  - 0 = No drought, 100 = Severe drought
  - Calculated from temperature and rainfall
- `recorded_at` (string): ISO 8601 timestamp
  - Format: `YYYY-MM-DDTHH:MM:SS`
  - Timezone: UTC
- `region_id` (integer): Associated region ID

**Error Responses:**
- `404 Not Found`: No climate data available in database
- `500 Internal Server Error`: Database query failed

**Performance:**
- Response time: < 2 seconds
- Caching: Not cached (real-time data)

---

#### GET /climate/{region_id}

Retrieve climate data for a specific region.

**Path Parameters:**
- `region_id` (integer, required): ID of the region

**Request:**
```bash
curl http://localhost:8000/climate/1
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

**Response Fields:** Same as `GET /climate`

**Error Responses:**
- `404 Not Found`: No climate data for specified region
- `500 Internal Server Error`: Database query failed

**Use Cases:**
- Retrieve climate data for specific geographic area
- Historical data analysis per region
- Region-specific monitoring dashboards

---

### Risk Prediction

#### POST /predict

Calculate crop and nutrition risk based on climate parameters.

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
- `temperature` (float, required): Temperature in Celsius
  - Valid range: -50 to 60
  - Typical range: 15 to 45
- `rainfall` (float, required): Rainfall in millimeters
  - Valid range: 0 to 1000
  - Typical range: 0 to 300

**Response:** `200 OK`
```json
{
  "crop_risk": "high",
  "nutrition_risk": "medium"
}
```

**Response Fields:**
- `crop_risk` (string): Crop failure risk level
  - Values: `"low"`, `"medium"`, `"high"`
- `nutrition_risk` (string): Malnutrition risk level
  - Values: `"low"`, `"medium"`, `"high"`

**Prediction Logic:**

The MVP uses rule-based logic:

**Crop Risk:**
- **High**: `rainfall < 50mm AND temperature > 30°C`
- **Medium**: `rainfall < 100mm OR temperature > 35°C`
- **Low**: Otherwise

**Nutrition Risk:**
- **High**: `crop_risk == "high" AND rainfall < 30mm`
- **Medium**: `crop_risk == "high" AND rainfall >= 30mm` OR `crop_risk == "medium"`
- **Low**: `crop_risk == "low"`

**Error Responses:**

`400 Bad Request` - Invalid input:
```json
{
  "detail": "Temperature must be between -50 and 60 Celsius"
}
```

`422 Unprocessable Entity` - Validation error:
```json
{
  "detail": "Invalid request parameters",
  "errors": [
    {
      "loc": ["body", "temperature"],
      "msg": "ensure this value is less than or equal to 60",
      "type": "value_error.number.not_le"
    }
  ]
}
```

**Performance:**
- Response time: < 1 second
- Computation: O(1) constant time

**Use Cases:**
- Real-time risk assessment
- Scenario modeling ("what-if" analysis)
- Early warning system integration
- Decision support tools

---

### Region Management

#### GET /regions

Retrieve all regions with their current risk assessments.

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
- `latitude` (float): Latitude coordinate
  - Range: -90 to 90
  - Precision: 6 decimal places
- `longitude` (float): Longitude coordinate
  - Range: -180 to 180
  - Precision: 6 decimal places
- `crop_risk` (string): Current crop failure risk
  - Values: `"low"`, `"medium"`, `"high"`
- `nutrition_risk` (string): Current malnutrition risk
  - Values: `"low"`, `"medium"`, `"high"`
- `last_updated` (string): ISO 8601 timestamp of last update

**Error Responses:**
- `500 Internal Server Error`: Database query failed

**Performance:**
- Response time: < 2 seconds
- Typical payload: 1-5 KB for 3-10 regions

**Use Cases:**
- Dashboard initialization
- Map marker generation
- Risk overview reports
- Data export for analysis

---

#### GET /regions/{region_id}

Retrieve detailed information for a specific region.

**Path Parameters:**
- `region_id` (integer, required): ID of the region

**Request:**
```bash
curl http://localhost:8000/regions/1
```

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

**Response Fields:** Same as `GET /regions` (single region object)

**Error Responses:**

`404 Not Found`:
```json
{
  "detail": "Region with id 999 not found"
}
```

`500 Internal Server Error`:
```json
{
  "detail": "Failed to retrieve region 1"
}
```

**Use Cases:**
- Region detail pages
- Single region monitoring
- Data validation
- API testing

---

### SMS Alerts (Bonus)

#### POST /alerts/sms

Send SMS alert notification about high-risk situations.

**Note**: This is a bonus feature with mock SMS functionality for MVP. In production, this would integrate with an SMS gateway service.

**Request:**
```bash
curl -X POST http://localhost:8000/alerts/sms \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+254712345678",
    "message": "High crop risk alert for Sahel Region. Immediate action required."
  }'
```

**Request Body:**
```json
{
  "phone": "+254712345678",
  "message": "High crop risk alert for Sahel Region. Immediate action required."
}
```

**Request Parameters:**
- `phone` (string, required): Phone number in international format
  - Must start with `+`
  - Length: 10-20 characters
  - Format: `+[country code][number]`
  - Spaces and dashes allowed for formatting
  - Examples: `+1234567890`, `+254 712 345 678`, `+27-82-123-4567`
- `message` (string, required): Alert message content
  - Length: 1-160 characters (SMS standard)
  - Plain text only

**Response:** `201 Created`
```json
{
  "success": true,
  "message_id": "sms_c7793a19c286",
  "phone": "+254712345678",
  "timestamp": "2024-01-15T10:30:00.123456",
  "message": "SMS alert queued successfully"
}
```

**Response Fields:**
- `success` (boolean): Whether SMS was successfully queued
- `message_id` (string): Unique identifier for the SMS message
  - Format: `sms_[12 character hex]`
  - Used for tracking and logging
- `phone` (string): Recipient phone number (as provided)
- `timestamp` (string): ISO 8601 timestamp when message was queued
- `message` (string): Confirmation message

**Error Responses:**

`400 Bad Request` - Invalid phone format:
```json
{
  "detail": "Invalid request parameters",
  "errors": [
    {
      "loc": ["body", "phone"],
      "msg": "Phone number must start with + (international format)",
      "type": "value_error"
    }
  ]
}
```

`400 Bad Request` - Message too long:
```json
{
  "detail": "Invalid request parameters",
  "errors": [
    {
      "loc": ["body", "message"],
      "msg": "String should have at most 160 characters",
      "type": "string_too_long"
    }
  ]
}
```

`422 Unprocessable Entity` - Missing required field:
```json
{
  "detail": "Invalid request parameters",
  "errors": [
    {
      "loc": ["body", "message"],
      "msg": "Field required",
      "type": "missing"
    }
  ]
}
```

**Mock Implementation:**

For the MVP, this endpoint logs SMS messages to the console instead of actually sending them:

```
============================================================
MOCK SMS SERVICE - Message Details:
  Message ID: sms_c7793a19c286
  To: +254712345678
  Message: High crop risk alert for Sahel Region. Immediate action required.
  Timestamp: 2024-01-15T10:30:00.123456
============================================================
```

**Production Integration:**

To integrate with a real SMS gateway, replace the mock implementation with:
- **Twilio**: Popular SMS gateway with global coverage
- **AWS SNS**: Amazon's notification service
- **Africa's Talking**: SMS gateway focused on African markets

See `SMS_ALERTS_README.md` for detailed integration examples.

**Use Cases:**
- Alert field workers about high-risk regions
- Notify stakeholders of critical situations
- Send automated alerts based on risk thresholds
- Emergency notifications for disaster response

**Performance:**
- Response time: < 500ms (mock implementation)
- Production: Depends on SMS gateway (typically 1-3 seconds)

**Validation Rules:**
1. Phone number must be in international format (start with +)
2. Phone number must contain only digits after + (spaces/dashes allowed)
3. Phone number must be 10-20 characters long
4. Message must be 1-160 characters (SMS standard)

---

## Data Models

### Region

Represents a geographic area with risk assessments.

```typescript
interface Region {
  id: number;                    // Unique identifier
  name: string;                  // Region name
  latitude: number;              // -90 to 90
  longitude: number;             // -180 to 180
  crop_risk: "low" | "medium" | "high";
  nutrition_risk: "low" | "medium" | "high";
  last_updated: string;          // ISO 8601 timestamp
}
```

**Constraints:**
- `latitude`: Must be between -90 and 90
- `longitude`: Must be between -180 and 180
- `crop_risk`: Must be one of: "low", "medium", "high"
- `nutrition_risk`: Must be one of: "low", "medium", "high"

---

### ClimateData

Represents climate measurements for a region.

```typescript
interface ClimateData {
  temperature: number;           // Celsius (-50 to 60)
  rainfall: number;              // Millimeters (0 to 1000)
  drought_index: number;         // 0 to 100
  recorded_at: string;           // ISO 8601 timestamp
  region_id: number;             // Associated region
}
```

**Constraints:**
- `temperature`: Must be between -50 and 60 Celsius
- `rainfall`: Must be between 0 and 1000 mm
- `drought_index`: Must be between 0 and 100

---

### RiskPrediction

Represents risk assessment results.

```typescript
interface RiskPrediction {
  crop_risk: "low" | "medium" | "high";
  nutrition_risk: "low" | "medium" | "high";
}
```

---

### PredictRequest

Request body for risk prediction.

```typescript
interface PredictRequest {
  temperature: number;           // Celsius (-50 to 60)
  rainfall: number;              // Millimeters (0 to 1000)
}
```

---

### SMSAlertRequest

Request body for SMS alert.

```typescript
interface SMSAlertRequest {
  phone: string;                 // International format (+1234567890)
  message: string;               // 1-160 characters
}
```

**Constraints:**
- `phone`: Must start with +, followed by 9-19 digits (spaces/dashes allowed)
- `message`: Must be between 1 and 160 characters

---

### SMSAlertResponse

Response from SMS alert endpoint.

```typescript
interface SMSAlertResponse {
  success: boolean;              // Whether SMS was queued successfully
  message_id: string;            // Unique message identifier
  phone: string;                 // Recipient phone number
  timestamp: string;             // ISO 8601 timestamp
  message: string;               // Confirmation message
}
```

---

## Examples

### Example 1: Dashboard Initialization

Fetch all regions and display on map:

```python
import requests

# Fetch regions
response = requests.get('http://localhost:8000/regions')
regions = response.json()

# Process each region
for region in regions:
    print(f"{region['name']}: {region['crop_risk']} crop risk")
    # Plot on map at (region['latitude'], region['longitude'])
```

---

### Example 2: Risk Assessment Workflow

Complete workflow from climate data to risk prediction:

```python
import requests

# 1. Get current climate data
climate_response = requests.get('http://localhost:8000/climate')
climate = climate_response.json()

print(f"Temperature: {climate['temperature']}°C")
print(f"Rainfall: {climate['rainfall']}mm")

# 2. Predict risk based on climate data
predict_response = requests.post(
    'http://localhost:8000/predict',
    json={
        'temperature': climate['temperature'],
        'rainfall': climate['rainfall']
    }
)
prediction = predict_response.json()

print(f"Crop Risk: {prediction['crop_risk']}")
print(f"Nutrition Risk: {prediction['nutrition_risk']}")

# 3. Get affected regions
regions_response = requests.get('http://localhost:8000/regions')
regions = regions_response.json()

high_risk_regions = [
    r for r in regions 
    if r['crop_risk'] == 'high'
]

print(f"\nHigh risk regions: {len(high_risk_regions)}")
for region in high_risk_regions:
    print(f"  - {region['name']}")
```

---

### Example 3: Scenario Analysis

Test different climate scenarios:

```python
import requests

scenarios = [
    {"name": "Normal", "temp": 25, "rain": 150},
    {"name": "Drought", "temp": 38, "rain": 20},
    {"name": "Extreme Heat", "temp": 45, "rain": 80},
]

for scenario in scenarios:
    response = requests.post(
        'http://localhost:8000/predict',
        json={
            'temperature': scenario['temp'],
            'rainfall': scenario['rain']
        }
    )
    result = response.json()
    
    print(f"{scenario['name']} Scenario:")
    print(f"  Temp: {scenario['temp']}°C, Rain: {scenario['rain']}mm")
    print(f"  Crop Risk: {result['crop_risk']}")
    print(f"  Nutrition Risk: {result['nutrition_risk']}\n")
```

---

### Example 4: Error Handling

Robust error handling for production use:

```python
import requests
from requests.exceptions import RequestException, Timeout

def fetch_regions_safely():
    """Fetch regions with comprehensive error handling."""
    try:
        response = requests.get(
            'http://localhost:8000/regions',
            timeout=5  # 5 second timeout
        )
        response.raise_for_status()  # Raise exception for 4xx/5xx
        
        return response.json()
        
    except Timeout:
        print("Error: Request timed out")
        return None
        
    except RequestException as e:
        print(f"Error: Network error - {e}")
        return None
        
    except ValueError as e:
        print(f"Error: Invalid JSON response - {e}")
        return None

# Usage
regions = fetch_regions_safely()
if regions:
    print(f"Successfully fetched {len(regions)} regions")
else:
    print("Failed to fetch regions, using cached data")
```

---

## Best Practices

### 1. Error Handling

Always handle potential errors:

```python
response = requests.get('http://localhost:8000/regions')
if response.status_code == 200:
    regions = response.json()
elif response.status_code == 503:
    print("Service temporarily unavailable, try again later")
else:
    print(f"Error: {response.json()['detail']}")
```

### 2. Timeouts

Set reasonable timeouts to prevent hanging:

```python
response = requests.get(
    'http://localhost:8000/regions',
    timeout=5  # 5 seconds
)
```

### 3. Input Validation

Validate inputs before sending requests:

```python
def predict_risk(temperature, rainfall):
    # Validate inputs
    if not (-50 <= temperature <= 60):
        raise ValueError("Temperature must be between -50 and 60")
    if not (0 <= rainfall <= 1000):
        raise ValueError("Rainfall must be between 0 and 1000")
    
    # Make request
    response = requests.post(
        'http://localhost:8000/predict',
        json={'temperature': temperature, 'rainfall': rainfall}
    )
    return response.json()
```

### 4. Caching

Cache responses to reduce API calls:

```python
import time

cache = {}
CACHE_TTL = 300  # 5 minutes

def get_regions_cached():
    now = time.time()
    
    if 'regions' in cache:
        data, timestamp = cache['regions']
        if now - timestamp < CACHE_TTL:
            return data
    
    # Fetch fresh data
    response = requests.get('http://localhost:8000/regions')
    data = response.json()
    
    # Update cache
    cache['regions'] = (data, now)
    return data
```

### 5. Retry Logic

Implement retry logic for transient failures:

```python
import time
from requests.exceptions import RequestException

def fetch_with_retry(url, max_retries=3):
    for attempt in range(max_retries):
        try:
            response = requests.get(url, timeout=5)
            response.raise_for_status()
            return response.json()
        except RequestException as e:
            if attempt == max_retries - 1:
                raise
            time.sleep(2 ** attempt)  # Exponential backoff
```

### 6. Batch Processing

Process multiple predictions efficiently:

```python
def batch_predict(climate_data_list):
    """Predict risk for multiple climate data points."""
    results = []
    
    for data in climate_data_list:
        response = requests.post(
            'http://localhost:8000/predict',
            json=data
        )
        results.append(response.json())
    
    return results

# Usage
scenarios = [
    {'temperature': 35, 'rainfall': 45},
    {'temperature': 28, 'rainfall': 120},
    {'temperature': 42, 'rainfall': 15},
]

predictions = batch_predict(scenarios)
```

---

## Interactive Documentation

FastAPI provides automatic interactive documentation:

### Swagger UI
Visit `http://localhost:8000/docs` for:
- Interactive API testing
- Request/response examples
- Schema definitions
- Try out endpoints directly

### ReDoc
Visit `http://localhost:8000/redoc` for:
- Clean, readable documentation
- Detailed schema information
- Easy navigation
- Printable format

---

## Support

For questions, issues, or feature requests:
- Check the interactive docs: `http://localhost:8000/docs`
- Review the main README: `../README.md`
- Open an issue on the project repository

---

**API Version**: 1.0.0  
**Last Updated**: 2024  
**Maintained by**: HarvestAlert Development Team
