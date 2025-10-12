# FastAPI Disaster Detection & Damage Assessment Backend

This FastAPI backend provides REST API endpoints for both disaster detection and damage assessment using your trained models.

## Features

- **🌪️ Disaster Detection**: Classify disasters (Cyclone, Earthquake, Flood, Wildfire)
- **🏗️ Damage Assessment**: Assess damage levels (No-damage, Minor-damage, Major-damage, Destroyed)
- **🔄 Combined Analysis**: Run both models on the same image
- **📦 Batch Processing**: Process multiple images at once
- **🌐 CORS Support**: Ready for frontend integration
- **🔍 Health Checks**: Monitor API and model status
- **⚙️ Model Management**: Load/reload models dynamically

## Models Used

- **Disaster Detection**: TensorFlow/Keras model (`disaster.h5`)
- **Damage Assessment**: PyTorch model (`best_damage.pth`)

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Make sure your model files are in the same directory:
   - `disaster.h5` (TensorFlow disaster detection model)
   - `best_damage.pth` (PyTorch damage assessment model)

3. Start the server:
```bash
python fastapi_backend.py
```

Or using uvicorn directly:
```bash
uvicorn fastapi_backend:app --host 0.0.0.0 --port 8000 --reload
```

## API Endpoints

### Health & Information
- **GET** `/` - Basic health check with model status
- **GET** `/health` - Detailed health information
- **GET** `/classes` - Get all supported classes
- **GET** `/disaster-classes` - Get disaster classes only
- **GET** `/damage-classes` - Get damage classes only

### Model Management
- **POST** `/load-disaster-model?model_path=disaster.h5` - Load disaster model
- **POST** `/load-damage-model?model_path=best_damage.pth` - Load damage model

### Predictions
- **POST** `/predict-disaster` - Disaster detection only
- **POST** `/predict-damage` - Damage assessment only
- **POST** `/predict-both` - Both models on same image
- **POST** `/predict-batch` - Batch processing with type selection

## Usage Examples

### Health Check
```bash
python test_client_combined.py --health
```

### Single Image Analysis
```bash
# Both models
python test_client_combined.py image.jpg

# Disaster detection only
python test_client_combined.py image.jpg --disaster

# Damage assessment only
python test_client_combined.py image.jpg --damage
```

### Batch Processing
```bash
# Both models on multiple images
python test_client_combined.py image1.jpg image2.jpg image3.jpg --batch

# Disaster detection only on batch
python test_client_combined.py *.jpg --batch --disaster
```

### cURL Examples
```bash
# Disaster detection
curl -X POST "http://localhost:8000/predict-disaster" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@image.jpg"

# Damage assessment
curl -X POST "http://localhost:8000/predict-damage" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@image.jpg"

# Combined analysis
curl -X POST "http://localhost:8000/predict-both" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@image.jpg"
```

## Response Formats

### Disaster Detection Response
```json
{
  "success": true,
  "filename": "disaster.jpg",
  "type": "disaster_detection",
  "prediction": {
    "predicted_class": "Flood",
    "confidence": 0.8542,
    "probabilities": {
      "Cyclone": 0.0234,
      "Earthquake": 0.1224,
      "Flood": 0.8542,
      "Wildfire": 0.0000
    }
  }
}
```

### Damage Assessment Response
```json
{
  "success": true,
  "filename": "damage.jpg",
  "type": "damage_assessment",
  "prediction": {
    "predicted_class": "Major-damage",
    "confidence": 0.7834,
    "probabilities": {
      "No-damage": 0.0123,
      "Minor-damage": 0.2043,
      "Major-damage": 0.7834,
      "Destroyed": 0.0000
    }
  }
}
```

### Combined Analysis Response
```json
{
  "success": true,
  "filename": "combined.jpg",
  "type": "combined_analysis",
  "results": {
    "disaster_detection": {
      "success": true,
      "prediction": { /* disaster prediction */ }
    },
    "damage_assessment": {
      "success": true,
      "prediction": { /* damage prediction */ }
    }
  }
}
```

### Batch Processing Response
```json
{
  "success": true,
  "prediction_type": "both",
  "results": [
    {
      "filename": "image1.jpg",
      "success": true,
      "disaster_prediction": { /* disaster results */ },
      "damage_prediction": { /* damage results */ }
    },
    {
      "filename": "image2.jpg",
      "success": false,
      "error": "Error message"
    }
  ]
}
```

## Frontend Integration

The API includes CORS middleware and is ready for frontend integration:

```javascript
// Single prediction
const uploadForDisaster = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('http://localhost:8000/predict-disaster', {
    method: 'POST',
    body: formData
  });
  
  return await response.json();
};

// Combined analysis
const uploadForBoth = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('http://localhost:8000/predict-both', {
    method: 'POST',
    body: formData
  });
  
  return await response.json();
};

// Batch processing
const uploadBatch = async (files, type = 'both') => {
  const formData = new FormData();
  files.forEach(file => formData.append('files', file));
  formData.append('prediction_type', type);
  
  const response = await fetch('http://localhost:8000/predict-batch', {
    method: 'POST',
    body: formData
  });
  
  return await response.json();
};
```

## Model Architecture

### Disaster Detection Model
- **Framework**: TensorFlow/Keras
- **Input Size**: 64x64 RGB images
- **Classes**: 4 disaster types
- **Output**: Softmax probabilities

### Damage Assessment Model
- **Framework**: PyTorch
- **Architecture**: Custom CNN with dropout
- **Input Size**: 64x64 RGB images
- **Classes**: 4 damage levels
- **Output**: Softmax probabilities

## Error Handling

The API includes comprehensive error handling:
- File validation (image types only)
- Model loading errors
- Prediction errors
- Batch size limits (max 10 files)
- Individual model failures in combined mode

## Performance Notes

- Models are loaded once at startup for better performance
- GPU acceleration automatically used if available (PyTorch)
- Images are preprocessed to match model requirements
- Supports common image formats (JPG, JPEG, PNG)
- Automatic format conversion and normalization

## Docker Support

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "fastapi_backend:app", "--host", "0.0.0.0", "--port", "8000"]
```

Run with Docker:
```bash
docker build -t disaster-api .
docker run -p 8000:8000 disaster-api
```