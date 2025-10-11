import express from "express";
import upload from "../middleware/multer.js";
import { createReport, getReports } from "../controllers/reportController.js";

const router = express.Router();

router.post("/", upload.single("media"), createReport);
router.get("/", getReports);

export default router;
