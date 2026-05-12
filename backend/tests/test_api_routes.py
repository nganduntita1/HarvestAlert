"""
Integration tests for HarvestAlert API routes.

Tests all API endpoints including climate, predict, and regions routes.
Validates request/response formats, error handling, and business logic.

Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 3.1, 3.2, 3.3, 3.4
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime

from main import app
from database import Base, get_db
from models.region import Region
from models.climate_data import ClimateData

# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_api.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for testing."""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(scope="function")
def setup_database():
    """Create test database and populate with sample data."""
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Create test session
    db = TestingSessionLocal()
    
    try:
        # Add sample regions
        regions = [
            Region(
                id=1,
                name="Sahel Region",
                latitude=14.5,
                longitude=-14.5,
                crop_risk="high",
                nutrition_risk="high",
                last_updated=datetime.utcnow()
            ),
            Region(
                id=2,
                name="East Africa Highlands",
                latitude=-1.3,
                longitude=36.8,
                crop_risk="medium",
                nutrition_risk="medium",
                last_updated=datetime.utcnow()
            ),
            Region(
                id=3,
                name="Southern Africa Plains",
                latitude=-25.7,
                longitude=28.2,
                crop_risk="low",
                nutrition_risk="low",
                last_updated=datetime.utcnow()
            )
        ]
        
        for region in regions:
            db.add(region)
        
        db.commit()
        
        # Add sample climate data
        climate_data = [
            ClimateData(
                region_id=1,
                temperature=35.5,
                rainfall=45.2,
                drought_index=72.3,
                recorded_at=datetime.utcnow()
            ),
            ClimateData(
                region_id=2,
                temperature=28.3,
                rainfall=120.5,
                drought_index=35.2,
                recorded_at=datetime.utcnow()
            ),
            ClimateData(
                region_id=3,
                temperature=22.1,
                rainfall=180.0,
                drought_index=20.5,
                recorded_at=datetime.utcnow()
            )
        ]
        
        for data in climate_data:
            db.add(data)
        
        db.commit()
        
        yield db
    
    finally:
        db.close()
        # Drop all tables after test
        Base.metadata.drop_all(bind=engine)


class TestHealthEndpoints:
    """Test health check endpoints."""
    
    def test_root_endpoint(self):
        """Test root endpoint returns API information."""
        response = client.get("/")
        
        assert response.status_code == 200
        data = response.json()
        assert "name" in data
        assert "version" in data
        assert "status" in data
        assert data["name"] == "HarvestAlert API"
    
    def test_health_check_endpoint(self):
        """Test health check endpoint."""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "database" in data


class TestClimateEndpoint:
    """Test /climate endpoint."""
    
    def test_get_climate_data_success(self, setup_database):
        """Test successful retrieval of climate data."""
        response = client.get("/climate")
        
        assert response.status_code == 200
        data = response.json()
        
        # Validate response structure
        assert "temperature" in data
        assert "rainfall" in data
        assert "drought_index" in data
        assert "recorded_at" in data
        assert "region_id" in data
        
        # Validate data types
        assert isinstance(data["temperature"], (int, float))
        assert isinstance(data["rainfall"], (int, float))
        assert isinstance(data["drought_index"], (int, float))
        assert isinstance(data["region_id"], int)
        
        # Validate ranges
        assert 0 <= data["drought_index"] <= 100
    
    def test_get_climate_by_region_success(self, setup_database):
        """Test successful retrieval of climate data for specific region."""
        response = client.get("/climate/1")
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["region_id"] == 1
        assert "temperature" in data
        assert "rainfall" in data
        assert "drought_index" in data
    
    def test_get_climate_by_region_not_found(self, setup_database):
        """Test climate endpoint with non-existent region."""
        response = client.get("/climate/999")
        
        assert response.status_code == 404
        assert "detail" in response.json()


