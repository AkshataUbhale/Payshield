import express from "express";
import {
  createReview,
  getUserReviews,
  getReputationStats,
} from "../controllers/reputationController.js";

const router = express.Router();

router.post("/reviews", createReview);
router.get("/:userPubkey/reviews", getUserReviews);
router.get("/:userPubkey/stats", getReputationStats);

export default router;
