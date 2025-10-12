import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { 
  AlertTriangle, 
  Shield, 
  MapPin, 
  Truck, 
  Users, 
  Phone,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const InteractiveOperationsMap = ({ reports = [], resources = [], isConnected, onMapClick }) => {
  const [mapCenter] = useState([20.0384615, 73.8198394]); // Default center

  // Component to handle map clicks
  const MapClickHandler = () => {
    useMapEvents({
      click: (e) => {
        if (onMapClick) {
          onMapClick(e.latlng);
        }
      }
    });
    return null;
  };

  // Create custom icons for different types
  const createCustomIcon = (type, color, size = 30) => {
    const iconHtml = type === 'safe-zone' ? '🏠' :
                    type === 'blocked-road' ? '🚧' :
                    type === 'medical-emergency' ? '🚑' :
                    type === 'fire-emergency' ? '🔥' :
                    type === 'flood' ? '🌊' :
                    type === 'relief-camp' ? '⛺' :
                    type === 'medical-center' ? '🏥' :
                    type === 'food-distribution' ? '🍞' :
                    type === 'evacuation-center' ? '🏃' :
                    '⚠️';

    return L.divIcon({
      html: `<div style="
        background-color: ${color}; 
        width: ${size}px; 
        height: ${size}px; 
        border-radius: 50%; 
        border: 3px solid white; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${size * 0.6}px;
      ">${iconHtml}</div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      className: 'custom-div-icon'
    });
  };

  // Get status color
  const getStatusColor = (status, type) => {
    if (type === 'resource') {
      return status === 'active' ? '#10b981' : '#6b7280';
    }
    
    const colors = {
      'pending': '#f59e0b',
      'investigating': '#3b82f6',
      'in-progress': '#8b5cf6',
      'resolved': '#10b981'
    };
    return colors[status] || '#f59e0b';
  };

  // Create safe zone circles
  const safeZones = resources.filter(r => r.type === 'safe-zone' && r.status === 'active');

  return (
    <div className="h-full w-full relative">
      <MapContainer
        center={mapCenter}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg"
      >
        <MapClickHandler />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Safe Zone Circles */}
        {safeZones.map((zone) => (
          <Circle
            key={`zone-${zone._id}`}
            center={[zone.location.lat, zone.location.lng]}
            radius={500} // 500 meter radius
            pathOptions={{
              color: '#10b981',
              fillColor: '#10b981',
              fillOpacity: 0.1,
              weight: 2
            }}
          />
        ))}

        {/* Emergency Reports Markers */}
        {reports.map((report) => (
          <Marker
            key={`report-${report._id}`}
            position={[
              report.location?.lat || report.lat || 0, 
              report.location?.lng || report.lng || 0
            ]}
            icon={createCustomIcon(
              report.incidentType, 
              getStatusColor(report.status, 'report'),
              report.urgency === 'immediate' ? 40 : 30
            )}
          >
            <Popup>
              <div className="p-3 min-w-[250px]">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <h3 className="font-semibold text-gray-900">
                    {report.incidentType?.replace('-', ' ').toUpperCase()}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    report.urgency === 'immediate' ? 'bg-red-100 text-red-800' :
                    report.urgency === 'urgent' ? 'bg-orange-100 text-orange-800' :
                    report.urgency === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {report.urgency}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700">{report.description}</p>
                  
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>{report.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{report.phone}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{new Date(report.createdAt).toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {report.verified ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="font-medium">
                      {report.verified ? 'Verified' : 'Pending Verification'}
                    </span>
                  </div>
                  
                  <div className={`mt-3 px-3 py-2 rounded-lg text-center font-medium ${
                    report.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    report.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    report.status === 'investigating' ? 'bg-purple-100 text-purple-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    Status: {report.status?.toUpperCase() || 'PENDING'}
                  </div>
                  
                  {report.witnessCount && (
                    <div className="text-xs text-gray-500">
                      Witnesses: {report.witnessCount} | Affected: {report.estimatedAffected || 1}
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Resource Markers */}
        {resources.map((resource) => (
          <Marker
            key={`resource-${resource._id}`}
            position={[resource.location.lat, resource.location.lng]}
            icon={createCustomIcon(
              resource.type, 
              getStatusColor(resource.status, 'resource'),
              35
            )}
          >
            <Popup>
              <div className="p-3 min-w-[250px]">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold text-gray-900">
                    {resource.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    resource.availability === 'available' ? 'bg-green-100 text-green-800' :
                    resource.availability === 'limited' ? 'bg-yellow-100 text-yellow-800' :
                    resource.availability === 'full' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {resource.availability}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="font-medium text-blue-600">
                    {resource.type.replace('-', ' ').toUpperCase()}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{resource.location.address}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>
                      Capacity: {resource.currentOccupancy || 0} / {resource.capacity}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span>{resource.contact?.phone}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-gray-500" />
                    <span>In Charge: {resource.contact?.inCharge}</span>
                  </div>
                  
                  {resource.services && resource.services.length > 0 && (
                    <div className="mt-3">
                      <div className="text-xs font-medium text-gray-700 mb-1">Services:</div>
                      <div className="flex flex-wrap gap-1">
                        {resource.services.map((service, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            {service.replace('-', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 mt-2">
                    {resource.operatingHours?.is24Hours ? '24/7 Operation' : 
                     `${resource.operatingHours?.start} - ${resource.operatingHours?.end}`}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Connection Status Indicator */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-sm font-medium">
            {isConnected ? 'Live Updates' : 'Offline'}
          </span>
        </div>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-4 z-[1000] max-w-xs">
        <h4 className="font-semibold text-gray-900 mb-3">Map Legend</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span>Safe Zones & Active Resources</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span>Critical/Blocked Areas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span>Active Operations</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
            <span>Pending Reports</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
            <span>Under Investigation</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveOperationsMap;