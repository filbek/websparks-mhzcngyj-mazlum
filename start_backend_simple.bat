@echo off
echo 🎵 Audio Editor Pro Backend - Simple Starter
echo ===========================================
echo.

REM Check if we're in the right directory
if exist "main.py" (
    echo ✅ Found main.py in current directory
    echo 🚀 Starting backend server...
    python main.py
) else if exist "backend\main.py" (
    echo ✅ Found main.py in backend directory
    echo 🚀 Starting backend server...
    cd backend && python main.py
) else (
    echo ❌ main.py not found!
    echo Current directory: %cd%
    echo Files in current directory:
    dir
    echo.
    echo Please navigate to the correct directory and try again.
    pause
    exit /b 1
)
