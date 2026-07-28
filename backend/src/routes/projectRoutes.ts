import express from "express";
import {
  createProject,
  getProjects,
  getProjectById,
} from "../controllers/projectController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, createProject);
router.get("/", getProjects);
router.get("/:id", getProjectById);

export default router;
