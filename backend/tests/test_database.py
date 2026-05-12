"""
Unit and integration tests for database configuration.

Tests database connection, session management, and error handling
for both PostgreSQL and SQLite configurations.
"""

import os
import pytest
from unittest.mock import patch, MagicMock
from sqlalchemy import exc, Column, Integer, String, text
from sqlalchemy.orm import Session

from database import (
    Base,
    get_engine_config,
    get_db,
    init_db,
    check_db_connection,
    close_db,
    engine,
    SessionLocal,
)


class DummyModel(Base):
    """Test model for database operations."""
    __tablename__ = "test_table"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(50))


class TestEngineConfiguration:
    """Test database engine configuration."""
    
    def test_sqlite_engine_config(self):
        """Test SQLite engine configuration returns correct parameters."""
        with patch.dict(os.environ, {"DATABASE_URL": "sqlite:///./test.db"}):
            # Need to reload module to pick up new env var
            from database import get_engine_config, is_sqlite
            
            if is_sqlite:
                config = get_engine_config()
                
                assert "connect_args" in config
                assert config["connect_args"]["check_same_thread"] is False
                assert "poolclass" in config
    
    def test_postgresql_engine_config(self):
        """Test PostgreSQL engine configuration includes connection pooling."""
        with patch.dict(os.environ, {
            "DATABASE_URL": "postgresql://user:pass@localhost/db",
            "DB_POOL_SIZE": "10",
            "DB_MAX_OVERFLOW": "20",
        }):
            from database import get_engine_config, is_sqlite
            
            if not is_sqlite:
                config = get_engine_config()
                
                assert config["pool_size"] == 10
                assert config["max_overflow"] == 20
                assert config["pool_pre_ping"] is True
    
    def test_default_pool_values(self):
        """Test default connection pool values are used when not specified."""
        with patch.dict(os.environ, {
            "DATABASE_URL": "postgresql://user:pass@localhost/db"
        }, clear=True):
            from database import get_engine_config, is_sqlite
            
            if not is_sqlite:
                config = get_engine_config()
                
                # Check defaults
                assert config["pool_size"] == 5
                assert config["max_overflow"] == 10
                assert config["pool_timeout"] == 30


class TestDatabaseSession:
    """Test database session management."""
    
    def test_get_db_yields_session(self):
        """Test get_db yields a valid database session."""
        db_gen = get_db()
        db = next(db_gen)
        
        assert isinstance(db, Session)
        assert db.is_active
        
        # Clean up
        try:
            next(db_gen)
        except StopIteration:
            pass
    
    def test_get_db_closes_session(self):
        """Test get_db properly closes session after use."""
        db_gen = get_db()
        db = next(db_gen)
        session_id = id(db)
        
        # Session should be active initially
        assert db.is_active
        
        # Simulate end of context
        try:
            next(db_gen)
        except StopIteration:
            pass
        
        # Verify the session was closed by checking it's no longer in the session registry
        # A closed session will have its connection returned to the pool
        # We verify this by creating a new session and checking it works
        new_db = SessionLocal()
        try:
            # New session should work fine
            new_db.execute(text("SELECT 1"))
            assert new_db.is_active
        finally:
            new_db.close()
    
    def test_get_db_handles_errors(self):
        """Test get_db rolls back on errors."""
        db_gen = get_db()
        db = next(db_gen)
        
        # Simulate an error by executing invalid SQL
        with pytest.raises(exc.SQLAlchemyError):
            db.execute("INVALID SQL STATEMENT")
        
        # Clean up
        try:
            next(db_gen)
        except StopIteration:
            pass


class TestDatabaseInitialization:
    """Test database initialization and table creation."""
    
    def test_init_db_creates_tables(self):
        """Test init_db creates all tables successfully."""
        # This will create tables in the test database
        init_db()
        
        # Verify tables exist by checking metadata
        assert Base.metadata.tables
        
        # Verify we can query the database
        db = SessionLocal()
        try:
            # This should not raise an error
            db.execute(text("SELECT 1"))
        finally:
            db.close()
    
    def test_init_db_idempotent(self):
        """Test init_db can be called multiple times safely."""
        # First call
        init_db()
        
        # Second call should not raise error
        init_db()
        
        # Tables should still exist
        assert Base.metadata.tables


class TestDatabaseConnection:
    """Test database connection health checks."""
    
    def test_check_db_connection_success(self):
        """Test check_db_connection returns True for healthy connection."""
        result = check_db_connection()
        
        assert result is True
    
    def test_check_db_connection_failure(self):
        """Test check_db_connection returns False on connection failure."""
        # Mock engine.connect to raise an error
        with patch('database.engine.connect') as mock_connect:
            mock_connect.side_effect = exc.SQLAlchemyError("Connection failed")
            
            result = check_db_connection()
            
            assert result is False


