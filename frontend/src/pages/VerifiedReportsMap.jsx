import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { 
  AlertTriangle, 
  Clock, 
  User, 
  MapPin, 
  CheckCircle, 
  Shield, 
  Filter,
  Calendar,
  Phone,
  Activity,
  Info,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import '../styles/VerifiedReportsMap.css';
import L from 'leaflet';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const VerifiedReportsMap = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [timeFilter, setTimeFilter] = useState('30'); // days
  const [showSidebar, setShowSidebar] = useState(true);

  useEffect(() => {
    const fetchVerifiedReports = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/reports');
        const data = await response.json();
        
        // Filter for verified/resolved reports only
        const verifiedReports = Array.isArray(data.reports || data) 
          ? (data.reports || data).filter(report => 
              report.status === 'resolved' || 
              report.status === 'verified' ||
              report.verified === true
            )
          : [];
        
        // Apply time filter
        const timeThreshold = Date.now() - (parseInt(timeFilter) * 24 * 60 * 60 * 1000);
        const filteredReports = verifiedReports.filter(report => 
          new Date(report.createdAt).getTime() > timeThreshold
        );
        
        setReports(filteredReports);
      } catch (error) {
        console.error('Error fetching verified reports:', error);
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVerifiedReports();
  }, [timeFilter]);

  // Create custom icons for different incident types
  const createCustomIcon = (type, isResolved = true) => {
    const color = isResolved ? '#10b981' : getIncidentColor(type);
    const emoji = getIncidentEmoji(type);
    
    return L.divIcon({
      html: `<div style="
        background-color: ${color}; 
        width: 35px; 
        height: 35px; 
        border-radius: 50%; 
        border: 3px solid white; 
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 16px;
        color: white;
        font-weight: bold;
      ">${emoji}</div>`,
      className: 'custom-div-icon',
      iconSize: [35, 35],
      iconAnchor: [17, 35],
      popupAnchor: [0, -35]
    });
  };

  const getIncidentColor = (type) => {
    const colors = {
      'flooding': '#3b82f6',
      'fire-emergency': '#ef4444',
      'medical-emergency': '#ec4899',
      'blocked-road': '#f59e0b',
      'landslide': '#84cc16',
      'severe-weather': '#8b5cf6',
      'earthquake': '#6b7280',
      'accident': '#f97316',
      'other': '#64748b'
    };
    return colors[type] || '#64748b';
  };

  const getIncidentEmoji = (type) => {
    const emojis = {
      'flooding': '🌊',
      'fire-emergency': '🔥',
      'medical-emergency': '🚑',
      'blocked-road': '🚧',
      'landslide': '⛰️',
      'severe-weather': '⛈️',
      'earthquake': '💥',
      'accident': '🚗',
      'other': '⚠️'
    };
    return emojis[type] || '📍';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredReports = filterType === 'all' 
    ? reports 
    : reports.filter(report => report.incidentType === filterType);

  const getIncidentStats = () => {
    const stats = {};
    reports.forEach(report => {
      const type = report.incidentType || 'other';
      stats[type] = (stats[type] || 0) + 1;
    });
    return stats;
  };

  const incidentStats = getIncidentStats();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-500 border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading Verified Reports...</h2>
          <p className="text-gray-500">Fetching confirmed incident data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 verified-map-container">
      {/* Header */}
      <div className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="h-6 w-6 lg:h-8 lg:w-8 text-green-600" />
                Verified Reports Map
              </h1>
              <p className="text-gray-600 mt-1 lg:mt-2 text-sm lg:text-base">
                View confirmed and resolved incidents in your area • Updated in real-time
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <div className="bg-green-100 text-green-800 px-3 lg:px-4 py-2 rounded-full font-medium text-sm lg:text-base">
                <CheckCircle className="h-4 w-4 inline mr-2" />
                {filteredReports.length} Verified Reports
              </div>
              
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="bg-blue-600 text-white px-3 lg:px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm lg:text-base"
              >
                <Filter className="h-4 w-4" />
                {showSidebar ? 'Hide' : 'Show'} Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row h-[calc(100vh-120px)] lg:h-[calc(100vh-140px)]">
        {/* Sidebar */}
        {showSidebar && (
          <div className="w-full lg:w-80 bg-white shadow-lg border-r order-2 lg:order-1 overflow-y-auto verified-map-sidebar">
            <div className="p-4 lg:p-6">
              {/* Time Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-2" />
                  Time Period
                </label>
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 3 months</option>
                  <option value="365">Last year</option>
                </select>
              </div>

              {/* Incident Type Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Filter className="h-4 w-4 inline mr-2" />
                  Incident Type
                </label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Types</option>
                  <option value="flooding">Flooding</option>
                  <option value="fire-emergency">Fire Emergency</option>
                  <option value="medical-emergency">Medical Emergency</option>
                  <option value="blocked-road">Blocked Road</option>
                  <option value="landslide">Landslide</option>
                  <option value="severe-weather">Severe Weather</option>
                  <option value="earthquake">Earthquake</option>
                  <option value="accident">Accident</option>
                </select>
              </div>

              {/* Statistics */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  Incident Statistics
                </h3>
                <div className="space-y-2">
                  {Object.entries(incidentStats).map(([type, count]) => (
                    <div key={type} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm capitalize flex items-center gap-2">
                        <span>{getIncidentEmoji(type)}</span>
                        {type.replace('-', ' ')}
                      </span>
                      <span className="font-semibold text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  Map Legend
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span>Verified & Resolved</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span>Official Verification</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-blue-600" />
                    <span>Real-time Updates</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Map Container */}
        <div className="flex-1 relative order-1 lg:order-2">
          <MapContainer
            center={[20.0384615, 73.8198394]}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            className="rounded-none z-10"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {filteredReports.map((report) => (
              <Marker
                key={report._id}
                position={[
                  report.location?.lat || report.lat || 0,
                  report.location?.lng || report.lng || 0
                ]}
                icon={createCustomIcon(report.incidentType, report.status === 'resolved')}
              >
                <Popup className="custom-popup">
                  <div className="p-3 max-w-sm">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-lg">{getIncidentEmoji(report.incidentType)}</span>
                      <h3 className="font-bold text-gray-900 capitalize">
                        {report.incidentType?.replace('-', ' ')}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        report.status === 'resolved' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        <CheckCircle className="h-3 w-3 inline mr-1" />
                        {report.status === 'resolved' ? 'Resolved' : 'Verified'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <p className="text-gray-700 font-medium">{report.description}</p>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="h-4 w-4" />
                        <span>Reported by: {report.name}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{report.phone}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="h-4 w-4" />
                        <span>{formatDate(report.createdAt)}</span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {report.location?.lat?.toFixed(4)}, {report.location?.lng?.toFixed(4)}
                        </span>
                      </div>

                      {report.urgency && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4" />
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            report.urgency === 'immediate' ? 'bg-red-100 text-red-800' :
                            report.urgency === 'urgent' ? 'bg-orange-100 text-orange-800' :
                            report.urgency === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {report.urgency} priority
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>

          {/* Floating Stats Card */}
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 lg:p-4 z-[1000] text-sm lg:text-base">
            <h4 className="font-semibold text-gray-900 mb-2">Quick Stats</h4>
            <div className="space-y-1 text-xs lg:text-sm">
              <div className="flex justify-between">
                <span>Total Verified:</span>
                <span className="font-medium text-green-600">{reports.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Showing:</span>
                <span className="font-medium text-blue-600">{filteredReports.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Time Period:</span>
                <span className="font-medium">{timeFilter} days</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifiedReportsMap;