"""
Prediction Service for HarvestAlert MVP

This module implements rule-based prediction logic for crop and nutrition risk
assessment based on climate data (temperature and rainfall).

The prediction engine uses threshold-based rules for the MVP and is designed
to be extensible for future ML model integration.
"""

from typing import Dict, Literal

RiskLevel = Literal["low", "medium", "high"]


def predict_crop_risk(temperature: float, rainfall: float) -> RiskLevel:
    """
    Predicts crop risk based on temperature and rainfall.
    
    Rule-based logic:
    - High risk: rainfall < 50mm AND temperature > 30°C
    - Medium risk: rainfall < 100mm OR temperature > 35°C
    - Low risk: otherwise
    
    Args:
        temperature: Temperature in Celsius (expected range: -50 to 60)
        rainfall: Rainfall in millimeters (expected range: 0 to 1000)
    
    Returns:
        Risk level as one of: "low", "medium", "high"
    
    Requirements: 2.2, 2.5, 14.1, 14.2
    """
    # High risk: low rainfall AND high temperature
    if rainfall < 50 and temperature > 30:
        return "high"
    
    # Medium risk: low rainfall OR very high temperature
    elif rainfall < 100 or temperature > 35:
        return "medium"
    
    # Low risk: otherwise
    else:
        return "low"


def predict_nutrition_risk(crop_risk: RiskLevel, rainfall: float) -> RiskLevel:
    """
    Predicts nutrition risk based on crop risk and rainfall.
    
    Rule-based logic:
    - High crop risk → high or medium nutrition risk (based on rainfall)
    - Medium crop risk → medium nutrition risk
    - Low crop risk → low nutrition risk
    
    Args:
        crop_risk: The calculated crop risk level
        rainfall: Rainfall in millimeters (used for high crop risk cases)
    
    Returns:
        Risk level as one of: "low", "medium", "high"
    
    Requirements: 2.3, 2.6, 14.4
    """
    if crop_risk == "high":
        # Very low rainfall with high crop risk → high nutrition risk
        return "high" if rainfall < 30 else "medium"
    elif crop_risk == "medium":
        return "medium"
    else:
        return "low"


def calculate_drought_index(temperature: float, rainfall: float) -> float:
    """
    Calculates drought index on a 0-100 scale.
    
    Formula: (temperature / 50) * 50 + (1 - rainfall / 300) * 50
    - Higher temperature increases the index
    - Lower rainfall increases the index
    - Result is clamped to 0-100 range
    
    Args:
        temperature: Temperature in Celsius
        rainfall: Rainfall in millimeters
    
    Returns:
        Drought index as a float between 0 and 100
    
    Requirements: 2.4, 14.2
    """
    # Temperature component (0-50 range)
    temp_component = (temperature / 50) * 50
    
    # Rainfall component (0-50 range, inverted so less rain = higher index)
    # Cap rainfall at 300mm for calculation purposes
    rainfall_component = (1 - min(rainfall, 300) / 300) * 50
    
    # Combine components
    drought_index = temp_component + rainfall_component
    
    # Clamp to 0-100 range
    return max(0, min(100, drought_index))


def predict_risk(temperature: float, rainfall: float) -> Dict[str, RiskLevel]:
    """
    Main prediction function that calculates both crop and nutrition risk.
    
    This is a convenience function that combines crop risk and nutrition risk
    predictions into a single call.
    
    Args:
        temperature: Temperature in Celsius (expected range: -50 to 60)
        rainfall: Rainfall in millimeters (expected range: 0 to 1000)
    
    Returns:
        Dictionary with keys:
        - crop_risk: Risk level for crop failure
        - nutrition_risk: Risk level for food insecurity/malnutrition
    
    Requirements: 2.2, 2.3, 2.4, 2.5, 2.6
    """
    crop_risk = predict_crop_risk(temperature, rainfall)
    nutrition_risk = predict_nutrition_risk(crop_risk, rainfall)
    
    return {
        "crop_risk": crop_risk,
        "nutrition_risk": nutrition_risk
    }
