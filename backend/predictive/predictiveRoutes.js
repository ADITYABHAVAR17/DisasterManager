import express from "express";
import { getRiskMap } from "./predictiveController.js";

const router = express.Router();

router.get("/risk", getRiskMap);

export default router;
