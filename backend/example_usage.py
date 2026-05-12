"""
Example usage of the database configuration.

This script demonstrates how to use the database module in the HarvestAlert application.
"""

from database import Base, engine, SessionLocal, init_db, get_db, check_db_connection
from sqlalchemy import Column, Integer, String, Float


# Example model definition
class Region(Base):
    """Example Region model."""
    __tablename__ = "regions"
    
    id = Column(Integer, primary_key=True)
    name = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    crop_risk = Column(String(10), nullable=False)
    nutrition_risk = Column(String(10), nullable=False)


def example_basic_usage():
    """Example: Basic database usage."""
    print("=== Basic Database Usage ===")
    
    # Initialize database (create tables)
    init_db()
    print("✓ Database initialized")
    
    # Check connection
    if check_db_connection():
        print("✓ Database connection is healthy")
    
    # Create a session
    db = SessionLocal()
    
    try:
        # Create a new region
        region = Region(
            id=1,
            name="Sahel Region",
            latitude=14.5,
            longitude=-14.5,
            crop_risk="high",
            nutrition_risk="high"
        )
        db.add(region)
        db.commit()
        print(f"✓ Created region: {region.name}")
        
        # Query the region
        retrieved = db.query(Region).filter(Region.id == 1).first()
        print(f"✓ Retrieved region: {retrieved.name} at ({retrieved.latitude}, {retrieved.longitude})")
        
        # Update the region
        retrieved.crop_risk = "medium"
        db.commit()
        print(f"✓ Updated crop risk to: {retrieved.crop_risk}")
        
        # Query all regions
        all_regions = db.query(Region).all()
        print(f"✓ Total regions in database: {len(all_regions)}")
        
    finally:
        db.close()
        print("✓ Database session closed")


def example_dependency_injection():
    """Example: Using dependency injection pattern (FastAPI style)."""
    print("\n=== Dependency Injection Pattern ===")
    
    # This is how you would use it in FastAPI
    db_generator = get_db()
    db = next(db_generator)
    
    try:
        # Use the database session
        region = Region(
            id=2,
            name="East Africa Highlands",
            latitude=-1.3,
            longitude=36.8,
            crop_risk="medium",
            nutrition_risk="medium"
        )
        db.add(region)
        db.commit()
        print(f"✓ Created region using dependency injection: {region.name}")
        
    finally:
        # Cleanup (FastAPI does this automatically)
        try:
            next(db_generator)
        except StopIteration:
            pass
        print("✓ Session automatically cleaned up")


def example_error_handling():
    """Example: Error handling and rollback."""
    print("\n=== Error Handling ===")
    
    db = SessionLocal()
    
    try:
        # Try to create a region with duplicate ID
        region = Region(
            id=1,  # This ID already exists
            name="Duplicate Region",
            latitude=0.0,
            longitude=0.0,
            crop_risk="low",
            nutrition_risk="low"
        )
        db.add(region)
        db.commit()
        
    except Exception as e:
        print(f"✗ Error occurred: {type(e).__name__}")
        db.rollback()
        print("✓ Transaction rolled back successfully")
        
    finally:
        db.close()


def example_query_operations():
    """Example: Various query operations."""
    print("\n=== Query Operations ===")
    
    db = SessionLocal()
    
    try:
        # Count regions
        count = db.query(Region).count()
        print(f"✓ Total regions: {count}")
        
        # Filter by risk level
        high_risk = db.query(Region).filter(Region.crop_risk == "high").all()
        print(f"✓ High risk regions: {len(high_risk)}")
        
        # Get specific region by name
        region = db.query(Region).filter(Region.name == "Sahel Region").first()
        if region:
            print(f"✓ Found region: {region.name} with {region.crop_risk} crop risk")
        
        # Order by name
        regions = db.query(Region).order_by(Region.name).all()
        print(f"✓ Regions ordered by name: {[r.name for r in regions]}")
        
    finally:
        db.close()


def cleanup_example_data():
    """Clean up example data."""
    print("\n=== Cleanup ===")
    
    db = SessionLocal()
    
    try:
        # Delete all regions
        db.query(Region).delete()
        db.commit()
        print("✓ All example data cleaned up")
        
    finally:
        db.close()


if __name__ == "__main__":
    print("HarvestAlert Database Configuration Example\n")
    
    try:
        example_basic_usage()
        example_dependency_injection()
        example_error_handling()
        example_query_operations()
        cleanup_example_data()
        
        print("\n✓ All examples completed successfully!")
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
        import traceback
        traceback.print_exc()
