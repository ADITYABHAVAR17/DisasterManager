import requests
import sys
import os

def test_api_health(api_url: str = "http://localhost:8000"):
    """Test the API health and status"""
    try:
        health_response = requests.get(f"{api_url}/health")
        print("=== API Health Check ===")
        health_data = health_response.json()
        print(f"Status: {health_data['status']}")
        print(f"Disaster Model Loaded: {health_data['disaster_model_loaded']}")
        print(f"Damage Model Loaded: {health_data['damage_model_loaded']}")
        print(f"Disaster Classes: {health_data['supported_disaster_classes']}")
        print(f"Damage Classes: {health_data['supported_damage_classes']}")
        print(f"Device: {health_data['damage_device']}")
        print("-" * 50)
        return health_data
    except Exception as e:
        print(f"Error connecting to API: {e}")
        return None

def test_disaster_prediction(image_path: str, api_url: str = "http://localhost:8000"):
    """Test disaster detection prediction"""
    if not os.path.exists(image_path):
        print(f"Error: Image file not found: {image_path}")
        return
    
    try:
        with open(image_path, 'rb') as f:
            files = {'file': (os.path.basename(image_path), f, 'image/jpeg')}
            response = requests.post(f"{api_url}/predict-disaster", files=files)
        
        if response.status_code == 200:
            result = response.json()
            print("=== Disaster Detection Result ===")
            print(f"Success: {result['success']}")
            print(f"Filename: {result['filename']}")
            print(f"Type: {result['type']}")
            
            prediction = result['prediction']
            print(f"Predicted Class: {prediction['predicted_class']}")
            print(f"Confidence: {prediction['confidence']:.4f}")
            print("\nAll Probabilities:")
            for class_name, prob in prediction['probabilities'].items():
                print(f"  {class_name}: {prob:.4f}")
            print("-" * 50)
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
    
    except Exception as e:
        print(f"Error making disaster prediction request: {e}")

def test_damage_prediction(image_path: str, api_url: str = "http://localhost:8000"):
    """Test damage assessment prediction"""
    if not os.path.exists(image_path):
        print(f"Error: Image file not found: {image_path}")
        return
    
    try:
        with open(image_path, 'rb') as f:
            files = {'file': (os.path.basename(image_path), f, 'image/jpeg')}
            response = requests.post(f"{api_url}/predict-damage", files=files)
        
        if response.status_code == 200:
            result = response.json()
            print("=== Damage Assessment Result ===")
            print(f"Success: {result['success']}")
            print(f"Filename: {result['filename']}")
            print(f"Type: {result['type']}")
            
            prediction = result['prediction']
            print(f"Predicted Class: {prediction['predicted_class']}")
            print(f"Confidence: {prediction['confidence']:.4f}")
            print("\nAll Probabilities:")
            for class_name, prob in prediction['probabilities'].items():
                print(f"  {class_name}: {prob:.4f}")
            print("-" * 50)
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
    
    except Exception as e:
        print(f"Error making damage prediction request: {e}")

