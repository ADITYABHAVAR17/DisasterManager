import Report from "../models/reportModel.js";
import axios from "axios";

// Weather API configuration (using OpenWeatherMap - replace with your API key)
const WEATHER_API_KEY = process.env.WEATHER_API_KEY || "a20b0be12d000c0d0de0083058a365bc";
const WEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5";

// Terrain elevation API (using Open-Elevation)
const ELEVATION_BASE_URL = "https://api.open-elevation.com/api/v1";
const BACKUP_ELEVATION_API = "https://api.opentopodata.org/v1/srtm30m"; // Backup API

// Rate limiting for API calls
const apiCallCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache
const MIN_REQUEST_INTERVAL = 1000; // 1 second between requests
let lastApiCall = 0;

// Risk zone types and their base risk scores
const RISK_ZONE_TYPES = {
  FLOOD: { weight: 0.8, factors: ['precipitation', 'elevation', 'waterBodies'] },
  LANDSLIDE: { weight: 0.7, factors: ['elevation', 'slope', 'precipitation'] },
  WILDFIRE: { weight: 0.6, factors: ['temperature', 'humidity', 'windSpeed', 'vegetation'] },
  EARTHQUAKE: { weight: 0.9, factors: ['seismicActivity', 'elevation', 'soilType'] },
  STORM: { weight: 0.7, factors: ['windSpeed', 'pressure', 'temperature'] },
  DROUGHT: { weight: 0.5, factors: ['temperature', 'humidity', 'precipitation'] }
};

// Get weather data from API
export const getWeatherData = async (lat, lng) => {
  // Create cache key
  const cacheKey = `weather_${lat.toFixed(3)}_${lng.toFixed(3)}`;
  
  // Check cache first (weather data cached for shorter time)
  const cached = apiCallCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < (10 * 60 * 1000)) { // 10 minutes for weather
    console.log('Using cached weather data for', lat, lng);
    return cached.data;
  }

  try {
    // Rate limiting
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCall;
    if (timeSinceLastCall < MIN_REQUEST_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastCall));
    }
    lastApiCall = Date.now();

    console.log('Fetching weather data from API for', lat, lng);
    
    // Current weather
    const currentWeather = await axios.get(
      `${WEATHER_BASE_URL}/weather?lat=${lat}&lon=${lng}&appid=${WEATHER_API_KEY}&units=metric`,
      { timeout: 5000 }
    );

    // Weather forecast (5 day)
    const forecast = await axios.get(
      `${WEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lng}&appid=${WEATHER_API_KEY}&units=metric`,
      { timeout: 5000 }
    );

    const weatherData = {
      current: {
        temperature: currentWeather.data.main.temp,
        humidity: currentWeather.data.main.humidity,
        pressure: currentWeather.data.main.pressure,
        windSpeed: currentWeather.data.wind?.speed || 0,
        windDirection: currentWeather.data.wind?.deg || 0,
        precipitation: currentWeather.data.rain?.['1h'] || currentWeather.data.snow?.['1h'] || 0,
        visibility: currentWeather.data.visibility || 10000,
        cloudCover: currentWeather.data.clouds.all,
        condition: currentWeather.data.weather[0].main,
        description: currentWeather.data.weather[0].description
      },
      forecast: forecast.data.list.slice(0, 8).map(item => ({
        datetime: item.dt_txt,
        temperature: item.main.temp,
        humidity: item.main.humidity,
        precipitation: item.rain?.['3h'] || item.snow?.['3h'] || 0,
        windSpeed: item.wind?.speed || 0,
        condition: item.weather[0].main
      }))
    };

    // Cache the result
    apiCallCache.set(cacheKey, {
      data: weatherData,
      timestamp: Date.now()
    });

    return weatherData;
  } catch (error) {
    const errorCode = error.response?.status || error.code || 'UNKNOWN';
    const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
    
    console.warn(`⚠️  Weather API error (${errorCode}): ${errorMessage} for ${lat}, ${lng}`);
    console.warn('🔄 Using mock weather data');
    
    const mockData = getMockWeatherData(lat, lng);
    
    // Cache mock data
    apiCallCache.set(cacheKey, {
      data: mockData,
      timestamp: Date.now() - (CACHE_DURATION * 0.8)
    });
    
    return mockData;
  }
};

