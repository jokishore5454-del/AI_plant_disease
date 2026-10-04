#!/usr/bin/env bash

# Move to the root directory where run.sh is located
cd "$(dirname "$0")"

# Activate Virtual Environment if available
if [ -d "venv" ] && [ -f "venv/bin/activate" ]; then
    source venv/bin/activate
elif [ -d "backend/venv" ] && [ -f "backend/venv/bin/activate" ]; then
    source backend/venv/bin/activate
fi

# Clean up background jobs on exit (Ctrl+C)
cleanup() {
    echo ""
    echo "Stopping AgriVision services..."
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null
    fi
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

echo "=========================================="
echo " Starting AgriVision Backend (FastAPI)..."
echo "=========================================="
(
    cd backend || exit 1
    # Run uvicorn via python module
    python3 -m uvicorn app.main:app --reload --port 8000
) &
BACKEND_PID=$!

# Wait briefly for backend to initialize
sleep 2

echo "=========================================="
echo " Starting AgriVision Frontend (Vite)..."
echo "=========================================="
cd frontend || exit 1
npm run dev