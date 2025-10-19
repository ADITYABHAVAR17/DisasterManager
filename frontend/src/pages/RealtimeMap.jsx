import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import io from "socket.io-client";
import { AlertTriangle, Radio, Users, MapPin, Bell, BellOff } from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const RealtimeMap = () => {
  const [userLocation, setUserLocation] = useState({ lat: 40.7128, lng: -74.0060 });
  const [reports, setReports] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [socket, setSocket] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io("https://disastermanager.onrender.com/");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to server");
      setIsConnected(true);
      
      // Subscribe to area around user location
      newSocket.emit("subscribeToArea", {
        lat: userLocation.lat,
        lng: userLocation.lng,
        radiusKm: 10 // 10km radius
      });
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from server");
      setIsConnected(false);
    });

    newSocket.on("newReport", (report) => {
      console.log("New report received:", report);
      setReports((prev) => [report, ...prev.filter(r => r._id !== report._id)]);
      
      if (notificationsEnabled && "Notification" in window && Notification.permission === "granted") {
        new Notification("🚨 New Emergency Report", {
          body: `${report.disasterType}: ${report.description}`,
          icon: "/favicon.ico",
          tag: report._id
        });
      }
    });

    newSocket.on("reportUpdated", (report) => {
      console.log("Report updated:", report);
      setReports((prev) => prev.map((r) => (r._id === report._id ? report : r)));
    });

    return () => {
      newSocket.emit("unsubscribe");
      newSocket.close();
    };
  }, [userLocation.lat, userLocation.lng, notificationsEnabled]);

  // Load initial reports
  useEffect(() => {
    fetch("/api/reports")
      .then((r) => r.json())
      .then((data) => {
        const reportsArray = Array.isArray(data) ? data : [];
        setReports(reportsArray);
      })
      .catch(console.error);
  }, []);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        if (permission === "granted") {
          setNotificationsEnabled(true);
        }
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

  const getDisasterColor = (type) => {
    const colors = {
      'Fire': '#ef4444',
      'Flood': '#3b82f6',
      'Earthquake': '#8b5cf6',
      'Hurricane': '#06b6d4',
      'Tornado': '#f59e0b',
      'Landslide': '#84cc16',
      'Tsunami': '#0ea5e9',
      'Drought': '#f97316',
      'Volcanic Eruption': '#dc2626',
      'Other': '#6b7280'
    };
    return colors[type] || colors['Other'];
  };

  const createCustomIcon = (disasterType, verified = false) => {
    const color = getDisasterColor(disasterType);
    const border = verified ? '#10b981' : '#ef4444';
    return L.divIcon({
      html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid ${border}; box-shadow: 0 2px 4px rgba(0,0,0,0.3); position: relative;">
        ${!verified ? '<div style="position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background-color: #ef4444; border-radius: 50%; animation: pulse 2s infinite;"></div>' : ''}
      </div>`,
      iconSize: [26, 26],
      iconAnchor: [13, 13],
      className: 'custom-div-icon'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Radio className={`h-6 w-6 ${isConnected ? 'text-green-500' : 'text-red-500'}`} />
                Real-time Emergency Map
              </h1>
              <p className="text-gray-600">Live updates of emergency reports and incidents</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm text-gray-600">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              <button
                onClick={toggleNotifications}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  notificationsEnabled 
                    ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                {notificationsEnabled ? 'Notifications On' : 'Enable Notifications'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={[userLocation.lat, userLocation.lng]}
            zoom={10}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* User location marker */}
            <Marker position={[userLocation.lat, userLocation.lng]}>
              <Popup>
                <div className="text-center">
                  <Users className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                  <strong>Your Location</strong>
                </div>
              </Popup>
            </Marker>

            {/* Report markers */}
            {Array.isArray(reports) && reports.map((report) => (
              <Marker
                key={report._id}
                position={[report.location?.lat || 0, report.location?.lng || 0]}
                icon={createCustomIcon(report.disasterType, report.verified)}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      <h3 className="font-semibold text-gray-900">{report.disasterType}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{report.description}</p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p><strong>Reported by:</strong> {report.name}</p>
                      <p><strong>Time:</strong> {new Date(report.createdAt).toLocaleString()}</p>
                      <p><strong>Status:</strong> 
                        <span className={`ml-1 px-2 py-1 rounded-full text-xs ${
                          report.verified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {report.verified ? 'Verified' : 'Pending'}
                        </span>
                      </p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Floating stats */}
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 min-w-[200px]">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-500" />
              Live Statistics
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Reports:</span>
                <span className="font-semibold">{reports.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Verified:</span>
                <span className="font-semibold text-green-600">
                  {reports.filter(r => r.verified).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Pending:</span>
                <span className="font-semibold text-yellow-600">
                  {reports.filter(r => !r.verified).length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Feed Sidebar */}
        <div className="w-80 bg-white border-l shadow-lg overflow-y-auto">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Radio className="h-5 w-5 text-red-500" />
              Live Feed
            </h2>
            <p className="text-sm text-gray-600">Real-time emergency reports</p>
          </div>
          
          <div className="divide-y">
            {Array.isArray(reports) && reports.slice(0, 20).map((report) => (
              <div key={report._id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-3">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
                    style={{ backgroundColor: getDisasterColor(report.disasterType) }}
                  ></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span className="font-medium text-gray-900">{report.disasterType}</span>
                      {!report.verified && (
                        <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {report.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{report.name}</span>
                      <span>{new Date(report.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {reports.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <Radio className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No live reports yet</p>
              <p className="text-sm">Waiting for new incidents...</p>
            </div>
          )}
        </div>
      </div>

      {/* CSS for animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default RealtimeMap;