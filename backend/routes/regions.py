"""
Regions API Routes

Provides endpoints for retrieving region information including geographic
coordinates and risk assessments.

Validates: Requirements 3.1, 3.2, 3.3, 3.4
"""

import logging
from typing import List, Dict, Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from database import get_db
from services.region_service import get_all_regions, get_region_by_id

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(
    prefix="/regions",
    tags=["Regions"]
)


class RegionResponse(BaseModel):
    """
    Response model for region data.
    
    Attributes:
        id: Unique region identifier
        name: Human-readable region name
        latitude: Latitude coordinate (-90 to 90)
        longitude: Longitude coordinate (-180 to 180)
        crop_risk: Crop failure risk level ("low", "medium", "high")
        nutrition_risk: Malnutrition risk level ("low", "medium", "high")
        last_updated: ISO format timestamp of last update
    """
    id: int = Field(..., description="Unique region identifier", examples=[1])
    name: str = Field(..., description="Region name", examples=["Sahel Region"])
    latitude: float = Field(
        ...,
        description="Latitude coordinate",
        ge=-90,
        le=90,
        examples=[14.5]
    )
    longitude: float = Field(
        ...,
        description="Longitude coordinate",
        ge=-180,
        le=180,
        examples=[-14.5]
    )
    crop_risk: str = Field(
        ...,
        description="Crop failure risk level",
        pattern="^(low|medium|high)$",
        examples=["high"]
    )
    nutrition_risk: str = Field(
        ...,
        description="Malnutrition risk level",
        pattern="^(low|medium|high)$",
        examples=["high"]
    )
    last_updated: str = Field(
        ...,
        description="ISO format timestamp of last update",
        examples=["2024-01-15T10:30:00"]
    )


