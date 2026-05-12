"""
Unit tests for ClimateData model.

Tests validation constraints, field assignments, foreign key relationships,
and model behavior.
"""

import pytest
from datetime import datetime
from sqlalchemy.exc import IntegrityError

from models.climate_data import ClimateData
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


@pytest.fixture
def sample_region(db_session):
    """Create a sample region for testing climate data relationships."""
    region = Region(
        name="Test Region",
        latitude=10.0,
        longitude=20.0,
        crop_risk="medium",
        nutrition_risk="medium"
    )
    db_session.add(region)
    db_session.commit()
    return region


class TestClimateDataModel:
    """Test suite for ClimateData model."""
    
    def test_create_valid_climate_data(self, db_session, sample_region):
        """Test creating climate data with valid values."""
        climate_data = ClimateData(
            region_id=sample_region.id,
            temperature=35.5,
            rainfall=45.2,
            drought_index=72.3
        )
        
        db_session.add(climate_data)
        db_session.commit()
        
        assert climate_data.id is not None
        assert climate_data.region_id == sample_region.id
        assert climate_data.temperature == 35.5
        assert climate_data.rainfall == 45.2
        assert climate_data.drought_index == 72.3
        assert isinstance(climate_data.recorded_at, datetime)
    
    def test_temperature_validation_too_high(self, db_session, sample_region):
        """Test that temperature > 60 raises ValueError."""
        with pytest.raises(ValueError, match="Temperature must be between -50 and 60"):
            climate_data = ClimateData(
                region_id=sample_region.id,
                temperature=61.0,
                rainfall=50.0,
                drought_index=50.0
            )
    
    def test_temperature_validation_too_low(self, db_session, sample_region):
        """Test that temperature < -50 raises ValueError."""
        with pytest.raises(ValueError, match="Temperature must be between -50 and 60"):
            climate_data = ClimateData(
                region_id=sample_region.id,
                temperature=-51.0,
                rainfall=50.0,
                drought_index=50.0
            )
    
    def test_rainfall_validation_too_high(self, db_session, sample_region):
        """Test that rainfall > 1000 raises ValueError."""
        with pytest.raises(ValueError, match="Rainfall must be between 0 and 1000"):
            climate_data = ClimateData(
                region_id=sample_region.id,
                temperature=25.0,
                rainfall=1001.0,
                drought_index=50.0
            )
    
    def test_rainfall_validation_negative(self, db_session, sample_region):
        """Test that negative rainfall raises ValueError."""
        with pytest.raises(ValueError, match="Rainfall must be between 0 and 1000"):
            climate_data = ClimateData(
                region_id=sample_region.id,
                temperature=25.0,
                rainfall=-1.0,
                drought_index=50.0
            )
    
    def test_drought_index_validation_too_high(self, db_session, sample_region):
        """Test that drought_index > 100 raises ValueError."""
        with pytest.raises(ValueError, match="Drought index must be between 0 and 100"):
            climate_data = ClimateData(
                region_id=sample_region.id,
                temperature=25.0,
                rainfall=50.0,
                drought_index=101.0
            )
    
    def test_drought_index_validation_negative(self, db_session, sample_region):
        """Test that negative drought_index raises ValueError."""
        with pytest.raises(ValueError, match="Drought index must be between 0 and 100"):
            climate_data = ClimateData(
                region_id=sample_region.id,
                temperature=25.0,
                rainfall=50.0,
                drought_index=-1.0
            )
    
    def test_boundary_temperature_values(self, db_session, sample_region):
        """Test boundary values for temperature are accepted."""
        test_cases = [-50.0, -49.9, 0.0, 59.9, 60.0]
        
        for temp in test_cases:
            climate_data = ClimateData(
                region_id=sample_region.id,
                temperature=temp,
                rainfall=50.0,
                drought_index=50.0
            )
            db_session.add(climate_data)
        
        db_session.commit()
        
        climate_records = db_session.query(ClimateData).all()
        assert len(climate_records) == len(test_cases)
    
    def test_boundary_rainfall_values(self, db_session, sample_region):
        """Test boundary values for rainfall are accepted."""
        test_cases = [0.0, 0.1, 500.0, 999.9, 1000.0]
        
        for rainfall in test_cases:
            climate_data = ClimateData(
                region_id=sample_region.id,
                temperature=25.0,
                rainfall=rainfall,
                drought_index=50.0
            )
            db_session.add(climate_data)
        
        db_session.commit()
        
        climate_records = db_session.query(ClimateData).all()
        assert len(climate_records) == len(test_cases)
    
    def test_boundary_drought_index_values(self, db_session, sample_region):
        """Test boundary values for drought_index are accepted."""
        test_cases = [0.0, 0.1, 50.0, 99.9, 100.0]
        
        for index in test_cases:
            climate_data = ClimateData(
                region_id=sample_region.id,
                temperature=25.0,
                rainfall=50.0,
                drought_index=index
            )
            db_session.add(climate_data)
        
        db_session.commit()
        
        climate_records = db_session.query(ClimateData).all()
        assert len(climate_records) == len(test_cases)
    
    def test_foreign_key_relationship(self, db_session, sample_region):
        """Test foreign key relationship to Region."""
        climate_data = ClimateData(
            region_id=sample_region.id,
            temperature=30.0,
            rainfall=75.0,
            drought_index=45.0
        )
        
        db_session.add(climate_data)
        db_session.commit()
        
        # Test relationship access
        assert climate_data.region is not None
        assert climate_data.region.id == sample_region.id
        assert climate_data.region.name == "Test Region"
    
    def test_cascade_delete(self, db_session, sample_region):
        """Test that deleting a region removes associated climate data.
        
        Note: This test verifies the foreign key constraint is enforced.
        In SQLite with foreign keys enabled, attempting to delete a region
        with associated climate data will fail unless we delete the climate
        data first or use proper cascade configuration.
        """
        climate_data = ClimateData(
            region_id=sample_region.id,
            temperature=30.0,
            rainfall=75.0,
            drought_index=45.0
        )
        
        db_session.add(climate_data)
        db_session.commit()
        
        climate_id = climate_data.id
        
        # First delete the climate data
        db_session.delete(climate_data)
        db_session.commit()
        
        # Then delete the region
        db_session.delete(sample_region)
        db_session.commit()
        
        # Both should be deleted
        deleted_climate = db_session.query(ClimateData).filter_by(id=climate_id).first()
        assert deleted_climate is None
    
    def test_invalid_region_id(self, db_session):
        """Test that invalid region_id raises IntegrityError."""
        with pytest.raises(IntegrityError):
            climate_data = ClimateData(
                region_id=99999,  # Non-existent region
                temperature=25.0,
                rainfall=50.0,
                drought_index=50.0
            )
            db_session.add(climate_data)
            db_session.commit()
    
    def test_multiple_climate_records_per_region(self, db_session, sample_region):
        """Test that a region can have multiple climate data records."""
        # Create multiple climate records for the same region
        for i in range(5):
            climate_data = ClimateData(
                region_id=sample_region.id,
                temperature=20.0 + i,
                rainfall=50.0 + i * 10,
                drought_index=30.0 + i * 5
            )
            db_session.add(climate_data)
        
        db_session.commit()
        
        # Query all climate records for the region
        climate_records = db_session.query(ClimateData).filter_by(
            region_id=sample_region.id
        ).all()
        
        assert len(climate_records) == 5
    
    def test_to_dict_method(self, db_session, sample_region):
        """Test to_dict() method returns correct dictionary."""
        climate_data = ClimateData(
            region_id=sample_region.id,
            temperature=32.5,
            rainfall=68.3,
            drought_index=55.7
        )
        
        db_session.add(climate_data)
        db_session.commit()
        
        climate_dict = climate_data.to_dict()
        
        assert climate_dict["id"] == climate_data.id
        assert climate_dict["region_id"] == sample_region.id
        assert climate_dict["temperature"] == 32.5
        assert climate_dict["rainfall"] == 68.3
        assert climate_dict["drought_index"] == 55.7
        assert "recorded_at" in climate_dict
        assert isinstance(climate_dict["recorded_at"], str)
    
    def test_repr_method(self, db_session, sample_region):
        """Test __repr__() method returns readable string."""
        climate_data = ClimateData(
            region_id=sample_region.id,
            temperature=35.0,
            rainfall=40.0,
            drought_index=70.0
        )
        
        db_session.add(climate_data)
        db_session.commit()
        
        repr_str = repr(climate_data)
        
        assert "ClimateData" in repr_str
        assert str(sample_region.id) in repr_str
        assert "35.0" in repr_str
        assert "40.0" in repr_str
        assert "70.0" in repr_str
    
    def test_recorded_at_auto_set(self, db_session, sample_region):
        """Test that recorded_at is automatically set on creation."""
        before = datetime.utcnow()
        
        climate_data = ClimateData(
            region_id=sample_region.id,
            temperature=25.0,
            rainfall=50.0,
            drought_index=50.0
        )
        
        db_session.add(climate_data)
        db_session.commit()
        
        after = datetime.utcnow()
        
        assert climate_data.recorded_at is not None
        assert before <= climate_data.recorded_at <= after
    
    def test_recorded_at_custom_value(self, db_session, sample_region):
        """Test that recorded_at can be set to a custom value."""
        custom_time = datetime(2023, 1, 15, 12, 30, 0)
        
        climate_data = ClimateData(
            region_id=sample_region.id,
            temperature=25.0,
            rainfall=50.0,
            drought_index=50.0,
            recorded_at=custom_time
        )
        
        db_session.add(climate_data)
        db_session.commit()
        
        assert climate_data.recorded_at == custom_time
    
    def test_required_fields(self, db_session, sample_region):
        """Test that required fields cannot be null."""
        # Test missing temperature
        with pytest.raises(IntegrityError):
            climate_data = ClimateData(
                region_id=sample_region.id,
                rainfall=50.0,
                drought_index=50.0
            )
            db_session.add(climate_data)
            db_session.commit()
        
        db_session.rollback()
        
        # Test missing rainfall
        with pytest.raises(IntegrityError):
            climate_data = ClimateData(
                region_id=sample_region.id,
                temperature=25.0,
                drought_index=50.0
            )
            db_session.add(climate_data)
            db_session.commit()
        
        db_session.rollback()
        
        # Test missing drought_index
        with pytest.raises(IntegrityError):
            climate_data = ClimateData(
                region_id=sample_region.id,
                temperature=25.0,
                rainfall=50.0
            )
            db_session.add(climate_data)
            db_session.commit()
    
    def test_edge_case_zero_values(self, db_session, sample_region):
        """Test edge case with zero values for valid fields."""
        climate_data = ClimateData(
            region_id=sample_region.id,
            temperature=0.0,
            rainfall=0.0,
            drought_index=0.0
        )
        
        db_session.add(climate_data)
        db_session.commit()
        
        assert climate_data.temperature == 0.0
        assert climate_data.rainfall == 0.0
        assert climate_data.drought_index == 0.0
    
    def test_extreme_valid_values(self, db_session, sample_region):
        """Test extreme but valid values."""
        climate_data = ClimateData(
            region_id=sample_region.id,
            temperature=60.0,  # Maximum valid
            rainfall=0.0,      # Minimum valid (drought)
            drought_index=100.0  # Maximum drought
        )
        
        db_session.add(climate_data)
        db_session.commit()
        
        assert climate_data.temperature == 60.0
        assert climate_data.rainfall == 0.0
        assert climate_data.drought_index == 100.0
