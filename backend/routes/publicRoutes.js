import express from "express";
import Report from "../models/reportModel.js";

const router = express.Router();

// Get verified reports only
router.get("/reports", async (req, res) => {
  try {
    const reports = await Report.find({ verified: true }).sort({ createdAt: -1 });
    res.json({ success: true, reports });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
