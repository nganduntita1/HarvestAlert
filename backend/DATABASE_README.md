# HarvestAlert Database Configuration

This document describes the database configuration and usage for the HarvestAlert backend.

## Overview

The `database.py` module provides SQLAlchemy-based database configuration with support for both PostgreSQL and SQLite databases. It includes connection pooling, error handling, and session management optimized for FastAPI applications.

**Validates Requirements:** 10.1, 10.2, 19.2

## Features

- ✅ **Dual Database Support**: PostgreSQL for production, SQLite for development
- ✅ **Connection Pooling**: Configurable connection pool for PostgreSQL
- ✅ **Error Handling**: Comprehensive error handling and logging
- ✅ **Session Management**: FastAPI-compatible dependency injection
- ✅ **Foreign Key Support**: Automatic foreign key constraint enforcement for SQLite
- ✅ **Health Checks**: Built-in connection health check function

## Configuration

### Environment Variables

Configure the database using environment variables (see `.env.example`):

```bash
# PostgreSQL (Production)
DATABASE_URL=postgresql://user:password@localhost:5432/harvestalert

# SQLite (Development)
DATABASE_URL=sqlite:///./harvestalert.db

# Connection Pool Settings (PostgreSQL only)
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=10
DB_POOL_TIMEOUT=30
DB_POOL_RECYCLE=3600
```

### Database Selection

The database type is automatically detected from the `DATABASE_URL`:
- URLs starting with `sqlite://` use SQLite configuration
- URLs starting with `postgresql://` use PostgreSQL configuration with connection pooling

## Usage

### 1. Basic Usage

```python
from database import SessionLocal, init_db

# Initialize database (create tables)
init_db()

# Create a session
db = SessionLocal()

try:
    # Use the session
    result = db.query(Region).all()
finally:
    db.close()
```

### 2. FastAPI Dependency Injection (Recommended)

```python
from fastapi import Depends
from sqlalchemy.orm import Session
from database import get_db

@app.get("/regions")
def get_regions(db: Session = Depends(get_db)):
    """Get all regions."""
    regions = db.query(Region).all()
    return regions
```

The `get_db()` function:
- Yields a database session
- Automatically closes the session after use
- Handles errors with automatic rollback

### 3. Health Check

```python
from database import check_db_connection

if check_db_connection():
    print("Database is healthy")
else:
    print("Database connection failed")
```

### 4. Application Lifecycle

```python
from fastapi import FastAPI
from database import init_db, close_db

app = FastAPI()

@app.on_event("startup")
async def startup():
    """Initialize database on startup."""
    init_db()

@app.on_event("shutdown")
async def shutdown():
    """Close database connections on shutdown."""
    close_db()
```

## Database Models

Define models by inheriting from `Base`:

```python
from sqlalchemy import Column, Integer, String, Float
from database import Base

class Region(Base):
    __tablename__ = "regions"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    crop_risk = Column(String(10), nullable=False)
    nutrition_risk = Column(String(10), nullable=False)
```

## Connection Pooling

### PostgreSQL Configuration

Connection pooling is automatically configured for PostgreSQL:

- **pool_size**: Number of connections to maintain (default: 5)
- **max_overflow**: Additional connections when pool is full (default: 10)
- **pool_timeout**: Seconds to wait for connection (default: 30)
- **pool_recycle**: Recycle connections after seconds (default: 3600)
- **pool_pre_ping**: Verify connections before use (enabled)

### SQLite Configuration

SQLite uses `StaticPool` for thread-safe operation:

- **check_same_thread**: Disabled for multi-threaded access
- **Foreign keys**: Automatically enabled via event listener

## Error Handling

The module includes comprehensive error handling:

```python
from database import get_db
from sqlalchemy.exc import SQLAlchemyError

db_gen = get_db()
db = next(db_gen)

try:
    # Database operations
    db.add(region)
    db.commit()
except SQLAlchemyError as e:
    # Automatic rollback on error
    db.rollback()
    raise
finally:
    # Automatic cleanup
    try:
        next(db_gen)
    except StopIteration:
        pass
```

## Testing

Run the database tests:

```bash
# All database tests
pytest tests/test_database*.py -v

# Unit tests only
pytest tests/test_database.py -v

# Integration tests only
pytest tests/test_database_integration.py -v
```

## Example Usage

See `example_usage.py` for complete examples:

```bash
python3 example_usage.py
```

## Logging

The module uses Python's logging module:

```python
import logging

# Configure logging level
logging.basicConfig(level=logging.INFO)

# Database operations will log:
# - Engine creation
# - Connection checks
# - Errors and warnings
```

## Migration to PostgreSQL

To switch from SQLite to PostgreSQL:

1. Update `.env` file:
   ```bash
   DATABASE_URL=postgresql://user:password@localhost:5432/harvestalert
   ```

2. Install PostgreSQL dependencies (already in requirements.txt):
   ```bash
   pip install psycopg2-binary
   ```

3. Create PostgreSQL database:
   ```bash
   createdb harvestalert
   ```

4. Run migrations:
   ```python
   from database import init_db
   init_db()
   ```

## Best Practices

1. **Always use dependency injection** in FastAPI routes
2. **Never commit database credentials** to version control
3. **Use connection pooling** for production PostgreSQL deployments
4. **Enable logging** in development for debugging
5. **Run health checks** before critical operations
6. **Close sessions** properly to avoid connection leaks
7. **Use transactions** for multi-step operations

## Troubleshooting

### Connection Errors

```python
# Check if database is accessible
from database import check_db_connection

if not check_db_connection():
    print("Database connection failed")
    # Check DATABASE_URL environment variable
    # Verify database server is running
    # Check network connectivity
```

### Pool Exhaustion (PostgreSQL)

If you see "QueuePool limit exceeded" errors:

1. Increase `DB_POOL_SIZE` and `DB_MAX_OVERFLOW`
2. Ensure sessions are properly closed
3. Check for long-running transactions

### SQLite Locking

If you see "database is locked" errors:

1. Ensure `check_same_thread=False` is set (automatic)
2. Reduce concurrent write operations
3. Consider switching to PostgreSQL for production

## API Reference

### Functions

- `get_engine_config() -> dict`: Get database engine configuration
- `get_db() -> Generator[Session, None, None]`: Get database session (dependency)
- `init_db() -> None`: Initialize database and create tables
- `check_db_connection() -> bool`: Check database connection health
- `close_db() -> None`: Close database engine and dispose connections

### Variables

- `Base`: Declarative base for models
- `engine`: SQLAlchemy engine instance
- `SessionLocal`: Session factory
- `DATABASE_URL`: Database connection URL
- `is_sqlite`: Boolean indicating if using SQLite

## Support

For issues or questions:
1. Check the logs for error messages
2. Verify environment variables are set correctly
3. Run the test suite to verify configuration
4. Review the example usage script
