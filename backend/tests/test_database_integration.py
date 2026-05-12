"""
Integration tests for database configuration with application context.

Tests that the database configuration works correctly when used
in a FastAPI application context.
"""

import pytest
from sqlalchemy import Column, Integer, String, Float
from database import Base, engine, SessionLocal, init_db, get_db


class SampleRegion(Base):
    """Sample region model for integration testing."""
    __tablename__ = "sample_regions"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)


class TestDatabaseApplicationIntegration:
    """Test database integration with application-like scenarios."""
    
    @pytest.fixture(autouse=True)
    def setup_teardown(self):
        """Setup and teardown for integration tests."""
        # Setup: Create tables
        Base.metadata.create_all(bind=engine)
        
        yield
        
        # Teardown: Drop test tables
        Base.metadata.drop_all(bind=engine)
    
    def test_dependency_injection_pattern(self):
        """Test database dependency injection pattern used in FastAPI."""
        # Simulate FastAPI dependency injection
        db_generator = get_db()
        db = next(db_generator)
        
        try:
            # Create a sample region
            region = SampleRegion(
                id=1,
                name="Test Region",
                latitude=14.5,
                longitude=-14.5
            )
            db.add(region)
            db.commit()
            
            # Query the region
            retrieved = db.query(SampleRegion).filter(SampleRegion.id == 1).first()
            assert retrieved is not None
            assert retrieved.name == "Test Region"
            assert retrieved.latitude == 14.5
            assert retrieved.longitude == -14.5
            
        finally:
            # Cleanup (simulates FastAPI's automatic cleanup)
            try:
                next(db_generator)
            except StopIteration:
                pass
    
    def test_multiple_requests_simulation(self):
        """Test multiple simulated requests using the database."""
        # Simulate first request
        db1_gen = get_db()
        db1 = next(db1_gen)
        
        try:
            region1 = SampleRegion(id=1, name="Region 1", latitude=10.0, longitude=20.0)
            db1.add(region1)
            db1.commit()
        finally:
            try:
                next(db1_gen)
            except StopIteration:
                pass
        
        # Simulate second request
        db2_gen = get_db()
        db2 = next(db2_gen)
        
        try:
            region2 = SampleRegion(id=2, name="Region 2", latitude=30.0, longitude=40.0)
            db2.add(region2)
            db2.commit()
            
            # Verify both regions exist
            count = db2.query(SampleRegion).count()
            assert count == 2
        finally:
            try:
                next(db2_gen)
            except StopIteration:
                pass
    
    def test_transaction_isolation(self):
        """Test transaction behavior between sessions."""
        # Start first session
        db1_gen = get_db()
        db1 = next(db1_gen)
        
        # Start second session
        db2_gen = get_db()
        db2 = next(db2_gen)
        
        try:
            # Add region in first session and commit
            region = SampleRegion(id=1, name="Committed", latitude=0.0, longitude=0.0)
            db1.add(region)
            db1.commit()
            
            # Second session should see the committed data
            count = db2.query(SampleRegion).count()
            assert count == 1
            
            # Verify data is correct
            retrieved = db2.query(SampleRegion).first()
            assert retrieved.name == "Committed"
            
        finally:
            try:
                next(db1_gen)
            except StopIteration:
                pass
            try:
                next(db2_gen)
            except StopIteration:
                pass
    
    def test_error_handling_with_rollback(self):
        """Test error handling and rollback in application context."""
        db_gen = get_db()
        db = next(db_gen)
        
        try:
            # Add a valid region
            region1 = SampleRegion(id=1, name="Valid", latitude=10.0, longitude=20.0)
            db.add(region1)
            db.commit()
            
            # Try to add duplicate (should fail)
            region2 = SampleRegion(id=1, name="Duplicate", latitude=30.0, longitude=40.0)
            db.add(region2)
            
            with pytest.raises(Exception):  # Will raise IntegrityError
                db.commit()
            
            # Rollback
            db.rollback()
            
            # Verify only the first region exists
            count = db.query(SampleRegion).count()
            assert count == 1
            
            retrieved = db.query(SampleRegion).first()
            assert retrieved.name == "Valid"
            
        finally:
            try:
                next(db_gen)
            except StopIteration:
                pass
    
    def test_init_db_creates_all_tables(self):
        """Test init_db function creates all registered tables."""
        # Drop all tables first
        Base.metadata.drop_all(bind=engine)
        
        # Call init_db
        init_db()
        
        # Verify tables were created
        assert "sample_regions" in Base.metadata.tables
        
        # Verify we can use the tables
        db = SessionLocal()
        try:
            region = SampleRegion(id=1, name="Test", latitude=0.0, longitude=0.0)
            db.add(region)
            db.commit()
            
            count = db.query(SampleRegion).count()
            assert count == 1
        finally:
            db.close()


class TestDatabaseConfiguration:
    """Test database configuration for different scenarios."""
    
    def test_sqlite_configuration(self):
        """Test SQLite database configuration."""
        from database import is_sqlite, DATABASE_URL
        
        # Verify we're using SQLite (default for tests)
        assert is_sqlite
        assert "sqlite" in DATABASE_URL.lower()
    
    def test_connection_pool_configuration(self):
        """Test connection pool is properly configured."""
        from database import engine
        
        # Verify engine is created
        assert engine is not None
        
        # Verify we can get connections
        conn = engine.connect()
        assert conn is not None
        conn.close()
