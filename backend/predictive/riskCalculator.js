import Report from "../models/reportModel.js";

// Simple risk scoring: density of reports + severity + weather factor
export const calculateRiskScore = async (lat, lng) => {
  // 1. Get nearby historical reports (within 5 km)
  const nearbyReports = await Report.find({
    "location.lat": { $gte: lat - 0.05, $lte: lat + 0.05 },
    "location.lng": { $gte: lng - 0.05, $lte: lng + 0.05 },
  });

  // 2. Calculate base risk
  let baseScore = nearbyReports.reduce((acc, r) => {
    if (r.priority === "high") return acc + 3;
    if (r.priority === "medium") return acc + 2;
    return acc + 1;
  }, 0);

  // 3. Optionally, fetch weather data
  // const weatherFactor = await getWeatherFactor(lat, lng);
  const weatherFactor = 1.2; // placeholder

  // Final risk score
  const riskScore = baseScore * weatherFactor;
  return { lat, lng, riskScore };
};
