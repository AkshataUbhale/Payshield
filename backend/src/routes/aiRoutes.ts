import express from "express";
import protect from "../middleware/authMiddleware.js";
import { aiRateLimiter } from "../middleware/rateLimitMiddleware.js";
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
router.get("/recommendations/jobs", protect, aiRateLimiter, getRecommendedJobs);
router.get("/recommendations/freelancers", protect, aiRateLimiter, getRecommendedFreelancers);

// ── Feature 1: AI Contract & Clause Assistant (RAG) ──
router.post("/contract/explain-clause", protect, aiRateLimiter, explainContractClause);
router.post("/contract/audit-draft", protect, aiRateLimiter, auditDraftContract);

// ── Feature 2: AI Dispute Arbitrator Precedents (RAG) ──
router.get("/disputes", protect, getDisputes);
router.post("/disputes/create", protect, createDispute);
router.post("/disputes/:disputeId/messages", protect, addDisputeMessage);
router.post("/disputes/:disputeId/arbitrate", protect, aiRateLimiter, arbitrateDisputeWithAI);
router.post("/disputes/:disputeId/manual-override", protect, overrideArbitration);
router.post("/disputes/arbitrate-precedents", protect, aiRateLimiter, arbitrateWithPrecedents);

// ── Feature 3 & 4: AI Copilot with Solana RPC & GitHub MCP Tools ──
router.post("/agent/chat", protect, aiRateLimiter, chatWithAgent);
router.get("/tools/solana/tx/:signature", protect, getSolanaTxStatus);
router.get("/tools/solana/balance/:address", protect, getSolanaBalance);
router.post("/tools/github/audit", protect, aiRateLimiter, auditGithubProofOfWork);

export default router;