def test_both_predictions(image_path: str, api_url: str = "http://localhost:8000"):
    """Test both disaster and damage prediction on the same image"""
    if not os.path.exists(image_path):
        print(f"Error: Image file not found: {image_path}")
        return
    
    try:
        with open(image_path, 'rb') as f:
            files = {'file': (os.path.basename(image_path), f, 'image/jpeg')}
            response = requests.post(f"{api_url}/predict-both", files=files)
        
        if response.status_code == 200:
            result = response.json()
            print("=== Combined Analysis Result ===")
            print(f"Success: {result['success']}")
            print(f"Filename: {result['filename']}")
            print(f"Type: {result['type']}")
            
            results = result['results']
            
            # Disaster detection results
            if 'disaster_detection' in results:
                disaster_result = results['disaster_detection']
                print("\n--- Disaster Detection ---")
                if disaster_result['success']:
                    pred = disaster_result['prediction']
                    print(f"Predicted: {pred['predicted_class']} ({pred['confidence']:.4f})")
                    print("Probabilities:")
                    for class_name, prob in pred['probabilities'].items():
                        print(f"  {class_name}: {prob:.4f}")
                else:
                    print(f"Error: {disaster_result['error']}")
            
            # Damage assessment results
            if 'damage_assessment' in results:
                damage_result = results['damage_assessment']
                print("\n--- Damage Assessment ---")
                if damage_result['success']:
                    pred = damage_result['prediction']
                    print(f"Predicted: {pred['predicted_class']} ({pred['confidence']:.4f})")
                    print("Probabilities:")
                    for class_name, prob in pred['probabilities'].items():
                        print(f"  {class_name}: {prob:.4f}")
                else:
                    print(f"Error: {damage_result['error']}")
            
            print("-" * 50)
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
    
    except Exception as e:
        print(f"Error making combined prediction request: {e}")

def test_batch_prediction(image_paths: list, prediction_type: str = "both", api_url: str = "http://localhost:8000"):
    """Test batch prediction"""
    
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
        data = {'prediction_type': prediction_type}
        response = requests.post(f"{api_url}/predict-batch", files=files, data=data)
        
        # Close file handles
        for _, (_, file_handle, _) in files:
            file_handle.close()
        
        if response.status_code == 200:
            result = response.json()
            print(f"=== Batch Prediction Results ({prediction_type}) ===")
            for item in result['results']:
                print(f"\nFile: {item['filename']}")
                if item['success']:
                    if 'disaster_prediction' in item:
                        pred = item['disaster_prediction']
                        print(f"  Disaster: {pred['predicted_class']} ({pred['confidence']:.4f})")
                    if 'damage_prediction' in item:
                        pred = item['damage_prediction']
                        print(f"  Damage: {pred['predicted_class']} ({pred['confidence']:.4f})")
                    if 'disaster_error' in item:
                        print(f"  Disaster Error: {item['disaster_error']}")
                    if 'damage_error' in item:
                        print(f"  Damage Error: {item['damage_error']}")
                else:
                    print(f"  Error: {item['error']}")
            print("-" * 50)
        else:
            print(f"Error: {response.status_code}")
            print(response.text)
    
    except Exception as e:
        print(f"Error making batch prediction request: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  Health check: python test_client_combined.py --health")
        print("  Single image (both models): python test_client_combined.py image.jpg")
        print("  Single image (disaster only): python test_client_combined.py image.jpg --disaster")
        print("  Single image (damage only): python test_client_combined.py image.jpg --damage")
        print("  Multiple images: python test_client_combined.py image1.jpg image2.jpg --batch")
        print("  Batch with specific type: python test_client_combined.py image1.jpg image2.jpg --batch --disaster")
        sys.exit(1)
    
    # Check for health check flag
    if "--health" in sys.argv:
        test_api_health()
        sys.exit(0)
    
    # Get image paths (exclude flags)
    image_paths = [arg for arg in sys.argv[1:] if not arg.startswith('--')]
    
    if not image_paths:
        print("No image files specified")
        sys.exit(1)
    
    # Test API health first
    health_data = test_api_health()
    if not health_data:
        sys.exit(1)
    
    # Determine prediction type and mode
    if "--batch" in sys.argv:
        # Batch mode
        if "--disaster" in sys.argv:
            test_batch_prediction(image_paths, "disaster")
        elif "--damage" in sys.argv:
            test_batch_prediction(image_paths, "damage")
        else:
            test_batch_prediction(image_paths, "both")
    else:
        # Single image mode
        image_path = image_paths[0]
        
        if "--disaster" in sys.argv:
            test_disaster_prediction(image_path)
        elif "--damage" in sys.argv:
            test_damage_prediction(image_path)
        else:
            # Test both models
            test_both_predictions(image_path)