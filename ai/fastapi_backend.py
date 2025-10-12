from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import torch
from torchvision import transforms
import os
import io
from PIL import Image
import uvicorn
from typing import Dict, List, Optional
from damage_model import create_damage_model

app = FastAPI(title="Disaster Detection & Damage Assessment API", version="2.0.0")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for disaster detection
DISASTER_MODEL = None
DISASTER_CLASSES = ["Cyclone", "Earthquake", "Flood", "Wildfire"]
DISASTER_MODEL_INPUT_SIZE = (64, 64)  # Default size

# Global variables for damage assessment
DAMAGE_MODEL = None
DAMAGE_CLASSES = ["No-damage", "Minor-damage", "Major-damage", "Destroyed"]
DAMAGE_DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

def load_disaster_model(model_path: str = "disaster.h5"):
    """Load the disaster detection model"""
    global DISASTER_MODEL, DISASTER_MODEL_INPUT_SIZE
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Disaster model file not found: {model_path}")
    
    DISASTER_MODEL = load_model(model_path)
    
    # Get the model's expected input size
    inp = DISASTER_MODEL.input_shape
    if inp and len(inp) == 4 and inp[1] and inp[2]:
        DISASTER_MODEL_INPUT_SIZE = (inp[1], inp[2])
    
    print(f"Disaster model loaded successfully. Input shape: {DISASTER_MODEL.input_shape}")
    print(f"Using input size: {DISASTER_MODEL_INPUT_SIZE}")

def load_damage_model(model_path: str = "best_damage.pth"):
    """Load the damage assessment model"""
    global DAMAGE_MODEL
    
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Damage model file not found: {model_path}")
    
    DAMAGE_MODEL = create_damage_model().to(DAMAGE_DEVICE)
    checkpoint = torch.load(model_path, map_location=DAMAGE_DEVICE)
    DAMAGE_MODEL.load_state_dict(checkpoint['model_state_dict'])
    DAMAGE_MODEL.eval()
    
    print(f"Damage model loaded successfully from: {model_path}")
    print(f"Using device: {DAMAGE_DEVICE}")

def preprocess_image_for_disaster(image_bytes: bytes) -> np.ndarray:
    """Preprocess the uploaded image for disaster model prediction"""
    try:
        # Convert bytes to PIL Image
        img = Image.open(io.BytesIO(image_bytes))
        
        # Convert to RGB if necessary
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Resize to model's expected size
        img = img.resize(DISASTER_MODEL_INPUT_SIZE)
        
        # Convert to array and normalize
        img_array = np.array(img).astype("float32") / 255.0
        
        # Add batch dimension
        img_array = np.expand_dims(img_array, 0)
        
        return img_array
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing image for disaster detection: {str(e)}")

def preprocess_image_for_damage(image_bytes: bytes) -> torch.Tensor:
    """Preprocess the uploaded image for damage model prediction"""
    try:
        # Convert bytes to PIL Image
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        
        # PyTorch transforms for damage model
        transform = transforms.Compose([
            transforms.Resize((64, 64)),
            transforms.ToTensor()
        ])
        
        # Apply transforms and add batch dimension
        img_tensor = transform(img).unsqueeze(0).to(DAMAGE_DEVICE)
        
        return img_tensor
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing image for damage assessment: {str(e)}")

def softmax(v: np.ndarray) -> np.ndarray:
    """Apply softmax to convert logits to probabilities"""
    e = np.exp(v - np.max(v))
    return e / e.sum()

