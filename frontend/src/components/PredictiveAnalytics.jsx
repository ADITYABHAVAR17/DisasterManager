import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Rectangle, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { 
  AlertTriangle, 
  Cloud, 
  Thermometer, 
  Wind, 
  Droplets, 
  Mountain, 
  TrendingUp,
  TrendingDown,
  Minus,
  Shield,
  Eye,
  BarChart3,
  RefreshCw,
  MapPin,
  Calendar,
  Activity
} from 'lucide-react';
import { predictiveAPI } from '../api/reportAPI';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const PredictiveAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [riskMapData, setRiskMapData] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationAnalysis, setLocationAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  // Pittsburgh coordinates
  const center = [40.4406, -79.9959];

  useEffect(() => {
    loadAnalyticsData();
    loadRiskMap();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const response = await predictiveAPI.getAnalytics('pittsburgh');
      if (response.success) {
        setAnalyticsData(response.data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRiskMap = async () => {
    try {
      const response = await predictiveAPI.getRiskMap(40.4406, -79.9959, 15, 6);
      if (response.success) {
        setRiskMapData(response.data);
      }
    } catch (error) {
      console.error('Error loading risk map:', error);
    }
  };

  const handleLocationClick = async (lat, lng) => {
    try {
      setSelectedLocation({ lat, lng });
      const response = await predictiveAPI.getRiskAnalysis(lat, lng);
      if (response.success) {
        setLocationAnalysis(response.data);
      }
    } catch (error) {
      console.error('Error analyzing location:', error);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await Promise.all([loadAnalyticsData(), loadRiskMap()]);
    setRefreshing(false);
  };

  const getRiskColor = (riskLevel) => {
    const colors = {
      'CRITICAL': '#DC2626',
      'HIGH': '#EA580C',
      'MODERATE': '#D97706',
      'LOW': '#65A30D',
      'MINIMAL': '#16A34A'
    };
    return colors[riskLevel] || '#6B7280';
  };

  const getRiskZoneOpacity = (overallRisk) => {
    return Math.max(0.3, Math.min(0.8, overallRisk / 100));
  };

  const getDisasterIcon = (type) => {
    const icons = {
      'FLOOD': '🌊',
      'LANDSLIDE': '⛰️',
      'WILDFIRE': '🔥',
      'EARTHQUAKE': '🌍',
      'STORM': '⛈️',
      'DROUGHT': '🌵'
    };
    return icons[type] || '⚠️';
  };

  const getTrendIcon = (trend) => {
    if (trend === 'increasing') return <TrendingUp className="w-4 h-4 text-red-500" />;
    if (trend === 'decreasing') return <TrendingDown className="w-4 h-4 text-green-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg">Loading predictive analytics...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold">Predictive Analytics & Risk Assessment</h3>
          <p className="text-gray-600">AI-powered disaster risk prediction based on weather and terrain data</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshData}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'risk-map', label: 'Risk Map', icon: MapPin },
          { id: 'weather', label: 'Weather Analysis', icon: Cloud },
          { id: 'terrain', label: 'Terrain Factors', icon: Mountain }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
              activeView === tab.id
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeView === 'overview' && analyticsData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Risk Status */}
          <div className="lg:col-span-2 space-y-6">
            {/* Risk Level Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">Current Risk Assessment</h4>
                <div 
                  className="px-3 py-1 rounded-full text-white font-medium"
                  style={{ backgroundColor: getRiskColor(analyticsData.currentRiskLevel.level) }}
                >
                  {analyticsData.currentRiskLevel.level}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{analyticsData.overallRisk}%</p>
                  <p className="text-gray-600">Overall Risk Score</p>
                </div>
                <div>
                  <p className="text-lg text-gray-700">{analyticsData.currentRiskLevel.description}</p>
                </div>
              </div>
            </div>

            {/* Disaster Risk Breakdown */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h4 className="text-lg font-semibold mb-4">Disaster Risk Analysis</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(analyticsData.disasterRisks).map(([type, risk]) => (
                  <div key={type} className="border rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{getDisasterIcon(type)}</span>
                      <h5 className="font-medium text-sm">{type.replace('_', ' ')}</h5>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold">{risk.score}%</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          risk.level === 'HIGH' ? 'bg-red-100 text-red-800' :
                          risk.level === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {risk.level}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            risk.level === 'HIGH' ? 'bg-red-500' :
                            risk.level === 'MEDIUM' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${risk.score}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h4 className="text-lg font-semibold mb-4">AI Recommendations</h4>
              <div className="space-y-2">
                {analyticsData.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <p className="text-gray-800">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Weather Conditions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h4 className="text-lg font-semibold mb-4">Current Weather</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Thermometer className="w-5 h-5 text-red-500" />
                  <div>
                    <p className="font-medium">{analyticsData.weatherConditions.temperature}°C</p>
                    <p className="text-sm text-gray-600">Temperature</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Droplets className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium">{analyticsData.weatherConditions.humidity}%</p>
                    <p className="text-sm text-gray-600">Humidity</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Wind className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{analyticsData.weatherConditions.windSpeed} m/s</p>
                    <p className="text-sm text-gray-600">Wind Speed</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Cloud className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{analyticsData.weatherConditions.condition}</p>
                    <p className="text-sm text-gray-600">{analyticsData.weatherConditions.description}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Alerts */}
            {analyticsData.alerts && analyticsData.alerts.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h4 className="text-lg font-semibold mb-4">Active Alerts</h4>
                <div className="space-y-3">
                  {analyticsData.alerts.map((alert, index) => (
                    <div key={index} className={`p-3 rounded-lg border-l-4 ${
                      alert.severity === 'high' ? 'bg-red-50 border-red-500' :
                      alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-500' :
                      'bg-blue-50 border-blue-500'
                    }`}>
                      <div className="flex items-start gap-2">
                        <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                          alert.severity === 'high' ? 'text-red-600' :
                          alert.severity === 'medium' ? 'text-yellow-600' :
                          'text-blue-600'
                        }`} />
                        <div>
                          <p className="font-medium text-sm">{alert.message}</p>
                          <p className="text-xs text-gray-600">{alert.category}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h4 className="text-lg font-semibold mb-4">Recent Activity</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium">{analyticsData.recentIncidents}</p>
                    <p className="text-sm text-gray-600">Recent incidents (7 days)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">Last updated</p>
                    <p className="font-medium text-xs">
                      {new Date(analyticsData.lastUpdated).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Risk Map Tab */}
      {activeView === 'risk-map' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h4 className="text-lg font-semibold mb-4">Regional Risk Assessment Map</h4>
              <div className="h-96 rounded-lg overflow-hidden">
                <MapContainer center={center} zoom={11} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  
                  {/* Risk Zone Rectangles */}
                  {riskMapData && riskMapData.riskZones.map((zone) => (
                    <Rectangle
                      key={zone.id}
                      bounds={[
                        [zone.bounds.south, zone.bounds.west],
                        [zone.bounds.north, zone.bounds.east]
                      ]}
                      fillColor={getRiskColor(zone.riskZone.level)}
                      fillOpacity={getRiskZoneOpacity(zone.overallRisk)}
                      color={getRiskColor(zone.riskZone.level)}
                      weight={2}
                      eventHandlers={{
                        click: () => handleLocationClick(zone.center.lat, zone.center.lng)
                      }}
                    >
                      <Popup>
                        <div className="p-2">
                          <h5 className="font-semibold">Risk Zone {zone.id}</h5>
                          <p className="text-sm">Risk Level: <strong>{zone.riskZone.level}</strong></p>
                          <p className="text-sm">Overall Risk: <strong>{zone.overallRisk}%</strong></p>
                          <p className="text-xs text-gray-600 mt-1">{zone.riskZone.description}</p>
                        </div>
                      </Popup>
                    </Rectangle>
                  ))}

                  {/* Selected Location Marker */}
                  {selectedLocation && (
                    <Marker position={[selectedLocation.lat, selectedLocation.lng]}>
                      <Popup>
                        <div className="p-2">
                          <h5 className="font-semibold">Selected Location</h5>
                          <p className="text-sm">Lat: {selectedLocation.lat.toFixed(4)}</p>
                          <p className="text-sm">Lng: {selectedLocation.lng.toFixed(4)}</p>
                        </div>
                      </Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>
              <div className="mt-4 flex justify-center">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-600 rounded"></div>
                    <span>Critical/High Risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-600 rounded"></div>
                    <span>Moderate Risk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-600 rounded"></div>
                    <span>Low/Minimal Risk</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Location Analysis Sidebar */}
          <div>
            {locationAnalysis ? (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h4 className="text-lg font-semibold mb-4">Location Analysis</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Risk Level</p>
                    <div 
                      className="px-3 py-1 rounded-full text-white font-medium inline-block"
                      style={{ backgroundColor: getRiskColor(locationAnalysis.riskZone.level) }}
                    >
                      {locationAnalysis.riskZone.level}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-600">Overall Risk Score</p>
                    <p className="text-2xl font-bold">{locationAnalysis.overallRisk}%</p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Top Risks</p>
                    {Object.entries(locationAnalysis.disasterRisks)
                      .sort((a, b) => b[1].score - a[1].score)
                      .slice(0, 3)
                      .map(([type, risk]) => (
                        <div key={type} className="flex justify-between items-center py-1">
                          <span className="text-sm">{getDisasterIcon(type)} {type}</span>
                          <span className="font-medium">{risk.score}%</span>
                        </div>
                      ))}
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Recommendations</p>
                    <div className="space-y-1">
                      {locationAnalysis.recommendations.slice(0, 3).map((rec, index) => (
                        <p key={index} className="text-xs text-gray-700 bg-gray-50 p-2 rounded">
                          {rec}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="text-center py-8">
                  <Eye className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Click on a risk zone to view detailed analysis</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Weather Analysis Tab */}
      {activeView === 'weather' && analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h4 className="text-lg font-semibold mb-4">Temperature</h4>
            <div className="flex items-center gap-4">
              <Thermometer className="w-8 h-8 text-red-500" />
              <div>
                <p className="text-3xl font-bold">{analyticsData.weatherConditions.temperature}°C</p>
                <p className="text-gray-600">Current temperature</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h4 className="text-lg font-semibold mb-4">Humidity</h4>
            <div className="flex items-center gap-4">
              <Droplets className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-3xl font-bold">{analyticsData.weatherConditions.humidity}%</p>
                <p className="text-gray-600">Relative humidity</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h4 className="text-lg font-semibold mb-4">Wind Speed</h4>
            <div className="flex items-center gap-4">
              <Wind className="w-8 h-8 text-gray-500" />
              <div>
                <p className="text-3xl font-bold">{analyticsData.weatherConditions.windSpeed} m/s</p>
                <p className="text-gray-600">Current wind speed</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h4 className="text-lg font-semibold mb-4">Precipitation</h4>
            <div className="flex items-center gap-4">
              <Cloud className="w-8 h-8 text-gray-400" />
              <div>
                <p className="text-3xl font-bold">{analyticsData.weatherConditions.precipitation} mm</p>
                <p className="text-gray-600">Hourly precipitation</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h4 className="text-lg font-semibold mb-4">Pressure</h4>
            <div className="flex items-center gap-4">
              <BarChart3 className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-3xl font-bold">{analyticsData.weatherConditions.pressure} hPa</p>
                <p className="text-gray-600">Atmospheric pressure</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h4 className="text-lg font-semibold mb-4">Conditions</h4>
            <div className="flex items-center gap-4">
              <span className="text-4xl">🌤️</span>
              <div>
                <p className="text-xl font-bold">{analyticsData.weatherConditions.condition}</p>
                <p className="text-gray-600">{analyticsData.weatherConditions.description}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Terrain Analysis Tab */}
      {activeView === 'terrain' && analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h4 className="text-lg font-semibold mb-4">Elevation</h4>
            <div className="flex items-center gap-4">
              <Mountain className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-3xl font-bold">{Math.round(analyticsData.terrainFactors.elevation)} m</p>
                <p className="text-gray-600">Above sea level</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h4 className="text-lg font-semibold mb-4">Slope</h4>
            <div className="flex items-center gap-4">
              <TrendingUp className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-3xl font-bold">{Math.round(analyticsData.terrainFactors.slope)}°</p>
                <p className="text-gray-600">Average slope</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h4 className="text-lg font-semibold mb-4">Soil Type</h4>
            <div className="flex items-center gap-4">
              <span className="text-4xl">🌱</span>
              <div>
                <p className="text-xl font-bold capitalize">{analyticsData.terrainFactors.soilType}</p>
                <p className="text-gray-600">Soil composition</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h4 className="text-lg font-semibold mb-4">Water Bodies</h4>
            <div className="flex items-center gap-4">
              <span className="text-4xl">💧</span>
              <div>
                <p className="text-3xl font-bold">{analyticsData.terrainFactors.waterBodies.toFixed(1)} km</p>
                <p className="text-gray-600">Distance to water</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h4 className="text-lg font-semibold mb-4">Vegetation</h4>
            <div className="flex items-center gap-4">
              <span className="text-4xl">🌳</span>
              <div>
                <p className="text-3xl font-bold">{Math.round(analyticsData.terrainFactors.vegetation)}%</p>
                <p className="text-gray-600">Vegetation density</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h4 className="text-lg font-semibold mb-4">Urban Density</h4>
            <div className="flex items-center gap-4">
              <span className="text-4xl">🏢</span>
              <div>
                <p className="text-3xl font-bold">{Math.round(analyticsData.terrainFactors.urbanDensity)}%</p>
                <p className="text-gray-600">Urban development</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PredictiveAnalytics;