"""
Manual API testing script.

This script starts the FastAPI server and makes test requests to verify
all endpoints are working correctly with the actual database.
"""

import requests
import time
import sys

BASE_URL = "http://localhost:8000"


def test_health_endpoints():
    """Test health check endpoints."""
    print("\n=== Testing Health Endpoints ===")
    
    # Test root endpoint
    response = requests.get(f"{BASE_URL}/")
    print(f"GET / - Status: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # Test health endpoint
    response = requests.get(f"{BASE_URL}/health")
    print(f"GET /health - Status: {response.status_code}")
    print(f"Response: {response.json()}")


def test_climate_endpoint():
    """Test climate data endpoint."""
    print("\n=== Testing Climate Endpoint ===")
    
    response = requests.get(f"{BASE_URL}/climate")
    print(f"GET /climate - Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"Temperature: {data.get('temperature')}°C")
        print(f"Rainfall: {data.get('rainfall')}mm")
        print(f"Drought Index: {data.get('drought_index')}")
    else:
        print(f"Error: {response.json()}")


def test_predict_endpoint():
    """Test prediction endpoint."""
    print("\n=== Testing Predict Endpoint ===")
    
    # Test case 1: High risk scenario
    payload = {"temperature": 35.0, "rainfall": 40.0}
    response = requests.post(f"{BASE_URL}/predict", json=payload)
    print(f"POST /predict (high risk) - Status: {response.status_code}")
    print(f"Input: {payload}")
    print(f"Response: {response.json()}")
    
    # Test case 2: Low risk scenario
    payload = {"temperature": 25.0, "rainfall": 150.0}
    response = requests.post(f"{BASE_URL}/predict", json=payload)
    print(f"\nPOST /predict (low risk) - Status: {response.status_code}")
    print(f"Input: {payload}")
    print(f"Response: {response.json()}")
    
    # Test case 3: Invalid input
    payload = {"temperature": 100.0, "rainfall": 50.0}
    response = requests.post(f"{BASE_URL}/predict", json=payload)
    print(f"\nPOST /predict (invalid) - Status: {response.status_code}")
    print(f"Input: {payload}")
    print(f"Response: {response.json()}")


def test_regions_endpoint():
    """Test regions endpoint."""
    print("\n=== Testing Regions Endpoint ===")
    
    response = requests.get(f"{BASE_URL}/regions")
    print(f"GET /regions - Status: {response.status_code}")
    
    if response.status_code == 200:
        regions = response.json()
        print(f"Total regions: {len(regions)}")
        for region in regions:
            print(f"  - {region['name']}: Crop Risk={region['crop_risk']}, Nutrition Risk={region['nutrition_risk']}")
    else:
        print(f"Error: {response.json()}")


def main():
    """Run all tests."""
    print("=" * 60)
    print("HarvestAlert API Manual Test")
    print("=" * 60)
    print(f"\nTesting API at: {BASE_URL}")
    print("Make sure the server is running: uvicorn backend.main:app --reload")
    print("\nWaiting 2 seconds for connection...")
    time.sleep(2)
    
    try:
        test_health_endpoints()
        test_climate_endpoint()
        test_predict_endpoint()
        test_regions_endpoint()
        
        print("\n" + "=" * 60)
        print("✓ All manual tests completed!")
        print("=" * 60)
        
    except requests.exceptions.ConnectionError:
        print("\n✗ Error: Could not connect to API server")
        print("Please start the server with: uvicorn backend.main:app --reload")
        sys.exit(1)
    except Exception as e:
        print(f"\n✗ Error during testing: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