def make_disaster_prediction(img_array: np.ndarray) -> Dict:
    """Make disaster prediction using the loaded model"""
    if DISASTER_MODEL is None:
        raise HTTPException(status_code=500, detail="Disaster model not loaded")
    
    try:
        # Get model predictions
        preds = DISASTER_MODEL.predict(img_array)
        preds = preds.flatten()
        
        # Convert to probabilities if needed
        if preds.max() > 1.0 or preds.min() < 0.0 or not np.isclose(preds.sum(), 1.0):
            probs = softmax(preds)
        else:
            probs = preds / preds.sum()
        
        # Get the top prediction
        top_idx = int(np.argmax(probs))
        predicted_class = DISASTER_CLASSES[top_idx] if top_idx < len(DISASTER_CLASSES) else f"class_{top_idx}"
        confidence = float(probs[top_idx])
        
        # Create probability dictionary
        probabilities = {}
        for i, class_name in enumerate(DISASTER_CLASSES):
            prob = float(probs[i]) if i < len(probs) else 0.0
            probabilities[class_name] = prob
        
        return {
            "predicted_class": predicted_class,
            "confidence": confidence,
            "probabilities": probabilities
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error making disaster prediction: {str(e)}")

def make_damage_prediction(img_tensor: torch.Tensor) -> Dict:
    """Make damage assessment prediction using the loaded model"""
    if DAMAGE_MODEL is None:
        raise HTTPException(status_code=500, detail="Damage model not loaded")
    
    try:
        with torch.no_grad():
            outputs = DAMAGE_MODEL(img_tensor)
            probs = torch.softmax(outputs, dim=1).cpu().numpy()[0]
            pred_idx = int(probs.argmax())
            predicted_class = DAMAGE_CLASSES[pred_idx]
            confidence = float(probs[pred_idx])
            
            # Create probability dictionary
            probabilities = {}
            for i, class_name in enumerate(DAMAGE_CLASSES):
                prob = float(probs[i]) if i < len(probs) else 0.0
                probabilities[class_name] = prob
            
            return {
                "predicted_class": predicted_class,
                "confidence": confidence,
                "probabilities": probabilities
            }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error making damage prediction: {str(e)}")

@app.on_event("startup")
async def startup_event():
    """Load both models when the app starts"""
    try:
        load_disaster_model()
        print("✓ Disaster detection model loaded successfully")
    except Exception as e:
        print(f"⚠ Warning: Could not load disaster model: {e}")
    
    try:
        load_damage_model()
        print("✓ Damage assessment model loaded successfully")
    except Exception as e:
        print(f"⚠ Warning: Could not load damage model: {e}")
    
    if DISASTER_MODEL is None and DAMAGE_MODEL is None:
        print("⚠ Warning: No models loaded. Use /load-models endpoint to load them manually")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Disaster Detection & Damage Assessment API is running",
        "disaster_model_loaded": DISASTER_MODEL is not None,
        "damage_model_loaded": DAMAGE_MODEL is not None,
        "disaster_classes": DISASTER_CLASSES,
        "damage_classes": DAMAGE_CLASSES
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "disaster_model_loaded": DISASTER_MODEL is not None,
        "damage_model_loaded": DAMAGE_MODEL is not None,
        "disaster_model_input_size": DISASTER_MODEL_INPUT_SIZE,
        "damage_device": str(DAMAGE_DEVICE),
        "supported_disaster_classes": DISASTER_CLASSES,
        "supported_damage_classes": DAMAGE_CLASSES
    }

