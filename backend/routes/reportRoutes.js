import express from "express";
import upload from "../middleware/multer.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { createReport, getReports, verifyReportByAdmin, testUpload } from "../controllers/reportController.js";

const router = express.Router();

router.post("/", upload.single("media"), createReport);
router.get("/", getReports);
router.post("/test-upload", upload.single("media"), testUpload);
router.patch("/admin/verify/:id", verifyToken, verifyReportByAdmin);

export default router;
