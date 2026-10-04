@echo off
setlocal

REM Move to the directory where run.bat is located
cd /d "%~dp0"

echo ==========================================
echo        Starting AgriVision
echo ==========================================

REM Activate Virtual Environment if available
if exist "venv\Scripts\activate.bat" (
    echo Activating root virtual environment...
    call "venv\Scripts\activate.bat"
) else if exist "backend\venv\Scripts\activate.bat" (
    echo Activating backend virtual environment...
    call "backend\venv\Scripts\activate.bat"
) else (
    echo No virtual environment found.
)

echo.
echo ==========================================
echo  Starting AgriVision Backend (FastAPI)...
echo ==========================================

REM Start FastAPI backend in a separate window
start "AgriVision Backend" cmd /k "cd /d "%~dp0backend" && python -m uvicorn app.main:app --reload --port 8000"

REM Wait 2 seconds for backend to initialize
timeout /t 2 /nobreak >nul

echo.
echo ==========================================
echo  Starting AgriVision Frontend (Vite)...
echo ==========================================

REM Start frontend in a separate window
start "AgriVision Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ==========================================
echo      AgriVision Started Successfully
echo ==========================================
echo.
echo Backend:  http://127.0.0.1:8000
echo Frontend: http://localhost:5173
echo.
pause
