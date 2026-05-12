#!/bin/bash
# HarvestAlert Frontend Startup Script

echo "🚀 Starting HarvestAlert Frontend..."
echo ""

# Navigate to frontend directory
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules not found. Installing dependencies..."
    npm install
    echo ""
fi

# Check if .env.local file exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local file not found. Creating from .env.example..."
    cp .env.example .env.local
    echo "✓ Created .env.local file."
fi

echo ""
echo "✓ Starting Next.js development server..."
echo "✓ Dashboard will be available at: http://localhost:3000"
echo ""
echo "Press CTRL+C to stop the server"
echo ""

# Start the server
npm run dev
