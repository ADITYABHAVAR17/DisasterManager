import Report from "../models/reportModel.js";
import { verifyReport } from "../ai/verifier.js";


// Create report (file upload + cloudinary already handled)
export const createReport = async (req, res) => {
  try {
    const { name, disasterType, description, lat, lng } = req.body;
    
    // Debug logging for file upload
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    
    const mediaUrl = req.file ? req.file.path : null;

    // Validate required fields
    if (!name || !disasterType || !description || !lat || !lng) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: name, disasterType, description, lat, lng" 
      });
    }

    // create pending record
    let report = await Report.create({
      name,
      disasterType,
      description,
      location: { lat: Number(lat), lng: Number(lng) },
      mediaUrl,
      verified: false,
    });

    // run AI verification (can be async; here we await for demo)
    let aiResult;
    try {
      aiResult = await verifyReport(report);
    } catch (aiError) {
      console.error("AI verification failed:", aiError);
      // Fallback AI result if verification fails
      aiResult = {
        verified: false,
        category: disasterType.toLowerCase(),
        priority: "medium"
      };
    }

    report.verified = aiResult.verified;
    report.aiCategory = aiResult.category;
    report.priority = aiResult.priority;
    await report.save();

    // Broadcast new report to relevant subscribers
    const broadcastReport = req.app.locals.broadcastReport;
    if (broadcastReport) {
      broadcastReport("newReport", report);
    }

    res.status(201).json({ success: true, report });
  } catch (error) {
    console.error("Error creating report:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Admin verifies a report (example)
export const verifyReportByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { verified } = req.body; // true/false

    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ success: false, message: "Not found" });

    report.verified = Boolean(verified);
    await report.save();

    // Broadcast update to subscribers
    const broadcastReport = req.app.locals.broadcastReport;
    broadcastReport("reportUpdated", report);

    res.json({ success: true, report });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};


export const getReports = async (req, res) => {
  try {
    const reports = await Report.find();
    res.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Test endpoint for debugging file uploads
export const testUpload = async (req, res) => {
  try {
    console.log("Test upload - Request body:", req.body);
    console.log("Test upload - Request file:", req.file);
    
    if (req.file) {
      res.json({
        success: true,
        message: "File uploaded successfully",
        file: {
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: req.file.path
        }
      });
    } else {
      res.json({
        success: false,
        message: "No file uploaded",
        body: req.body
      });
    }
  } catch (error) {
    console.error("Test upload error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};