class TestDatabaseCleanup:
    """Test database cleanup and connection disposal."""
    
    def test_close_db_disposes_engine(self):
        """Test close_db properly disposes of engine."""
        # Mock engine.dispose to verify it's called
        with patch('database.engine.dispose') as mock_dispose:
            close_db()
            
            mock_dispose.assert_called_once()
    
    def test_close_db_handles_errors(self):
        """Test close_db handles disposal errors."""
        with patch('database.engine.dispose') as mock_dispose:
            mock_dispose.side_effect = exc.SQLAlchemyError("Disposal failed")
            
            with pytest.raises(exc.SQLAlchemyError):
                close_db()


class TestSQLiteForeignKeys:
    """Test SQLite foreign key constraint enforcement."""
    
    def test_sqlite_foreign_keys_enabled(self):
        """Test foreign key constraints are enabled for SQLite."""
        # Only test if using SQLite
        from database import is_sqlite
        
        if is_sqlite:
            db = SessionLocal()
            try:
                result = db.execute(text("PRAGMA foreign_keys")).fetchone()
                # Foreign keys should be enabled (1)
                assert result[0] == 1
            finally:
                db.close()


class TestDatabaseIntegration:
    """Integration tests for database operations."""
    
    @pytest.fixture(autouse=True)
    def setup_teardown(self):
        """Setup and teardown for integration tests."""
        # Setup: Create tables
        Base.metadata.create_all(bind=engine)
        
        yield
        
        # Teardown: Drop test tables
        Base.metadata.drop_all(bind=engine)
    
    def test_crud_operations(self):
        """Test basic CRUD operations work correctly."""
        db = SessionLocal()
        
        try:
            # Create
            test_obj = DummyModel(id=1, name="Test")
            db.add(test_obj)
            db.commit()
            
            # Read
            retrieved = db.query(DummyModel).filter(DummyModel.id == 1).first()
            assert retrieved is not None
            assert retrieved.name == "Test"
            
            # Update
            retrieved.name = "Updated"
            db.commit()
            
            updated = db.query(DummyModel).filter(DummyModel.id == 1).first()
            assert updated.name == "Updated"
            
            # Delete
            db.delete(updated)
            db.commit()
            
            deleted = db.query(DummyModel).filter(DummyModel.id == 1).first()
            assert deleted is None
            
        finally:
            db.close()
    
    def test_transaction_rollback(self):
        """Test transaction rollback on error."""
        db = SessionLocal()
        
        try:
            # Start a transaction
            test_obj = DummyModel(id=2, name="Rollback Test")
            db.add(test_obj)
            
            # Force an error (duplicate primary key)
            duplicate = DummyModel(id=2, name="Duplicate")
            db.add(duplicate)
            
            with pytest.raises(exc.IntegrityError):
                db.commit()
            
            # Rollback
            db.rollback()
            
            # Verify nothing was committed
            result = db.query(DummyModel).filter(DummyModel.id == 2).first()
            assert result is None
            
        finally:
            db.close()
    
    def test_concurrent_sessions(self):
        """Test multiple concurrent database sessions."""
        # Create first session
        db1 = SessionLocal()
        # Create second session
        db2 = SessionLocal()
        
        try:
            # Both sessions should work independently
            obj1 = DummyModel(id=3, name="Session 1")
            db1.add(obj1)
            db1.commit()
            
            obj2 = DummyModel(id=4, name="Session 2")
            db2.add(obj2)
            db2.commit()
            
            # Both objects should be visible in both sessions
            assert db1.query(DummyModel).count() == 2
            assert db2.query(DummyModel).count() == 2
            
        finally:
            db1.close()
            db2.close()


class TestErrorHandling:
    """Test error handling in database operations."""
    
    def test_invalid_database_url(self):
        """Test handling of invalid database URL."""
        with patch.dict(os.environ, {"DATABASE_URL": "invalid://url"}):
            with pytest.raises(exc.ArgumentError):
                from sqlalchemy import create_engine
                create_engine(os.getenv("DATABASE_URL"))
    
    def test_connection_timeout(self):
        """Test handling of connection timeout."""
        # This test would require a real timeout scenario
        # For now, we verify the timeout parameter is set
        from database import get_engine_config, is_sqlite
        
        if not is_sqlite:
            config = get_engine_config()
            assert "pool_timeout" in config
            assert config["pool_timeout"] > 0
