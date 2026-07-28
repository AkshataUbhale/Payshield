import express from "express";
import protect from "../middleware/authMiddleware.js";
import {
  createDraft,
  getDrafts,
  getDraftById,
  updateDraft,
  approveDraft,
  addChatMessage,
  getRiskAudit,
  askAIQuestion,
  deployDraft,
} from "../controllers/draftContractController.js";

const router = express.Router();

router.post("/create", protect, createDraft);
router.get("/", protect, getDrafts);
router.get("/:id", protect, getDraftById);
router.put("/:id", protect, updateDraft);
router.post("/:id/approve", protect, approveDraft);
router.post("/:id/chat", protect, addChatMessage);
router.get("/:id/audit", protect, getRiskAudit);
router.post("/:id/ask", protect, askAIQuestion);
router.post("/:id/deploy", protect, deployDraft);

export default router;
