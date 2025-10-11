import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import { AlertTriangle, Clock, User, MapPin } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const LiveMap = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/reports');
        setReports(response.data);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

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

  const createCustomIcon = (disasterType) => {
    const color = getDisasterColor(disasterType);
    return L.divIcon({
      html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      className: 'custom-div-icon'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading incident reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="h-6 w-6 text-red-500" />
                Live Incident Map
              </h1>
              <p className="text-gray-600">Real-time view of reported incidents</p>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Active Incidents: {reports.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={[40.7128, -74.0060]}
            zoom={10}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {reports.map((report) => (
              <Marker
                key={report._id}
                position={[report.location.lat, report.location.lng]}
                icon={createCustomIcon(report.disasterType)}
                eventHandlers={{
                  click: () => setSelectedReport(report)
                }}
              >
                <Popup>
                  <div className="p-2">
                    <h3 className="font-semibold text-gray-900">{report.disasterType}</h3>
                    <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                    <div className="mt-2 text-xs text-gray-500">
                      <p>Reported by: {report.name}</p>
                      <p>Time: {new Date(report.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-white border-l shadow-lg overflow-y-auto">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Recent Reports</h2>
          </div>
          
          <div className="divide-y">
            {reports.map((report) => (
              <div
                key={report._id}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedReport?._id === report._id ? 'bg-blue-50 border-r-4 border-blue-500' : ''
                }`}
                onClick={() => setSelectedReport(report)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0 mt-1"
                    style={{ backgroundColor: getDisasterColor(report.disasterType) }}
                  ></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span className="font-medium text-gray-900">{report.disasterType}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {report.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{report.name}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                    {report.verified && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Verified
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {reports.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No incidents reported yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveMap;