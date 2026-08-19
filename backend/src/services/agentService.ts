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
  sources?: string[] | undefined;
}

export class AgentService {
  /**
   * JSON Tool Definitions for Gemini Native Tool Calling (MCP)
   */
  public static readonly toolDeclarations: any[] = [
    {
      functionDeclarations: [
        {
          name: "get_solana_tx",
          description: "Fetch transaction status, slot, block time, and confirmation details on the Solana Devnet ledger by signature.",
          parameters: {
            type: "OBJECT",
            properties: {
              signature: {
                type: "STRING",
                description: "The base58 encoded Solana transaction signature string (64-88 characters).",
              },
            },
            required: ["signature"],
          },
        },
        {
          name: "get_solana_balance",
          description: "Fetch real-time SOL balance and lamports for a given Solana public key wallet address.",
          parameters: {
            type: "OBJECT",
            properties: {
              address: {
                type: "STRING",
                description: "The base58 encoded Solana wallet address (32-44 characters).",
              },
            },
            required: ["address"],
          },
        },
        {
          name: "audit_github_pow",
          description: "Audit a freelancer's GitHub repository Proof of Work, validating commit authorship, PR diffs, and lines added/deleted.",
          parameters: {
            type: "OBJECT",
            properties: {
              repo: {
                type: "STRING",
                description: "The GitHub repository in owner/repo format or full URL (e.g. 'octocat/Hello-World').",
              },
              milestoneCriteria: {
                type: "STRING",
                description: "Deliverable description or acceptance criteria for the milestone.",
              },
              freelancerEmail: {
                type: "STRING",
                description: "Optional email of freelancer to verify commit author identity.",
              },
            },
            required: ["repo"],
          },
        },
        {
          name: "search_rules",
          description: "Perform vector semantic similarity search over PayShield platform escrow policies, refund guidelines, and dispute precedents.",
          parameters: {
            type: "OBJECT",
            properties: {
              query: {
                type: "STRING",
                description: "Search topic or clause to look up in the vector knowledge base.",
              },
            },
            required: ["query"],
          },
        },
      ],
    },
  ];

  /**
   * Execute a single tool by name
   */
  public static async executeTool(name: string, args: any): Promise<any> {
    switch (name) {
      case "get_solana_tx": {
        const sig = args?.signature;
        if (!sig) return { error: "Signature parameter required" };
        return await SolanaRPCTools.getTransactionStatus(sig);
      }

      case "get_solana_balance": {
        const addr = args?.address;
        if (!addr) return { error: "Address parameter required" };
        return await SolanaRPCTools.getWalletBalance(addr);
      }

      case "audit_github_pow": {
        const repo = args?.repo;
        if (!repo) return { error: "Repository parameter required" };
        const criteria = args?.milestoneCriteria || "Deliverable audit";
        return await GitHubProofOfWorkTools.auditProofOfWork(repo, criteria, {
          freelancerEmail: args?.freelancerEmail,
        });
      }

      case "search_rules": {
        const query = args?.query;
        if (!query) return { error: "Query parameter required" };
        return await RAGService.searchPlatformRules(query, 3);
      }

      default:
        return { error: `Unknown tool: ${name}` };
    }
  }

