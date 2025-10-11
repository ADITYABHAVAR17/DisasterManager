import { calculateRiskScore } from "./riskCalculator.js";

export const getRiskMap = async (req, res) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) return res.status(400).json({ success: false, message: "Missing coordinates" });

    const risk = await calculateRiskScore(Number(lat), Number(lng));
    res.json({ success: true, risk });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};
