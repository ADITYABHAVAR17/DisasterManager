import mongoose from "mongoose";
import connectDB from "../config/db.js";

// Sample data for testing the predictive analytics system
const sampleWeatherData = {
  currentConditions: {
    temperature: 22.5,
    humidity: 65,
    pressure: 1013.2,
    windSpeed: 8.5,
    windDirection: 180,
    precipitation: 0.2,
    visibility: 9500,
    cloudCover: 45,
    condition: 'Partly Cloudy',
    description: 'Partly cloudy with light winds'
  },
  forecast: [
    { hour: 1, temp: 21, humidity: 68, precipitation: 0, windSpeed: 7 },
    { hour: 2, temp: 20, humidity: 70, precipitation: 0.1, windSpeed: 6 },
    { hour: 3, temp: 19, humidity: 75, precipitation: 0.5, windSpeed: 8 },
    { hour: 4, temp: 18, humidity: 80, precipitation: 1.2, windSpeed: 12 },
    { hour: 5, temp: 17, humidity: 85, precipitation: 2.5, windSpeed: 15 },
    { hour: 6, temp: 18, humidity: 82, precipitation: 1.8, windSpeed: 13 }
  ]
};

const sampleTerrainData = {
  pittsburgh: {
    elevation: 235,
    slope: 8.5,
    soilType: 'loam',
    waterBodies: 2.3,
    vegetation: 45,
    urbanDensity: 75
  },
  hillAreas: {
    elevation: 450,
    slope: 25,
    soilType: 'rocky',
    waterBodies: 5.2,
    vegetation: 80,
    urbanDensity: 20
  },
  riverlands: {
    elevation: 180,
    slope: 2,
    soilType: 'clay',
    waterBodies: 0.5,
    vegetation: 30,
    urbanDensity: 60
  }
};

console.log('✅ Sample data initialized for predictive analytics');
console.log('Weather conditions:', sampleWeatherData.currentConditions);
console.log('Terrain profiles:', Object.keys(sampleTerrainData));
console.log('🌟 Predictive analytics system ready for testing');

// This is a utility file for reference - no database seeding needed
export { sampleWeatherData, sampleTerrainData };