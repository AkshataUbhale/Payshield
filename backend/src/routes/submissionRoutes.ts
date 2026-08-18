import express from "express";
import {
  createSubmission,
  getSubmissions,
} from "../controllers/submissionController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createSubmission);
router.get("/", authMiddleware, getSubmissions);

export default router;
