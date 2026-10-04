@echo off
setlocal enabledelayedexpansion

:: Navigate to root directory
cd /d "%~dp0"

echo ==========================================
echo  Starting AgriVision Backend (FastAPI)...
echo ==========================================

:: Start backend in a separate terminal window
start "AgriVision Backend" cmd /k "if exist venv\Scripts\activate.bat (call venv\Scripts\activate.bat) else if exist backend\venv\Scripts\activate.bat (call backend\venv\Scripts\activate.bat) & cd backend & python -m uvicorn app.main:app --reload --port 8000"

:: Wait 3 seconds for backend to spin up
timeout /t 3 /nobreak >nul

echo ==========================================
echo  Starting AgriVision Frontend (Vite)...
echo ==========================================
cd frontend
npm run dev