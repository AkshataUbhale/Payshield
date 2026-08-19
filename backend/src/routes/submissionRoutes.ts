import express from "express";
import {
  createSubmission,
  getSubmissions,
} from "../controllers/submissionController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { apiRateLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, apiRateLimiter, createSubmission);
router.get("/", authMiddleware, getSubmissions);

export default router;
