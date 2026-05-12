"""
Unit tests for Climate Service.

Tests climate data retrieval functions with database integration.
"""

import pytest
from datetime import datetime, timedelta

from models.climate_data import ClimateData
from models.region import Region
from services.climate_service import get_current_climate, get_climate_by_region
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
def sample_regions(db_session):
    """Create sample regions for testing."""
    regions = [
        Region(
            name="Sahel Region",
            latitude=14.5,
            longitude=-14.5,
            crop_risk="high",
            nutrition_risk="high"
        ),
        Region(
            name="East Africa Highlands",
            latitude=-1.3,
            longitude=36.8,
            crop_risk="medium",
            nutrition_risk="medium"
        ),
    ]
    
    for region in regions:
        db_session.add(region)
    
    db_session.commit()
    
    return regions


@pytest.fixture
def sample_climate_data(db_session, sample_regions):
    """Create sample climate data for testing."""
    now = datetime.utcnow()
    
    climate_records = [
        ClimateData(
            region_id=sample_regions[0].id,
            temperature=35.5,
            rainfall=45.2,
            drought_index=72.3,
            recorded_at=now - timedelta(hours=2)
        ),
        ClimateData(
            region_id=sample_regions[1].id,
            temperature=28.0,
            rainfall=120.5,
            drought_index=35.0,
            recorded_at=now - timedelta(hours=1)
        ),
        ClimateData(
            region_id=sample_regions[0].id,
            temperature=36.0,
            rainfall=40.0,
            drought_index=75.0,
            recorded_at=now  # Most recent
        ),
    ]
    
    for record in climate_records:
        db_session.add(record)
    
    db_session.commit()
    
    return climate_records


class TestGetCurrentClimate:
    """Test suite for get_current_climate function."""
    
    def test_get_current_climate_returns_latest(self, db_session, sample_climate_data):
        """Test that get_current_climate returns the most recent record."""
        result = get_current_climate(db_session)
        
        assert result is not None
        assert result['temperature'] == 36.0
        assert result['rainfall'] == 40.0
        assert result['drought_index'] == 75.0
        assert result['region_id'] == sample_climate_data[2].region_id
    
    def test_get_current_climate_returns_dict_with_correct_keys(self, db_session, sample_climate_data):
        """Test that result contains all expected keys."""
        result = get_current_climate(db_session)
        
        assert 'temperature' in result
        assert 'rainfall' in result
        assert 'drought_index' in result
        assert 'recorded_at' in result
        assert 'region_id' in result
    
    def test_get_current_climate_recorded_at_is_iso_format(self, db_session, sample_climate_data):
        """Test that recorded_at is returned as ISO format string."""
        result = get_current_climate(db_session)
        
        assert isinstance(result['recorded_at'], str)
        # Verify it's a valid ISO format by parsing it
        datetime.fromisoformat(result['recorded_at'])
    
    def test_get_current_climate_empty_database(self, db_session):
        """Test that get_current_climate returns None when no data exists."""
        result = get_current_climate(db_session)
        
        assert result is None
    
    def test_get_current_climate_values_are_numeric(self, db_session, sample_climate_data):
        """Test that numeric values are returned as floats."""
        result = get_current_climate(db_session)
        
        assert isinstance(result['temperature'], (int, float))
        assert isinstance(result['rainfall'], (int, float))
        assert isinstance(result['drought_index'], (int, float))
        assert isinstance(result['region_id'], int)


class TestGetClimateByRegion:
    """Test suite for get_climate_by_region function."""
    
    def test_get_climate_by_region_returns_latest_for_region(self, db_session, sample_climate_data, sample_regions):
        """Test that get_climate_by_region returns the most recent record for specified region."""
        region_id = sample_regions[0].id
        result = get_climate_by_region(db_session, region_id)
        
        assert result is not None
        assert result['region_id'] == region_id
        assert result['temperature'] == 36.0  # Most recent for region 1
        assert result['rainfall'] == 40.0
        assert result['drought_index'] == 75.0
    
    def test_get_climate_by_region_different_regions(self, db_session, sample_climate_data, sample_regions):
        """Test retrieving climate data for different regions."""
        # Region 1
        result1 = get_climate_by_region(db_session, sample_regions[0].id)
        assert result1['temperature'] == 36.0
        
        # Region 2
        result2 = get_climate_by_region(db_session, sample_regions[1].id)
        assert result2['temperature'] == 28.0
        assert result2['rainfall'] == 120.5
    
    def test_get_climate_by_region_returns_dict_with_correct_keys(self, db_session, sample_climate_data, sample_regions):
        """Test that result contains all expected keys."""
        result = get_climate_by_region(db_session, sample_regions[0].id)
        
        assert 'temperature' in result
        assert 'rainfall' in result
        assert 'drought_index' in result
        assert 'recorded_at' in result
        assert 'region_id' in result
    
    def test_get_climate_by_region_nonexistent_region(self, db_session, sample_climate_data):
        """Test that get_climate_by_region returns None for non-existent region."""
        result = get_climate_by_region(db_session, region_id=9999)
        
        assert result is None
    
    def test_get_climate_by_region_region_with_no_data(self, db_session, sample_regions):
        """Test region that exists but has no climate data."""
        # Create a new region without climate data
        new_region = Region(
            name="New Region",
            latitude=0.0,
            longitude=0.0,
            crop_risk="low",
            nutrition_risk="low"
        )
        db_session.add(new_region)
        db_session.commit()
        
        result = get_climate_by_region(db_session, new_region.id)
        
        assert result is None
    
    def test_get_climate_by_region_recorded_at_is_iso_format(self, db_session, sample_climate_data, sample_regions):
        """Test that recorded_at is returned as ISO format string."""
        result = get_climate_by_region(db_session, sample_regions[0].id)
        
        assert isinstance(result['recorded_at'], str)
        # Verify it's a valid ISO format by parsing it
        datetime.fromisoformat(result['recorded_at'])
    
    def test_get_climate_by_region_values_are_numeric(self, db_session, sample_climate_data, sample_regions):
        """Test that numeric values are returned as correct types."""
        result = get_climate_by_region(db_session, sample_regions[0].id)
        
        assert isinstance(result['temperature'], (int, float))
        assert isinstance(result['rainfall'], (int, float))
        assert isinstance(result['drought_index'], (int, float))
        assert isinstance(result['region_id'], int)
    
    def test_get_climate_by_region_multiple_records_returns_latest(self, db_session, sample_regions):
        """Test that when multiple records exist, the latest is returned."""
        now = datetime.utcnow()
        region_id = sample_regions[0].id
        
        # Add multiple records with different timestamps
        records = [
            ClimateData(
                region_id=region_id,
                temperature=30.0,
                rainfall=100.0,
                drought_index=50.0,
                recorded_at=now - timedelta(days=3)
            ),
            ClimateData(
                region_id=region_id,
                temperature=32.0,
                rainfall=80.0,
                drought_index=60.0,
                recorded_at=now - timedelta(days=2)
            ),
            ClimateData(
                region_id=region_id,
                temperature=35.0,
                rainfall=50.0,
                drought_index=70.0,
                recorded_at=now - timedelta(days=1)
            ),
        ]
        
        for record in records:
            db_session.add(record)
        db_session.commit()
        
        result = get_climate_by_region(db_session, region_id)
        
        # Should return the most recent (35.0 temperature)
        assert result['temperature'] == 35.0
        assert result['rainfall'] == 50.0
        assert result['drought_index'] == 70.0