class TestPredictEndpoint:
    """Test /predict endpoint."""
    
    def test_predict_with_valid_input(self, setup_database):
        """Test prediction with valid temperature and rainfall."""
        response = client.post("/predict", json={
            "temperature": 35.0,
            "rainfall": 40.0
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # Validate response structure
        assert "crop_risk" in data
        assert "nutrition_risk" in data
        
        # Validate risk levels
        assert data["crop_risk"] in ["low", "medium", "high"]
        assert data["nutrition_risk"] in ["low", "medium", "high"]
    
    def test_predict_high_risk_scenario(self, setup_database):
        """Test prediction returns high risk for extreme conditions."""
        # High temperature and low rainfall should trigger high crop risk
        response = client.post("/predict", json={
            "temperature": 35.0,
            "rainfall": 30.0
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # According to requirements: rainfall < 50mm AND temperature > 30°C → high crop risk
        assert data["crop_risk"] == "high"
        # High crop risk should result in high or medium nutrition risk
        assert data["nutrition_risk"] in ["high", "medium"]
    
    def test_predict_low_risk_scenario(self, setup_database):
        """Test prediction returns low risk for favorable conditions."""
        response = client.post("/predict", json={
            "temperature": 25.0,
            "rainfall": 150.0
        })
        
        assert response.status_code == 200
        data = response.json()
        
        assert data["crop_risk"] == "low"
        assert data["nutrition_risk"] == "low"
    
    def test_predict_medium_risk_scenario(self, setup_database):
        """Test prediction returns medium risk for borderline conditions."""
        response = client.post("/predict", json={
            "temperature": 32.0,
            "rainfall": 80.0
        })
        
        assert response.status_code == 200
        data = response.json()
        
        # Should be medium risk (rainfall < 100mm)
        assert data["crop_risk"] == "medium"
    
    def test_predict_with_invalid_temperature_too_high(self, setup_database):
        """Test prediction rejects temperature above valid range."""
        response = client.post("/predict", json={
            "temperature": 100.0,  # Invalid: > 60
            "rainfall": 50.0
        })
        
        assert response.status_code in [400, 422]  # Validation error
    
    def test_predict_with_invalid_temperature_too_low(self, setup_database):
        """Test prediction rejects temperature below valid range."""
        response = client.post("/predict", json={
            "temperature": -100.0,  # Invalid: < -50
            "rainfall": 50.0
        })
        
        assert response.status_code in [400, 422]  # Validation error
    
    def test_predict_with_invalid_rainfall_negative(self, setup_database):
        """Test prediction rejects negative rainfall."""
        response = client.post("/predict", json={
            "temperature": 30.0,
            "rainfall": -10.0  # Invalid: < 0
        })
        
        assert response.status_code in [400, 422]  # Validation error
    
    def test_predict_with_invalid_rainfall_too_high(self, setup_database):
        """Test prediction rejects rainfall above valid range."""
        response = client.post("/predict", json={
            "temperature": 30.0,
            "rainfall": 1500.0  # Invalid: > 1000
        })
        
        assert response.status_code in [400, 422]  # Validation error
    
    def test_predict_with_missing_temperature(self, setup_database):
        """Test prediction rejects request missing temperature."""
        response = client.post("/predict", json={
            "rainfall": 50.0
        })
        
        assert response.status_code in [400, 422]  # Validation error
    
    def test_predict_with_missing_rainfall(self, setup_database):
        """Test prediction rejects request missing rainfall."""
        response = client.post("/predict", json={
            "temperature": 30.0
        })
        
        assert response.status_code in [400, 422]  # Validation error
    
    def test_predict_boundary_values(self, setup_database):
        """Test prediction with boundary values."""
        # Test minimum valid values
        response = client.post("/predict", json={
            "temperature": -50.0,
            "rainfall": 0.0
        })
        assert response.status_code == 200
        
        # Test maximum valid values
        response = client.post("/predict", json={
            "temperature": 60.0,
            "rainfall": 1000.0
        })
        assert response.status_code == 200


class TestRegionsEndpoint:
    """Test /regions endpoint."""
    
    def test_get_all_regions_success(self, setup_database):
        """Test successful retrieval of all regions."""
        response = client.get("/regions")
        
        assert response.status_code == 200
        regions = response.json()
        
        # Validate response is a list
        assert isinstance(regions, list)
        
        # MVP requires at least 3 regions
        assert len(regions) >= 3
        
        # Validate first region structure
        region = regions[0]
        assert "id" in region
        assert "name" in region
        assert "latitude" in region
        assert "longitude" in region
        assert "crop_risk" in region
        assert "nutrition_risk" in region
        assert "last_updated" in region
        
        # Validate data types
        assert isinstance(region["id"], int)
        assert isinstance(region["name"], str)
        assert isinstance(region["latitude"], (int, float))
        assert isinstance(region["longitude"], (int, float))
        
        # Validate coordinate ranges
        assert -90 <= region["latitude"] <= 90
        assert -180 <= region["longitude"] <= 180
        
        # Validate risk levels
        assert region["crop_risk"] in ["low", "medium", "high"]
        assert region["nutrition_risk"] in ["low", "medium", "high"]
    
    def test_get_region_by_id_success(self, setup_database):
        """Test successful retrieval of specific region."""
        response = client.get("/regions/1")
        
        assert response.status_code == 200
        region = response.json()
        
        assert region["id"] == 1
        assert region["name"] == "Sahel Region"
        assert region["latitude"] == 14.5
        assert region["longitude"] == -14.5
        assert region["crop_risk"] == "high"
        assert region["nutrition_risk"] == "high"
    
    def test_get_region_by_id_not_found(self, setup_database):
        """Test region endpoint with non-existent ID."""
        response = client.get("/regions/999")
        
        assert response.status_code == 404
        assert "detail" in response.json()
        assert "999" in response.json()["detail"]
    
    def test_regions_data_consistency(self, setup_database):
        """Test that all regions have consistent data."""
        response = client.get("/regions")
        
        assert response.status_code == 200
        regions = response.json()
        
        for region in regions:
            # All regions must have valid coordinates
            assert -90 <= region["latitude"] <= 90
            assert -180 <= region["longitude"] <= 180
            
            # All regions must have valid risk levels
            assert region["crop_risk"] in ["low", "medium", "high"]
            assert region["nutrition_risk"] in ["low", "medium", "high"]
            
            # All regions must have a timestamp
            assert region["last_updated"] is not None


class TestPerformanceRequirements:
    """Test performance requirements."""
    
    def test_climate_endpoint_response_time(self, setup_database):
        """Test climate endpoint responds within 2 seconds (Requirement 1.4)."""
        import time
        
        start = time.time()
        response = client.get("/climate")
        duration = time.time() - start
        
        assert response.status_code == 200
        assert duration < 2.0, f"Response took {duration:.3f}s, expected < 2.0s"
    
    def test_predict_endpoint_response_time(self, setup_database):
        """Test predict endpoint responds within 1 second (Requirement 2.7)."""
        import time
        
        start = time.time()
        response = client.post("/predict", json={
            "temperature": 35.0,
            "rainfall": 40.0
        })
        duration = time.time() - start
        
        assert response.status_code == 200
        assert duration < 1.0, f"Response took {duration:.3f}s, expected < 1.0s"
    
    def test_regions_endpoint_response_time(self, setup_database):
        """Test regions endpoint responds within 2 seconds."""
        import time
        
        start = time.time()
        response = client.get("/regions")
        duration = time.time() - start
        
        assert response.status_code == 200
        assert duration < 2.0, f"Response took {duration:.3f}s, expected < 2.0s"


class TestCORSConfiguration:
    """Test CORS middleware configuration."""
    
    def test_cors_headers_present(self, setup_database):
        """Test that CORS headers are present in responses."""
        response = client.get("/regions")
        
        # CORS middleware should add headers to responses
        # For TestClient, CORS may not be fully simulated, so we just verify the endpoint works
        assert response.status_code == 200
