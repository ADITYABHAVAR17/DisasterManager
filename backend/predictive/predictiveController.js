import { calculateRiskScore, getWeatherData, getTerrainData } from "./riskCalculator.js";
import Report from "../models/reportModel.js";

// Get comprehensive risk analysis for a location
export const getRiskAnalysis = async (req, res) => {
  try {
    const { lat, lng, analysisType = 'comprehensive' } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing coordinates (lat, lng)" 
      });
    }

    const riskAnalysis = await calculateRiskScore(
      Number(lat), 
      Number(lng), 
      analysisType
    );
    
    res.json({ 
      success: true, 
      data: riskAnalysis 
    });
  } catch (err) {
    console.error('Risk analysis error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// Get risk map for a region (grid of risk zones)
export const getRiskMap = async (req, res) => {
  try {
    const { 
      centerLat, 
      centerLng, 
      radiusKm = 10, 
      gridSize = 5 
    } = req.query;

    if (!centerLat || !centerLng) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing center coordinates" 
      });
    }

    const lat = Number(centerLat);
    const lng = Number(centerLng);
    const radius = Number(radiusKm);
    const grid = Number(gridSize);

    // Calculate grid bounds
    const latStep = (radius * 2) / (grid * 111); // Convert km to degrees
    const lngStep = (radius * 2) / (grid * 111 * Math.cos(lat * Math.PI / 180));
    
    const startLat = lat - (radius / 111);
    const startLng = lng - (radius / (111 * Math.cos(lat * Math.PI / 180)));

    const riskZones = [];
    
    // Generate risk analysis for each grid cell
    for (let i = 0; i < grid; i++) {
      for (let j = 0; j < grid; j++) {
        const cellLat = startLat + (i * latStep);
        const cellLng = startLng + (j * lngStep);
        
        try {
          const riskData = await calculateRiskScore(cellLat, cellLng);
          riskZones.push({
            id: `${i}-${j}`,
            bounds: {
              north: cellLat + latStep,
              south: cellLat,
              east: cellLng + lngStep,
              west: cellLng
            },
            center: { lat: cellLat + latStep/2, lng: cellLng + lngStep/2 },
            ...riskData
          });
        } catch (error) {
          console.warn(`Failed to calculate risk for cell ${i}-${j}:`, error.message);
        }
      }
    }

    res.json({ 
      success: true, 
      data: {
        center: { lat, lng },
        radius,
        gridSize: grid,
        riskZones,
        generatedAt: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('Risk map error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// Get weather data for a location
export const getWeatherAnalysis = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing coordinates" 
      });
    }

    const weatherData = await getWeatherData(Number(lat), Number(lng));
    
    res.json({ 
      success: true, 
      data: weatherData 
    });
  } catch (err) {
    console.error('Weather analysis error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// Get terrain analysis for a location
export const getTerrainAnalysis = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing coordinates" 
      });
    }

    const terrainData = await getTerrainData(Number(lat), Number(lng));
    
    res.json({ 
      success: true, 
      data: terrainData 
    });
  } catch (err) {
    console.error('Terrain analysis error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// Get historical incident analysis
export const getHistoricalAnalysis = async (req, res) => {
  try {
    const { lat, lng, radiusKm = 5, months = 12 } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing coordinates" 
      });
    }

    const latitude = Number(lat);
    const longitude = Number(lng);
    const radius = Number(radiusKm);
    const monthsBack = Number(months);

    // Calculate search bounds
    const latRange = radius / 111;
    const lngRange = radius / (111 * Math.cos(latitude * Math.PI / 180));
    
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - monthsBack);

    const reports = await Report.find({
      "location.lat": { $gte: latitude - latRange, $lte: latitude + latRange },
      "location.lng": { $gte: longitude - lngRange, $lte: longitude + lngRange },
      createdAt: { $gte: startDate }
    }).sort({ createdAt: -1 });

    // Analyze patterns
    const analysis = {
      totalIncidents: reports.length,
      timeRange: { from: startDate, to: new Date() },
      incidentsByType: {},
      incidentsBySeverity: { high: 0, moderate: 0, low: 0 },
      monthlyTrends: {},
      seasonalPatterns: { spring: 0, summer: 0, fall: 0, winter: 0 },
      averageResponseTime: 0,
      mostCommonTypes: [],
      riskTrends: 'stable'
    };

    // Process reports
    reports.forEach(report => {
      // By type
      analysis.incidentsByType[report.type] = (analysis.incidentsByType[report.type] || 0) + 1;
      
      // By severity
      analysis.incidentsBySeverity[report.priority] = (analysis.incidentsBySeverity[report.priority] || 0) + 1;
      
      // Monthly trends
      const month = report.createdAt.toISOString().slice(0, 7);
      analysis.monthlyTrends[month] = (analysis.monthlyTrends[month] || 0) + 1;
      
      // Seasonal patterns
      const month_num = report.createdAt.getMonth();
      if (month_num >= 2 && month_num <= 4) analysis.seasonalPatterns.spring++;
      else if (month_num >= 5 && month_num <= 7) analysis.seasonalPatterns.summer++;
      else if (month_num >= 8 && month_num <= 10) analysis.seasonalPatterns.fall++;
      else analysis.seasonalPatterns.winter++;
    });

    // Most common incident types
    analysis.mostCommonTypes = Object.entries(analysis.incidentsByType)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));

    // Risk trend analysis
    const recentReports = reports.filter(r => 
      new Date(r.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );
    const previousReports = reports.filter(r => {
      const date = new Date(r.createdAt);
      return date <= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) && 
             date > new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    });

    if (recentReports.length > previousReports.length * 1.2) {
      analysis.riskTrends = 'increasing';
    } else if (recentReports.length < previousReports.length * 0.8) {
      analysis.riskTrends = 'decreasing';
    }

    res.json({ 
      success: true, 
      data: analysis 
    });
  } catch (err) {
    console.error('Historical analysis error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// Get comprehensive dashboard analytics
export const getPredictiveAnalytics = async (req, res) => {
  try {
    const { region = 'pittsburgh' } = req.query;
    
    // Pittsburgh coordinates as default
    const centerCoords = {
      pittsburgh: { lat: 40.4406, lng: -79.9959 },
      // Add more regions as needed
    };

    const coords = centerCoords[region] || centerCoords.pittsburgh;
    
    // Get comprehensive analysis for the region
    const [riskAnalysis, weatherData, terrainData] = await Promise.all([
      calculateRiskScore(coords.lat, coords.lng),
      getWeatherData(coords.lat, coords.lng),
      getTerrainData(coords.lat, coords.lng)
    ]);

    // Get recent incidents for context
    const recentIncidents = await Report.find({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).limit(10);

    const dashboard = {
      region,
      centerCoordinates: coords,
      currentRiskLevel: riskAnalysis.riskZone,
      overallRisk: riskAnalysis.overallRisk,
      weatherConditions: weatherData.current,
      terrainFactors: terrainData,
      disasterRisks: riskAnalysis.disasterRisks,
      recommendations: riskAnalysis.recommendations,
      recentIncidents: recentIncidents.length,
      alerts: generateAlerts(riskAnalysis, weatherData),
      lastUpdated: new Date().toISOString()
    };

    res.json({ 
      success: true, 
      data: dashboard 
    });
  } catch (err) {
    console.error('Predictive analytics error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message 
    });
  }
};

// Generate alerts based on risk analysis
const generateAlerts = (riskAnalysis, weatherData) => {
  const alerts = [];
  
  // Check for high-risk conditions
  Object.entries(riskAnalysis.disasterRisks).forEach(([type, risk]) => {
    if (risk.level === 'HIGH') {
      alerts.push({
        type: 'WARNING',
        category: type,
        message: `High ${type.toLowerCase()} risk detected`,
        severity: 'high',
        timestamp: new Date().toISOString()
      });
    }
  });

  // Weather-based alerts
  if (weatherData.current.windSpeed > 15) {
    alerts.push({
      type: 'WEATHER',
      category: 'WIND',
      message: `Strong winds detected: ${weatherData.current.windSpeed} m/s`,
      severity: 'medium',
      timestamp: new Date().toISOString()
    });
  }

  if (weatherData.current.precipitation > 5) {
    alerts.push({
      type: 'WEATHER',
      category: 'PRECIPITATION',
      message: `Heavy precipitation: ${weatherData.current.precipitation} mm/h`,
      severity: 'medium',
      timestamp: new Date().toISOString()
    });
  }

  return alerts;
};
