# SMS Alerts Feature

## Overview

The SMS Alerts feature allows sending SMS notifications about high-risk situations to field workers and stakeholders. This is a bonus feature implemented with mock SMS functionality for the MVP.

## Endpoint

### POST /alerts/sms

Send an SMS alert notification.

**Request Body:**
```json
{
  "phone": "+1234567890",
  "message": "High crop risk alert for Sahel Region. Immediate action required."
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message_id": "sms_abc123def456",
  "phone": "+1234567890",
  "timestamp": "2024-01-15T10:30:00.123456",
  "message": "SMS alert queued successfully"
}
```

**Error Response (400 Bad Request):**
```json
{
  "detail": "Invalid request parameters",
  "errors": [
    {
      "loc": ["body", "phone"],
      "msg": "Phone number must start with + (international format)",
      "type": "value_error"
    }
  ]
}
```

## Request Parameters

### phone (required)
- **Type:** string
- **Format:** International format with + prefix (e.g., +1234567890)
- **Length:** 10-20 characters
- **Validation:** Must start with +, followed by digits only (spaces and dashes are allowed)
- **Examples:**
  - `+1234567890` (USA)
  - `+254712345678` (Kenya)
  - `+234 803 123 4567` (Nigeria with spaces)
  - `+27-82-123-4567` (South Africa with dashes)

### message (required)
- **Type:** string
- **Length:** 1-160 characters (SMS standard)
- **Description:** Alert message content to be sent

## Mock Implementation

For the MVP, this endpoint uses a **mock SMS service** that logs messages to the console instead of actually sending them. This allows testing and demonstration without requiring an SMS gateway integration.

### Console Output Example

When an SMS is sent, the following is logged:

```
============================================================
MOCK SMS SERVICE - Message Details:
  Message ID: sms_c7793a19c286
  To: +254712345678
  Phone: Alert for Kenya region
  Timestamp: 2024-01-15T10:30:00.123456
============================================================
```

## Production Integration

To integrate with a real SMS gateway in production, replace the mock implementation in `backend/routes/alerts.py` with actual SMS service calls:

### Example: Twilio Integration

```python
from twilio.rest import Client

# Initialize Twilio client
twilio_client = Client(account_sid, auth_token)

# Send SMS
message = twilio_client.messages.create(
    to=request.phone,
    from_=twilio_phone_number,
    body=request.message
)

message_id = message.sid
```

### Example: AWS SNS Integration

```python
import boto3

# Initialize SNS client
sns_client = boto3.client('sns', region_name='us-east-1')

# Send SMS
response = sns_client.publish(
    PhoneNumber=request.phone,
    Message=request.message
)

message_id = response['MessageId']
```

### Example: Africa's Talking Integration

```python
import africastalking

# Initialize Africa's Talking
africastalking.initialize(username, api_key)
sms = africastalking.SMS

# Send SMS
response = sms.send(
    message=request.message,
    recipients=[request.phone]
)

message_id = response['SMSMessageData']['Recipients'][0]['messageId']
```

## Usage Examples

### cURL

```bash
# Send SMS alert
curl -X POST "http://localhost:8000/alerts/sms" \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+254712345678",
    "message": "High crop risk alert for Sahel Region. Immediate action required."
  }'
```

### Python

```python
import requests

response = requests.post(
    "http://localhost:8000/alerts/sms",
    json={
        "phone": "+254712345678",
        "message": "High crop risk alert for Sahel Region. Immediate action required."
    }
)

if response.status_code == 201:
    data = response.json()
    print(f"SMS sent successfully! Message ID: {data['message_id']}")
else:
    print(f"Error: {response.json()['detail']}")
```

### JavaScript/TypeScript

```typescript
const response = await fetch('http://localhost:8000/alerts/sms', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    phone: '+254712345678',
    message: 'High crop risk alert for Sahel Region. Immediate action required.',
  }),
});

if (response.ok) {
  const data = await response.json();
  console.log(`SMS sent successfully! Message ID: ${data.message_id}`);
} else {
  const error = await response.json();
  console.error(`Error: ${error.detail}`);
}
```

## Validation Rules

1. **Phone Number:**
   - Must start with `+` (international format)
   - Must contain only digits after the `+` (spaces and dashes are allowed for formatting)
   - Must be between 10 and 20 characters long
   - Examples of valid formats: `+1234567890`, `+234 803 123 4567`, `+27-82-123-4567`

2. **Message:**
   - Must be between 1 and 160 characters
   - Standard SMS length limit

## Error Handling

The endpoint returns appropriate HTTP status codes:

- **201 Created:** SMS queued successfully
- **400 Bad Request:** Invalid phone number or message format
- **422 Unprocessable Entity:** Missing required fields
- **500 Internal Server Error:** Unexpected server error

## Requirements Validation

This feature validates the following requirements:

- **Requirement 16.1:** Backend API exposes `/alerts/sms` endpoint
- **Requirement 16.2:** Accepts phone number and message content as parameters
- **Requirement 16.3:** Returns success confirmation when SMS is queued or sent
- **Requirement 16.4:** Uses mock SMS service for MVP (no actual SMS gateway required)

## Testing

To test the SMS alerts endpoint:

1. Start the backend server:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

2. Send a test SMS:
   ```bash
   curl -X POST "http://localhost:8000/alerts/sms" \
     -H "Content-Type: application/json" \
     -d '{
       "phone": "+1234567890",
       "message": "Test alert message"
     }'
   ```

3. Check the console logs to see the mock SMS output

## Future Enhancements

Potential enhancements for production:

1. **SMS Gateway Integration:** Replace mock service with Twilio, AWS SNS, or Africa's Talking
2. **SMS Templates:** Pre-defined message templates for different alert types
3. **Batch SMS:** Send alerts to multiple recipients at once
4. **SMS History:** Store sent SMS records in database
5. **Delivery Status:** Track SMS delivery status and failures
6. **Rate Limiting:** Prevent SMS spam and control costs
7. **Opt-in/Opt-out:** Allow users to subscribe/unsubscribe from alerts
8. **Localization:** Support multiple languages for SMS messages
