# Dependencies Installation Guide

To use the enhanced ReportForm component, you need to install the following dependencies:

```bash
npm install react-leaflet leaflet lucide-react @tailwindcss/forms
```

## Dependencies Breakdown:

1. **react-leaflet & leaflet**: For interactive map functionality
2. **lucide-react**: For modern, consistent icons
3. **@tailwindcss/forms**: For better form styling

## Additional Setup:

If you encounter issues with Leaflet CSS, make sure to add this import to your main CSS file or component:

```javascript
import "leaflet/dist/leaflet.css";
```

The component now includes:
- Interactive map with click-to-select location
- Current location detection using GPS
- Camera capture functionality
- File upload with preview
- Enhanced responsive UI
- Form validation
- Loading states
- Success feedback

## Browser Permissions Required:
- **Location**: For "Use Current Location" feature
- **Camera**: For photo capture functionality