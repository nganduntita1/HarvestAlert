"""
Unit tests for Region Service.

Tests region data management and risk update functions with database integration.
"""

import pytest
from datetime import datetime

from models.region import Region
from services.region_service import (
    get_all_regions,
    get_region_by_id,
    update_region_risk
)
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
        Region(
            name="Southern Africa Plains",
            latitude=-25.7,
            longitude=28.2,
            crop_risk="low",
            nutrition_risk="low"
        ),
    ]
    
    for region in regions:
        db_session.add(region)
    
    db_session.commit()
    
    return regions


class TestGetAllRegions:
    """Test suite for get_all_regions function."""
    
    def test_get_all_regions_returns_all_records(self, db_session, sample_regions):
        """Test that get_all_regions returns all region records."""
        result = get_all_regions(db_session)
        
        assert len(result) == 3
    
    def test_get_all_regions_returns_list_of_dicts(self, db_session, sample_regions):
        """Test that result is a list of dictionaries."""
        result = get_all_regions(db_session)
        
        assert isinstance(result, list)
        assert all(isinstance(item, dict) for item in result)
    
    def test_get_all_regions_dict_contains_correct_keys(self, db_session, sample_regions):
        """Test that each region dict contains all expected keys."""
        result = get_all_regions(db_session)
        
        expected_keys = {'id', 'name', 'latitude', 'longitude', 'crop_risk', 'nutrition_risk', 'last_updated'}
        
        for region_dict in result:
            assert set(region_dict.keys()) == expected_keys
    
    def test_get_all_regions_contains_correct_data(self, db_session, sample_regions):
        """Test that returned data matches inserted data."""
        result = get_all_regions(db_session)
        
        # Find Sahel Region in results
        sahel = next(r for r in result if r['name'] == 'Sahel Region')
        
        assert sahel['latitude'] == 14.5
        assert sahel['longitude'] == -14.5
        assert sahel['crop_risk'] == 'high'
        assert sahel['nutrition_risk'] == 'high'
    
    def test_get_all_regions_empty_database(self, db_session):
        """Test that get_all_regions returns empty list when no regions exist."""
        result = get_all_regions(db_session)
        
        assert result == []
        assert isinstance(result, list)
    
    def test_get_all_regions_last_updated_is_string(self, db_session, sample_regions):
        """Test that last_updated is returned as ISO format string."""
        result = get_all_regions(db_session)
        
        for region_dict in result:
            assert isinstance(region_dict['last_updated'], str)
            # Verify it's a valid ISO format by parsing it
            datetime.fromisoformat(region_dict['last_updated'])
    
    def test_get_all_regions_coordinates_are_numeric(self, db_session, sample_regions):
        """Test that coordinates are returned as numeric values."""
        result = get_all_regions(db_session)
        
        for region_dict in result:
            assert isinstance(region_dict['latitude'], (int, float))
            assert isinstance(region_dict['longitude'], (int, float))
            assert -90 <= region_dict['latitude'] <= 90
            assert -180 <= region_dict['longitude'] <= 180


class TestGetRegionById:
    """Test suite for get_region_by_id function."""
    
    def test_get_region_by_id_returns_correct_region(self, db_session, sample_regions):
        """Test that get_region_by_id returns the correct region."""
        region_id = sample_regions[0].id
        result = get_region_by_id(db_session, region_id)
        
        assert result is not None
        assert result['id'] == region_id
        assert result['name'] == 'Sahel Region'
        assert result['latitude'] == 14.5
        assert result['longitude'] == -14.5
    
    def test_get_region_by_id_returns_dict(self, db_session, sample_regions):
        """Test that result is a dictionary."""
        result = get_region_by_id(db_session, sample_regions[0].id)
        
        assert isinstance(result, dict)
    
    def test_get_region_by_id_dict_contains_correct_keys(self, db_session, sample_regions):
        """Test that region dict contains all expected keys."""
        result = get_region_by_id(db_session, sample_regions[0].id)
        
        expected_keys = {'id', 'name', 'latitude', 'longitude', 'crop_risk', 'nutrition_risk', 'last_updated'}
        
        assert set(result.keys()) == expected_keys
    
    def test_get_region_by_id_nonexistent_region(self, db_session):
        """Test that get_region_by_id returns None for non-existent region."""
        result = get_region_by_id(db_session, region_id=9999)
        
        assert result is None
    
    def test_get_region_by_id_different_regions(self, db_session, sample_regions):
        """Test retrieving different regions by ID."""
        # Get first region
        result1 = get_region_by_id(db_session, sample_regions[0].id)
        assert result1['name'] == 'Sahel Region'
        
        # Get second region
        result2 = get_region_by_id(db_session, sample_regions[1].id)
        assert result2['name'] == 'East Africa Highlands'
        
        # Get third region
        result3 = get_region_by_id(db_session, sample_regions[2].id)
        assert result3['name'] == 'Southern Africa Plains'
    
    def test_get_region_by_id_last_updated_is_string(self, db_session, sample_regions):
        """Test that last_updated is returned as ISO format string."""
        result = get_region_by_id(db_session, sample_regions[0].id)
        
        assert isinstance(result['last_updated'], str)
        # Verify it's a valid ISO format by parsing it
        datetime.fromisoformat(result['last_updated'])


