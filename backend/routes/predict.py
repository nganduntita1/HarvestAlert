"""
Prediction API Routes

Provides endpoints for risk prediction based on climate parameters.
Accepts temperature and rainfall data and returns crop and nutrition risk levels.

Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7
"""

import logging
from typing import Dict

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field, field_validator

from services.prediction_service import predict_risk

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(
    prefix="/predict",
    tags=["Prediction"]
)


class PredictRequest(BaseModel):
    """
    Request model for risk prediction.
    
    Attributes:
        temperature: Temperature in Celsius (range: -50 to 60)
        rainfall: Rainfall in millimeters (range: 0 to 1000)
    """
    temperature: float = Field(
        ...,
        description="Temperature in Celsius",
        ge=-50,
        le=60,
        examples=[35.5]
    )
    rainfall: float = Field(
        ...,
        description="Rainfall in millimeters",
        ge=0,
        le=1000,
        examples=[45.2]
    )
    
    @field_validator('temperature')
    @classmethod
    def validate_temperature(cls, v: float) -> float:
        """Validate temperature is within acceptable range."""
        if v < -50 or v > 60:
            raise ValueError("Temperature must be between -50 and 60 Celsius")
        return v
    
    @field_validator('rainfall')
    @classmethod
    def validate_rainfall(cls, v: float) -> float:
        """Validate rainfall is within acceptable range."""
        if v < 0 or v > 1000:
            raise ValueError("Rainfall must be between 0 and 1000 mm")
        return v


class PredictResponse(BaseModel):
    """
    Response model for risk prediction.
    
    Attributes:
        crop_risk: Crop failure risk level ("low", "medium", "high")
        nutrition_risk: Malnutrition risk level ("low", "medium", "high")
    """
    crop_risk: str = Field(
        ...,
        description="Crop failure risk level",
        pattern="^(low|medium|high)$",
        examples=["high"]
    )
    nutrition_risk: str = Field(
        ...,
        description="Malnutrition risk level",
        pattern="^(low|medium|high)$",
        examples=["medium"]
    )


@router.post("", response_model=PredictResponse)
async def predict(request: PredictRequest) -> Dict[str, str]:
    """
    Predict crop and nutrition risk based on climate parameters.
    
    Accepts temperature and rainfall data and returns risk predictions
    using rule-based logic.
    
    Prediction Rules:
    - High crop risk: rainfall < 50mm AND temperature > 30°C
    - Medium crop risk: rainfall < 100mm OR temperature > 35°C
    - Low crop risk: otherwise
    - Nutrition risk: derived from crop risk
    
    Args:
        request: Prediction request with temperature and rainfall
        
    Returns:
        dict: Risk predictions with keys:
            - crop_risk: "low", "medium", or "high"
            - nutrition_risk: "low", "medium", or "high"
            
    Raises:
        HTTPException 400: If input parameters are invalid
        HTTPException 500: If prediction calculation fails
        
    Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7
    
    Example Request:
        {
            "temperature": 35.5,
            "rainfall": 45.2
        }
        
    Example Response:
        {
            "crop_risk": "high",
            "nutrition_risk": "medium"
        }
    """
    try:
        logger.info(
            f"Predicting risk for temperature={request.temperature}°C, "
            f"rainfall={request.rainfall}mm"
        )
        
        # Call prediction service
        result = predict_risk(request.temperature, request.rainfall)
        
        logger.info(
            f"Prediction result: crop_risk={result['crop_risk']}, "
            f"nutrition_risk={result['nutrition_risk']}"
        )
        
        return result
    
    except ValueError as e:
        logger.warning(f"Invalid input for prediction: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    except Exception as e:
        logger.error(f"Error during prediction: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to calculate risk prediction"
        )
