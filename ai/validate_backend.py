#!/usr/bin/env python3
"""
Simple validation script to check if the FastAPI backend can start without runtime errors.
This checks imports and basic structure without starting the server.
"""

import sys
import os

def check_imports():
    """Check if all required imports can be loaded"""
    try:
        print("Checking imports...")
        
        # Check FastAPI imports
        from fastapi import FastAPI, File, UploadFile, HTTPException
        from fastapi.middleware.cors import CORSMiddleware
        from fastapi.responses import JSONResponse
        print("✓ FastAPI imports successful")
        
        # Check basic Python imports
        import numpy as np
        from PIL import Image
        import io
        from typing import Dict, List, Optional
        print("✓ Basic Python imports successful")
        
        # Check if model files exist
        model_files = {
            "disaster.h5": "Disaster detection model",
            "best_damage.pth": "Damage assessment model"
        }
        
        for file, description in model_files.items():
            if os.path.exists(file):
                print(f"✓ {description} found: {file}")
            else:
                print(f"⚠ {description} not found: {file}")
        
        # Try to import the damage model (might fail if torch not installed)
        try:
            from damage_model import create_damage_model
            print("✓ Damage model import successful")
        except ImportError as e:
            print(f"⚠ Damage model import failed: {e}")
        
        # Try to import ML frameworks (might fail if not installed)
        try:
            import torch
            import torchvision
            print("✓ PyTorch imports successful")
        except ImportError as e:
            print(f"⚠ PyTorch not available: {e}")
        
        try:
            import tensorflow as tf
            print("✓ TensorFlow imports successful")
        except ImportError as e:
            print(f"⚠ TensorFlow not available: {e}")
        
        return True
        
    except Exception as e:
        print(f"❌ Import check failed: {e}")
        return False

def check_syntax():
    """Check if the FastAPI backend file has valid syntax"""
    try:
        print("\nChecking syntax...")
        with open("fastapi_backend.py", 'r') as f:
            code = f.read()
        
        compile(code, "fastapi_backend.py", "exec")
        print("✓ FastAPI backend syntax is valid")
        return True
        
    except SyntaxError as e:
        print(f"❌ Syntax error in fastapi_backend.py: {e}")
        return False
    except Exception as e:
        print(f"❌ Error checking syntax: {e}")
        return False

def main():
    print("FastAPI Backend Validation")
    print("=" * 40)
    
    syntax_ok = check_syntax()
    imports_ok = check_imports()
    
    print("\n" + "=" * 40)
    if syntax_ok and imports_ok:
        print("✅ Validation successful! Backend should start properly.")
        print("\nTo start the server:")
        print("  python fastapi_backend.py")
        print("  OR")
        print("  uvicorn fastapi_backend:app --host 0.0.0.0 --port 8000 --reload")
    else:
        print("❌ Validation failed. Please check the errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()