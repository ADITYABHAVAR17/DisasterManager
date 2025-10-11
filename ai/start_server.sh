#!/bin/bash

echo "Starting FastAPI Disaster Detection Server..."
echo

# Check if model file exists
if [ ! -f "disaster.h5" ]; then
    echo "WARNING: disaster.h5 model file not found!"
    echo "Please make sure the model file is in this directory."
    echo
fi

# Install dependencies if needed
echo "Installing/updating dependencies..."
pip install fastapi uvicorn python-multipart pillow requests tensorflow numpy

echo
echo "Starting server on http://localhost:8000"
echo
echo "Available endpoints:"
echo "  GET  /health          - Health check"
echo "  POST /predict         - Single image prediction"
echo "  POST /predict-batch   - Batch image prediction"
echo "  GET  /classes         - Get supported classes"
echo
echo "Press Ctrl+C to stop the server"
echo

uvicorn fastapi_backend:app --host 0.0.0.0 --port 8000 --reload