"""
Climate API Routes

Provides endpoints for retrieving climate data including temperature,
rainfall, and drought index information.

Validates: Requirements 1.1, 1.2, 1.3, 1.4
"""

import logging
from typing import Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from services.climate_service import get_current_climate, get_climate_by_region

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(
    prefix="/climate",
    tags=["Climate"]
)


@router.get("", response_model=Dict[str, Any])
async def get_climate(db: Session = Depends(get_db)):
    """
    Get current climate data.
    
    Returns the most recent climate data including temperature, rainfall,
    and drought index.
    
    Args:
        db: Database session (injected)
        
    Returns:
        dict: Climate data with keys:
            - temperature (float): Temperature in Celsius
            - rainfall (float): Rainfall in millimeters
            - drought_index (float): Drought severity index (0-100)
            - recorded_at (str): ISO format timestamp
            - region_id (int): Associated region ID
            
    Raises:
        HTTPException 404: If no climate data is available
        HTTPException 500: If an unexpected error occurs
        
    Requirements: 1.1, 1.2, 1.3, 1.4
    
    Example Response:
        {
            "temperature": 35.5,
            "rainfall": 45.2,
            "drought_index": 72.3,
            "recorded_at": "2024-01-15T10:30:00",
            "region_id": 1
        }
    """
    try:
        logger.info("Fetching current climate data")
        
        climate_data = get_current_climate(db)
        
        if not climate_data:
            logger.warning("No climate data available")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No climate data available"
            )
        
        logger.info(f"Successfully retrieved climate data for region {climate_data['region_id']}")
        return climate_data
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    
    except Exception as e:
        logger.error(f"Error retrieving climate data: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve climate data"
        )


@router.get("/{region_id}", response_model=Dict[str, Any])
async def get_climate_by_region_id(
    region_id: int,
    db: Session = Depends(get_db)
):
    """
    Get climate data for a specific region.
    
    Returns the most recent climate data for the specified region.
    
    Args:
        region_id: ID of the region to retrieve climate data for
        db: Database session (injected)
        
    Returns:
        dict: Climate data with keys:
            - temperature (float): Temperature in Celsius
            - rainfall (float): Rainfall in millimeters
            - drought_index (float): Drought severity index (0-100)
            - recorded_at (str): ISO format timestamp
            - region_id (int): Associated region ID
            
    Raises:
        HTTPException 404: If no climate data exists for the region
        HTTPException 500: If an unexpected error occurs
        
    Requirements: 1.1, 1.2, 1.3
    
    Example Response:
        {
            "temperature": 28.3,
            "rainfall": 120.5,
            "drought_index": 35.2,
            "recorded_at": "2024-01-15T10:30:00",
            "region_id": 2
        }
    """
    try:
        logger.info(f"Fetching climate data for region {region_id}")
        
        climate_data = get_climate_by_region(db, region_id)
        
        if not climate_data:
            logger.warning(f"No climate data found for region {region_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No climate data available for region {region_id}"
            )
        
        logger.info(f"Successfully retrieved climate data for region {region_id}")
        return climate_data
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    
    except Exception as e:
        logger.error(f"Error retrieving climate data for region {region_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve climate data for region {region_id}"
        )
