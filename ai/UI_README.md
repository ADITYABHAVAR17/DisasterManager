# 🌪️ Disaster Analysis UI

A simple, responsive web interface for the Disaster Detection & Damage Assessment API.

## Features

- **📸 Image Upload**: Drag & drop or click to select images
- **🔍 Analysis Types**: 
  - Disaster Detection only
  - Damage Assessment only  
  - Combined Analysis (both)
- **📊 Visual Results**: Interactive results with confidence scores and probability bars
- **📱 Responsive Design**: Works on desktop and mobile
- **⚡ Real-time API Health Check**: Shows API status on page load

## Quick Start

### Option 1: Auto-start everything
```bash
# Start both API and UI servers
start_system.bat
```

### Option 2: Manual start

1. **Start the FastAPI backend** (in one terminal):
```bash
python fastapi_backend.py
```

2. **Start the UI server** (in another terminal):
```bash
python serve_ui.py
```

3. **Open your browser** and go to:
```
http://localhost:3000/disaster_ui.html
```

## Usage

1. **Upload Image**: Click "Choose Image" or drag & drop an image file
2. **Select Analysis Type**:
   - 🔍 **Both Analysis**: Run both disaster detection and damage assessment
   - 🌪️ **Disaster Detection**: Identify disaster type (Cyclone, Earthquake, Flood, Wildfire)
   - 🏗️ **Damage Assessment**: Assess damage level (No-damage, Minor-damage, Major-damage, Destroyed)
3. **Click "Analyze Image"**: Wait for AI analysis results
4. **View Results**: See predictions with confidence scores and probability distributions

## Supported Image Formats

- JPG/JPEG
- PNG
- GIF (converted to static)
- WebP
- BMP

## API Endpoints Used

- `GET /health` - Check API and model status
- `POST /predict-disaster` - Disaster detection only
- `POST /predict-damage` - Damage assessment only
- `POST /predict-both` - Combined analysis

## UI Components

### Upload Section
- Visual drag & drop area
- Image preview after selection
- File validation

### Analysis Type Selection
- Radio buttons for analysis type
- Clear visual indicators
- Responsive layout

### Results Display
- **Predicted Class**: Main prediction with confidence
- **Probability Bars**: Visual representation of all class probabilities
- **Color-coded Results**: Different colors for different analysis types
- **Error Handling**: Clear error messages if analysis fails

## Customization

### Change API URL
Edit the `API_BASE_URL` in `disaster_ui.html`:
```javascript
const API_BASE_URL = 'http://your-api-server:8000';
```

### Change UI Port
```bash
python serve_ui.py --port 4000
```

### Modify Styling
The CSS is embedded in the HTML file. Key sections:
- Color scheme: Gradient backgrounds and accent colors
- Responsive breakpoints: Media queries for mobile
- Animations: Hover effects and loading spinners

## Troubleshooting

### API Connection Issues
- Make sure FastAPI backend is running on port 8000
- Check browser console for CORS errors
- Verify model files are present (disaster.h5, best_damage.pth)

### UI Server Issues
- Port already in use: Try a different port with `--port` option
- File not found: Make sure you're in the AI directory

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- JavaScript must be enabled
- Local file access may be restricted in some browsers

## File Structure

```
ai/
├── disaster_ui.html      # Main UI file
├── serve_ui.py           # UI server script
├── start_system.bat      # Auto-start script
├── fastapi_backend.py    # API backend
├── disaster.h5           # Disaster detection model
├── best_damage.pth       # Damage assessment model
└── damage_model.py       # PyTorch model definition
```

## Development

To modify the UI:
1. Edit `disaster_ui.html` for layout/styling changes
2. The server auto-reloads, just refresh your browser
3. Check browser developer tools for debugging

## Screenshots

The UI includes:
- Clean, modern design with gradient backgrounds
- Intuitive upload interface
- Real-time loading indicators
- Color-coded result cards
- Interactive probability visualizations
- Mobile-responsive layout