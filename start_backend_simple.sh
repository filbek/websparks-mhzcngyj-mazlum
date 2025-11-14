#!/bin/bash

echo "🎵 Audio Editor Pro Backend - Simple Starter"
echo "==========================================="
echo

# Check if we're in the right directory
if [ -f "main.py" ]; then
    echo "✅ Found main.py in current directory"
    echo "🚀 Starting backend server..."
    python3 main.py
elif [ -f "backend/main.py" ]; then
    echo "✅ Found main.py in backend directory"
    echo "🚀 Starting backend server..."
    cd backend && python3 main.py
else
    echo "❌ main.py not found!"
    echo "Current directory: $(pwd)"
    echo "Files in current directory:"
    ls -la
    echo
    echo "Please navigate to the correct directory and try again."
    exit 1
fi