@router.get("", response_model=List[RegionResponse])
async def get_regions(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    """
    Get all regions with their risk assessments.
    
    Returns a list of all regions including their geographic coordinates,
    crop risk levels, and nutrition risk levels.
    
    Args:
        db: Database session (injected)
        
    Returns:
        list: List of region dictionaries, each containing:
            - id (int): Unique region identifier
            - name (str): Region name
            - latitude (float): Latitude coordinate (-90 to 90)
            - longitude (float): Longitude coordinate (-180 to 180)
            - crop_risk (str): "low", "medium", or "high"
            - nutrition_risk (str): "low", "medium", or "high"
            - last_updated (str): ISO format timestamp
            
    Raises:
        HTTPException 500: If an unexpected error occurs
        
    Requirements: 3.1, 3.2, 3.3, 3.4
    
    Example Response:
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
    """
    try:
        logger.info("Fetching all regions")
        
        regions = get_all_regions(db)
        
        logger.info(f"Successfully retrieved {len(regions)} regions")
        return regions
    
    except Exception as e:
        logger.error(f"Error retrieving regions: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve regions"
        )


@router.get("/{region_id}", response_model=RegionResponse)
async def get_region(
    region_id: int,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get a specific region by ID.
    
    Returns detailed information for a single region including geographic
    coordinates and risk assessments.
    
    Args:
        region_id: ID of the region to retrieve
        db: Database session (injected)
        
    Returns:
        dict: Region data with keys:
            - id (int): Unique region identifier
            - name (str): Region name
            - latitude (float): Latitude coordinate
            - longitude (float): Longitude coordinate
            - crop_risk (str): "low", "medium", or "high"
            - nutrition_risk (str): "low", "medium", or "high"
            - last_updated (str): ISO format timestamp
            
    Raises:
        HTTPException 404: If region with given ID does not exist
        HTTPException 500: If an unexpected error occurs
        
    Requirements: 3.1, 3.2, 3.4
    
    Example Response:
        {
            "id": 1,
            "name": "Sahel Region",
            "latitude": 14.5,
            "longitude": -14.5,
            "crop_risk": "high",
            "nutrition_risk": "high",
            "last_updated": "2024-01-15T10:30:00"
        }
    """
    try:
        logger.info(f"Fetching region with id={region_id}")
        
        region = get_region_by_id(db, region_id)
        
        if not region:
            logger.warning(f"Region with id={region_id} not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Region with id {region_id} not found"
            )
        
        logger.info(f"Successfully retrieved region {region_id}")
        return region
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    
    except Exception as e:
        logger.error(f"Error retrieving region {region_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve region {region_id}"
        )


class TrendDataPoint(BaseModel):
    """
    Response model for a single trend data point.
    
    Attributes:
        recorded_at: ISO format timestamp when data was recorded
        temperature: Temperature in Celsius
        rainfall: Rainfall in millimeters
        drought_index: Drought severity index (0-100)
        crop_risk: Crop failure risk level
        nutrition_risk: Malnutrition risk level
    """
    recorded_at: str = Field(
        ...,
        description="ISO format timestamp",
        examples=["2024-01-15T10:30:00"]
    )
    temperature: float = Field(
        ...,
        description="Temperature in Celsius",
        examples=[35.5]
    )
    rainfall: float = Field(
        ...,
        description="Rainfall in millimeters",
        examples=[45.2]
    )
    drought_index: float = Field(
        ...,
        description="Drought severity index (0-100)",
        ge=0,
        le=100,
        examples=[72.3]
    )
    crop_risk: str = Field(
        ...,
        description="Crop failure risk level",
        pattern="^(low|medium|high)$",
        examples=["high"]
    )
    nutrition_risk: str = Field(
        ...,
        description="Malnutrition risk level",
        pattern="^(low|medium|high)$",
        examples=["high"]
    )


@router.get("/{region_id}/trends", response_model=List[TrendDataPoint])
async def get_region_trends(
    region_id: int,
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """
    Get historical risk trend data for a specific region.
    
    Returns the most recent 7 climate data points with calculated risk levels
    for trend visualization. Data is ordered from oldest to newest.
    
    Args:
        region_id: ID of the region to retrieve trends for
        db: Database session (injected)
        
    Returns:
        list: List of trend data points, each containing:
            - recorded_at (str): ISO format timestamp
            - temperature (float): Temperature in Celsius
            - rainfall (float): Rainfall in millimeters
            - drought_index (float): Drought severity index (0-100)
            - crop_risk (str): "low", "medium", or "high"
            - nutrition_risk (str): "low", "medium", or "high"
            
    Raises:
        HTTPException 404: If region with given ID does not exist
        HTTPException 500: If an unexpected error occurs
        
    Requirements: 18.1, 18.2
    
    Example Response:
        [
            {
                "recorded_at": "2024-01-10T10:00:00",
                "temperature": 32.5,
                "rainfall": 55.0,
                "drought_index": 65.2,
                "crop_risk": "medium",
                "nutrition_risk": "medium"
            },
            {
                "recorded_at": "2024-01-11T10:00:00",
                "temperature": 35.0,
                "rainfall": 45.0,
                "drought_index": 72.5,
                "crop_risk": "high",
                "nutrition_risk": "high"
            }
        ]
    """
    try:
        logger.info(f"Fetching trend data for region {region_id}")
        
        # First verify the region exists
        region = get_region_by_id(db, region_id)
        if not region:
            logger.warning(f"Region with id={region_id} not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Region with id {region_id} not found"
            )
        
        # Import here to avoid circular dependency
        from models.climate_data import ClimateData
        from services.prediction_service import predict_risk
        
        # Query the last 7 climate data points for this region
        climate_data_records = (
            db.query(ClimateData)
            .filter(ClimateData.region_id == region_id)
            .order_by(ClimateData.recorded_at.desc())
            .limit(7)
            .all()
        )
        
        # Reverse to get oldest to newest order for trend visualization
        climate_data_records.reverse()
        
        # Calculate risk levels for each data point
        trend_data = []
        for record in climate_data_records:
            # Calculate risk levels using prediction service
            risk_prediction = predict_risk(record.temperature, record.rainfall)
            
            trend_data.append({
                "recorded_at": record.recorded_at.isoformat(),
                "temperature": record.temperature,
                "rainfall": record.rainfall,
                "drought_index": record.drought_index,
                "crop_risk": risk_prediction["crop_risk"],
                "nutrition_risk": risk_prediction["nutrition_risk"]
            })
        
        logger.info(f"Successfully retrieved {len(trend_data)} trend data points for region {region_id}")
        return trend_data
    
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    
    except Exception as e:
        logger.error(f"Error retrieving trends for region {region_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve trends for region {region_id}"
        )
