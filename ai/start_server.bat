@echo off
echo Starting FastAPI Disaster Detection & Damage Assessment Server...
echo.

REM Check if model files exist
if not exist "disaster.h5" (
    echo WARNING: disaster.h5 model file not found!
    echo This is needed for disaster detection.
    echo.
)

if not exist "best_damage.pth" (
    echo WARNING: best_damage.pth model file not found!
    echo This is needed for damage assessment.
    echo.
)

REM Install dependencies if needed
echo Installing/updating dependencies...
pip install fastapi uvicorn python-multipart pillow requests tensorflow torch torchvision numpy

echo.
echo Starting server on http://localhost:8000
echo.
echo Available endpoints:
echo   GET  /health              - Health check
echo   POST /predict-disaster    - Disaster detection only
echo   POST /predict-damage      - Damage assessment only  
echo   POST /predict-both        - Combined analysis
echo   POST /predict-batch       - Batch processing
echo   GET  /classes             - Get all supported classes
echo.
echo Test the API:
echo   python test_client_combined.py --health
echo   python test_client_combined.py image.jpg
echo   python test_client_combined.py image.jpg --disaster
echo   python test_client_combined.py image.jpg --damage
echo.
echo Press Ctrl+C to stop the server
echo.

uvicorn fastapi_backend:app --host 0.0.0.0 --port 8000 --reload