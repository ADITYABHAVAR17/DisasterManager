from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import os
import io
from PIL import Image
import uvicorn
from typing import Dict, List

app = FastAPI(title="Disaster Detection API", version="1.0.0")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables
MODEL = None
CLASSES = ["Cyclone", "Earthquake", "Flood", "Wildfire"]
MODEL_INPUT_SIZE = (64, 64)  # Default size

def load_disaster_model(model_path: str = "disaster.h5"):
    """Load the disaster detection model"""
    global MODEL, MODEL_INPUT_SIZE
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model file not found: {model_path}")
    
    MODEL = load_model(model_path)
    
    # Get the model's expected input size
    inp = MODEL.input_shape
    if inp and len(inp) == 4 and inp[1] and inp[2]:
        MODEL_INPUT_SIZE = (inp[1], inp[2])
    
    print(f"Model loaded successfully. Input shape: {MODEL.input_shape}")
    print(f"Using input size: {MODEL_INPUT_SIZE}")

def preprocess_image(image_bytes: bytes) -> np.ndarray:
    """Preprocess the uploaded image for model prediction"""
    try:
        # Convert bytes to PIL Image
        img = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if necessary
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize to model's expected size
        img = img.resize(MODEL_INPUT_SIZE)
        
        # Convert to array and normalize
        img_array = np.array(img).astype("float32") / 255.0
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, 0)
        
        return img_array
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing image: {str(e)}")

def softmax(v: np.ndarray) -> np.ndarray:
    """Apply softmax to convert logits to probabilities"""
    e = np.exp(v - np.max(v))
    return e / e.sum()

def make_prediction(img_array: np.ndarray) -> Dict:
    """Make prediction using the loaded model"""
    if MODEL is None:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    try:
        # Get model predictions
        preds = MODEL.predict(img_array)
        preds = preds.flatten()
        
        # Convert to probabilities if needed
        if preds.max() > 1.0 or preds.min() < 0.0 or not np.isclose(preds.sum(), 1.0):
            probs = softmax(preds)
        else:
            probs = preds / preds.sum()
        
        # Get the top prediction
        top_idx = int(np.argmax(probs))
        predicted_class = CLASSES[top_idx] if top_idx < len(CLASSES) else f"class_{top_idx}"
        confidence = float(probs[top_idx])
        
        # Create probability dictionary
        probabilities = {}
        for i, class_name in enumerate(CLASSES):
            prob = float(probs[i]) if i < len(probs) else 0.0
            probabilities[class_name] = prob
        
        return {
            "predicted_class": predicted_class,
            "confidence": confidence,
            "probabilities": probabilities
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error making prediction: {str(e)}")

@app.on_event("startup")
async def startup_event():
    """Load the model when the app starts"""
    try:
        load_disaster_model()
    except Exception as e:
        print(f"Warning: Could not load model on startup: {e}")
        print("Model will need to be loaded manually via /load-model endpoint")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Disaster Detection API is running",
        "model_loaded": MODEL is not None,
        "classes": CLASSES
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "model_loaded": MODEL is not None,
        "model_input_size": MODEL_INPUT_SIZE,
        "supported_classes": CLASSES
    }

@app.post("/load-model")
async def load_model_endpoint(model_path: str = "disaster.h5"):
    """Manually load or reload the model"""
    try:
        load_disaster_model(model_path)
        return {
            "message": "Model loaded successfully",
            "model_input_size": MODEL_INPUT_SIZE
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load model: {str(e)}")

@app.post("/predict")
async def predict_disaster(file: UploadFile = File(...)):
    """
    Predict disaster type from uploaded image
    
    Args:
        file: Image file (jpg, jpeg, png)
    
    Returns:
        JSON with prediction results
    """
    # Validate file type
    if not file.content_type.startswith('image/'):
        raise HTTPException(
            status_code=400, 
            detail="File must be an image (jpg, jpeg, png)"
        )
    
    try:
        # Read image bytes
        image_bytes = await file.read()
        
        # Preprocess image
        img_array = preprocess_image(image_bytes)
        
        # Make prediction
        result = make_prediction(img_array)
        
        return JSONResponse(content={
            "success": True,
            "filename": file.filename,
            "prediction": result
        })
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/predict-batch")
async def predict_batch(files: List[UploadFile] = File(...)):
    """
    Predict disaster types for multiple images
    
    Args:
        files: List of image files
    
    Returns:
        JSON with prediction results for each image
    """
    if len(files) > 10:  # Limit batch size
        raise HTTPException(status_code=400, detail="Maximum 10 files allowed per batch")
    
    results = []
    
    for file in files:
        try:
            # Validate file type
            if not file.content_type.startswith('image/'):
                results.append({
                    "filename": file.filename,
                    "success": False,
                    "error": "File must be an image"
                })
                continue
            
            # Read and process image
            image_bytes = await file.read()
            img_array = preprocess_image(image_bytes)
            prediction = make_prediction(img_array)
            
            results.append({
                "filename": file.filename,
                "success": True,
                "prediction": prediction
            })
        
        except Exception as e:
            results.append({
                "filename": file.filename,
                "success": False,
                "error": str(e)
            })
    
    return JSONResponse(content={
        "success": True,
        "results": results
    })

@app.get("/classes")
async def get_classes():
    """Get list of supported disaster classes"""
    return {
        "classes": CLASSES,
        "count": len(CLASSES)
    }

if __name__ == "__main__":
    # Run the server
    uvicorn.run(
        "fastapi_backend:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )