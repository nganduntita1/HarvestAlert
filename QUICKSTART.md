# HarvestAlert Quick Start Guide

Get HarvestAlert up and running in 5 minutes!

## Prerequisites

Make sure you have these installed:
- **Python 3.9+** - Check with: `python3 --version`
- **Node.js 18+** - Check with: `node --version`

## Option 1: Automated Setup (Recommended)

### Step 1: Backend Setup

```bash
# From the project root directory
./start-backend.sh
```

This script will:
- ✓ Activate the virtual environment
- ✓ Create .env file if needed
- ✓ Initialize the database with sample data
- ✓ Seed historical trend data
- ✓ Start the backend server on http://localhost:8000

**First time setup?** The script will prompt you to create the virtual environment:
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..
./start-backend.sh
```

### Step 2: Frontend Setup

Open a **new terminal window** and run:

```bash
# From the project root directory
./start-frontend.sh
```

This script will:
- ✓ Install npm dependencies if needed
- ✓ Create .env.local file if needed
- ✓ Start the frontend server on http://localhost:3000

### Step 3: Open the Application

Open your browser and go to:
- **Dashboard**: http://localhost:3000
- **API Docs**: http://localhost:8000/docs

## Option 2: Manual Setup

### Backend

```bash
# 1. Navigate to backend
cd backend

# 2. Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # On macOS/Linux
# OR on Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set up environment
cp .env.example .env

# 5. Initialize database
python3 init_db.py

# 6. Seed trend data
python3 seed_trend_data.py

# 7. Start server
uvicorn main:app --reload --port 8000
```

### Frontend

Open a **new terminal**:

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env.local

# 4. Start server
npm run dev
```

## What You'll See

### Dashboard Features

1. **Interactive Map** with color-coded markers:
   - 🟢 Green = Low risk
   - 🟡 Yellow = Medium risk
   - 🔴 Red = High risk

2. **Risk Summary Cards** showing region counts by risk level

3. **Trend Chart** (NEW!) - Select any region to see risk trends over the last 7 days

4. **Offline Indicator** - Shows when using cached data

### Sample Data

The system includes 5 pre-loaded regions:
- Sahel Region (High risk)
- East Africa Highlands (Medium risk)
- Southern Africa Plains (Low risk)
- Horn of Africa (High risk)
- West Africa Coastal (Medium risk)

Each region has 7 days of historical climate data for trend visualization.

## Testing the API

Try these commands in a new terminal:

```bash
# Get all regions
curl http://localhost:8000/regions

# Get climate data
curl http://localhost:8000/climate

# Predict risk
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"temperature": 35, "rainfall": 40}'

# Get trend data for region 1
curl http://localhost:8000/regions/1/trends
```

## Troubleshooting

### Backend Issues

**"ModuleNotFoundError: No module named 'backend'"**
- ✓ Fixed! The imports have been updated to work from the backend directory

**"Virtual environment not activated"**
```bash
cd backend
source venv/bin/activate  # macOS/Linux
# OR: venv\Scripts\activate  # Windows
```

**"Database not found"**
```bash
cd backend
python3 init_db.py
python3 seed_trend_data.py
```

### Frontend Issues

**"Module not found" errors**
```bash
cd frontend
rm -rf node_modules
npm install
```

**"Cannot connect to API"**
- Make sure backend is running at http://localhost:8000
- Check `.env.local` has: `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000`

**Map not loading**
- Check browser console (F12) for errors
- Verify backend is returning data: `curl http://localhost:8000/regions`

### Port Already in Use

**Backend (port 8000)**
```bash
# Find and kill the process
lsof -ti:8000 | xargs kill -9
```

**Frontend (port 3000)**
```bash
# Find and kill the process
lsof -ti:3000 | xargs kill -9
```

## Next Steps

- Explore the **API documentation** at http://localhost:8000/docs
- Click on **map markers** to see region details
- Use the **trend chart** to analyze risk patterns over time
- Check the **README.md** for detailed documentation

## Need Help?

- Check the full **README.md** for detailed setup instructions
- Review **API documentation** at http://localhost:8000/docs
- Check browser console (F12) for frontend errors
- Check terminal output for backend errors

---

**Happy exploring! 🌍📊**
