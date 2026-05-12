"""
Climate Service for HarvestAlert MVP

This module provides service functions for retrieving climate data from the database.
Implements data access layer for climate-related operations.

Requirements: 1.1, 1.2, 1.3
"""

import logging
from typing import Optional, Dict, Any
from datetime import datetime

from sqlalchemy.orm import Session
from sqlalchemy import desc

from models.climate_data import ClimateData

# Configure logging
logger = logging.getLogger(__name__)


def get_current_climate(db: Session) -> Optional[Dict[str, Any]]:
    """
    Retrieves the latest climate data across all regions.
    
    Returns the most recent climate data record based on recorded_at timestamp.
    
    Args:
        db: SQLAlchemy database session
    
    Returns:
        Dictionary containing climate data with keys:
        - temperature: float (Celsius)
        - rainfall: float (millimeters)
        - drought_index: float (0-100 scale)
        - recorded_at: str (ISO format timestamp)
        - region_id: int
        
        Returns None if no climate data exists.
    
    Requirements: 1.1, 1.2, 1.3
    
    Example:
        >>> climate = get_current_climate(db)
        >>> print(climate['temperature'])
        35.5
    """
    try:
        # Query for the most recent climate data record
        climate_data = db.query(ClimateData).order_by(
            desc(ClimateData.recorded_at)
        ).first()
        
        if not climate_data:
            logger.warning("No climate data found in database")
            return None
        
        logger.info(f"Retrieved current climate data: id={climate_data.id}, region_id={climate_data.region_id}")
        
        return {
            "temperature": climate_data.temperature,
            "rainfall": climate_data.rainfall,
            "drought_index": climate_data.drought_index,
            "recorded_at": climate_data.recorded_at.isoformat() if climate_data.recorded_at else None,
            "region_id": climate_data.region_id
        }
    
    except Exception as e:
        logger.error(f"Error retrieving current climate data: {e}")
        raise


def get_climate_by_region(db: Session, region_id: int) -> Optional[Dict[str, Any]]:
    """
    Retrieves the latest climate data for a specific region.
    
    Returns the most recent climate data record for the given region_id.
    
    Args:
        db: SQLAlchemy database session
        region_id: ID of the region to retrieve climate data for
    
    Returns:
        Dictionary containing climate data with keys:
        - temperature: float (Celsius)
        - rainfall: float (millimeters)
        - drought_index: float (0-100 scale)
        - recorded_at: str (ISO format timestamp)
        - region_id: int
        
        Returns None if no climate data exists for the specified region.
    
    Requirements: 1.1, 1.2, 1.3
    
    Example:
        >>> climate = get_climate_by_region(db, region_id=1)
        >>> print(climate['rainfall'])
        45.2
    """
    try:
        # Query for the most recent climate data for the specified region
        climate_data = db.query(ClimateData).filter(
            ClimateData.region_id == region_id
        ).order_by(
            desc(ClimateData.recorded_at)
        ).first()
        
        if not climate_data:
            logger.warning(f"No climate data found for region_id={region_id}")
            return None
        
        logger.info(f"Retrieved climate data for region_id={region_id}: id={climate_data.id}")
        
        return {
            "temperature": climate_data.temperature,
            "rainfall": climate_data.rainfall,
            "drought_index": climate_data.drought_index,
            "recorded_at": climate_data.recorded_at.isoformat() if climate_data.recorded_at else None,
            "region_id": climate_data.region_id
        }
    
    except Exception as e:
        logger.error(f"Error retrieving climate data for region_id={region_id}: {e}")
        raise
