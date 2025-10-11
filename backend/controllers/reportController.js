import Report from "../models/reportModel.js";
import { verifyReport } from "../ai/verifier.js";


// Create report (file upload + cloudinary already handled)
export const createReport = async (req, res) => {
  try {
    const { 
      name, 
      disasterType, 
      incidentType, 
      urgency, 
      description, 
      lat, 
      lng, 
      address,
      phone, 
      witnessCount, 
      estimatedAffected, 
      additionalContact 
    } = req.body;
    
    // Debug logging for file upload
    console.log("Request body:", req.body);
    console.log("Request file:", req.file);
    
    const mediaUrl = req.file ? req.file.path : null;

    // Validate required fields
    if (!name || !incidentType || !urgency || !description || !lat || !lng || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: "Missing required fields: name, incidentType, urgency, description, lat, lng, phone" 
      });
    }

    // Create pending record with new fields
    let report = await Report.create({
      name,
      disasterType: disasterType || incidentType, // Backward compatibility
      incidentType,
      urgency,
      description,
      location: { 
        lat: Number(lat), 
        lng: Number(lng),
        address: address || undefined
      },
      phone,
      witnessCount: witnessCount ? Number(witnessCount) : 1,
      estimatedAffected: estimatedAffected ? Number(estimatedAffected) : 1,
      additionalContact: additionalContact || undefined,
      mediaUrl,
      verified: false,
      aiVerified: false,
      status: 'pending'
    });

    // Run AI verification (can be async; here we await for demo)
    let aiResult;
    try {
      aiResult = await verifyReport(report);
      report.aiVerified = aiResult.verified;
    } catch (aiError) {
      console.error("AI verification failed:", aiError);
      // Fallback AI result if verification fails
      aiResult = {
        verified: false,
        category: incidentType || disasterType?.toLowerCase(),
        priority: urgency === 'immediate' ? 'high' : urgency === 'urgent' ? 'medium' : 'low'
      };
      report.aiVerified = false;
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
    if (verified) {
      report.status = 'investigating'; // Update status when verified
    }
    await report.save();

    // Broadcast update to subscribers
    const broadcastReport = req.app.locals.broadcastReport;
    if (broadcastReport) {
      broadcastReport("reportUpdated", report);
    }

    res.json({ success: true, report });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// Admin updates a report
export const updateReportByAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const report = await Report.findById(id);
    if (!report) return res.status(404).json({ success: false, message: "Report not found" });

    // Update status if provided
    if (status) {
      report.status = status;
    }

    // Add notes if provided
    if (notes && notes.trim()) {
      if (!report.notes) report.notes = [];
      report.notes.push({
        content: notes.trim(),
        addedBy: req.user?.name || 'Admin',
        timestamp: new Date()
      });
    }

    await report.save();

    // Broadcast update to subscribers
    const broadcastReport = req.app.locals.broadcastReport;
    if (broadcastReport) {
      broadcastReport("reportUpdated", report);
    }

    res.json({ success: true, report });
  } catch (err) {
    console.error("Error updating report:", err);
    res.status(400).json({ success: false, message: err.message });
  }
};


export const getReports = async (req, res) => {
  try {
    const { 
      status, 
      urgency, 
      incidentType, 
      verified, 
      page = 1, 
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (urgency) filter.urgency = urgency;
    if (incidentType) filter.incidentType = incidentType;
    if (verified !== undefined) filter.verified = verified === 'true';

    // Pagination
    const skip = (page - 1) * limit;
    const sortObj = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const reports = await Report.find(filter)
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Report.countDocuments(filter);

    res.json({
      success: true,
      reports,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / limit),
        count: reports.length,
        totalReports: total
      }
    });
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update report status
export const updateReportStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assignedTo, note } = req.body;

    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    // Update status and assignment
    if (status) report.status = status;
    if (assignedTo) report.assignedTo = assignedTo;

    // Add note if provided
    if (note) {
      report.notes.push({
        content: note,
        addedBy: req.user?.name || 'Admin', // Assuming user info from auth middleware
        timestamp: new Date()
      });
    }

    await report.save();

    // Broadcast update to subscribers
    const broadcastReport = req.app.locals.broadcastReport;
    if (broadcastReport) {
      broadcastReport("reportUpdated", report);
    }

    res.json({ success: true, report });
  } catch (error) {
    console.error("Error updating report:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get report statistics for admin dashboard
export const getReportStats = async (req, res) => {
  try {
    const totalReports = await Report.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    const resolvedReports = await Report.countDocuments({ status: 'resolved' });
    const highUrgencyReports = await Report.countDocuments({ urgency: 'immediate' });

    // Get reports by incident type
    const reportsByType = await Report.aggregate([
      {
        $group: {
          _id: '$incidentType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get reports by urgency level
    const reportsByUrgency = await Report.aggregate([
      {
        $group: {
          _id: '$urgency',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      stats: {
        total: totalReports,
        pending: pendingReports,
        resolved: resolvedReports,
        highUrgency: highUrgencyReports,
        byType: reportsByType,
        byUrgency: reportsByUrgency
      }
    });
  } catch (error) {
    console.error("Error fetching report stats:", error);
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