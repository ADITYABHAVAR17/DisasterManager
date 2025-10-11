import express from "express";
import { createReport, getReports } from "../controllers/reportController.js";

const router = express.Router();

router.post("/", createReport);
router.get("/", getReports);

export default router;
