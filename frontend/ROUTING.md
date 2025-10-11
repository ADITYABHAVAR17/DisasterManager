# DisasterConnect - Routing Structure

## 🏗️ Application Routes

### Main Routes:
- **`/`** - Home Page
  - Landing page with overview, statistics, and quick actions
  - Hero section with emergency contact information
  - Feature highlights and call-to-action buttons

- **`/report`** - Report Incident
  - Enhanced incident reporting form
  - Interactive map for location selection
  - Camera capture and file upload functionality
  - Real-time validation and feedback

- **`/dashboard`** - Admin Dashboard
  - Comprehensive admin interface
  - Statistics overview (total, verified, pending, resolved reports)
  - Reports table with filtering and status management
  - Real-time data from backend API

- **`/map`** - Live Map View
  - Interactive map showing all reported incidents
  - Color-coded markers by disaster type
  - Sidebar with detailed report information
  - Real-time updates and incident details

- **`/*`** - 404 Not Found
  - User-friendly error page
  - Navigation links back to main sections

## 🧭 Navigation

The app includes a persistent navigation bar with:
- **DisasterConnect** logo/brand
- **Home** - Return to main page
- **Report Incident** - Quick access to reporting form
- **Admin Dashboard** - Management interface
- **Live Map** - Real-time incident visualization

## 🎨 Design Features

- **Responsive Design** - Works on mobile, tablet, and desktop
- **Active Route Highlighting** - Current page is visually indicated
- **Consistent Theming** - Red/orange emergency theme throughout
- **Smooth Transitions** - Hover effects and page transitions
- **Accessibility** - Proper ARIA labels and keyboard navigation

## 🔧 Technical Implementation

- **React Router v6** - Modern routing with hooks
- **Component-based Architecture** - Modular, reusable components
- **State Management** - Local state with hooks
- **API Integration** - Axios for backend communication
- **Responsive Grid** - Tailwind CSS for styling

## 📱 Mobile Optimization

- Touch-friendly navigation
- Responsive layouts on all pages
- Mobile-optimized form inputs
- Swipe-friendly map interactions

The routing system provides a complete, professional web application experience for emergency management and incident reporting.