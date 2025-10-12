import torch
from PIL import Image
from torchvision import transforms
import sys

# Import your DamageCNN class
from damage_model import create_damage_model  # adjust if file is named differently

CLASSES = ["No-damage", "Minor-damage", "Major-damage", "Destroyed"]

def main():
    if len(sys.argv) < 2:
        print("Usage: python test_damage_checkpoint.py path/to/patch.jpg [path/to/best_damage.pth]")
        return

    img_path = sys.argv[1]
    model_path = sys.argv[2] if len(sys.argv) > 2 else "best_damage.pth"

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # Create model and load checkpoint
    model = create_damage_model().to(device)
    checkpoint = torch.load(model_path, map_location=device)
    model.load_state_dict(checkpoint['model_state_dict'])
    model.eval()

    # Load and preprocess image
    img = Image.open(img_path).convert("RGB")
    transform = transforms.Compose([
        transforms.Resize((64,64)),
        transforms.ToTensor()
    ])
    x = transform(img).unsqueeze(0).to(device)

    # Predict
    with torch.no_grad():
        outputs = model(x)
        probs = torch.softmax(outputs, dim=1).cpu().numpy()[0]
        pred_idx = probs.argmax()
        pred_class = CLASSES[pred_idx]

    print("Predicted Damage Class:", pred_class)
    print("Probabilities:")
    for c, p in zip(CLASSES, probs):
        print(f"  {c}: {p:.4f}")

if __name__ == "__main__":
    main()
