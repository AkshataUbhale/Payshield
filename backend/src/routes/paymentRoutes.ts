import express from "express";
import {
  approvePayment,
  rejectPayment,
} from "../controllers/paymentController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { apiRateLimiter } from "../middleware/rateLimitMiddleware.js";

const router = express.Router();

router.post("/approve", authMiddleware, apiRateLimiter, approvePayment);
router.post("/reject", authMiddleware, apiRateLimiter, rejectPayment);

export default router;
