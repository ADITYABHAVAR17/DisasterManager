import requests
import sys
import os

def test_api(image_path: str, api_url: str = "http://localhost:8000"):
    """Test the FastAPI disaster prediction endpoint"""
    
    if not os.path.exists(image_path):
        print(f"Error: Image file not found: {image_path}")
        return
    
    # Test health endpoint
    try:
        health_response = requests.get(f"{api_url}/health")
        print("API Health Check:")
        print(health_response.json())
        print("-" * 50)
    except Exception as e:
        print(f"Error connecting to API: {e}")
        return
    
    # Test prediction endpoint
    try:
        with open(image_path, 'rb') as f:
            files = {'file': (os.path.basename(image_path), f, 'image/jpeg')}
            response = requests.post(f"{api_url}/predict", files=files)
        
        if response.status_code == 200:
            result = response.json()
            print("Prediction Result:")
            print(f"Success: {result['success']}")
            print(f"Filename: {result['filename']}")
            
            prediction = result['prediction']
            print(f"Predicted Class: {prediction['predicted_class']}")
            print(f"Confidence: {prediction['confidence']:.4f}")
            print("\nAll Probabilities:")
            for class_name, prob in prediction['probabilities'].items():
                print(f"  {class_name}: {prob:.4f}")
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
    
    except Exception as e:
        print(f"Error making prediction request: {e}")

def test_batch_api(image_paths: list, api_url: str = "http://localhost:8000"):
    """Test the batch prediction endpoint"""
    
    files = []
    for path in image_paths:
        if os.path.exists(path):
            files.append(('files', (os.path.basename(path), open(path, 'rb'), 'image/jpeg')))
        else:
            print(f"Warning: Skipping missing file: {path}")
    
    if not files:
        print("No valid image files found")
        return
    
    try:
        response = requests.post(f"{api_url}/predict-batch", files=files)
        
        # Close file handles
        for _, (_, file_handle, _) in files:
            file_handle.close()
        
        if response.status_code == 200:
            result = response.json()
            print("Batch Prediction Results:")
            for item in result['results']:
                print(f"\nFile: {item['filename']}")
                if item['success']:
                    pred = item['prediction']
                    print(f"  Predicted: {pred['predicted_class']} ({pred['confidence']:.4f})")
                else:
                    print(f"  Error: {item['error']}")
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
    
    except Exception as e:
        print(f"Error making batch prediction request: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  Single image: python test_client.py image.jpg")
        print("  Multiple images: python test_client.py image1.jpg image2.jpg image3.jpg")
        sys.exit(1)
    
    image_paths = sys.argv[1:]
    
    if len(image_paths) == 1:
        test_api(image_paths[0])
    else:
        test_batch_api(image_paths)