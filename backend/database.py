"""
Database configuration and connection management for HarvestAlert.

This module provides SQLAlchemy engine setup with support for both PostgreSQL
and SQLite databases via environment variable configuration. Includes connection
pooling and comprehensive error handling.

Validates: Requirements 10.1, 10.2, 19.2
"""

import logging
import os
from typing import Generator

from sqlalchemy import create_engine, event, exc, text
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from sqlalchemy.pool import StaticPool

# Configure logging
logger = logging.getLogger(__name__)

# Create declarative base for models
Base = declarative_base()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./harvestalert.db")

# Railway injects postgres:// but SQLAlchemy requires postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# Determine database type from URL
is_sqlite = DATABASE_URL.startswith("sqlite")


def get_engine_config() -> dict:
    """
    Get database engine configuration based on database type.
    
    Returns:
        dict: Engine configuration parameters
    """
    if is_sqlite:
        # SQLite configuration
        # Use StaticPool for SQLite to handle threading properly
        # connect_args with check_same_thread=False allows multi-threaded access
        return {
            "connect_args": {"check_same_thread": False},
            "poolclass": StaticPool,
            "echo": os.getenv("ENVIRONMENT") == "development",
        }
    else:
        # PostgreSQL configuration with connection pooling
        return {
            "pool_size": int(os.getenv("DB_POOL_SIZE", "5")),
            "max_overflow": int(os.getenv("DB_MAX_OVERFLOW", "10")),
            "pool_timeout": int(os.getenv("DB_POOL_TIMEOUT", "30")),
            "pool_recycle": int(os.getenv("DB_POOL_RECYCLE", "3600")),
            "pool_pre_ping": True,  # Verify connections before using
            "echo": os.getenv("ENVIRONMENT") == "development",
        }


# Create engine with appropriate configuration
try:
    engine = create_engine(DATABASE_URL, **get_engine_config())
    logger.info(f"Database engine created successfully for: {DATABASE_URL.split('@')[-1] if '@' in DATABASE_URL else 'SQLite'}")
except exc.SQLAlchemyError as e:
    logger.error(f"Failed to create database engine: {e}")
    raise


# Enable foreign key constraints for SQLite
@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_conn, connection_record):
    """
    Enable foreign key constraints for SQLite connections.
    
    Args:
        dbapi_conn: Database API connection
        connection_record: Connection record
    """
    if is_sqlite:
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()
        logger.debug("SQLite foreign keys enabled")


# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """
    Dependency function to get database session.
    
    Yields:
        Session: SQLAlchemy database session
        
    Example:
        @app.get("/regions")
        def get_regions(db: Session = Depends(get_db)):
            return db.query(Region).all()
    """
    db = SessionLocal()
    try:
        yield db
    except exc.SQLAlchemyError as e:
        logger.error(f"Database session error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def init_db() -> None:
    """
    Initialize database by creating all tables.
    
    This function should be called on application startup to ensure
    all tables defined in models are created.
    
    Raises:
        SQLAlchemyError: If table creation fails
    """
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables created successfully")
    except exc.SQLAlchemyError as e:
        logger.error(f"Failed to create database tables: {e}")
        raise


def check_db_connection() -> bool:
    """
    Check if database connection is healthy.
    
    Returns:
        bool: True if connection is successful, False otherwise
    """
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))
        logger.info("Database connection check successful")
        return True
    except exc.SQLAlchemyError as e:
        logger.error(f"Database connection check failed: {e}")
        return False


def close_db() -> None:
    """
    Close database engine and dispose of connection pool.
    
    This function should be called on application shutdown to properly
    clean up database connections.
    """
    try:
        engine.dispose()
        logger.info("Database connections closed successfully")
    except exc.SQLAlchemyError as e:
        logger.error(f"Error closing database connections: {e}")
        raise
