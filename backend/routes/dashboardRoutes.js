import express from "express";
import Report from "../models/reportModel.js";
import Resource from "../models/resourceModel.js";

const router = express.Router();

// Dashboard overview endpoint
router.get("/overview", async (req, res) => {
  try {
    // Get report statistics
    const reportStats = {
      total: await Report.countDocuments(),
      pending: await Report.countDocuments({ status: 'pending' }),
      investigating: await Report.countDocuments({ status: 'investigating' }),
      inProgress: await Report.countDocuments({ status: 'in-progress' }),
      resolved: await Report.countDocuments({ status: 'resolved' }),
      highUrgency: await Report.countDocuments({ urgency: 'immediate' }),
      aiVerified: await Report.countDocuments({ aiVerified: true })
    };

    // Get resource statistics
    const resourceStats = {
      total: await Resource.countDocuments({ status: 'active' }),
      available: await Resource.countDocuments({ status: 'active', availability: 'available' }),
      limited: await Resource.countDocuments({ status: 'active', availability: 'limited' }),
      full: await Resource.countDocuments({ status: 'active', availability: 'full' }),
      shelters: await Resource.countDocuments({ type: 'shelter', status: 'active' }),
      reliefCamps: await Resource.countDocuments({ type: 'relief-camp', status: 'active' }),
      medicalCenters: await Resource.countDocuments({ type: 'medical-center', status: 'active' })
    };

    // Get recent reports (last 24 hours)
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentReports = await Report.find({ 
      createdAt: { $gte: last24Hours } 
    }).sort({ createdAt: -1 }).limit(10);

    // Get incident type breakdown
    const incidentBreakdown = await Report.aggregate([
      {
        $group: {
          _id: '$incidentType',
          count: { $sum: 1 },
          highUrgency: {
            $sum: { $cond: [{ $eq: ['$urgency', 'immediate'] }, 1, 0] }
          }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get urgency level distribution
    const urgencyDistribution = await Report.aggregate([
      {
        $group: {
          _id: '$urgency',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate trends (compare last 7 days vs previous 7 days)
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const last14Days = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);

    const recentReportCount = await Report.countDocuments({ 
      createdAt: { $gte: last7Days } 
    });
    const previousReportCount = await Report.countDocuments({ 
      createdAt: { $gte: last14Days, $lt: last7Days } 
    });

    const reportTrend = previousReportCount > 0 
      ? ((recentReportCount - previousReportCount) / previousReportCount * 100).toFixed(1)
      : recentReportCount > 0 ? 100 : 0;

    res.json({
      success: true,
      data: {
        reports: reportStats,
        resources: resourceStats,
        recentReports,
        incidentBreakdown,
        urgencyDistribution,
        trends: {
          reportTrend: parseFloat(reportTrend),
          recentCount: recentReportCount,
          previousCount: previousReportCount
        }
      }
    });
  } catch (error) {
    console.error("Error fetching dashboard overview:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get real-time metrics for live dashboard updates
router.get("/live-metrics", async (req, res) => {
  try {
    const currentTime = new Date();
    const last5Minutes = new Date(currentTime.getTime() - 5 * 60 * 1000);
    const lastHour = new Date(currentTime.getTime() - 60 * 60 * 1000);

    const metrics = {
      timestamp: currentTime,
      recentReports: await Report.countDocuments({ 
        createdAt: { $gte: last5Minutes } 
      }),
      hourlyReports: await Report.countDocuments({ 
        createdAt: { $gte: lastHour } 
      }),
      activeIncidents: await Report.countDocuments({ 
        status: { $in: ['pending', 'investigating', 'in-progress'] }
      }),
      emergencyAlerts: await Report.countDocuments({ 
        urgency: 'immediate',
        status: { $ne: 'resolved' }
      })
    };

    res.json({ success: true, metrics });
  } catch (error) {
    console.error("Error fetching live metrics:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;