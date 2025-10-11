import express from "express";
import {
  createResource,
  getResources,
  updateResource,
  updateResourceOccupancy,
  getResourceStats,
  deleteResource
} from "../controllers/resourceController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes (for citizens to view resources)
router.get("/", getResources);
router.get("/stats", getResourceStats);

// Admin routes (temporarily made public for demo)
router.post("/", createResource);
router.put("/:id", updateResource);
router.patch("/:id/occupancy", updateResourceOccupancy);
router.delete("/:id", deleteResource);

export default router;