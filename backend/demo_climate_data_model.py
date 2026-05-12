"""
Demonstration script for ClimateData model.

This script demonstrates the ClimateData model functionality including:
- Creating climate data records
- Validating data constraints
- Foreign key relationships with Region
- Querying climate data
"""

from datetime import datetime
from backend.database import SessionLocal, init_db
from backend.models import Region, ClimateData


def main():
    """Demonstrate ClimateData model functionality."""
    
    # Initialize database
    print("Initializing database...")
    init_db()
    
    # Create session
    db = SessionLocal()
    
    try:
        # Create a sample region
        print("\n1. Creating sample region...")
        region = Region(
            name="Sahel Region",
            latitude=14.5,
            longitude=-14.5,
            crop_risk="high",
            nutrition_risk="high"
        )
        db.add(region)
        db.commit()
        print(f"   ✓ Created region: {region}")
        
        # Create climate data for the region
        print("\n2. Creating climate data records...")
        climate_records = [
            ClimateData(
                region_id=region.id,
                temperature=38.5,
                rainfall=25.0,
                drought_index=85.0
            ),
            ClimateData(
                region_id=region.id,
                temperature=35.0,
                rainfall=45.0,
                drought_index=70.0
            ),
            ClimateData(
                region_id=region.id,
                temperature=32.0,
                rainfall=60.0,
                drought_index=55.0
            )
        ]
        
        for climate in climate_records:
            db.add(climate)
        db.commit()
        print(f"   ✓ Created {len(climate_records)} climate data records")
        
        # Query climate data
        print("\n3. Querying climate data...")
        all_climate = db.query(ClimateData).filter_by(region_id=region.id).all()
        print(f"   ✓ Found {len(all_climate)} climate records for {region.name}")
        
        for climate in all_climate:
            print(f"      - Temp: {climate.temperature}°C, "
                  f"Rainfall: {climate.rainfall}mm, "
                  f"Drought Index: {climate.drought_index}")
        
        # Test relationship
        print("\n4. Testing foreign key relationship...")
        first_climate = all_climate[0]
        print(f"   ✓ Climate data region: {first_climate.region.name}")
        print(f"   ✓ Region has {len(first_climate.region.climate_data)} climate records")
        
        # Test to_dict method
        print("\n5. Testing to_dict() method...")
        climate_dict = first_climate.to_dict()
        print(f"   ✓ Climate data as dict: {climate_dict}")
        
        # Test validation constraints
        print("\n6. Testing validation constraints...")
        try:
            invalid_climate = ClimateData(
                region_id=region.id,
                temperature=100.0,  # Invalid: > 60
                rainfall=50.0,
                drought_index=50.0
            )
            print("   ✗ Validation failed to catch invalid temperature")
        except ValueError as e:
            print(f"   ✓ Validation caught invalid temperature: {e}")
        
        try:
            invalid_climate = ClimateData(
                region_id=region.id,
                temperature=30.0,
                rainfall=-10.0,  # Invalid: < 0
                drought_index=50.0
            )
            print("   ✗ Validation failed to catch invalid rainfall")
        except ValueError as e:
            print(f"   ✓ Validation caught invalid rainfall: {e}")
        
        try:
            invalid_climate = ClimateData(
                region_id=region.id,
                temperature=30.0,
                rainfall=50.0,
                drought_index=150.0  # Invalid: > 100
            )
            print("   ✗ Validation failed to catch invalid drought_index")
        except ValueError as e:
            print(f"   ✓ Validation caught invalid drought_index: {e}")
        
        # Test boundary values
        print("\n7. Testing boundary values...")
        boundary_climate = ClimateData(
            region_id=region.id,
            temperature=60.0,  # Maximum valid
            rainfall=0.0,      # Minimum valid
            drought_index=100.0  # Maximum valid
        )
        db.add(boundary_climate)
        db.commit()
        print(f"   ✓ Boundary values accepted: {boundary_climate}")
        
        print("\n✅ All demonstrations completed successfully!")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()