  /**
   * Conversational Agent with Native Gemini Tool-Calling (MCP)
   */
  public static async processUserMessage(
    userMessage: string,
    _chatHistory: AgentChatMessage[] = []
  ): Promise<AgentChatResponse> {
    const executedTools: AgentChatResponse["toolCallsExecuted"] = [];
    const sources: string[] = [];

    if (!ai) {
      return {
        reply: "Gemini API key is not configured. Please set GEMINI_API_KEY in .env.",
        toolCallsExecuted: [],
      };
    }

    try {
      // Step 1: Query Gemini with native Function/Tool declarations
      let firstPass: any = null;
      const candidateModels = ["gemini-2.5-flash", "gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash"];
      for (const model of candidateModels) {
        try {
          firstPass = await ai.models.generateContent({
            model,
            contents: userMessage,
            config: {
              tools: this.toolDeclarations,
              systemInstruction: `You are PayShield AI Assistant, an autonomous agent capable of executing tools on the Solana ledger, GitHub repos, and the RAG vector knowledge base. If the user asks about a transaction, wallet, GitHub repo, or escrow rule, call the appropriate tool.`,
            },
          });
          if (firstPass) break;
        } catch {
          // try next model
        }
      }

      // Step 2: Check if Gemini decided to call any tools autonomously
      const functionCalls = firstPass?.functionCalls || [];

      if (functionCalls.length > 0) {
        for (const call of functionCalls) {
          const toolName = call.name;
          const toolArgs = call.args || {};
          try {
            const result = await this.executeTool(toolName, toolArgs);
            executedTools.push({
              toolName,
              input: toolArgs,
              output: result,
            });

            if (toolName === "search_rules" && Array.isArray(result)) {
              result.forEach((r: any) => {
                if (r.id && r.title) sources.push(`${r.id}: ${r.title}`);
              });
            }
          } catch (e: any) {
            executedTools.push({
              toolName,
              input: toolArgs,
              output: { error: e.message },
            });
          }
        }
      }

      // Fallback Heuristic Check if Gemini didn't trigger tool calls but user input clearly references an entity
      if (executedTools.length === 0) {
        const lower = userMessage.toLowerCase();
        const signatureMatch = userMessage.match(/[1-9A-HJ-NP-za-km-z]{64,88}/);
        if (signatureMatch && (lower.includes("tx") || lower.includes("transaction") || lower.includes("signature"))) {
          const res = await this.executeTool("get_solana_tx", { signature: signatureMatch[0] });
          executedTools.push({ toolName: "get_solana_tx", input: { signature: signatureMatch[0] }, output: res });
        }

        const addressMatch = userMessage.match(/[1-9A-HJ-NP-za-km-z]{32,44}/);
        if (addressMatch && (lower.includes("balance") || lower.includes("sol") || lower.includes("wallet"))) {
          const res = await this.executeTool("get_solana_balance", { address: addressMatch[0] });
          executedTools.push({ toolName: "get_solana_balance", input: { address: addressMatch[0] }, output: res });
        }

        const githubMatch = userMessage.match(/(?:github\.com\/)?([a-zA-Z0-9_-]+\/[a-zA-Z0-9_.-]+)/);
        if (githubMatch && (lower.includes("github") || lower.includes("audit") || lower.includes("proof") || lower.includes("commit"))) {
          const res = await this.executeTool("audit_github_pow", { repo: githubMatch[1], milestoneCriteria: userMessage });
          executedTools.push({ toolName: "audit_github_pow", input: { repo: githubMatch[1] }, output: res });
        }

        if (lower.includes("rule") || lower.includes("policy") || lower.includes("escrow") || lower.includes("refund") || lower.includes("arbitration")) {
          const res = await this.executeTool("search_rules", { query: userMessage });
          executedTools.push({ toolName: "search_rules", input: { query: userMessage }, output: res });
        }
      }

      // Step 3: Synthesize tool outputs back to user
      const synthesisPrompt = `
User Query: "${userMessage}"

${
  executedTools.length > 0
    ? `AUTONOMOUS TOOL EXECUTION RESULTS:\n${JSON.stringify(executedTools, null, 2)}`
    : "No external tools were required."
}

Provide a clean, well-formatted, and helpful final response based strictly on the tool outputs.
- If Solana transaction was audited: Mention confirmation status, block slot, and fee.
- If Solana balance was queried: State the balance clearly in SOL.
- If GitHub Proof of Work was audited: Summarize total commits, PR diff lines changed, authorship verification, and milestone recommendation.
- If Platform Rules were searched: Summarize relevant clauses concisely.
`;

      const finalResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: synthesisPrompt,
      });

      return {
        reply: finalResponse.text || firstPass.text || "Response generated successfully.",
        toolCallsExecuted: executedTools,
        sources: sources.length > 0 ? sources : undefined,
      };
    } catch (error: any) {
      console.error("AgentService processing error:", error);
      return {
        reply: `PayShield Agent error: ${error.message || error}`,
        toolCallsExecuted: executedTools,
      };
    }
  }
}
