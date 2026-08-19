import dotenv from "dotenv";
import mongoose from "mongoose";
import { GoogleGenAI } from "@google/genai";
import { PLATFORM_RULES } from "../services/rag/platformTermsData.js";
import { DISPUTE_PRECEDENTS } from "../services/rag/precedentData.js";
import { QdrantService } from "../services/rag/qdrantService.js";
import RuleModel from "../models/Rule.js";
import PrecedentModel from "../models/Precedent.js";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/payshield";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

if (!GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is not defined in .env");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

async function run() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected");

    console.log("🚀 Initializing Qdrant Collections (768-dim, Cosine)...");
    await QdrantService.initCollections();

    console.log("🧹 Clearing existing rules and precedents in MongoDB...");
    await RuleModel.deleteMany({});
    await PrecedentModel.deleteMany({});

    console.log("🚀 Ingesting Platform Rules...");
    const rulePoints = [];
    for (const rule of PLATFORM_RULES) {
      const textToEmbed = `${rule.title}\nCategory: ${rule.category}\nContent: ${rule.content}\nKeywords: ${rule.keywords.join(", ")}`;
      console.log(`- Generating 768-dim embedding for rule: ${rule.id}`);

      const embedRes: any = await ai.models.embedContent({
        model: "text-embedding-004",
        contents: textToEmbed,
      });

      if (!embedRes.embedding?.values) {
        throw new Error(`Failed to generate embedding for rule ${rule.id}`);
      }

      await RuleModel.create({
        id: rule.id,
        title: rule.title,
        content: rule.content,
        keywords: rule.keywords,
        embedding: embedRes.embedding.values,
      });

      rulePoints.push({
        id: rule.id,
        vector: embedRes.embedding.values,
        payload: rule,
      });
    }
    await QdrantService.upsertRules(rulePoints);
    console.log(`✅ Rule Ingestion complete: ${PLATFORM_RULES.length} rules.`);

    console.log("🚀 Ingesting Dispute Precedents...");
    const precedentPoints = [];
    for (const prec of DISPUTE_PRECEDENTS) {
      const textToEmbed = `${prec.title}\nCategory: ${prec.category}\nCase Summary: ${prec.caseSummary}\nEvidence: ${prec.evidenceSummary}\nRationale: ${prec.rulingRationale}\nKeywords: ${prec.keywords.join(", ")}`;
      console.log(`- Generating 768-dim embedding for precedent: ${prec.id}`);

      const embedRes: any = await ai.models.embedContent({
        model: "text-embedding-004",
        contents: textToEmbed,
      });

      if (!embedRes.embedding?.values) {
        throw new Error(`Failed to generate embedding for precedent ${prec.id}`);
      }

      await PrecedentModel.create({
        id: prec.id,
        title: prec.title,
        category: prec.category,
        caseSummary: prec.caseSummary,
        evidenceSummary: prec.evidenceSummary,
        clientSplitPercent: prec.clientSplitPercent,
        freelancerSplitPercent: prec.freelancerSplitPercent,
        rulingRationale: prec.rulingRationale,
        applicableRules: prec.applicableRules,
        keywords: prec.keywords,
        embedding: embedRes.embedding.values,
      });

      precedentPoints.push({
        id: prec.id,
        vector: embedRes.embedding.values,
        payload: prec,
      });
    }
    await QdrantService.upsertPrecedents(precedentPoints);
    console.log(`✅ Precedent Ingestion complete: ${DISPUTE_PRECEDENTS.length} precedents.`);

    console.log("🎉 All data ingested successfully into Qdrant & MongoDB!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Ingestion failed:", error);
    process.exit(1);
  }
}

run();
