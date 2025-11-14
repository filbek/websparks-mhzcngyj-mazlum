#!/bin/bash

echo "🔄 Audio Editor Pro - Server Restart"
echo "===================================="
echo

# Kill any existing processes
echo "🛑 Stopping existing servers..."
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "python.*main.py" 2>/dev/null || true
pkill -f "uvicorn" 2>/dev/null || true

sleep 2

echo "✅ Existing servers stopped"
echo

# Start backend server
echo "🚀 Starting backend server..."
cd backend

# Create directories if they don't exist
mkdir -p uploads outputs temp

# Install/update dependencies
echo "📦 Installing backend dependencies..."
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements.txt

# Start backend in background
echo "🎵 Starting backend on port 8000..."
python3 main.py &
BACKEND_PID=$!

# Wait for backend to start
sleep 5

# Check if backend is running
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Backend server is running on http://localhost:8000"
else
    echo "❌ Backend server failed to start"
    kill $BACKEND_PID 2>/dev/null || true
    exit 1
fi

# Go back to root directory
cd ..

# Start frontend server
echo "🎨 Starting frontend server..."
echo "📦 Installing frontend dependencies..."
npm install --legacy-peer-deps

echo "🚀 Starting frontend on port 5173..."
npm run dev

echo "🎉 Both servers should now be running!"
echo "Frontend: http://localhost:5173"
echo "Backend: http://localhost:8000"
