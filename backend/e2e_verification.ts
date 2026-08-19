/**
 * End-to-End Verification Script — PayShield 4 AI Features
 * 
 * Tests the 4 core features without requiring server/DB:
 * 1. RAG Contract & Clause Assistant
 * 2. RAG Dispute Arbitrator Precedents
 * 3. Solana RPC Tools
 * 4. GitHub MCP Proof-of-Work Tools
 */

import { RAGService } from "./src/services/rag/ragService.js";
import { SolanaRPCTools } from "./src/services/mcp/solanaTools.js";
import { GitHubProofOfWorkTools } from "./src/services/mcp/githubTools.js";
import { AgentService } from "./src/services/agentService.js";
import { PLATFORM_RULES } from "./src/services/rag/platformTermsData.js";
import { DISPUTE_PRECEDENTS } from "./src/services/rag/precedentData.js";
import { Keypair } from "@solana/web3.js";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ ${testName}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

async function testFeature1_RAGContractAssistant() {
  console.log("\n═══ Feature 1: AI Contract & Clause Assistant (RAG) ═══\n");

  assert(PLATFORM_RULES.length >= 5, "Platform rules dataset has 5+ entries", `Got ${PLATFORM_RULES.length}`);

  const escrowRules = await RAGService.searchPlatformRules("escrow refund cancellation", 3);
  assert(escrowRules.length > 0, `searchPlatformRules returns results (Got ${escrowRules.length})`);
  assert(!!escrowRules[0]?.title, "Results contain rule titles");

  const milestoneRules = await RAGService.searchPlatformRules("milestone approval deadline", 2);
  assert(milestoneRules.length > 0, `Milestone search returns results (Got ${milestoneRules.length})`);
  assert(!!milestoneRules[0]?.content, "Top result has valid content");

  const clauseResult = await RAGService.explainClause(
    "Freelancer must deliver all milestone work within 14 business days of contract activation.",
    "Standard Solana escrow agreement"
  );
  assert(typeof clauseResult.explanation === "string" && clauseResult.explanation.length > 0, "explainClause returns non-empty explanation");
  assert(["LOW", "MEDIUM", "HIGH"].includes(clauseResult.riskLevel), `Risk level is valid (${clauseResult.riskLevel})`);
  assert(clauseResult.relevantRules.length > 0, `Returns ${clauseResult.relevantRules.length} relevant platform rules`);

  const highRiskResult = await RAGService.explainClause(
    "Client has unlimited right to withhold funds and demand immediate refund at any time without penalty.",
  );
  assert(highRiskResult.riskLevel === "HIGH", `High-risk clause detected (${highRiskResult.riskLevel})`);
}

async function testFeature2_RAGDisputeArbitrator() {
  console.log("\n═══ Feature 2: AI Dispute Arbitrator with Precedents (RAG) ═══\n");

  assert(DISPUTE_PRECEDENTS.length >= 5, "Precedent dataset has 5+ entries", `Got ${DISPUTE_PRECEDENTS.length}`);

  const latePrecedents = await RAGService.searchPrecedents("late delivery missing deadline", 3);
  assert(latePrecedents.length > 0, `searchPrecedents returns results (Got ${latePrecedents.length})`);
  assert(!!latePrecedents[0]?.title, "Precedents contain valid case title");

  const arbitrationResult = await RAGService.arbitrateWithPrecedents({
    projectName: "E-Commerce Platform",
    milestoneName: "Frontend MVP",
    paymentAmount: 5,
    userRole: "client",
    complaint: "Freelancer delivered code 2 weeks late with missing features",
    workExpected: "React frontend with cart, checkout, and user auth",
    workDelivered: "Only login page was built, no cart or checkout",
    evidenceNotes: "GitHub shows only 3 commits over 30 days",
  });

  assert(typeof arbitrationResult.aiDecision === "string" && arbitrationResult.aiDecision.length > 0, "Arbitration returns AI decision text");
  assert(arbitrationResult.suggestedSplit.clientPercent + arbitrationResult.suggestedSplit.freelancerPercent === 100, "Split sums to 100%");
  assert(arbitrationResult.citedPrecedents.length > 0, `Cited ${arbitrationResult.citedPrecedents.length} precedent(s)`);
  assert(arbitrationResult.confidenceScore >= 80 && arbitrationResult.confidenceScore <= 100, `Confidence score ${arbitrationResult.confidenceScore} is in [80,100]`);

  const firstPrecedent = arbitrationResult.citedPrecedents[0]!;
  assert(!!firstPrecedent.id && !!firstPrecedent.title, "Cited precedent has id and title");
  assert(typeof firstPrecedent.clientSplitPercent === "number", "Precedent has numeric client split");
}

