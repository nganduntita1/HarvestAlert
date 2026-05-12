# Database Initialization Script

## Overview

The `init_db.py` script initializes the HarvestAlert database by creating all necessary tables and seeding sample data for testing and demonstration purposes.

## Features

- **Table Creation**: Creates `regions` and `climate_data` tables with proper constraints
- **Sample Data**: Seeds 5 regions with realistic climate data representing different risk scenarios
- **Idempotent**: Safe to run multiple times - skips seeding if data already exists
- **Verification**: Displays summary of seeded data for verification

## Usage

### Basic Usage

Run the script from the backend directory:

```bash
cd backend
python3 init_db.py
```

Or from the project root:

```bash
python3 backend/init_db.py
```

### Expected Output

```
================================================================================
HarvestAlert Database Initialization
================================================================================
Creating database tables...
✓ Database tables created successfully
Seeding sample data...
  ✓ Added region: Sahel Region (lat: 14.5, lng: -14.5, crop_risk: high, nutrition_risk: high)
  ✓ Added region: East Africa Highlands (lat: -1.286389, lng: 36.817223, crop_risk: medium, nutrition_risk: medium)
  ✓ Added region: Southern Africa Plains (lat: -25.746111, lng: 28.188056, crop_risk: low, nutrition_risk: low)
  ✓ Added region: Horn of Africa (lat: 2.046934, lng: 45.318162, crop_risk: high, nutrition_risk: high)
  ✓ Added region: Central Africa Plateau (lat: -6.369028, lng: 34.888822, crop_risk: medium, nutrition_risk: medium)
✓ Successfully seeded 5 regions with climate data
Verifying seeded data...
  Regions in database: 5
  Climate data records: 5

Region Summary:
--------------------------------------------------------------------------------
  1. Sahel Region                    | Crop: high   | Nutrition: high   | Coords: (14.50, -14.50)
  2. East Africa Highlands           | Crop: medium | Nutrition: medium | Coords: (-1.29, 36.82)
  3. Southern Africa Plains          | Crop: low    | Nutrition: low    | Coords: (-25.75, 28.19)
  4. Horn of Africa                  | Crop: high   | Nutrition: high   | Coords: (2.05, 45.32)
  5. Central Africa Plateau          | Crop: medium | Nutrition: medium | Coords: (-6.37, 34.89)
--------------------------------------------------------------------------------

Climate Data Summary:
--------------------------------------------------------------------------------
  Sahel Region                   | Temp:  38.5°C | Rain:   35.0mm | Drought:  78.5
  East Africa Highlands          | Temp:  28.0°C | Rain:   85.0mm | Drought:  52.0
  Southern Africa Plains         | Temp:  22.5°C | Rain:  180.0mm | Drought:  28.0
  Horn of Africa                 | Temp:  42.0°C | Rain:   25.0mm | Drought:  85.0
  Central Africa Plateau         | Temp:  26.5°C | Rain:   95.0mm | Drought:  48.0
--------------------------------------------------------------------------------
✓ Data verification complete

================================================================================
✓ Database initialization completed successfully!
================================================================================
```

## Sample Data Details

The script seeds 5 regions representing different African geographic areas with realistic climate data:

### 1. Sahel Region (West Africa)
- **Location**: 14.5°N, 14.5°W
- **Risk Level**: High crop risk, High nutrition risk
- **Climate**: 38.5°C, 35mm rainfall, 78.5 drought index
- **Scenario**: Severe drought conditions with high temperature and very low rainfall

### 2. East Africa Highlands (Kenya)
- **Location**: 1.29°S, 36.82°E
- **Risk Level**: Medium crop risk, Medium nutrition risk
- **Climate**: 28.0°C, 85mm rainfall, 52.0 drought index
- **Scenario**: Moderate conditions with some water stress

### 3. Southern Africa Plains (South Africa)
- **Location**: 25.75°S, 28.19°E
- **Risk Level**: Low crop risk, Low nutrition risk
- **Climate**: 22.5°C, 180mm rainfall, 28.0 drought index
- **Scenario**: Favorable conditions with good rainfall

