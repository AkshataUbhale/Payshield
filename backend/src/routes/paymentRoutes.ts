import express from "express";
import {
  approvePayment,
  rejectPayment,
} from "../controllers/paymentController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/approve", authMiddleware, approvePayment);
router.post("/reject", authMiddleware, rejectPayment);

export default router;