// Get terrain elevation data
export const getTerrainData = async (lat, lng) => {
  // Create cache key
  const cacheKey = `terrain_${lat.toFixed(3)}_${lng.toFixed(3)}`;
  
  // Check cache first
  const cached = apiCallCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    console.log('Using cached terrain data for', lat, lng);
    return cached.data;
  }

  try {
    // Rate limiting - wait if needed
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCall;
    if (timeSinceLastCall < MIN_REQUEST_INTERVAL) {
      await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastCall));
    }
    lastApiCall = Date.now();

    console.log('Fetching terrain data from API for', lat, lng);
    let elevation = 0;
    
    try {
      // Try primary API first
      const response = await axios.get(
        `${ELEVATION_BASE_URL}/lookup?locations=${lat},${lng}`,
        { timeout: 5000 }
      );
      elevation = response.data.results[0]?.elevation || 0;
      console.log('Primary elevation API successful');
    } catch (primaryError) {
      console.log('Primary elevation API failed, trying backup...');
      
      try {
        // Try backup API
        const backupResponse = await axios.get(
          `${BACKUP_ELEVATION_API}?locations=${lat},${lng}`,
          { timeout: 5000 }
        );
        elevation = backupResponse.data.results[0]?.elevation || 0;
        console.log('Backup elevation API successful');
      } catch (backupError) {
        // Both APIs failed, throw to use mock data
        throw new Error(`Both elevation APIs failed: ${primaryError.message}`);
      }
    }
    
    // Calculate terrain analysis
    const terrainData = {
      elevation,
      slope: calculateSlope(elevation, lat, lng),
      soilType: classifySoilType(elevation, lat, lng),
      waterBodies: calculateWaterBodyProximity(lat, lng),
      vegetation: classifyVegetation(lat, lng),
      urbanDensity: calculateUrbanDensity(lat, lng)
    };

    // Cache the result
    apiCallCache.set(cacheKey, {
      data: terrainData,
      timestamp: Date.now()
    });

    return terrainData;
  } catch (error) {
    const errorCode = error.response?.status || error.code || 'UNKNOWN';
    const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
    
    console.warn(`⚠️  Terrain API error (${errorCode}): ${errorMessage} for ${lat}, ${lng}`);
    console.warn('🔄 Falling back to realistic mock data generation');
    
    // Generate more realistic mock data based on location
    const mockData = getMockTerrainData(lat, lng);
    
    // Cache the mock data too (shorter duration)
    apiCallCache.set(cacheKey, {
      data: mockData,
      timestamp: Date.now() - (CACHE_DURATION * 0.8) // Cache for shorter time
    });
    
    return mockData;
  }
};

// Calculate comprehensive risk score
export const calculateRiskScore = async (lat, lng, analysisType = 'comprehensive') => {
  try {
    // 1. Get historical incident data
    const historicalData = await getHistoricalIncidents(lat, lng);
    
    // 2. Get weather data
    const weatherData = await getWeatherData(lat, lng);
    
    // 3. Get terrain data
    const terrainData = await getTerrainData(lat, lng);
    
    // 4. Calculate risk for each disaster type
    const riskAnalysis = {};
    
    for (const [riskType, config] of Object.entries(RISK_ZONE_TYPES)) {
      riskAnalysis[riskType] = calculateDisasterTypeRisk(
        riskType,
        config,
        weatherData,
        terrainData,
        historicalData
      );
    }
    
    // 5. Calculate overall risk score
    const overallRisk = calculateOverallRisk(riskAnalysis);
    
    // 6. Generate risk zone classification
    const riskZone = classifyRiskZone(overallRisk);
    
    return {
      location: { lat, lng },
      overallRisk,
      riskZone,
      disasterRisks: riskAnalysis,
      weatherData: weatherData.current,
      terrainData,
      historicalIncidents: historicalData.incidents.length,
      recommendations: generateRecommendations(riskAnalysis, riskZone),
      lastAnalyzed: new Date().toISOString()
    };
  } catch (error) {
    console.error('Risk calculation error:', error);
    throw new Error('Failed to calculate risk score');
  }
};

// Get historical incident data from reports
const getHistoricalIncidents = async (lat, lng, radiusKm = 5) => {
  const latRange = radiusKm / 111; // Approximate degree per km
  const lngRange = radiusKm / (111 * Math.cos(lat * Math.PI / 180));
  
  const reports = await Report.find({
    "location.lat": { $gte: lat - latRange, $lte: lat + latRange },
    "location.lng": { $gte: lng - lngRange, $lte: lng + lngRange },
    createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } // Last year
  });
  
  return {
    incidents: reports,
    floodCount: reports.filter(r => r.type === 'flooding').length,
    landslideCount: reports.filter(r => r.type === 'landslide').length,
    stormCount: reports.filter(r => r.type === 'severe-weather').length,
    fireCount: reports.filter(r => r.type === 'fire').length,
    totalSeverity: reports.reduce((sum, r) => {
      const severityScore = r.priority === 'high' ? 3 : r.priority === 'moderate' ? 2 : 1;
      return sum + severityScore;
    }, 0)
  };
};