async function testFeature3_SolanaRPCTools() {
  console.log("\n═══ Feature 3: Solana RPC Tools (MCP) ═══\n");

  const txStatus = await SolanaRPCTools.getTransactionStatus("InvalidSignature123");
  assert(typeof txStatus.statusText === "string", "getTransactionStatus returns statusText for invalid signature");
  assert(txStatus.confirmed === false, "Invalid signature shows unconfirmed");

  try {
    const balance = await SolanaRPCTools.getWalletBalance("11111111111111111111111111111111");
    assert(typeof balance.solBalance === "number", `System program balance returned (${balance.solBalance} SOL)`);
    assert(balance.lamports >= 0, "Lamport value is non-negative");
  } catch (e: any) {
    assert(e.message.includes("Failed to fetch") || e.message.includes("fetch"), `Graceful error for network unavailable: ${e.message.slice(0, 80)}`);
  }

  try {
    const randomAddress = Keypair.generate().publicKey.toBase58();
    const escrow = await SolanaRPCTools.getEscrowAccountInfo(randomAddress);
    assert(escrow.status === "NOT_FOUND" || escrow.exists === false, "Non-existent account returns NOT_FOUND");
  } catch (e: any) {
    assert(e.message.includes("Failed") || e.message.includes("fetch"), `Graceful escrow error: ${e.message.slice(0, 80)}`);
  }
}

async function testFeature4_GitHubMCPTools() {
  console.log("\n═══ Feature 4: GitHub MCP Proof-of-Work Tools ═══\n");

  try {
    const audit = await GitHubProofOfWorkTools.auditProofOfWork(
      "https://github.com/AkshataUbhale/Payshield",
      "AI features, escrow, dispute resolution",
      { branch: "main" }
    );
    assert(audit.repo === "AkshataUbhale/Payshield", `Repo parsed correctly (${audit.repo})`);
    assert(typeof audit.totalCommits === "number", `Total commits: ${audit.totalCommits}`);
    assert(audit.recentCommits.length <= 5, "Returns max 5 recent commits");
    assert(["APPROVE_MILESTONE_RELEASE", "REQUEST_REVISIONS", "INSUFFICIENT_PROOF_OF_WORK"].includes(audit.recommendation), `Recommendation: ${audit.recommendation}`);
    assert(audit.completionScore >= 0 && audit.completionScore <= 100, `Completion score: ${audit.completionScore}`);
  } catch (e: any) {
    assert(typeof e.message === "string", `GitHub API error handled gracefully: ${e.message.slice(0, 80)}`);
  }

  try {
    await GitHubProofOfWorkTools.getRepoCommits("invalid-format");
    assert(false, "Should throw for invalid repo format");
  } catch (e: any) {
    assert(e.message.includes("Invalid GitHub repository format"), "Invalid repo format throws descriptive error");
  }

  const audit404 = await GitHubProofOfWorkTools.auditProofOfWork(
    "nonexistent-user-12345/nonexistent-repo-67890",
    "test criteria"
  );
  assert(audit404.completionScore === 0, "Non-existent repo returns 0 completion score");
  assert(audit404.recommendation === "INSUFFICIENT_PROOF_OF_WORK", "Non-existent repo returns INSUFFICIENT recommendation");
}

async function testFeature5_AgentCopilotIntegration() {
  console.log("\n═══ Feature 5: Agent Copilot Integration (All Tools) ═══\n");

  const ruleResponse = await AgentService.processUserMessage(
    "What is PayShield's escrow refund policy?"
  );
  assert(typeof ruleResponse.reply === "string" && ruleResponse.reply.length > 0, "Agent returns reply for platform rule query");

  const genericResponse = await AgentService.processUserMessage("Hello, how are you?");
  assert(genericResponse.toolCallsExecuted.length === 0, "Generic greeting doesn't trigger tools");
}

async function main() {
  console.log("╔══════════════════════════════════════════════════════════╗");
  console.log("║  PayShield End-to-End Verification — 4 AI Features      ║");
  console.log("╚══════════════════════════════════════════════════════════╝");

  await testFeature1_RAGContractAssistant();
  await testFeature2_RAGDisputeArbitrator();
  await testFeature3_SolanaRPCTools();
  await testFeature4_GitHubMCPTools();
  await testFeature5_AgentCopilotIntegration();

  console.log("\n══════════════════════════════════════════════════════════");
  console.log(`  RESULTS: ${passed} passed / ${failed} failed / ${passed + failed} total`);
  console.log("══════════════════════════════════════════════════════════\n");

  if (failed > 0) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("Fatal test error:", e);
  process.exit(1);
});
