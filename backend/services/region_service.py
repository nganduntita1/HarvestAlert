"""
Region Service for HarvestAlert MVP

This module provides service functions for managing region data and risk assessments.
Implements data access layer for region-related operations.

Requirements: 3.1, 3.2
"""

import logging
from typing import List, Optional, Dict, Any
from datetime import datetime

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from models.region import Region

# Configure logging
logger = logging.getLogger(__name__)


def get_all_regions(db: Session) -> List[Dict[str, Any]]:
    """
    Fetches all regions with their current risk levels.
    
    Retrieves all region records from the database and returns them as
    a list of dictionaries suitable for API responses.
    
    Args:
        db: SQLAlchemy database session
    
    Returns:
        List of dictionaries, each containing:
        - id: int
        - name: str
        - latitude: float
        - longitude: float
        - crop_risk: str ("low", "medium", "high")
        - nutrition_risk: str ("low", "medium", "high")
        - last_updated: str (ISO format timestamp)
        
        Returns empty list if no regions exist.
    
    Requirements: 3.1, 3.2
    
    Example:
        >>> regions = get_all_regions(db)
        >>> print(len(regions))
        3
        >>> print(regions[0]['name'])
        'Sahel Region'
    """
    try:
        # Query all regions
        regions = db.query(Region).all()
        
        if not regions:
            logger.warning("No regions found in database")
            return []
        
        logger.info(f"Retrieved {len(regions)} regions from database")
        
        # Convert to list of dictionaries
        return [region.to_dict() for region in regions]
    
    except SQLAlchemyError as e:
        logger.error(f"Database error retrieving regions: {e}")
        raise
    except Exception as e:
        logger.error(f"Error retrieving regions: {e}")
        raise


def get_region_by_id(db: Session, region_id: int) -> Optional[Dict[str, Any]]:
    """
    Retrieves a single region by its ID.
    
    Args:
        db: SQLAlchemy database session
        region_id: ID of the region to retrieve
    
    Returns:
        Dictionary containing region data with keys:
        - id: int
        - name: str
        - latitude: float
        - longitude: float
        - crop_risk: str ("low", "medium", "high")
        - nutrition_risk: str ("low", "medium", "high")
        - last_updated: str (ISO format timestamp)
        
        Returns None if region with given ID does not exist.
    
    Requirements: 3.1, 3.2
    
    Example:
        >>> region = get_region_by_id(db, region_id=1)
        >>> print(region['name'])
        'Sahel Region'
    """
    try:
        # Query for specific region
        region = db.query(Region).filter(Region.id == region_id).first()
        
        if not region:
            logger.warning(f"Region with id={region_id} not found")
            return None
        
        logger.info(f"Retrieved region: id={region_id}, name={region.name}")
        
        return region.to_dict()
    
    except SQLAlchemyError as e:
        logger.error(f"Database error retrieving region id={region_id}: {e}")
        raise
    except Exception as e:
        logger.error(f"Error retrieving region id={region_id}: {e}")
        raise


def update_region_risk(
    db: Session,
    region_id: int,
    crop_risk: str,
    nutrition_risk: str
) -> Optional[Dict[str, Any]]:
    """
    Updates the risk levels for a specific region.
    
    Updates both crop_risk and nutrition_risk for the specified region
    and automatically updates the last_updated timestamp.
    
    Args:
        db: SQLAlchemy database session
        region_id: ID of the region to update
        crop_risk: New crop risk level ("low", "medium", "high")
        nutrition_risk: New nutrition risk level ("low", "medium", "high")
    
    Returns:
        Dictionary containing updated region data with all fields.
        Returns None if region with given ID does not exist.
    
    Raises:
        ValueError: If crop_risk or nutrition_risk are not valid values
        SQLAlchemyError: If database operation fails
    
    Requirements: 3.1, 3.2
    
    Example:
        >>> updated = update_region_risk(db, region_id=1, crop_risk="high", nutrition_risk="medium")
        >>> print(updated['crop_risk'])
        'high'
    """
    try:
        # Validate risk levels
        valid_levels = {"low", "medium", "high"}
        if crop_risk not in valid_levels:
            raise ValueError(f"crop_risk must be one of {valid_levels}, got '{crop_risk}'")
        if nutrition_risk not in valid_levels:
            raise ValueError(f"nutrition_risk must be one of {valid_levels}, got '{nutrition_risk}'")
        
        # Query for the region
        region = db.query(Region).filter(Region.id == region_id).first()
        
        if not region:
            logger.warning(f"Cannot update: region with id={region_id} not found")
            return None
        
        # Update risk levels
        region.crop_risk = crop_risk
        region.nutrition_risk = nutrition_risk
        region.last_updated = datetime.utcnow()
        
        # Commit changes
        db.commit()
        db.refresh(region)
        
        logger.info(
            f"Updated region id={region_id}: crop_risk={crop_risk}, "
            f"nutrition_risk={nutrition_risk}"
        )
        
        return region.to_dict()
    
    except ValueError as e:
        logger.error(f"Validation error updating region id={region_id}: {e}")
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error updating region id={region_id}: {e}")
        db.rollback()
        raise
    except Exception as e:
        logger.error(f"Error updating region id={region_id}: {e}")
        db.rollback()
        raise