### 4. Horn of Africa (Somalia)
- **Location**: 2.05°N, 45.32°E
- **Risk Level**: High crop risk, High nutrition risk
- **Climate**: 42.0°C, 25mm rainfall, 85.0 drought index
- **Scenario**: Extreme drought with very high temperature and minimal rainfall

### 5. Central Africa Plateau (Tanzania)
- **Location**: 6.37°S, 34.89°E
- **Risk Level**: Medium crop risk, Medium nutrition risk
- **Climate**: 26.5°C, 95mm rainfall, 48.0 drought index
- **Scenario**: Borderline conditions with moderate water availability

## Database Schema

### Regions Table
```sql
CREATE TABLE regions (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    crop_risk VARCHAR(10) NOT NULL CHECK (crop_risk IN ('low', 'medium', 'high')),
    nutrition_risk VARCHAR(10) NOT NULL CHECK (nutrition_risk IN ('low', 'medium', 'high')),
    last_updated TIMESTAMP NOT NULL,
    CONSTRAINT valid_latitude CHECK (latitude >= -90 AND latitude <= 90),
    CONSTRAINT valid_longitude CHECK (longitude >= -180 AND longitude <= 180)
);
```

### Climate Data Table
```sql
CREATE TABLE climate_data (
    id INTEGER PRIMARY KEY,
    region_id INTEGER NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    temperature FLOAT NOT NULL,
    rainfall FLOAT NOT NULL,
    drought_index FLOAT NOT NULL,
    recorded_at TIMESTAMP NOT NULL,
    CONSTRAINT valid_temperature CHECK (temperature >= -50 AND temperature <= 60),
    CONSTRAINT valid_rainfall CHECK (rainfall >= 0 AND rainfall <= 1000),
    CONSTRAINT valid_drought_index CHECK (drought_index >= 0 AND drought_index <= 100)
);
```

## Configuration

The script uses the database configuration from `backend/database.py`, which reads the `DATABASE_URL` environment variable:

- **Default**: `sqlite:///./harvestalert.db` (SQLite database in backend directory)
- **PostgreSQL**: Set `DATABASE_URL` to PostgreSQL connection string

Example:
```bash
export DATABASE_URL="postgresql://user:password@localhost/harvestalert"
python3 backend/init_db.py
```

## Idempotency

The script is safe to run multiple times:
- If tables already exist, they are not recreated
- If regions already exist in the database, seeding is skipped
- A warning message is displayed: "Database already contains X regions. Skipping seed."

## Error Handling

The script includes comprehensive error handling:
- **Table Creation Errors**: Logged and script exits with error code 1
- **Data Seeding Errors**: Transaction is rolled back, error is logged
- **Verification Errors**: Logged but does not prevent completion

## Testing

Run the test suite to verify the initialization script:

```bash
# From project root
python3 -m pytest backend/tests/test_init_db.py -v
```

Tests verify:
- 5 regions are seeded correctly
- Climate data has realistic values
- All regions have valid coordinates
- Sample data includes all risk levels (low, medium, high)

## Requirements Validated

This script validates the following requirements:
- **15.1**: System includes sample data for 3-5 regions (provides 5 regions)
- **15.2**: Climate data provided in structured format (JSON/database)
- **15.3**: System operates with sample data without external dependencies
- **15.4**: Sample data includes realistic values (temperature 15-45°C, rainfall 0-300mm, actual geographic coordinates)

## Troubleshooting

### Module Import Errors
If you see `ModuleNotFoundError: No module named 'backend'`, ensure you're running from the correct directory:
```bash
# Run from project root
python3 backend/init_db.py

# Or add parent directory to PYTHONPATH
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
cd backend
python3 init_db.py
```

### Database Locked Errors
If using SQLite and you see "database is locked" errors:
- Close any other connections to the database
- Ensure no other processes are accessing the database file
- Delete the database file and run the script again

### Permission Errors
Ensure you have write permissions in the backend directory where the SQLite database file will be created.

## Related Files

- `backend/database.py` - Database configuration and connection management
- `backend/models/region.py` - Region model definition
- `backend/models/climate_data.py` - ClimateData model definition
- `backend/tests/test_init_db.py` - Test suite for initialization script
