"""
Seed historical climate data for trend visualization.

This script adds 7 historical climate data points for each region
to support the trend visualization feature (Requirement 18.2).

Usage:
    python backend/seed_trend_data.py
"""

import logging
import sys
from datetime import datetime, timedelta
from pathlib import Path
import random

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from backend.database import SessionLocal
from backend.models.region import Region
from backend.models.climate_data import ClimateData

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def calculate_drought_index(temperature: float, rainfall: float) -> float:
    """Calculate drought index using the same formula as prediction service."""
    temp_component = (temperature / 50) * 50
    rainfall_component = (1 - min(rainfall, 300) / 300) * 50
    drought_index = temp_component + rainfall_component
    return max(0, min(100, drought_index))


def generate_trend_data(base_temp: float, base_rainfall: float, num_points: int = 7):
    """
    Generate realistic trend data with some variation.
    
    Args:
        base_temp: Base temperature value
        base_rainfall: Base rainfall value
        num_points: Number of data points to generate
        
    Returns:
        List of (temperature, rainfall, drought_index) tuples
    """
    trend_data = []
    
    for i in range(num_points):
        # Add some realistic variation (±5°C for temp, ±20mm for rainfall)
        temp_variation = random.uniform(-5, 5)
        rainfall_variation = random.uniform(-20, 20)
        
        temp = max(-50, min(60, base_temp + temp_variation))
        rainfall = max(0, min(1000, base_rainfall + rainfall_variation))
        drought_index = calculate_drought_index(temp, rainfall)
        
        trend_data.append((temp, rainfall, drought_index))
    
    return trend_data


def seed_historical_data():
    """
    Seed historical climate data for all regions.
    
    Creates 7 data points per region spanning the last 7 days.
    """
    db = SessionLocal()
    
    try:
        logger.info("Seeding historical climate data for trend visualization...")
        
        # Get all regions
        regions = db.query(Region).all()
        
        if not regions:
            logger.error("No regions found in database. Please run init_db.py first.")
            return
        
        logger.info(f"Found {len(regions)} regions")
        
        for region in regions:
            # Get the most recent climate data for this region as baseline
            latest_climate = (
                db.query(ClimateData)
                .filter(ClimateData.region_id == region.id)
                .order_by(ClimateData.recorded_at.desc())
                .first()
            )
            
            if not latest_climate:
                logger.warning(f"No climate data found for region {region.name}, skipping")
                continue
            
            # Check if we already have enough data points
            existing_count = (
                db.query(ClimateData)
                .filter(ClimateData.region_id == region.id)
                .count()
            )
            
            if existing_count >= 7:
                logger.info(f"Region '{region.name}' already has {existing_count} data points, skipping")
                continue
            
            # Generate trend data based on current values
            trend_data = generate_trend_data(
                latest_climate.temperature,
                latest_climate.rainfall,
                num_points=7
            )
            
            # Delete existing climate data for this region to avoid duplicates
            db.query(ClimateData).filter(ClimateData.region_id == region.id).delete()
            
            # Create 7 historical data points (one per day for the last 7 days)
            now = datetime.utcnow()
            for i, (temp, rainfall, drought_index) in enumerate(trend_data):
                # Create data point for (7-i) days ago
                recorded_at = now - timedelta(days=(6 - i))
                
                climate_data = ClimateData(
                    region_id=region.id,
                    temperature=temp,
                    rainfall=rainfall,
                    drought_index=drought_index,
                    recorded_at=recorded_at
                )
                db.add(climate_data)
            
            logger.info(f"  ✓ Added 7 historical data points for region: {region.name}")
        
        # Commit all changes
        db.commit()
        logger.info(f"✓ Successfully seeded historical data for {len(regions)} regions")
        
    except Exception as e:
        logger.error(f"✗ Failed to seed historical data: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def verify_trend_data():
    """Verify that trend data was seeded correctly."""
    db = SessionLocal()
    
    try:
        logger.info("\nVerifying trend data...")
        logger.info("-" * 80)
        
        regions = db.query(Region).all()
        
        for region in regions:
            climate_count = (
                db.query(ClimateData)
                .filter(ClimateData.region_id == region.id)
                .count()
            )
            
            logger.info(f"  {region.name:30s} | Data points: {climate_count}")
            
            if climate_count >= 7:
                # Show date range
                oldest = (
                    db.query(ClimateData)
                    .filter(ClimateData.region_id == region.id)
                    .order_by(ClimateData.recorded_at.asc())
                    .first()
                )
                newest = (
                    db.query(ClimateData)
                    .filter(ClimateData.region_id == region.id)
                    .order_by(ClimateData.recorded_at.desc())
                    .first()
                )
                
                logger.info(
                    f"    Date range: {oldest.recorded_at.strftime('%Y-%m-%d')} to "
                    f"{newest.recorded_at.strftime('%Y-%m-%d')}"
                )
        
        logger.info("-" * 80)
        logger.info("✓ Trend data verification complete")
        
    except Exception as e:
        logger.error(f"✗ Failed to verify trend data: {e}")
        raise
    finally:
        db.close()


def main():
    """Main function to seed historical climate data."""
    try:
        logger.info("=" * 80)
        logger.info("HarvestAlert Trend Data Seeding")
        logger.info("=" * 80)
        
        seed_historical_data()
        verify_trend_data()
        
        logger.info("\n" + "=" * 80)
        logger.info("✓ Trend data seeding completed successfully!")
        logger.info("=" * 80)
        
    except Exception as e:
        logger.error("\n" + "=" * 80)
        logger.error(f"✗ Trend data seeding failed: {e}")
        logger.error("=" * 80)
        sys.exit(1)


if __name__ == "__main__":
    main()
