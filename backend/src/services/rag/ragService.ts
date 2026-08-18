import { PLATFORM_RULES, type PlatformRuleDoc } from "./platformTermsData.js";
import { DISPUTE_PRECEDENTS, type DisputePrecedent } from "./precedentData.js";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Tokenizer & scoring utility for keyword/semantic overlap
function computeSimilarityScore(query: string, text: string, keywords: string[]): number {
  const qTokens = query.toLowerCase().split(/\W+/).filter(Boolean);
  const textLower = text.toLowerCase();
  
  if (qTokens.length === 0) return 0;

  let score = 0;
  
  // Keyword boost
  for (const kw of keywords) {
    if (query.toLowerCase().includes(kw.toLowerCase())) {
      score += 25;
    }
  }

  // Token matching in body text
  for (const token of qTokens) {
    if (token.length < 3) continue;
    if (textLower.includes(token)) {
      score += 10;
    }
  }

  return Math.min(100, score);
}

export class RAGService {
  /**
   * Retrieve relevant platform rules for a given query or contract clause
   */
  public static searchPlatformRules(query: string, limit: number = 3): { rule: PlatformRuleDoc; score: number }[] {
    const scored = PLATFORM_RULES.map((rule) => ({
      rule,
      score: computeSimilarityScore(query, `${rule.title} ${rule.content}`, rule.keywords),
    }));

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Retrieve relevant historical dispute precedents
   */
  public static searchPrecedents(query: string, limit: number = 3): { precedent: DisputePrecedent; score: number }[] {
    const scored = DISPUTE_PRECEDENTS.map((precedent) => ({
      precedent,
      score: computeSimilarityScore(
        query,
        `${precedent.title} ${precedent.caseSummary} ${precedent.evidenceSummary} ${precedent.rulingRationale}`,
        precedent.keywords
      ),
    }));

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Feature 1: AI Contract & Clause Assistant
   * Explains technical/legal clauses and checks compliance with platform escrow standards
   */
  public static async explainClause(clauseText: string, context?: string): Promise<{
    explanation: string;
    riskLevel: "LOW" | "MEDIUM" | "HIGH";
    platformCompliance: string;
    relevantRules: PlatformRuleDoc[];
  }> {
    const relevantRules = this.searchPlatformRules(clauseText, 2).map((r) => r.rule);

    const rulesContext = relevantRules
      .map((r) => `[${r.id} - ${r.title}]: ${r.content}`)
      .join("\n\n");

    const prompt = `
You are the PayShield AI Contract & Clause Assistant.
Translate and analyze this freelance/Solana contract clause for humans.

CONTRACT CLAUSE:
"""${clauseText}"""

ADDITIONAL CONTEXT:
${context || "Standard freelance milestone agreement"}

RETRIEVED PLATFORM RULES (RAG KNOWLEDGE):
${rulesContext}

Provide a structured response:
1. PLAIN ENGLISH TRANSLATION (Explain what this means for both client and freelancer in simple terms)
2. RISK ANALYSIS (Low, Medium, or High risk with clear reasoning)
3. PLATFORM COMPLIANCE (How it fits with PayShield decentralized escrow policies)
4. RECOMMENDATIONS (Any suggested improvements or safeguards)
`;

    let generatedText = "";
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });
        generatedText = response.text || "";
      } catch {
        const fallback = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: prompt,
        });
        generatedText = fallback.text || "";
      }
    } else {
      generatedText = `[Simulated RAG Analysis]\nPlain English Translation: This clause sets standard milestone obligations.\nRisk: LOW\nPlatform Compliance: Fully conforms with ${relevantRules[0]?.id || "platform escrow standards"}.`;
    }

    const isHighRisk = clauseText.toLowerCase().includes("unlimited") || clauseText.toLowerCase().includes("immediate refund") || clauseText.toLowerCase().includes("penalty");
    const riskLevel = isHighRisk ? "HIGH" : clauseText.length > 200 ? "MEDIUM" : "LOW";

    return {
      explanation: generatedText,
      riskLevel,
      platformCompliance: `Referenced ${relevantRules.length} platform escrow guidelines.`,
      relevantRules,
    };
  }

  /**
   * Feature 2: AI Dispute Arbitrator with Precedents (Kleros-inspired)
   */
  public static async arbitrateWithPrecedents(disputeData: {
    projectName: string;
    milestoneName: string;
    paymentAmount: number | string;
    userRole: string;
    complaint: string;
    workExpected: string;
    workDelivered: string;
    evidenceNotes?: string;
  }): Promise<{
    aiDecision: string;
    suggestedSplit: { clientPercent: number; freelancerPercent: number };
    citedPrecedents: DisputePrecedent[];
    confidenceScore: number;
  }> {
    const combinedQuery = `${disputeData.complaint} ${disputeData.workExpected} ${disputeData.workDelivered} ${disputeData.evidenceNotes || ""}`;
    const retrieved = this.searchPrecedents(combinedQuery, 2);
    const precedents = retrieved.map((r) => r.precedent);

    const precedentContext = precedents
      .map(
        (p) =>
          `[PRECEDENT ${p.id} - ${p.title}]\nCategory: ${p.category}\nCase Summary: ${p.caseSummary}\nPrecedent Ruling Split: Client ${p.clientSplitPercent}% / Freelancer ${p.freelancerSplitPercent}%\nRationale: ${p.rulingRationale}`
      )
      .join("\n\n");

    const prompt = `
You are the PayShield Lead Decentralized AI Arbitrator, modeled after Web3 decentralized arbitration courts (such as Kleros).
Evaluate this dispute strictly based on objective evidence, milestone deliverables, and established historical precedents.

DISPUTE INFORMATION:
- Project: ${disputeData.projectName}
- Milestone: ${disputeData.milestoneName}
- Escrow Value: ${disputeData.paymentAmount}
- Reporting Party: ${disputeData.userRole}
- Complaint/Issue: ${disputeData.complaint}
- Expected Deliverable: ${disputeData.workExpected}
- Delivered Work / Explanation: ${disputeData.workDelivered}

HISTORICAL DISPUTE PRECEDENTS (RETRIEVED VIA RAG):
${precedentContext}

INSTRUCTIONS:
1. Formulate a fair, binding arbitration ruling.
2. Directly cite the relevant precedent ID(s) and explain how this case compares.
3. Recommend an exact escrow split percentage (e.g. 70% Client / 30% Freelancer).
4. Provide structured reasoning covering:
   - Summary of Merits
   - Precedent Comparison
   - Final Ruling & Payment Allocation
`;

    const topPrecedent = precedents.length > 0 && precedents[0] ? precedents[0] : DISPUTE_PRECEDENTS[0]!;

    let generatedText = "";
    if (ai) {
      try {
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
        });
        generatedText = response.text || "";
      } catch {
        const fallback = await ai.models.generateContent({
          model: "gemini-2.0-flash",
          contents: prompt,
        });
        generatedText = fallback.text || "";
      }
    } else {
      generatedText = `Based on Precedent ${topPrecedent.id}, the recommended resolution is Client ${topPrecedent.clientSplitPercent}% / Freelancer ${topPrecedent.freelancerSplitPercent}%. ${topPrecedent.rulingRationale}`;
    }

    return {
      aiDecision: generatedText,
      suggestedSplit: {
        clientPercent: topPrecedent.clientSplitPercent,
        freelancerPercent: topPrecedent.freelancerSplitPercent,
      },
      citedPrecedents: precedents,
      confidenceScore: Math.min(95, Math.max(80, (retrieved[0]?.score || 70) + 15)),
    };
  }
}