class TestUpdateRegionRisk:
    """Test suite for update_region_risk function."""
    
    def test_update_region_risk_updates_both_risks(self, db_session, sample_regions):
        """Test that update_region_risk updates both crop and nutrition risk."""
        region_id = sample_regions[0].id
        
        result = update_region_risk(
            db_session,
            region_id=region_id,
            crop_risk="low",
            nutrition_risk="medium"
        )
        
        assert result is not None
        assert result['crop_risk'] == 'low'
        assert result['nutrition_risk'] == 'medium'
    
    def test_update_region_risk_persists_to_database(self, db_session, sample_regions):
        """Test that updates are persisted to the database."""
        region_id = sample_regions[0].id
        
        # Update the region
        update_region_risk(
            db_session,
            region_id=region_id,
            crop_risk="medium",
            nutrition_risk="low"
        )
        
        # Retrieve the region again to verify persistence
        updated_region = get_region_by_id(db_session, region_id)
        
        assert updated_region['crop_risk'] == 'medium'
        assert updated_region['nutrition_risk'] == 'low'
    
    def test_update_region_risk_updates_last_updated(self, db_session, sample_regions):
        """Test that update_region_risk updates the last_updated timestamp."""
        region_id = sample_regions[0].id
        
        # Get original timestamp
        original = get_region_by_id(db_session, region_id)
        original_timestamp = datetime.fromisoformat(original['last_updated'])
        
        # Small delay to ensure timestamp difference
        import time
        time.sleep(0.01)
        
        # Update the region
        result = update_region_risk(
            db_session,
            region_id=region_id,
            crop_risk="high",
            nutrition_risk="high"
        )
        
        updated_timestamp = datetime.fromisoformat(result['last_updated'])
        
        # Timestamp should be newer
        assert updated_timestamp >= original_timestamp
    
    def test_update_region_risk_nonexistent_region(self, db_session):
        """Test that update_region_risk returns None for non-existent region."""
        result = update_region_risk(
            db_session,
            region_id=9999,
            crop_risk="high",
            nutrition_risk="high"
        )
        
        assert result is None
    
    def test_update_region_risk_invalid_crop_risk(self, db_session, sample_regions):
        """Test that invalid crop_risk raises ValueError."""
        with pytest.raises(ValueError, match="crop_risk must be one of"):
            update_region_risk(
                db_session,
                region_id=sample_regions[0].id,
                crop_risk="invalid",
                nutrition_risk="low"
            )
    
    def test_update_region_risk_invalid_nutrition_risk(self, db_session, sample_regions):
        """Test that invalid nutrition_risk raises ValueError."""
        with pytest.raises(ValueError, match="nutrition_risk must be one of"):
            update_region_risk(
                db_session,
                region_id=sample_regions[0].id,
                crop_risk="low",
                nutrition_risk="invalid"
            )
    
    def test_update_region_risk_all_valid_combinations(self, db_session, sample_regions):
        """Test updating with all valid risk level combinations."""
        region_id = sample_regions[0].id
        valid_levels = ["low", "medium", "high"]
        
        for crop_level in valid_levels:
            for nutrition_level in valid_levels:
                result = update_region_risk(
                    db_session,
                    region_id=region_id,
                    crop_risk=crop_level,
                    nutrition_risk=nutrition_level
                )
                
                assert result['crop_risk'] == crop_level
                assert result['nutrition_risk'] == nutrition_level
    
    def test_update_region_risk_returns_complete_dict(self, db_session, sample_regions):
        """Test that update returns complete region dictionary."""
        result = update_region_risk(
            db_session,
            region_id=sample_regions[0].id,
            crop_risk="high",
            nutrition_risk="medium"
        )
        
        expected_keys = {'id', 'name', 'latitude', 'longitude', 'crop_risk', 'nutrition_risk', 'last_updated'}
        
        assert set(result.keys()) == expected_keys
    
    def test_update_region_risk_does_not_affect_other_fields(self, db_session, sample_regions):
        """Test that update only changes risk fields, not other attributes."""
        region_id = sample_regions[0].id
        original = get_region_by_id(db_session, region_id)
        
        # Update risks
        result = update_region_risk(
            db_session,
            region_id=region_id,
            crop_risk="low",
            nutrition_risk="low"
        )
        
        # Other fields should remain unchanged
        assert result['name'] == original['name']
        assert result['latitude'] == original['latitude']
        assert result['longitude'] == original['longitude']
    
    def test_update_region_risk_multiple_regions_independently(self, db_session, sample_regions):
        """Test that updating one region doesn't affect others."""
        # Update first region
        update_region_risk(
            db_session,
            region_id=sample_regions[0].id,
            crop_risk="low",
            nutrition_risk="low"
        )
        
        # Update second region
        update_region_risk(
            db_session,
            region_id=sample_regions[1].id,
            crop_risk="high",
            nutrition_risk="high"
        )
        
        # Verify both have correct values
        region1 = get_region_by_id(db_session, sample_regions[0].id)
        region2 = get_region_by_id(db_session, sample_regions[1].id)
        region3 = get_region_by_id(db_session, sample_regions[2].id)
        
        assert region1['crop_risk'] == 'low'
        assert region2['crop_risk'] == 'high'
        assert region3['crop_risk'] == 'low'  # Unchanged
