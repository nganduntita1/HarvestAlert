#!/bin/bash
# HarvestAlert Backend Startup Script

echo "🚀 Starting HarvestAlert Backend..."
echo ""

# Navigate to backend directory
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Please run: python3 -m venv venv"
    exit 1
fi

# Activate virtual environment
echo "✓ Activating virtual environment..."
source venv/bin/activate

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from .env.example..."
    cp .env.example .env
    echo "✓ Created .env file. Please review and update if needed."
fi

# Check if database is initialized
if [ ! -f "harvestalert.db" ]; then
    echo "⚠️  Database not found. Initializing..."
    python3 init_db.py
    echo ""
    echo "⚠️  Seeding trend data..."
    python3 seed_trend_data.py
fi

echo ""
echo "✓ Starting uvicorn server..."
echo "✓ API will be available at: http://localhost:8000"
echo "✓ API docs available at: http://localhost:8000/docs"
echo ""
echo "Press CTRL+C to stop the server"
echo ""

# Start the server
uvicorn main:app --reload --port 8000