// Calculate risk for specific disaster type
const calculateDisasterTypeRisk = (riskType, config, weatherData, terrainData, historicalData) => {
  let riskScore = 0;
  const factors = {};
  
  switch (riskType) {
    case 'FLOOD':
      factors.precipitation = Math.min(weatherData.current.precipitation * 10, 100);
      factors.elevation = Math.max(0, 100 - terrainData.elevation / 10);
      factors.waterBodies = terrainData.waterBodies * 20;
      factors.historical = historicalData.floodCount * 15;
      break;
      
    case 'LANDSLIDE':
      factors.slope = terrainData.slope * 2;
      factors.precipitation = weatherData.current.precipitation * 8;
      factors.elevation = Math.min(terrainData.elevation / 20, 50);
      factors.soilType = getSoilRiskFactor(terrainData.soilType);
      factors.historical = historicalData.landslideCount * 20;
      break;
      
    case 'WILDFIRE':
      factors.temperature = Math.max(0, weatherData.current.temperature - 25) * 2;
      factors.humidity = Math.max(0, 80 - weatherData.current.humidity);
      factors.windSpeed = weatherData.current.windSpeed * 3;
      factors.vegetation = terrainData.vegetation * 1.5;
      factors.historical = historicalData.fireCount * 15;
      break;
      
    case 'STORM':
      factors.windSpeed = weatherData.current.windSpeed * 2;
      factors.pressure = Math.max(0, 1013 - weatherData.current.pressure) * 0.1;
      factors.temperature = Math.abs(weatherData.current.temperature - 20) * 0.5;
      factors.historical = historicalData.stormCount * 10;
      break;
      
    case 'EARTHQUAKE':
      factors.seismicActivity = getSeismicActivity(terrainData.elevation);
      factors.elevation = terrainData.elevation / 50;
      factors.soilType = getSoilRiskFactor(terrainData.soilType);
      factors.urbanDensity = terrainData.urbanDensity;
      break;
      
    case 'DROUGHT':
      factors.temperature = Math.max(0, weatherData.current.temperature - 30);
      factors.humidity = Math.max(0, 60 - weatherData.current.humidity);
      factors.precipitation = Math.max(0, 50 - weatherData.current.precipitation * 100);
      break;
  }
  
  // Calculate weighted risk score
  riskScore = Object.values(factors).reduce((sum, factor) => sum + factor, 0);
  riskScore = Math.min(riskScore * config.weight, 100);
  
  return {
    score: Math.round(riskScore),
    level: riskScore > 70 ? 'HIGH' : riskScore > 40 ? 'MEDIUM' : 'LOW',
    factors,
    confidence: calculateConfidence(factors)
  };
};

// Calculate overall risk from individual disaster risks
const calculateOverallRisk = (riskAnalysis) => {
  const scores = Object.values(riskAnalysis).map(risk => risk.score);
  const maxScore = Math.max(...scores);
  const avgScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
  
  // Weight towards highest risk
  return Math.round((maxScore * 0.6) + (avgScore * 0.4));
};

// Classify risk zone
const classifyRiskZone = (overallRisk) => {
  if (overallRisk >= 80) return { level: 'CRITICAL', color: '#DC2626', description: 'Immediate evacuation recommended' };
  if (overallRisk >= 60) return { level: 'HIGH', color: '#EA580C', description: 'High risk - prepare for evacuation' };
  if (overallRisk >= 40) return { level: 'MODERATE', color: '#D97706', description: 'Moderate risk - stay alert' };
  if (overallRisk >= 20) return { level: 'LOW', color: '#65A30D', description: 'Low risk - normal precautions' };
  return { level: 'MINIMAL', color: '#16A34A', description: 'Minimal risk detected' };
};

// Generate recommendations based on risk analysis
const generateRecommendations = (riskAnalysis, riskZone) => {
  const recommendations = [];
  
  // High-risk disaster types
  const highRisks = Object.entries(riskAnalysis)
    .filter(([_, risk]) => risk.level === 'HIGH')
    .map(([type, _]) => type);
  
  if (highRisks.includes('FLOOD')) {
    recommendations.push('Monitor water levels and prepare sandbags');
    recommendations.push('Identify higher ground evacuation routes');
  }
  
  if (highRisks.includes('WILDFIRE')) {
    recommendations.push('Clear vegetation around structures');
    recommendations.push('Prepare fire suppression equipment');
  }
  
  if (highRisks.includes('LANDSLIDE')) {
    recommendations.push('Monitor slope stability and drainage');
    recommendations.push('Avoid construction on steep slopes');
  }
  
  if (riskZone.level === 'CRITICAL' || riskZone.level === 'HIGH') {
    recommendations.push('Establish emergency communication plan');
    recommendations.push('Prepare emergency supply kit');
    recommendations.push('Identify nearest evacuation routes');
  }
  
  return recommendations.length > 0 ? recommendations : ['Continue normal monitoring'];
};

