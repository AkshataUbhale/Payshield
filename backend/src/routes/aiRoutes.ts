import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  getRecommendedJobs,
  getRecommendedFreelancers,
  createDispute,
  getDisputes,
  addDisputeMessage,
  arbitrateDisputeWithAI,
  overrideArbitration,
} from "../controllers/aiController.js";

const router = express.Router();

// AI recommendations
router.get("/recommendations/jobs", protect, getRecommendedJobs);
router.get("/recommendations/freelancers", protect, getRecommendedFreelancers);

// AI dispute resolution
router.get("/disputes", protect, getDisputes);
router.post("/disputes/create", protect, createDispute);
router.post("/disputes/:disputeId/messages", protect, addDisputeMessage);
router.post("/disputes/:disputeId/arbitrate", protect, arbitrateDisputeWithAI);
router.post("/disputes/:disputeId/manual-override", protect, overrideArbitration);

export default router;
