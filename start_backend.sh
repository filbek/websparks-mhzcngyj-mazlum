#!/bin/bash

echo "🎵 Audio Editor Pro Backend Starter"
echo "====================================="
echo

cd backend

echo "Checking Python..."
python3 --version
if [ $? -ne 0 ]; then
    echo "❌ Python not found! Please install Python 3.8+"
    exit 1
fi

echo
echo "Installing dependencies..."
python3 -m pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo
echo "Creating directories..."
mkdir -p uploads outputs temp

echo
echo "🚀 Starting backend server..."
echo "Server will be available at: http://localhost:8000"
echo "API Documentation: http://localhost:8000/docs"
echo
echo "Press Ctrl+C to stop the server"
echo "====================================="

python3 main.py