// Helper functions for terrain analysis
const calculateSlope = (elevation, lat, lng) => {
  // Simplified slope calculation (would use DEM data in production)
  return Math.min(Math.abs(elevation - 300) / 10, 45); // Mock slope based on elevation variance
};

const classifySoilType = (elevation, lat, lng) => {
  // Mock soil classification based on elevation and location
  if (elevation < 200) return 'clay';
  if (elevation < 500) return 'loam';
  if (elevation < 1000) return 'sandy';
  return 'rocky';
};

const calculateWaterBodyProximity = (lat, lng) => {
  // Mock calculation - in production would use GIS data
  return Math.random() * 5; // 0-5 km to nearest water body
};

const classifyVegetation = (lat, lng) => {
  // Mock vegetation density (0-100)
  return Math.random() * 100;
};

const calculateUrbanDensity = (lat, lng) => {
  // Mock urban density calculation
  return Math.random() * 100;
};

const getSoilRiskFactor = (soilType) => {
  const riskFactors = { clay: 40, loam: 20, sandy: 30, rocky: 10 };
  return riskFactors[soilType] || 25;
};

const getSeismicActivity = (elevation) => {
  // Mock seismic activity based on elevation
  return Math.min(elevation / 100, 30);
};

const calculateConfidence = (factors) => {
  // Calculate confidence based on data availability
  const factorCount = Object.keys(factors).length;
  return Math.min(factorCount * 15, 100);
};

// Mock data generators for fallback
const getMockWeatherData = (lat, lng) => {
  return {
    current: {
      temperature: 20 + Math.random() * 15,
      humidity: 40 + Math.random() * 40,
      pressure: 1000 + Math.random() * 40,
      windSpeed: Math.random() * 20,
      windDirection: Math.random() * 360,
      precipitation: Math.random() * 5,
      visibility: 8000 + Math.random() * 2000,
      cloudCover: Math.random() * 100,
      condition: 'Clear',
      description: 'Clear sky'
    },
    forecast: Array(8).fill(0).map((_, i) => ({
      datetime: new Date(Date.now() + i * 3 * 60 * 60 * 1000).toISOString(),
      temperature: 18 + Math.random() * 12,
      humidity: 45 + Math.random() * 30,
      precipitation: Math.random() * 3,
      windSpeed: Math.random() * 15,
      condition: 'Clear'
    }))
  };
};

// Clean up old cache entries periodically
const cleanupCache = () => {
  const now = Date.now();
  for (const [key, value] of apiCallCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      apiCallCache.delete(key);
    }
  }
};

// Run cache cleanup every 10 minutes
setInterval(cleanupCache, 10 * 60 * 1000);

// Export cleanup function for manual use
export const clearApiCache = () => {
  apiCallCache.clear();
  console.log('API cache cleared');
};

const getMockTerrainData = (lat, lng) => {
  // Generate more realistic mock data based on actual geographic patterns
  // Using latitude/longitude to simulate realistic terrain variations
  
  // Simulate elevation based on location (very simplified)
  const latFactor = Math.abs(lat - 20); // Distance from base latitude
  const lngFactor = Math.abs(lng - 73); // Distance from base longitude
  const baseElevation = Math.max(0, 200 - (latFactor * 10) - (lngFactor * 5) + (Math.random() * 100));
  
  // Coastal areas tend to be lower elevation
  const distanceFromCoast = Math.min(latFactor, lngFactor);
  const elevation = distanceFromCoast < 2 ? baseElevation * 0.3 : baseElevation;
  
  // Slope calculation based on elevation variance
  const slope = Math.min(elevation / 20 + Math.random() * 15, 45);
  
  // Soil type based on elevation and region
  let soilType;
  if (elevation < 100) soilType = 'clay';
  else if (elevation < 300) soilType = 'loam';
  else if (elevation < 600) soilType = 'sandy';
  else soilType = 'rocky';
  
  // Water body proximity (coastal areas have closer water bodies)
  const waterBodies = distanceFromCoast < 2 ? Math.random() * 2 : Math.random() * 5;
  
  // Vegetation density (varies by elevation and climate)
  const vegetation = Math.max(20, 80 - (elevation / 10) + (Math.random() * 30));
  
  // Urban density (lower in mountainous areas)
  const urbanDensity = Math.max(5, 60 - (elevation / 15) + (Math.random() * 40));
  
  console.log(`Generated realistic mock terrain for ${lat}, ${lng}: elevation=${elevation.toFixed(0)}m, slope=${slope.toFixed(1)}°`);
  
  return {
    elevation: Math.round(elevation),
    slope: Math.round(slope * 10) / 10,
    soilType,
    waterBodies: Math.round(waterBodies * 10) / 10,
    vegetation: Math.round(vegetation),
    urbanDensity: Math.round(urbanDensity)
  };
};
