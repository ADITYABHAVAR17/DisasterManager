import Report from "../models/reportModel.js";
import { verifyReport } from "../ai/verifier.js";

export const createReport = async (req, res) => {
  try {
    const { name, disasterType, description, lat, lng } = req.body;
    const mediaUrl = req.file ? req.file.path : null;

    // Step 1: Create a temporary record
    let report = await Report.create({
      name,
      disasterType,
      description,
      location: { lat, lng },
      mediaUrl,
      verified: false,
    });

    // Step 2: Run AI verification asynchronously
    const aiResult = await verifyReport(report);

    report.verified = aiResult.verified;
    report.aiCategory = aiResult.category;
    report.priority = aiResult.priority;

    await report.save();

    res.status(201).json({ success: true, report });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


export const getReports = async (req, res) => {
  const reports = await Report.find();
  res.json(reports);
};
