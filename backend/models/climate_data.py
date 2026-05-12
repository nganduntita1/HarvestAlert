"""
ClimateData model for HarvestAlert.

This module defines the ClimateData SQLAlchemy model representing climate
measurements for geographic regions. Each record contains temperature, rainfall,
drought index, and timestamp information linked to a specific region.

Validates: Requirements 1.3, 10.3
"""

from datetime import datetime
from typing import Optional

from sqlalchemy import Column, Integer, Float, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import validates, relationship

from database import Base


class ClimateData(Base):
    """
    ClimateData model representing climate measurements for a region.
    
    Attributes:
        id (int): Primary key identifier
        region_id (int): Foreign key to regions table
        temperature (float): Temperature in Celsius
        rainfall (float): Rainfall in millimeters
        drought_index (float): Drought severity index (0-100 scale)
        recorded_at (datetime): Timestamp when data was recorded
        region (Region): Relationship to associated Region object
    
    Constraints:
        - temperature must be between -50 and 60 Celsius
        - rainfall must be between 0 and 1000 millimeters
        - drought_index must be between 0 and 100 (inclusive)
        - region_id must reference a valid region
    
    Example:
        climate_data = ClimateData(
            region_id=1,
            temperature=35.5,
            rainfall=45.2,
            drought_index=72.3,
            recorded_at=datetime.utcnow()
        )
    """
    
    __tablename__ = "climate_data"
    
    # Primary key
    id = Column(Integer, primary_key=True, index=True)
    
    # Foreign key to Region
    region_id = Column(
        Integer,
        ForeignKey("regions.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Climate measurements
    temperature = Column(Float, nullable=False)
    rainfall = Column(Float, nullable=False)
    drought_index = Column(Float, nullable=False)
    
    # Timestamp
    recorded_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    
    # Relationship to Region
    region = relationship("Region", backref="climate_data")
    
    # Database-level constraints
    __table_args__ = (
        CheckConstraint(
            "temperature >= -50 AND temperature <= 60",
            name="valid_temperature"
        ),
        CheckConstraint(
            "rainfall >= 0 AND rainfall <= 1000",
            name="valid_rainfall"
        ),
        CheckConstraint(
            "drought_index >= 0 AND drought_index <= 100",
            name="valid_drought_index"
        ),
    )
    
    @validates('temperature')
    def validate_temperature(self, key: str, value: float) -> float:
        """
        Validate temperature is within valid range.
        
        Args:
            key: Field name (automatically provided by SQLAlchemy)
            value: Temperature value to validate
            
        Returns:
            float: Validated temperature value
            
        Raises:
            ValueError: If temperature is outside valid range [-50, 60]
        """
        if value < -50 or value > 60:
            raise ValueError(f"Temperature must be between -50 and 60 Celsius, got {value}")
        return value
    
    @validates('rainfall')
    def validate_rainfall(self, key: str, value: float) -> float:
        """
        Validate rainfall is within valid range.
        
        Args:
            key: Field name (automatically provided by SQLAlchemy)
            value: Rainfall value to validate
            
        Returns:
            float: Validated rainfall value
            
        Raises:
            ValueError: If rainfall is outside valid range [0, 1000]
        """
        if value < 0 or value > 1000:
            raise ValueError(f"Rainfall must be between 0 and 1000 mm, got {value}")
        return value
    
    @validates('drought_index')
    def validate_drought_index(self, key: str, value: float) -> float:
        """
        Validate drought_index is within valid range.
        
        Args:
            key: Field name (automatically provided by SQLAlchemy)
            value: Drought index value to validate
            
        Returns:
            float: Validated drought index value
            
        Raises:
            ValueError: If drought_index is outside valid range [0, 100]
        """
        if value < 0 or value > 100:
            raise ValueError(f"Drought index must be between 0 and 100, got {value}")
        return value
    
    def __repr__(self) -> str:
        """
        String representation of ClimateData instance.
        
        Returns:
            str: Human-readable representation
        """
        return (
            f"<ClimateData(id={self.id}, region_id={self.region_id}, "
            f"temp={self.temperature}°C, rainfall={self.rainfall}mm, "
            f"drought_index={self.drought_index}, recorded_at={self.recorded_at})>"
        )
    
    def to_dict(self) -> dict:
        """
        Convert ClimateData instance to dictionary for API responses.
        
        Returns:
            dict: Dictionary representation with all fields
        """
        return {
            "id": self.id,
            "region_id": self.region_id,
            "temperature": self.temperature,
            "rainfall": self.rainfall,
            "drought_index": self.drought_index,
            "recorded_at": self.recorded_at.isoformat() if self.recorded_at else None
        }
