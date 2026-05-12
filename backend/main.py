"""
HarvestAlert Backend API

FastAPI application for the HarvestAlert Climate & Nutrition Early Warning Platform.
Provides REST endpoints for climate data, risk predictions, and region information.

Validates: Requirements 8.1, 8.4, 19.2, 19.3
"""

import logging
import os
import time
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError

from database import init_db, close_db, check_db_connection

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator:
    """
    Application lifespan manager for startup and shutdown events.
    
    Handles database initialization on startup and cleanup on shutdown.
    
    Yields:
        None: Control to the application
    """
    # Startup
    logger.info("Starting HarvestAlert Backend API")
    try:
        init_db()
        if check_db_connection():
            logger.info("Database connection established successfully")
        else:
            logger.warning("Database connection check failed")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("Shutting down HarvestAlert Backend API")
    try:
        close_db()
    except Exception as e:
        logger.error(f"Error during shutdown: {e}")


# Create FastAPI application
app = FastAPI(
    title="HarvestAlert API",
    description="AI-powered Climate & Nutrition Early Warning Platform",
    version="1.0.0",
    lifespan=lifespan
)


# Configure CORS middleware for frontend integration (Requirement 19.3)
# Read allowed origins from environment variable
cors_origins_env = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
cors_origins = [origin.strip() for origin in cors_origins_env.split(",")]

logger.info(f"CORS enabled for origins: {cors_origins}")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)


# Add GZip compression middleware for low-bandwidth optimization (Requirement 7.3)
# Compresses responses larger than 1000 bytes
app.add_middleware(GZipMiddleware, minimum_size=1000)


# Request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """
    Middleware to log all incoming requests and their response times.
    
    Args:
        request: Incoming HTTP request
        call_next: Next middleware or route handler
        
    Returns:
        Response from the route handler
    """
    start_time = time.time()
    
    # Log request
    logger.info(f"{request.method} {request.url.path}")
    
    try:
        response = await call_next(request)
        
        # Calculate response time
        duration = time.time() - start_time
        
        # Log response
        logger.info(
            f"{request.method} {request.url.path} - "
            f"Status: {response.status_code} - "
            f"Duration: {duration:.3f}s"
        )
        
        return response
    
    except Exception as e:
        duration = time.time() - start_time
        logger.error(
            f"{request.method} {request.url.path} - "
            f"Error: {str(e)} - "
            f"Duration: {duration:.3f}s"
        )
        raise


# Exception handlers

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Handle request validation errors (invalid input parameters).
    
    Args:
        request: The request that caused the error
        exc: The validation exception
        
    Returns:
        JSONResponse with error details
    """
    logger.warning(f"Validation error on {request.url.path}: {exc.errors()}")
    
    # Convert errors to JSON-serializable format
    errors = []
    for error in exc.errors():
        error_dict = {
            "loc": error.get("loc", []),
            "msg": error.get("msg", ""),
            "type": error.get("type", "")
        }
        # Handle ValueError in ctx
        if "ctx" in error and "error" in error["ctx"]:
            ctx_error = error["ctx"]["error"]
            if isinstance(ctx_error, ValueError):
                error_dict["msg"] = str(ctx_error)
        errors.append(error_dict)
    
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "detail": "Invalid request parameters",
            "errors": errors
        }
    )


@app.exception_handler(SQLAlchemyError)
async def database_exception_handler(request: Request, exc: SQLAlchemyError):
    """
    Handle database errors.
    
    Args:
        request: The request that caused the error
        exc: The database exception
        
    Returns:
        JSONResponse with error message
    """
    logger.error(f"Database error on {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
        content={
            "detail": "Database temporarily unavailable. Please try again later."
        }
    )


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    """
    Handle value errors (invalid data).
    
    Args:
        request: The request that caused the error
        exc: The value error exception
        
    Returns:
        JSONResponse with error message
    """
    logger.warning(f"Value error on {request.url.path}: {str(exc)}")
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "detail": str(exc)
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """
    Handle all other unexpected exceptions.
    
    Args:
        request: The request that caused the error
        exc: The exception
        
    Returns:
        JSONResponse with generic error message
    """
    logger.error(f"Unexpected error on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal server error. Please try again later."
        }
    )


# Root endpoint
@app.get("/", tags=["Health"])
async def root():
    """
    Root endpoint for API health check.
    
    Returns:
        dict: API status and version information
    """
    return {
        "name": "HarvestAlert API",
        "version": "1.0.0",
        "status": "operational"
    }


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint for monitoring.
    
    Returns:
        dict: Health status including database connectivity
    """
    db_healthy = check_db_connection()
    
    return {
        "status": "healthy" if db_healthy else "degraded",
        "database": "connected" if db_healthy else "disconnected"
    }


# Import and include routers
from routes import climate, predict, regions, alerts

app.include_router(climate.router)
app.include_router(predict.router)
app.include_router(regions.router)
app.include_router(alerts.router)
