import express from "express";
import {
  createProject,
  getOpenProjects,
  getProjects,
  getProjectById,
  applyToProject,
  hireFreelancer,
} from "../controllers/projectController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { apiRateLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

// Project creation endpoints
router.post("/", authMiddleware, apiRateLimiter, createProject);
router.post("/create", authMiddleware, apiRateLimiter, createProject);

// Project query endpoints
router.get("/open", getOpenProjects);
router.get("/", getProjects);
router.get("/:id", getProjectById);

// Proposal & hiring lifecycle
router.post("/:id/apply", authMiddleware, apiRateLimiter, applyToProject);
router.post("/:id/hire", authMiddleware, apiRateLimiter, hireFreelancer);

export default router;
