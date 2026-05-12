"""
Demonstration script for Region model.

This script shows how to create, query, and manipulate Region instances.
"""

from backend.models.region import Region
from backend.database import Base, engine, SessionLocal

# Create tables
Base.metadata.create_all(bind=engine)

# Create a session
db = SessionLocal()

try:
    # Create sample regions
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
    
    # Add regions to database
    for region in regions:
        db.add(region)
    
    db.commit()
    
    print("✓ Created 3 sample regions\n")
    
    # Query all regions
    all_regions = db.query(Region).all()
    
    print(f"Total regions in database: {len(all_regions)}\n")
    
    # Display each region
    for region in all_regions:
        print(f"Region: {region.name}")
        print(f"  Location: ({region.latitude}, {region.longitude})")
        print(f"  Crop Risk: {region.crop_risk}")
        print(f"  Nutrition Risk: {region.nutrition_risk}")
        print(f"  Last Updated: {region.last_updated}")
        print(f"  Dict representation: {region.to_dict()}")
        print()
    
    # Query high-risk regions
    high_risk_regions = db.query(Region).filter(Region.crop_risk == "high").all()
    print(f"High-risk regions: {len(high_risk_regions)}")
    for region in high_risk_regions:
        print(f"  - {region.name}")
    
    print("\n✓ Region model demonstration complete!")
    
except Exception as e:
    print(f"Error: {e}")
    db.rollback()
finally:
    db.close()
