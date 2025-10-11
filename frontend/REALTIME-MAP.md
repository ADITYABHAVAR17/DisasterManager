# Real-time Emergency Map

## 🔴 **Live Emergency Tracking System**

The Real-time Map provides instant updates and notifications for emergency situations in your area.

### 🛰️ **Features**

#### **Live Updates**
- **Real-time Socket Connection**: Instant updates via WebSocket connection
- **Area-based Subscriptions**: Receive updates within 10km radius of your location
- **Live Status Indicator**: Connection status display (Connected/Disconnected)
- **Auto-reconnection**: Automatic reconnection on connection loss

#### **Interactive Map**
- **User Location Marker**: Your current position on the map
- **Emergency Markers**: Color-coded incident markers by disaster type
- **Verification Status**: Visual indicators for verified vs pending reports
- **Detailed Popups**: Complete incident information on marker click

#### **Push Notifications**
- **Browser Notifications**: Instant alerts for new emergencies in your area
- **Permission-based**: Enable/disable notifications with one click
- **Smart Filtering**: Only notifications for incidents near you
- **Rich Content**: Detailed emergency information in notifications

#### **Live Feed Sidebar**
- **Real-time List**: Latest 20 emergency reports
- **Live Indicators**: Pulsing dots for unverified reports
- **Time Stamps**: Precise timing for each incident
- **Click to Focus**: Click any report to center map on location

#### **Live Statistics**
- **Total Reports**: Real-time count of all incidents
- **Verification Status**: Live count of verified vs pending reports
- **Auto-updating**: Statistics update automatically with new reports

### 🔧 **Technical Implementation**

#### **Frontend (React + Socket.IO Client)**
```javascript
// Socket connection with area subscription
const socket = io("http://localhost:5000");
socket.emit("subscribeToArea", {
  lat: userLocation.lat,
  lng: userLocation.lng,
  radiusKm: 10
});
```

#### **Backend (Node.js + Socket.IO Server)**
```javascript
// Haversine distance calculation for area-based filtering
const broadcastReport = (eventName, report) => {
  for (const [socketId, sub] of subscriptions.entries()) {
    const dist = haversineDistanceKm(lat, lng, sub.lat, sub.lng);
    if (dist <= sub.radiusKm) {
      io.to(socketId).emit(eventName, report);
    }
  }
};
```

### 📱 **Mobile Optimization**
- **Touch-friendly Interface**: Large touch targets for mobile interaction
- **Responsive Design**: Adapts to all screen sizes
- **Mobile Notifications**: Works with mobile browser notifications
- **GPS Integration**: Automatic location detection on mobile devices

### 🎯 **Use Cases**

#### **For Citizens**
- **Emergency Awareness**: Stay informed about nearby emergencies
- **Safety Planning**: Plan routes avoiding active incidents
- **Community Alert**: Get notified about disasters in your area

#### **For Emergency Responders**
- **Situation Awareness**: Real-time view of all active incidents
- **Resource Allocation**: See which areas need immediate attention
- **Response Coordination**: Track incident status and verification

#### **For Administrators**
- **Live Monitoring**: Monitor all emergency reports in real-time
- **Verification Workflow**: Update incident status with live broadcasting
- **Analytics**: Live statistics for decision making

### 🚀 **Getting Started**

1. **Visit the Real-time Map**: Navigate to `/realtime` route
2. **Allow Location**: Enable location access for area-based updates
3. **Enable Notifications**: Click "Enable Notifications" for instant alerts
4. **Monitor Live Feed**: Watch the sidebar for real-time updates
5. **Interact with Map**: Click markers for detailed incident information

### 🔐 **Privacy & Security**
- **Location Privacy**: Location used only for relevant incident filtering
- **Secure Connection**: All data transmitted via secure WebSocket
- **No Data Storage**: Real-time data doesn't persist client-side
- **Permission-based**: All features require explicit user permission

The real-time map transforms emergency management from reactive to proactive, enabling instant awareness and rapid response to emergency situations.