import express from "express";
import {
  getProfile,
  updateProfile,
  createUser,
  getUserByPublicKey,
  getFreelancers,
  saveUserRole,
  saveFreelancerOnboarding,
  saveClientOnboarding,
  getOnboardingStatus,
  clearDummyData,
} from "../controllers/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", createUser);

// Onboarding endpoints
router.post("/role", saveUserRole);
router.post("/freelancer", saveFreelancerOnboarding);
router.post("/client", saveClientOnboarding);
router.get("/onboarding-status", getOnboardingStatus);
router.delete("/dummy-data", clearDummyData);

router.get("/profile", authMiddleware, getProfile);
router.put("/update", authMiddleware, updateProfile);
router.get("/freelancers", getFreelancers);
router.get("/:publicKey", getUserByPublicKey);

export default router;
