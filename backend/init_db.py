"""
Database initialization script for HarvestAlert.

This script creates database tables and seeds sample data for testing and
demonstration purposes. It includes 5 regions with realistic climate data
representing different risk scenarios.

Validates: Requirements 15.1, 15.2, 15.3, 15.4

Usage:
    python backend/init_db.py
"""

import logging
import sys
from datetime import datetime, timedelta
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.database import Base, engine, SessionLocal, init_db
from backend.models.region import Region
from backend.models.climate_data import ClimateData

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def create_tables():
    """
    Create all database tables defined in models.
    
    Raises:
        Exception: If table creation fails
    """
    try:
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("✓ Database tables created successfully")
    except Exception as e:
        logger.error(f"✗ Failed to create tables: {e}")
        raise


def seed_sample_data():
    """
    Seed database with sample regions and climate data.
    
    Creates 5 regions with realistic values representing different
    geographic areas and risk scenarios:
    1. Sahel Region (West Africa) - High risk
    2. East Africa Highlands (Kenya) - Medium risk
    3. Southern Africa Plains (South Africa) - Low risk
    4. Horn of Africa (Somalia) - High risk
    5. Central Africa Plateau (Tanzania) - Medium risk
    
    Each region includes associated climate data with realistic
    temperature, rainfall, and drought index values.
    
    Raises:
        Exception: If data seeding fails
    """
    db = SessionLocal()
    
    try:
        logger.info("Seeding sample data...")
        
        # Check if data already exists
        existing_count = db.query(Region).count()
        if existing_count > 0:
            logger.warning(f"Database already contains {existing_count} regions. Skipping seed.")
            return
        
        # Sample regions with realistic data
        sample_regions = [
            {
                "name": "Sahel Region",
                "latitude": 14.5,
                "longitude": -14.5,
                "crop_risk": "high",
                "nutrition_risk": "high",
                "climate": {
                    "temperature": 38.5,
                    "rainfall": 35.0,
                    "drought_index": 78.5
                }
            },
            {
                "name": "East Africa Highlands",
                "latitude": -1.286389,
                "longitude": 36.817223,
                "crop_risk": "medium",
                "nutrition_risk": "medium",
                "climate": {
                    "temperature": 28.0,
                    "rainfall": 85.0,
                    "drought_index": 52.0
                }
            },
            {
                "name": "Southern Africa Plains",
                "latitude": -25.746111,
                "longitude": 28.188056,
                "crop_risk": "low",
                "nutrition_risk": "low",
                "climate": {
                    "temperature": 22.5,
                    "rainfall": 180.0,
                    "drought_index": 28.0
                }
            },
            {
                "name": "Horn of Africa",
                "latitude": 2.046934,
                "longitude": 45.318162,
                "crop_risk": "high",
                "nutrition_risk": "high",
                "climate": {
                    "temperature": 42.0,
                    "rainfall": 25.0,
                    "drought_index": 85.0
                }
            },
            {
                "name": "Central Africa Plateau",
                "latitude": -6.369028,
                "longitude": 34.888822,
                "crop_risk": "medium",
                "nutrition_risk": "medium",
                "climate": {
                    "temperature": 26.5,
                    "rainfall": 95.0,
                    "drought_index": 48.0
                }
            }
        ]
        
        # Create regions and associated climate data
        for region_data in sample_regions:
            # Create region
            region = Region(
                name=region_data["name"],
                latitude=region_data["latitude"],
                longitude=region_data["longitude"],
                crop_risk=region_data["crop_risk"],
                nutrition_risk=region_data["nutrition_risk"],
                last_updated=datetime.utcnow()
            )
            db.add(region)
            db.flush()  # Flush to get region.id
            
            # Create climate data for the region
            climate = ClimateData(
                region_id=region.id,
                temperature=region_data["climate"]["temperature"],
                rainfall=region_data["climate"]["rainfall"],
                drought_index=region_data["climate"]["drought_index"],
                recorded_at=datetime.utcnow()
            )
            db.add(climate)
            
            logger.info(
                f"  ✓ Added region: {region.name} "
                f"(lat: {region.latitude}, lng: {region.longitude}, "
                f"crop_risk: {region.crop_risk}, nutrition_risk: {region.nutrition_risk})"
            )
        
        # Commit all changes
        db.commit()
        logger.info(f"✓ Successfully seeded {len(sample_regions)} regions with climate data")
        
    except Exception as e:
        logger.error(f"✗ Failed to seed data: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def verify_data():
    """
    Verify that data was seeded correctly.
    
    Checks that regions and climate data exist in the database
    and displays a summary.
    """
    db = SessionLocal()
    
    try:
        logger.info("Verifying seeded data...")
        
        # Count regions
        region_count = db.query(Region).count()
        climate_count = db.query(ClimateData).count()
        
        logger.info(f"  Regions in database: {region_count}")
        logger.info(f"  Climate data records: {climate_count}")
        
        # Display region summary
        regions = db.query(Region).all()
        logger.info("\nRegion Summary:")
        logger.info("-" * 80)
        for region in regions:
            logger.info(
                f"  {region.id}. {region.name:30s} | "
                f"Crop: {region.crop_risk:6s} | "
                f"Nutrition: {region.nutrition_risk:6s} | "
                f"Coords: ({region.latitude:.2f}, {region.longitude:.2f})"
            )
        logger.info("-" * 80)
        
        # Display climate data summary
        logger.info("\nClimate Data Summary:")
        logger.info("-" * 80)
        climate_data = db.query(ClimateData).all()
        for climate in climate_data:
            region = db.query(Region).filter(Region.id == climate.region_id).first()
            logger.info(
                f"  {region.name:30s} | "
                f"Temp: {climate.temperature:5.1f}°C | "
                f"Rain: {climate.rainfall:6.1f}mm | "
                f"Drought: {climate.drought_index:5.1f}"
            )
        logger.info("-" * 80)
        
        logger.info("✓ Data verification complete")
        
    except Exception as e:
        logger.error(f"✗ Failed to verify data: {e}")
        raise
    finally:
        db.close()


def main():
    """
    Main function to initialize database and seed sample data.
    
    Steps:
    1. Create database tables
    2. Seed sample regions and climate data
    3. Verify data was seeded correctly
    """
    try:
        logger.info("=" * 80)
        logger.info("HarvestAlert Database Initialization")
        logger.info("=" * 80)
        
        # Step 1: Create tables
        create_tables()
        
        # Step 2: Seed sample data
        seed_sample_data()
        
        # Step 3: Verify data
        verify_data()
        
        logger.info("\n" + "=" * 80)
        logger.info("✓ Database initialization completed successfully!")
        logger.info("=" * 80)
        
    except Exception as e:
        logger.error("\n" + "=" * 80)
        logger.error(f"✗ Database initialization failed: {e}")
        logger.error("=" * 80)
        sys.exit(1)


if __name__ == "__main__":
    main()
