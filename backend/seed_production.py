"""
Production seed script — run once after Railway deployment to populate the database.

Usage (from Railway shell or locally pointing at the production DB):
    python seed_production.py
"""

import sys
import random
from datetime import datetime, timedelta, timezone

sys.path.insert(0, '.')

from database import SessionLocal, init_db
from models.region import Region
from models.climate_data import ClimateData


def drought_index(temp: float, rain: float) -> float:
    return max(0.0, min(100.0, (temp / 50) * 50 + (1 - min(rain, 300) / 300) * 50))


REGIONS = [
    # (name, lat, lng, crop_risk, nutrition_risk, base_temp, base_rain)
    ("Sahel Region",            14.50,  -14.50, "high",   "high",   38.5,  35.0),
    ("East Africa Highlands",   -1.29,   36.82, "medium", "medium", 28.0,  85.0),
    ("Southern Africa Plains", -25.75,   28.19, "low",    "low",    22.5, 180.0),
    ("Horn of Africa",           2.05,   45.32, "high",   "high",   42.0,  25.0),
    ("Central Africa Plateau",  -6.37,   34.89, "medium", "medium", 26.5,  95.0),
    ("Niger River Delta",        5.33,    6.45, "medium", "medium", 29.0, 120.0),
    ("Lake Chad Basin",         13.00,   14.00, "high",   "high",   40.0,  28.0),
    ("Ethiopian Highlands",      9.02,   38.74, "medium", "low",    22.0, 110.0),
    ("South Sudan Lowlands",     4.85,   31.60, "high",   "high",   37.0,  40.0),
    ("Mozambique Coast",        -18.67,  35.53, "low",    "low",    26.0, 160.0),
    ("Zambia Plateau",          -13.13,  27.85, "low",    "medium", 24.0, 140.0),
    ("Mali Sahel",              15.00,   -2.00, "high",   "high",   41.0,  22.0),
    ("Madagascar Highlands",   -19.00,   46.70, "medium", "medium", 21.0,  95.0),
    ("Angola Central Plateau", -11.20,   17.87, "medium", "low",    25.0, 105.0),
    ("Zimbabwe Lowveld",        -20.00,  31.00, "medium", "medium", 30.0,  75.0),
]


def seed():
    init_db()
    db = SessionLocal()
    now = datetime.now(timezone.utc)
    added = 0

    try:
        for name, lat, lng, crop_risk, nutrition_risk, base_temp, base_rain in REGIONS:
            if db.query(Region).filter(Region.name == name).first():
                print(f"  skip (exists): {name}")
                continue

            r = Region(
                name=name, latitude=lat, longitude=lng,
                crop_risk=crop_risk, nutrition_risk=nutrition_risk,
                last_updated=now,
            )
            db.add(r)
            db.flush()

            for i in range(7):
                t = max(-50.0, min(60.0, base_temp + random.uniform(-4, 4)))
                rain = max(0.0, min(1000.0, base_rain + random.uniform(-18, 18)))
                db.add(ClimateData(
                    region_id=r.id,
                    temperature=round(t, 1),
                    rainfall=round(rain, 1),
                    drought_index=round(drought_index(t, rain), 1),
                    recorded_at=now - timedelta(days=6 - i),
                ))

            print(f"  added: {name} ({crop_risk}/{nutrition_risk})")
            added += 1

        db.commit()
        print(f"\nDone — {added} regions added.")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
