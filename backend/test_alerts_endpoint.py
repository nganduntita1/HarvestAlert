"""
Manual test script for SMS alerts endpoint.

Run this script to test the /alerts/sms endpoint functionality.
"""

import sys
import requests
import json

# API base URL
BASE_URL = "http://localhost:8000"

def test_sms_alert_endpoint():
    """Test the SMS alert endpoint with various scenarios."""
    
    print("=" * 60)
    print("Testing SMS Alert Endpoint")
    print("=" * 60)
    
    # Test 1: Valid SMS alert
    print("\n1. Testing valid SMS alert...")
    payload = {
        "phone": "+1234567890",
        "message": "High crop risk alert for Sahel Region. Immediate action required."
    }
    
    try:
        response = requests.post(f"{BASE_URL}/alerts/sms", json=payload, timeout=5)
        
        if response.status_code == 201:
            data = response.json()
            print("✓ Valid SMS alert successful")
            print(f"  Message ID: {data['message_id']}")
            print(f"  Phone: {data['phone']}")
            print(f"  Timestamp: {data['timestamp']}")
            print(f"  Success: {data['success']}")
        else:
            print(f"✗ Unexpected status code: {response.status_code}")
            print(f"  Response: {response.text}")
    except requests.exceptions.ConnectionError:
        print("✗ Connection failed. Is the backend server running?")
        print("  Start it with: uvicorn backend.main:app --reload")
        return
    except Exception as e:
        print(f"✗ Error: {e}")
        return
    
    # Test 2: Invalid phone number (no +)
    print("\n2. Testing invalid phone number (no +)...")
    payload = {
        "phone": "1234567890",
        "message": "Test message"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/alerts/sms", json=payload, timeout=5)
        
        if response.status_code == 400:
            print("✓ Invalid phone number correctly rejected")
            print(f"  Error: {response.json()['detail']}")
        else:
            print(f"✗ Expected 400, got {response.status_code}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 3: Message too long
    print("\n3. Testing message too long...")
    payload = {
        "phone": "+1234567890",
        "message": "x" * 161
    }
    
    try:
        response = requests.post(f"{BASE_URL}/alerts/sms", json=payload, timeout=5)
        
        if response.status_code == 422:  # Pydantic validation error
            print("✓ Long message correctly rejected")
            print(f"  Error: {response.json()['detail'][0]['msg']}")
        else:
            print(f"✗ Expected 422, got {response.status_code}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 4: Missing required fields
    print("\n4. Testing missing required fields...")
    payload = {
        "phone": "+1234567890"
        # Missing message field
    }
    
    try:
        response = requests.post(f"{BASE_URL}/alerts/sms", json=payload, timeout=5)
        
        if response.status_code == 422:
            print("✓ Missing field correctly rejected")
            print(f"  Error: {response.json()['detail'][0]['msg']}")
        else:
            print(f"✗ Expected 422, got {response.status_code}")
    except Exception as e:
        print(f"✗ Error: {e}")
    
    # Test 5: International phone number formats
    print("\n5. Testing various international phone formats...")
    test_phones = [
        "+254712345678",  # Kenya
        "+234 803 123 4567",  # Nigeria (with spaces)
        "+27-82-123-4567",  # South Africa (with dashes)
        "+91 98765 43210",  # India
    ]
    
    for phone in test_phones:
        payload = {
            "phone": phone,
            "message": "Test alert"
        }
        
        try:
            response = requests.post(f"{BASE_URL}/alerts/sms", json=payload, timeout=5)
            
            if response.status_code == 201:
                print(f"✓ {phone} accepted")
            else:
                print(f"✗ {phone} rejected with status {response.status_code}")
        except Exception as e:
            print(f"✗ {phone} error: {e}")
    
    print("\n" + "=" * 60)
    print("Testing complete!")
    print("=" * 60)


if __name__ == "__main__":
    test_sms_alert_endpoint()
