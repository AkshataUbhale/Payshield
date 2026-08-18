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
  explainContractClause,
  auditDraftContract,
  arbitrateWithPrecedents,
  chatWithAgent,
  getSolanaTxStatus,
  getSolanaBalance,
  auditGithubProofOfWork,
} from "../controllers/aiController.js";

const router = express.Router();

// ── AI Recommendations ──
router.get("/recommendations/jobs", protect, getRecommendedJobs);
router.get("/recommendations/freelancers", protect, getRecommendedFreelancers);

// ── Feature 1: AI Contract & Clause Assistant (RAG) ──
router.post("/contract/explain-clause", explainContractClause);
router.post("/contract/audit-draft", auditDraftContract);

// ── Feature 2: AI Dispute Arbitrator Precedents (RAG) ──
router.get("/disputes", protect, getDisputes);
router.post("/disputes/create", protect, createDispute);
router.post("/disputes/:disputeId/messages", protect, addDisputeMessage);
router.post("/disputes/:disputeId/arbitrate", protect, arbitrateDisputeWithAI);
router.post("/disputes/:disputeId/manual-override", protect, overrideArbitration);
router.post("/disputes/arbitrate-precedents", arbitrateWithPrecedents);

// ── Feature 3 & 4: AI Copilot with Solana RPC & GitHub MCP Tools ──
router.post("/agent/chat", chatWithAgent);
router.get("/tools/solana/tx/:signature", getSolanaTxStatus);
router.get("/tools/solana/balance/:address", getSolanaBalance);
router.post("/tools/github/audit", auditGithubProofOfWork);

router.post("/contract/explain-clause", protect, explainContractClause);
router.post("/contract/audit-draft", protect, auditDraftContract);
router.post("/disputes/arbitrate-precedents", protect, arbitrateWithPrecedents);
router.post("/agent/chat", protect, chatWithAgent);
router.post("/tools/github/audit", protect, auditGithubProofOfWork);

export default router;
