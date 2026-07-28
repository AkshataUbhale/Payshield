import express from "express";
import {
  getProfile,
  updateProfile,
  createUser,
  getUserByPublicKey,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", createUser);

router.get("/profile", authMiddleware, getProfile);
router.put("/update", authMiddleware, updateProfile);
router.get("/:publicKey", getUserByPublicKey);

export default router;
