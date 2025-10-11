import express from "express";
import upload from "../middleware/multer.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { 
  createReport, 
  getReports, 
  verifyReportByAdmin, 
  updateReportByAdmin,
  updateReportStatus,
  getReportStats,
  testUpload 
} from "../controllers/reportController.js";

const router = express.Router();

// Public routes
router.post("/", upload.single("media"), createReport);
router.get("/", getReports);
router.get("/stats", getReportStats);
router.post("/test-upload", upload.single("media"), testUpload);

// Protected routes (admin only) - temporarily removing auth for demo
router.patch("/admin/verify/:id", verifyReportByAdmin);
router.patch("/admin/update/:id", updateReportByAdmin);
router.patch("/admin/status/:id", updateReportStatus);

export default router;
