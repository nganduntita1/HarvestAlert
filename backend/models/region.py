"""
Region model for HarvestAlert.

This module defines the Region SQLAlchemy model representing geographic areas
with associated climate risk levels. Each region has coordinates, risk scores,
and timestamp information.

Validates: Requirements 3.2, 3.4, 10.3
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import Column, Integer, String, Float, DateTime, CheckConstraint
from sqlalchemy.orm import validates

from database import Base


class Region(Base):
    """
    Region model representing a geographic area with risk assessments.
    
    Attributes:
        id (int): Primary key identifier
        name (str): Human-readable region name
        latitude (float): Latitude coordinate (-90 to 90)
        longitude (float): Longitude coordinate (-180 to 180)
        crop_risk (str): Crop failure risk level ("low", "medium", "high")
        nutrition_risk (str): Malnutrition risk level ("low", "medium", "high")
        last_updated (datetime): Timestamp of last risk assessment update
    
    Constraints:
        - Latitude must be between -90 and 90 (inclusive)
        - Longitude must be between -180 and 180 (inclusive)
        - crop_risk must be one of: "low", "medium", "high"
        - nutrition_risk must be one of: "low", "medium", "high"
    
    Example:
        region = Region(
            name="Sahel Region",
            latitude=14.5,
            longitude=-14.5,
            crop_risk="high",
            nutrition_risk="high"
        )
    """
    
    __tablename__ = "regions"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Region identification
    name = Column(String(255), nullable=False)
    
    # Geographic coordinates
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    
    # Risk assessments
    crop_risk = Column(String(10), nullable=False)
    nutrition_risk = Column(String(10), nullable=False)
    
    # Metadata
    last_updated = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Database-level constraints
    __table_args__ = (
        CheckConstraint(
            "latitude >= -90 AND latitude <= 90",
            name="valid_latitude"
        ),
        CheckConstraint(
            "longitude >= -180 AND longitude <= 180",
            name="valid_longitude"
        ),
        CheckConstraint(
            "crop_risk IN ('low', 'medium', 'high')",
            name="valid_crop_risk"
        ),
        CheckConstraint(
            "nutrition_risk IN ('low', 'medium', 'high')",
            name="valid_nutrition_risk"
        ),
    )
    
    @validates('latitude')
    def validate_latitude(self, key: str, value: float) -> float:
        """
        Validate latitude is within valid range.
        
        Args:
            key: Field name (automatically provided by SQLAlchemy)
            value: Latitude value to validate
            
        Returns:
            float: Validated latitude value
            
        Raises:
            ValueError: If latitude is outside valid range [-90, 90]
        """
        if value < -90 or value > 90:
            raise ValueError(f"Latitude must be between -90 and 90, got {value}")
        return value
    
    @validates('longitude')
    def validate_longitude(self, key: str, value: float) -> float:
        """
        Validate longitude is within valid range.
        
        Args:
            key: Field name (automatically provided by SQLAlchemy)
            value: Longitude value to validate
            
        Returns:
            float: Validated longitude value
            
        Raises:
            ValueError: If longitude is outside valid range [-180, 180]
        """
        if value < -180 or value > 180:
            raise ValueError(f"Longitude must be between -180 and 180, got {value}")
        return value
    
    @validates('crop_risk')
    def validate_crop_risk(self, key: str, value: str) -> str:
        """
        Validate crop_risk is a valid risk level.
        
        Args:
            key: Field name (automatically provided by SQLAlchemy)
            value: Risk level to validate
            
        Returns:
            str: Validated risk level
            
        Raises:
            ValueError: If risk level is not one of: "low", "medium", "high"
        """
        valid_levels = {"low", "medium", "high"}
        if value not in valid_levels:
            raise ValueError(f"crop_risk must be one of {valid_levels}, got '{value}'")
        return value
    
    @validates('nutrition_risk')
    def validate_nutrition_risk(self, key: str, value: str) -> str:
        """
        Validate nutrition_risk is a valid risk level.
        
        Args:
            key: Field name (automatically provided by SQLAlchemy)
            value: Risk level to validate
            
        Returns:
            str: Validated risk level
            
        Raises:
            ValueError: If risk level is not one of: "low", "medium", "high"
        """
        valid_levels = {"low", "medium", "high"}
        if value not in valid_levels:
            raise ValueError(f"nutrition_risk must be one of {valid_levels}, got '{value}'")
        return value
    
    def __repr__(self) -> str:
        """
        String representation of Region instance.
        
        Returns:
            str: Human-readable representation
        """
        return (
            f"<Region(id={self.id}, name='{self.name}', "
            f"lat={self.latitude}, lng={self.longitude}, "
            f"crop_risk='{self.crop_risk}', nutrition_risk='{self.nutrition_risk}')>"
        )
    
    def to_dict(self) -> dict:
        """
        Convert Region instance to dictionary for API responses.
        
        Returns:
            dict: Dictionary representation with all fields
        """
        return {
            "id": self.id,
            "name": self.name,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "crop_risk": self.crop_risk,
            "nutrition_risk": self.nutrition_risk,
            "last_updated": self.last_updated.isoformat() if self.last_updated else None
        }
