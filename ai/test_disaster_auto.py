# test_disaster_fixed.py
import sys
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing import image
import os

CLASSES = ["Cyclone", "Earthquake", "Flood", "Wildfire"]

def load_and_prep(path, size):
    # size should be (height, width)
    img = image.load_img(path, target_size=size)
    arr = image.img_to_array(img).astype("float32") / 255.0
    arr = np.expand_dims(arr, 0)  # shape (1, h, w, c)
    return arr

def softmax(v):
    e = np.exp(v - np.max(v))
    return e / e.sum()

def main():
    if len(sys.argv) < 2:
        print("Usage: python test_disaster_fixed.py path/to/image.jpg [path/to/disaster.h5]")
        return

    img_path = sys.argv[1]
    model_path = sys.argv[2] if len(sys.argv) > 2 else "disaster.h5"

    if not os.path.exists(img_path):
        print("Image not found:", img_path); return
    if not os.path.exists(model_path):
        print("Model not found:", model_path); return

    model = load_model(model_path)
    print("Model expects input shape:", model.input_shape)

    # Use the model's expected size if available, otherwise default to (64,64)
    inp = model.input_shape  # (None, h, w, c) expected
    if inp and len(inp) == 4 and inp[1] and inp[2]:
        size = (inp[1], inp[2])
    else:
        size = (64, 64)

    print("Resizing image to (height,width) =", size)
    x = load_and_prep(img_path, size)

    # Predict
    preds = model.predict(x)
    preds = preds.flatten()
    # convert to probabilities if needed
    if preds.max() > 1.0 or preds.min() < 0.0 or not np.isclose(preds.sum(), 1.0):
        probs = softmax(preds)
    else:
        probs = preds / preds.sum()

    top = int(np.argmax(probs))
    label = CLASSES[top] if top < len(CLASSES) else f"class_{top}"
    print("Predicted:", label)
    print("Probabilities:")
    for i, c in enumerate(CLASSES):
        p = float(probs[i]) if i < probs.shape[0] else 0.0
        print(f"  {c}: {p:.4f}")

if __name__ == "__main__":
    main()
