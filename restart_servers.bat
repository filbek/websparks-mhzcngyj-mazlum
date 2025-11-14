@echo off
echo 🔄 Audio Editor Pro - Server Restart
echo ====================================
echo.

REM Kill any existing processes
echo 🛑 Stopping existing servers...
taskkill /f /im node.exe 2>nul
taskkill /f /im python.exe 2>nul
timeout /t 2 /nobreak >nul

echo ✅ Existing servers stopped
echo.

REM Start backend server
echo 🚀 Starting backend server...
cd backend

REM Create directories if they don't exist
if not exist "uploads" mkdir uploads
if not exist "outputs" mkdir outputs
if not exist "temp" mkdir temp

REM Install/update dependencies
echo 📦 Installing backend dependencies...
python -m pip install --upgrade pip
python -m pip install -r requirements.txt

REM Start backend
echo 🎵 Starting backend on port 8000...
start /b python main.py

REM Wait for backend to start
timeout /t 5 /nobreak >nul

REM Go back to root directory
cd ..

REM Start frontend server
echo 🎨 Starting frontend server...
echo 📦 Installing frontend dependencies...
call npm install --legacy-peer-deps

echo 🚀 Starting frontend on port 5173...
call npm run dev

echo 🎉 Both servers should now be running!
echo Frontend: http://localhost:5173
echo Backend: http://localhost:8000
pause
