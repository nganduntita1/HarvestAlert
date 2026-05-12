"""
Alerts API Routes

Provides endpoints for sending SMS alerts about high-risk situations.
This is a bonus feature with mock SMS functionality for MVP.

Validates: Requirements 16.1, 16.2, 16.3, 16.4
"""

import logging
import uuid
from datetime import datetime

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field, validator

# Configure logging
logger = logging.getLogger(__name__)

# Create router
router = APIRouter(
    prefix="/alerts",
    tags=["Alerts"]
)


class SMSAlertRequest(BaseModel):
    """
    Request model for SMS alert.
    
    Attributes:
        phone: Phone number in international format (e.g., +1234567890)
        message: Alert message content (max 160 characters for SMS)
    """
    phone: str = Field(
        ...,
        description="Phone number in international format",
        examples=["+1234567890"],
        min_length=10,
        max_length=20
    )
    message: str = Field(
        ...,
        description="Alert message content",
        examples=["High crop risk alert for Sahel Region. Immediate action required."],
        min_length=1,
        max_length=160
    )
    
    @validator('phone')
    def validate_phone(cls, v):
        """
        Validate phone number format.
        
        Args:
            v: Phone number string
            
        Returns:
            str: Validated phone number
            
        Raises:
            ValueError: If phone number format is invalid
        """
        # Remove spaces and dashes for validation
        cleaned = v.replace(" ", "").replace("-", "")
        
        # Check if it starts with + and contains only digits after that
        if not cleaned.startswith("+"):
            raise ValueError("Phone number must start with + (international format)")
        
        if not cleaned[1:].isdigit():
            raise ValueError("Phone number must contain only digits after +")
        
        if len(cleaned) < 10 or len(cleaned) > 20:
            raise ValueError("Phone number must be between 10 and 20 characters")
        
        # Return the original value (with spaces/dashes preserved)
        return v


class SMSAlertResponse(BaseModel):
    """
    Response model for SMS alert.
    
    Attributes:
        success: Whether the SMS was successfully queued/sent
        message_id: Unique identifier for the SMS message
        phone: Phone number the message was sent to
        timestamp: ISO format timestamp when the message was queued
        message: Confirmation message
    """
    success: bool = Field(..., description="Whether SMS was successfully queued")
    message_id: str = Field(..., description="Unique message identifier")
    phone: str = Field(..., description="Recipient phone number")
    timestamp: str = Field(..., description="ISO format timestamp")
    message: str = Field(..., description="Confirmation message")


@router.post("/sms", response_model=SMSAlertResponse, status_code=status.HTTP_201_CREATED)
async def send_sms_alert(request: SMSAlertRequest) -> SMSAlertResponse:
    """
    Send SMS alert notification.
    
    This is a mock implementation for MVP that logs the SMS to console
    instead of actually sending it. In production, this would integrate
    with an SMS gateway service like Twilio, AWS SNS, or Africa's Talking.
    
    Args:
        request: SMS alert request containing phone number and message
        
    Returns:
        SMSAlertResponse: Confirmation with mock message_id
        
    Raises:
        HTTPException 400: If phone number or message format is invalid
        HTTPException 500: If an unexpected error occurs
        
    Requirements: 16.1, 16.2, 16.3, 16.4
    
    Example Request:
        {
            "phone": "+1234567890",
            "message": "High crop risk alert for Sahel Region. Immediate action required."
        }
        
    Example Response:
        {
            "success": true,
            "message_id": "sms_abc123def456",
            "phone": "+1234567890",
            "timestamp": "2024-01-15T10:30:00.123456",
            "message": "SMS alert queued successfully"
        }
    """
    try:
        logger.info(f"Processing SMS alert request for phone: {request.phone}")
        
        # Generate mock message ID
        message_id = f"sms_{uuid.uuid4().hex[:12]}"
        
        # Get current timestamp
        timestamp = datetime.utcnow().isoformat()
        
        # Mock SMS service - log to console instead of actually sending
        logger.info("=" * 60)
        logger.info("MOCK SMS SERVICE - Message Details:")
        logger.info(f"  Message ID: {message_id}")
        logger.info(f"  To: {request.phone}")
        logger.info(f"  Message: {request.message}")
        logger.info(f"  Timestamp: {timestamp}")
        logger.info("=" * 60)
        
        # In production, this would be replaced with actual SMS gateway call:
        # response = sms_gateway.send(
        #     to=request.phone,
        #     body=request.message
        # )
        
        logger.info(f"SMS alert queued successfully with message_id: {message_id}")
        
        return SMSAlertResponse(
            success=True,
            message_id=message_id,
            phone=request.phone,
            timestamp=timestamp,
            message="SMS alert queued successfully"
        )
    
    except ValueError as e:
        # Validation errors
        logger.warning(f"Invalid SMS alert request: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    except Exception as e:
        # Unexpected errors
        logger.error(f"Error processing SMS alert: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send SMS alert. Please try again later."
        )