@app.post("/load-disaster-model")
async def load_disaster_model_endpoint(model_path: str = "disaster.h5"):
    """Manually load or reload the disaster detection model"""
    try:
        load_disaster_model(model_path)
        return {
            "message": "Disaster model loaded successfully",
            "model_input_size": DISASTER_MODEL_INPUT_SIZE
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load disaster model: {str(e)}")

@app.post("/load-damage-model")
async def load_damage_model_endpoint(model_path: str = "best_damage.pth"):
    """Manually load or reload the damage assessment model"""
    try:
        load_damage_model(model_path)
        return {
            "message": "Damage model loaded successfully",
            "device": str(DAMAGE_DEVICE)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load damage model: {str(e)}")

@app.post("/predict-disaster")
async def predict_disaster(file: UploadFile = File(...)):
    """
    Predict disaster type from uploaded image
    
    Args:
        file: Image file (jpg, jpeg, png)
    
    Returns:
        JSON with disaster prediction results
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
        img_array = preprocess_image_for_disaster(image_bytes)
        
        # Make prediction
        result = make_disaster_prediction(img_array)
        
        return JSONResponse(content={
            "success": True,
            "filename": file.filename,
            "type": "disaster_detection",
            "prediction": result
        })
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Disaster prediction failed: {str(e)}")

@app.post("/predict-damage")
async def predict_damage(file: UploadFile = File(...)):
    """
    Predict damage level from uploaded image
    
    Args:
        file: Image file (jpg, jpeg, png)
    
    Returns:
        JSON with damage assessment results
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
        img_tensor = preprocess_image_for_damage(image_bytes)
        
        # Make prediction
        result = make_damage_prediction(img_tensor)
        
        return JSONResponse(content={
            "success": True,
            "filename": file.filename,
            "type": "damage_assessment",
            "prediction": result
        })
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Damage prediction failed: {str(e)}")

@app.post("/predict-both")
async def predict_both(file: UploadFile = File(...)):
    """
    Predict both disaster type and damage level from uploaded image
    
    Args:
        file: Image file (jpg, jpeg, png)
    
    Returns:
        JSON with both disaster and damage predictions
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
        
        results = {}
        
        # Try disaster prediction
        try:
            img_array = preprocess_image_for_disaster(image_bytes)
            disaster_result = make_disaster_prediction(img_array)
            results["disaster_detection"] = {
                "success": True,
                "prediction": disaster_result
            }
        except Exception as e:
            results["disaster_detection"] = {
                "success": False,
                "error": str(e)
            }
        
        # Try damage prediction
        try:
            img_tensor = preprocess_image_for_damage(image_bytes)
            damage_result = make_damage_prediction(img_tensor)
            results["damage_assessment"] = {
                "success": True,
                "prediction": damage_result
            }
        except Exception as e:
            results["damage_assessment"] = {
                "success": False,
                "error": str(e)
            }
        
        return JSONResponse(content={
            "success": True,
            "filename": file.filename,
            "type": "combined_analysis",
            "results": results
        })
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Combined prediction failed: {str(e)}")

@app.post("/predict-batch")
async def predict_batch(
    files: List[UploadFile] = File(...),
    prediction_type: str = "both"  # "disaster", "damage", or "both"
):
    """
    Predict disaster types and/or damage levels for multiple images
    
    Args:
        files: List of image files
        prediction_type: Type of prediction ("disaster", "damage", or "both")
    
    Returns:
        JSON with prediction results for each image
    """
    if len(files) > 10:  # Limit batch size
        raise HTTPException(status_code=400, detail="Maximum 10 files allowed per batch")
    
    if prediction_type not in ["disaster", "damage", "both"]:
        raise HTTPException(status_code=400, detail="prediction_type must be 'disaster', 'damage', or 'both'")
    
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
            
            # Read image bytes
            image_bytes = await file.read()
            file_result = {"filename": file.filename, "success": True}
            
            if prediction_type in ["disaster", "both"]:
                try:
                    img_array = preprocess_image_for_disaster(image_bytes)
                    disaster_pred = make_disaster_prediction(img_array)
                    file_result["disaster_prediction"] = disaster_pred
                except Exception as e:
                    file_result["disaster_error"] = str(e)
            
            if prediction_type in ["damage", "both"]:
                try:
                    img_tensor = preprocess_image_for_damage(image_bytes)
                    damage_pred = make_damage_prediction(img_tensor)
                    file_result["damage_prediction"] = damage_pred
                except Exception as e:
                    file_result["damage_error"] = str(e)
            
            results.append(file_result)
        
        except Exception as e:
            results.append({
                "filename": file.filename,
                "success": False,
                "error": str(e)
            })
    
    return JSONResponse(content={
        "success": True,
        "prediction_type": prediction_type,
        "results": results
    })

@app.get("/classes")
async def get_classes():
    """Get list of supported classes for both models"""
    return {
        "disaster_classes": DISASTER_CLASSES,
        "damage_classes": DAMAGE_CLASSES,
        "disaster_count": len(DISASTER_CLASSES),
        "damage_count": len(DAMAGE_CLASSES)
    }

@app.get("/disaster-classes")
async def get_disaster_classes():
    """Get list of supported disaster classes"""
    return {
        "classes": DISASTER_CLASSES,
        "count": len(DISASTER_CLASSES)
    }

@app.get("/damage-classes")
async def get_damage_classes():
    """Get list of supported damage classes"""
    return {
        "classes": DAMAGE_CLASSES,
        "count": len(DAMAGE_CLASSES)
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