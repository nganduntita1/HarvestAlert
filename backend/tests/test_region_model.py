"""
Unit tests for Region model.

Tests validation constraints, field assignments, and model behavior.
"""

import pytest
from datetime import datetime
from sqlalchemy.exc import IntegrityError

from models.region import Region
from database import Base, engine, SessionLocal


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test."""
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Create session
    session = SessionLocal()
    
    yield session
    
    # Cleanup
    session.close()
    Base.metadata.drop_all(bind=engine)


class TestRegionModel:
    """Test suite for Region model."""
    
    def test_create_valid_region(self, db_session):
        """Test creating a region with valid data."""
        region = Region(
            name="Sahel Region",
            latitude=14.5,
            longitude=-14.5,
            crop_risk="high",
            nutrition_risk="high"
        )
        
        db_session.add(region)
        db_session.commit()
        
        assert region.id is not None
        assert region.name == "Sahel Region"
        assert region.latitude == 14.5
        assert region.longitude == -14.5
        assert region.crop_risk == "high"
        assert region.nutrition_risk == "high"
        assert isinstance(region.last_updated, datetime)
    
    def test_latitude_validation_too_high(self, db_session):
        """Test that latitude > 90 raises ValueError."""
        with pytest.raises(ValueError, match="Latitude must be between -90 and 90"):
            region = Region(
                name="Invalid Region",
                latitude=91.0,
                longitude=0.0,
                crop_risk="low",
                nutrition_risk="low"
            )
    
    def test_latitude_validation_too_low(self, db_session):
        """Test that latitude < -90 raises ValueError."""
        with pytest.raises(ValueError, match="Latitude must be between -90 and 90"):
            region = Region(
                name="Invalid Region",
                latitude=-91.0,
                longitude=0.0,
                crop_risk="low",
                nutrition_risk="low"
            )
    
    def test_longitude_validation_too_high(self, db_session):
        """Test that longitude > 180 raises ValueError."""
        with pytest.raises(ValueError, match="Longitude must be between -180 and 180"):
            region = Region(
                name="Invalid Region",
                latitude=0.0,
                longitude=181.0,
                crop_risk="low",
                nutrition_risk="low"
            )
    
    def test_longitude_validation_too_low(self, db_session):
        """Test that longitude < -180 raises ValueError."""
        with pytest.raises(ValueError, match="Longitude must be between -180 and 180"):
            region = Region(
                name="Invalid Region",
                latitude=0.0,
                longitude=-181.0,
                crop_risk="low",
                nutrition_risk="low"
            )
    
    def test_crop_risk_validation_invalid(self, db_session):
        """Test that invalid crop_risk raises ValueError."""
        with pytest.raises(ValueError, match="crop_risk must be one of"):
            region = Region(
                name="Invalid Region",
                latitude=0.0,
                longitude=0.0,
                crop_risk="invalid",
                nutrition_risk="low"
            )
    
    def test_nutrition_risk_validation_invalid(self, db_session):
        """Test that invalid nutrition_risk raises ValueError."""
        with pytest.raises(ValueError, match="nutrition_risk must be one of"):
            region = Region(
                name="Invalid Region",
                latitude=0.0,
                longitude=0.0,
                crop_risk="low",
                nutrition_risk="invalid"
            )
    
    def test_valid_risk_levels(self, db_session):
        """Test all valid risk levels are accepted."""
        valid_levels = ["low", "medium", "high"]
        
        for crop_level in valid_levels:
            for nutrition_level in valid_levels:
                region = Region(
                    name=f"Region {crop_level}-{nutrition_level}",
                    latitude=0.0,
                    longitude=0.0,
                    crop_risk=crop_level,
                    nutrition_risk=nutrition_level
                )
                db_session.add(region)
        
        db_session.commit()
        
        # Should have 9 regions (3 x 3 combinations)
        regions = db_session.query(Region).all()
        assert len(regions) == 9
    
    def test_boundary_coordinates(self, db_session):
        """Test boundary values for coordinates are accepted."""
        # Test all four corners of valid coordinate space
        test_cases = [
            (90.0, 180.0),    # Northeast corner
            (90.0, -180.0),   # Northwest corner
            (-90.0, 180.0),   # Southeast corner
            (-90.0, -180.0),  # Southwest corner
        ]
        
        for lat, lng in test_cases:
            region = Region(
                name=f"Boundary {lat},{lng}",
                latitude=lat,
                longitude=lng,
                crop_risk="low",
                nutrition_risk="low"
            )
            db_session.add(region)
        
        db_session.commit()
        
        regions = db_session.query(Region).all()
        assert len(regions) == 4
    
    def test_to_dict_method(self, db_session):
        """Test to_dict() method returns correct dictionary."""
        region = Region(
            name="Test Region",
            latitude=10.5,
            longitude=20.5,
            crop_risk="medium",
            nutrition_risk="low"
        )
        
        db_session.add(region)
        db_session.commit()
        
        region_dict = region.to_dict()
        
        assert region_dict["id"] == region.id
        assert region_dict["name"] == "Test Region"
        assert region_dict["latitude"] == 10.5
        assert region_dict["longitude"] == 20.5
        assert region_dict["crop_risk"] == "medium"
        assert region_dict["nutrition_risk"] == "low"
        assert "last_updated" in region_dict
        assert isinstance(region_dict["last_updated"], str)
    
    def test_repr_method(self, db_session):
        """Test __repr__() method returns readable string."""
        region = Region(
            name="Test Region",
            latitude=10.5,
            longitude=20.5,
            crop_risk="high",
            nutrition_risk="medium"
        )
        
        db_session.add(region)
        db_session.commit()
        
        repr_str = repr(region)
        
        assert "Region" in repr_str
        assert "Test Region" in repr_str
        assert "10.5" in repr_str
        assert "20.5" in repr_str
        assert "high" in repr_str
        assert "medium" in repr_str
    
    def test_last_updated_auto_set(self, db_session):
        """Test that last_updated is automatically set on creation."""
        before = datetime.utcnow()
        
        region = Region(
            name="Test Region",
            latitude=0.0,
            longitude=0.0,
            crop_risk="low",
            nutrition_risk="low"
        )
        
        db_session.add(region)
        db_session.commit()
        
        after = datetime.utcnow()
        
        assert region.last_updated is not None
        assert before <= region.last_updated <= after
    
    def test_required_fields(self, db_session):
        """Test that required fields cannot be null."""
        # Test missing name
        with pytest.raises(IntegrityError):
            region = Region(
                latitude=0.0,
                longitude=0.0,
                crop_risk="low",
                nutrition_risk="low"
            )
            db_session.add(region)
            db_session.commit()
        
        db_session.rollback()
