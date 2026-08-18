import { GoogleGenAI } from "@google/genai";
import { SolanaRPCTools } from "./mcp/solanaTools.js";
import { GitHubProofOfWorkTools } from "./mcp/githubTools.js";
import { RAGService } from "./rag/ragService.js";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export interface AgentChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface AgentChatResponse {
  reply: string;
  toolCallsExecuted: {
    toolName: string;
    input: any;
    output: any;
  }[];
  sources?: string[];
}

export class AgentService {
  /**
   * Conversational Agent executing Solana RPC and GitHub MCP tools
   */
  public static async processUserMessage(
    userMessage: string,
    _chatHistory: AgentChatMessage[] = []
  ): Promise<AgentChatResponse> {
    const executedTools: AgentChatResponse["toolCallsExecuted"] = [];
    const lower = userMessage.toLowerCase();

    // 1. Solana Transaction Query Detection
    const signatureMatch = userMessage.match(/[1-9A-HJ-NP-za-km-z]{64,88}/);
    if (signatureMatch && signatureMatch[0] && (lower.includes("tx") || lower.includes("transaction") || lower.includes("signature") || lower.includes("where is"))) {
      const sig = signatureMatch[0];
      try {
        const txStatus = await SolanaRPCTools.getTransactionStatus(sig);
        executedTools.push({
          toolName: "solana_rpc_get_transaction_status",
          input: { signature: sig },
          output: txStatus,
        });
      } catch (e: any) {
        executedTools.push({
          toolName: "solana_rpc_get_transaction_status",
          input: { signature: sig },
          output: { error: e.message },
        });
      }
    }

    // 2. Solana Wallet Balance Query Detection
    const addressMatch = userMessage.match(/[1-9A-HJ-NP-za-km-z]{32,44}/);
    if (addressMatch && addressMatch[0] && (lower.includes("balance") || lower.includes("sol") || lower.includes("wallet") || lower.includes("funds"))) {
      const addr = addressMatch[0];
      try {
        const balance = await SolanaRPCTools.getWalletBalance(addr);
        executedTools.push({
          toolName: "solana_rpc_get_wallet_balance",
          input: { address: addr },
          output: balance,
        });
      } catch {
        // May be a signature, skip if already handled
      }
    }

    // 3. GitHub Repo & Proof of Work Detection
    const githubRepoMatch = userMessage.match(/(?:github\.com\/)?([a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+)/);
    if (githubRepoMatch && githubRepoMatch[1] && (lower.includes("github") || lower.includes("commit") || lower.includes("pr") || lower.includes("audit") || lower.includes("proof") || lower.includes("work"))) {
      const repo = githubRepoMatch[1];
      try {
        const audit = await GitHubProofOfWorkTools.auditProofOfWork(repo, userMessage || "");
        executedTools.push({
          toolName: "github_mcp_audit_proof_of_work",
          input: { repo, userQuery: userMessage },
          output: audit,
        });
      } catch (e: any) {
        executedTools.push({
          toolName: "github_mcp_audit_proof_of_work",
          input: { repo },
          output: { error: e.message },
        });
      }
    }

    // 4. RAG Rule Search if asking about platform terms
    let relevantRules: any[] = [];
    if (lower.includes("rule") || lower.includes("policy") || lower.includes("escrow") || lower.includes("refund") || lower.includes("cancel") || lower.includes("deadline")) {
      relevantRules = RAGService.searchPlatformRules(userMessage, 2).map((r) => r.rule);
    }

    // 5. Synthesize answer with Gemini
    const toolsContext = executedTools.length > 0
      ? `\nREAL-TIME ON-CHAIN / GITHUB TOOL RESULTS:\n${JSON.stringify(executedTools, null, 2)}\n`
      : "";

    const rulesContext = relevantRules.length > 0
      ? `\nRETRIEVED PLATFORM RULES:\n${JSON.stringify(relevantRules, null, 2)}\n`
      : "";

    const systemPrompt = `
You are PayShield AI Assistant, an autonomous assistant with direct access to the Solana blockchain ledger, GitHub repositories, and platform escrow guidelines.

User Query: "${userMessage}"
${toolsContext}
${rulesContext}

Provide a helpful, precise, and transparent response to the user.
- If Solana transaction or wallet data was retrieved, directly cite the confirmation status, slot, or balance.
- If GitHub commit data was audited, summarize the Proof of Work and suggest milestone approval or revision.
- If platform rules apply, explain clearly in plain language.
`;

    let reply = "";
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: systemPrompt,
        });
        reply = response.text || "";
      } catch {
        const fallback = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: systemPrompt,
        });
        reply = fallback.text || "";
      }
    } else {
      if (executedTools.length > 0 && executedTools[0]) {
        reply = `Executed ${executedTools.length} tool(s). Latest tool output: ${JSON.stringify(executedTools[0].output)}`;
      } else {
        reply = "PayShield AI ready. Ask about your Solana transactions, wallet balances, GitHub milestone progress, or platform escrow rules.";
      }
    }

    return {
      reply,
      toolCallsExecuted: executedTools,
      sources: relevantRules.map((r) => `${r.id}: ${r.title}`),
    };
  }
}
