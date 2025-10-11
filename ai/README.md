# FastAPI Disaster Detection Backend

This FastAPI backend provides REST API endpoints for disaster detection using your trained model.

## Features

- **Image Upload & Prediction**: Upload images and get disaster type predictions
- **Batch Processing**: Process multiple images at once
- **CORS Support**: Ready for frontend integration
- **Health Checks**: Monitor API status
- **Model Management**: Load/reload models dynamically

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Make sure your `disaster.h5` model file is in the same directory

3. Start the server:
```bash
python fastapi_backend.py
```

Or using uvicorn directly:
```bash
uvicorn fastapi_backend:app --host 0.0.0.0 --port 8000 --reload
```

## API Endpoints

### Health Check
- **GET** `/` - Basic health check
- **GET** `/health` - Detailed health information

### Model Management
- **POST** `/load-model?model_path=disaster.h5` - Load or reload model

### Predictions
- **POST** `/predict` - Single image prediction
  - Upload: `multipart/form-data` with `file` field
  - Returns: JSON with prediction results

- **POST** `/predict-batch` - Batch image prediction
  - Upload: `multipart/form-data` with multiple `files`
  - Returns: JSON with results for each image

### Information
- **GET** `/classes` - Get supported disaster classes

## Usage Examples

### Single Image Prediction
```bash
curl -X POST "http://localhost:8000/predict" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@image.jpg"
```

### Python Client
```python
import requests

# Single prediction
with open('image.jpg', 'rb') as f:
    files = {'file': ('image.jpg', f, 'image/jpeg')}
    response = requests.post('http://localhost:8000/predict', files=files)
    result = response.json()
    print(result)
```

### Test Client
Use the provided test client:
```bash
python test_client.py image.jpg
```

## Response Format

### Single Prediction Response
```json
{
  "success": true,
  "filename": "image.jpg",
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

### Batch Prediction Response
```json
{
  "success": true,
  "results": [
    {
      "filename": "image1.jpg",
      "success": true,
      "prediction": { ... }
    },
    {
      "filename": "image2.jpg",
      "success": false,
      "error": "Error message"
    }
  ]
}
```

## Integration with Frontend

The API includes CORS middleware and is ready for frontend integration. You can make requests from your React frontend like this:

```javascript
const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('http://localhost:8000/predict', {
    method: 'POST',
    body: formData
  });
  
  return await response.json();
};
```

## Docker Support

To containerize the API:

```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "fastapi_backend:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Error Handling

The API includes comprehensive error handling:
- File validation (image types only)
- Model loading errors
- Prediction errors
- Batch size limits (max 10 files)

## Performance Notes

- Model is loaded once at startup for better performance
- Images are preprocessed to match model input requirements
- Supports common image formats (JPG, JPEG, PNG)
- Automatic format conversion (e.g., RGBA to RGB)