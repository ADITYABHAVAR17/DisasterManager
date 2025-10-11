import express from "express";
import { 
  getRiskAnalysis,
  getRiskMap, 
  getWeatherAnalysis,
  getTerrainAnalysis,
  getHistoricalAnalysis,
  getPredictiveAnalytics
} from "./predictiveController.js";

const router = express.Router();

// Main endpoints
router.get("/analytics", getPredictiveAnalytics);
router.get("/risk-analysis", getRiskAnalysis);
router.get("/risk-map", getRiskMap);
router.get("/weather", getWeatherAnalysis);
router.get("/terrain", getTerrainAnalysis);
router.get("/historical", getHistoricalAnalysis);

// Legacy endpoint (for backward compatibility)
router.get("/risk", getRiskAnalysis);

export default router;
