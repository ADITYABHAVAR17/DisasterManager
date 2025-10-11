import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Edit2, Trash2, MapPin, Users, Phone, Mail, AlertCircle } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom resource icons
const createResourceIcon = (type, availability) => {
  const colors = {
    'safe-zone': '#10B981',
    'shelter': '#3B82F6',
    'medical-aid': '#EF4444',
    'supply-center': '#F59E0B',
    'evacuation-point': '#8B5CF6'
  };

  const availabilityColors = {
    'available': '#10B981',
    'limited': '#F59E0B',
    'full': '#EF4444'
  };

  const color = colors[type] || '#6B7280';
  const borderColor = availabilityColors[availability] || '#6B7280';

  return L.divIcon({
    html: `
      <div style="
        background-color: ${color};
        border: 3px solid ${borderColor};
        width: 20px;
        height: 20px;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>
    `,
    className: 'custom-resource-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10]
  });
};

// Component to handle map clicks
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      if (onMapClick) {
        onMapClick(e.latlng);
      }
    }
  });
  return null;
}

const InteractiveResourceMap = ({ 
  resources = [], 
  onResourceEdit, 
  onResourceCreate,
  enableMapClick = true 
}) => {
  const [clickPosition, setClickPosition] = useState(null);
  const [showClickPopup, setShowClickPopup] = useState(false);
  const mapRef = useRef();

  // Pittsburgh coordinates
  const center = [40.4406, -79.9959];

  const handleMapClick = (latlng) => {
    if (enableMapClick && onResourceCreate) {
      setClickPosition(latlng);
      setShowClickPopup(true);
    }
  };

  const handleCreateAtLocation = () => {
    if (clickPosition && onResourceCreate) {
      // Call parent's create function with pre-filled coordinates
      onResourceCreate({
        lat: clickPosition.lat.toFixed(6),
        lng: clickPosition.lng.toFixed(6)
      });
      setShowClickPopup(false);
      setClickPosition(null);
    }
  };

  const getResourceTypeLabel = (type) => {
    const labels = {
      'safe-zone': 'Safe Zone',
      'shelter': 'Shelter',
      'medical-aid': 'Medical Aid',
      'supply-center': 'Supply Center',
      'evacuation-point': 'Evacuation Point'
    };
    return labels[type] || type;
  };

  const getAvailabilityLabel = (availability) => {
    const labels = {
      'available': 'Available',
      'limited': 'Limited Space',
      'full': 'At Capacity'
    };
    return labels[availability] || availability;
  };

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {enableMapClick && (
          <MapClickHandler onMapClick={handleMapClick} />
        )}

        {/* Resource Markers */}
        {resources.map((resource) => (
          <Marker
            key={resource._id}
            position={[resource.location?.lat || 0, resource.location?.lng || 0]}
            icon={createResourceIcon(resource.type, resource.availability)}
          >
            <Popup className="resource-popup">
              <div className="p-2 min-w-[250px]">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-semibold text-gray-900">{resource.name}</h4>
                  <div className="flex gap-1">
                    {onResourceEdit && (
                      <button
                        onClick={() => onResourceEdit(resource)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit Resource"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-blue-600">
                      {getResourceTypeLabel(resource.type)}
                    </span>
                  </div>

                  {resource.location?.address && (
                    <p className="text-xs text-gray-600">{resource.location.address}</p>
                  )}

                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      {resource.currentOccupancy || 0}/{resource.capacity} capacity
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-gray-500" />
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      resource.availability === 'available' 
                        ? 'bg-green-100 text-green-800'
                        : resource.availability === 'limited'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {getAvailabilityLabel(resource.availability)}
                    </span>
                  </div>

                  {resource.contact?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{resource.contact.phone}</span>
                    </div>
                  )}

                  {resource.contact?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{resource.contact.email}</span>
                    </div>
                  )}

                  {resource.contact?.inCharge && (
                    <p className="text-sm text-gray-600">
                      <strong>Contact:</strong> {resource.contact.inCharge}
                    </p>
                  )}

                  {resource.description && (
                    <p className="text-xs text-gray-600 border-t pt-2">
                      {resource.description}
                    </p>
                  )}

                  {resource.services && resource.services.length > 0 && (
                    <div className="border-t pt-2">
                      <p className="text-xs font-medium text-gray-700 mb-1">Services:</p>
                      <div className="flex flex-wrap gap-1">
                        {resource.services.map((service, index) => (
                          <span
                            key={index}
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                          >
                            {service}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Click Position Marker */}
        {clickPosition && showClickPopup && (
          <Marker position={[clickPosition.lat, clickPosition.lng]}>
            <Popup>
              <div className="p-2">
                <h4 className="font-semibold mb-2">Create Resource Here?</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Lat: {clickPosition.lat.toFixed(6)}<br />
                  Lng: {clickPosition.lng.toFixed(6)}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleCreateAtLocation}
                    className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  >
                    Create Here
                  </button>
                  <button
                    onClick={() => {
                      setShowClickPopup(false);
                      setClickPosition(null);
                    }}
                    className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {enableMapClick && (
        <div className="absolute top-2 left-2 bg-white p-2 rounded shadow-sm z-[1000]">
          <p className="text-xs text-gray-600">
            💡 Click on the map to add a new resource
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-2 right-2 bg-white p-3 rounded shadow-sm z-[1000]">
        <h5 className="text-xs font-semibold mb-2">Resource Types</h5>
        <div className="space-y-1">
          {[
            { type: 'safe-zone', label: 'Safe Zone', color: '#10B981' },
            { type: 'shelter', label: 'Shelter', color: '#3B82F6' },
            { type: 'medical-aid', label: 'Medical Aid', color: '#EF4444' },
            { type: 'supply-center', label: 'Supply Center', color: '#F59E0B' },
            { type: 'evacuation-point', label: 'Evacuation Point', color: '#8B5CF6' }
          ].map(({ type, label, color }) => (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full border"
                style={{ backgroundColor: color, borderColor: color }}
              ></div>
              <span className="text-xs text-gray-700">{label}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 pt-2 border-t">
          <h6 className="text-xs font-semibold mb-1">Availability</h6>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: '#10B981' }}></div>
              <span className="text-xs text-gray-700">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: '#F59E0B' }}></div>
              <span className="text-xs text-gray-700">Limited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: '#EF4444' }}></div>
              <span className="text-xs text-gray-700">Full</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveResourceMap;