@echo off
echo 🌪️ Starting Disaster Analysis System
echo =====================================
echo.

REM Check if model files exist
if not exist "disaster.h5" (
    echo ❌ WARNING: disaster.h5 model file not found!
    echo This is needed for disaster detection.
    echo.
    pause
    exit /b 1
)

if not exist "best_damage.pth" (
    echo ❌ WARNING: best_damage.pth model file not found!
    echo This is needed for damage assessment.
    echo.
    pause
    exit /b 1
)

echo ✅ Model files found
echo.

echo 🚀 Starting FastAPI backend server...
start "FastAPI Backend" cmd /k "python fastapi_backend.py"

echo ⏳ Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo 🌐 Starting UI server...
start "UI Server" cmd /k "python serve_ui.py"

echo.
echo 🎉 Both servers are starting!
echo.
echo 📋 Services:
echo   • FastAPI Backend: http://localhost:8000
echo   • Web UI: http://localhost:3000/disaster_ui.html
echo.
echo 💡 The UI will open automatically in your browser
echo 🛑 Close both command windows to stop the servers
echo.
pause