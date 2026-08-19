import { QdrantClient } from "@qdrant/js-client-rest";
import dotenv from "dotenv";
import { PLATFORM_RULES } from "./platformTermsData.js";
import { DISPUTE_PRECEDENTS } from "./precedentData.js";

dotenv.config();

export const RULES_COLLECTION = "platform_rules";
export const PRECEDENTS_COLLECTION = "dispute_precedents";
export const VECTOR_DIMENSION = 768;

interface InMemPoint {
  id: string | number;
  vector: number[];
  payload: any;
}

export class QdrantService {
  private static client: QdrantClient | null = null;
  private static isConnected = false;
  private static inMemRules: InMemPoint[] = [];
  private static inMemPrecedents: InMemPoint[] = [];

  /**
   * Cosine similarity helper between two vector arrays
   */
  public static cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    const len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
      const valA = a[i] ?? 0;
      const valB = b[i] ?? 0;
      dot += valA * valB;
      normA += valA * valA;
      normB += valB * valB;
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Get or initialize the Qdrant REST Client
   */
  public static getClient(): QdrantClient {
    if (!this.client) {
      const url = process.env.QDRANT_URL || "http://localhost:6333";
      const apiKey = process.env.QDRANT_API_KEY;
      const config: any = { url, checkCompatibility: false };
      if (apiKey) {
        config.apiKey = apiKey;
      }
      this.client = new QdrantClient(config);
    }
    return this.client;
  }

  /**
   * Initialize collections with 768-dimensional cosine vectors
   */
  public static async initCollections(): Promise<boolean> {
    try {
      const client = this.getClient();
      const collections = await client.getCollections();
      const existing = (collections.collections || []).map((c: any) => c.name);

      if (!existing.includes(RULES_COLLECTION)) {
        await client.createCollection(RULES_COLLECTION, {
          vectors: {
            size: VECTOR_DIMENSION,
            distance: "Cosine",
          },
        });
        console.log(`✅ Created Qdrant collection: ${RULES_COLLECTION} (768-dim, Cosine)`);
      }

      if (!existing.includes(PRECEDENTS_COLLECTION)) {
        await client.createCollection(PRECEDENTS_COLLECTION, {
          vectors: {
            size: VECTOR_DIMENSION,
            distance: "Cosine",
          },
        });
        console.log(`✅ Created Qdrant collection: ${PRECEDENTS_COLLECTION} (768-dim, Cosine)`);
      }

      this.isConnected = true;
      return true;
    } catch (err: any) {
      console.warn("⚠️ Qdrant server connection skipped (operating in memory vector store mode):", err.message || err);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Upsert rules into Qdrant & in-memory vector index
   */
  public static async upsertRules(
    rules: { id: string | number; vector: number[]; payload: any }[]
  ): Promise<void> {
    this.inMemRules = rules.map((r) => ({
      id: r.id,
      vector: r.vector,
      payload: r.payload,
    }));

    try {
      if (this.isConnected || (await this.initCollections())) {
        const client = this.getClient();
        await client.upsert(RULES_COLLECTION, {
          wait: true,
          points: rules.map((r, idx) => ({
            id: typeof r.id === "number" ? r.id : idx + 1,
            vector: r.vector,
            payload: { ...r.payload, originalId: r.id },
          })),
        });
        console.log(`✅ Upserted ${rules.length} platform rules to Qdrant`);
      }
    } catch (err) {
      console.warn("Qdrant upsert rules fallback to in-memory:", err);
    }
  }

  /**
   * Upsert dispute precedents into Qdrant & in-memory vector index
   */
  public static async upsertPrecedents(
    precedents: { id: string | number; vector: number[]; payload: any }[]
  ): Promise<void> {
    this.inMemPrecedents = precedents.map((p) => ({
      id: p.id,
      vector: p.vector,
      payload: p.payload,
    }));

    try {
      if (this.isConnected || (await this.initCollections())) {
        const client = this.getClient();
        await client.upsert(PRECEDENTS_COLLECTION, {
          wait: true,
          points: precedents.map((p, idx) => ({
            id: typeof r_id(p.id) === "number" ? r_id(p.id) : idx + 100,
            vector: p.vector,
            payload: { ...p.payload, originalId: p.id },
          })),
        });
        console.log(`✅ Upserted ${precedents.length} precedents to Qdrant`);
      }
    } catch (err) {
      console.warn("Qdrant upsert precedents fallback to in-memory:", err);
    }
  }

  /**
   * Search platform rules by vector cosine similarity
   */
  public static async searchRules(
    queryVector: number[],
    limit: number = 3,
    scoreThreshold: number = 0.4
  ): Promise<any[]> {
    try {
      if (this.isConnected || (await this.initCollections())) {
        const client: any = this.getClient();
        const searchFn = client.search || client.query;
        if (typeof searchFn === "function") {
          const results = await searchFn.call(client, RULES_COLLECTION, {
            vector: queryVector,
            limit,
            score_threshold: scoreThreshold,
            with_payload: true,
          });

          if (results && results.length > 0) {
            return results.map((r: any) => ({
              ...(r.payload || {}),
              score: r.score,
              id: r.payload?.originalId || r.id,
            }));
          }
        }
      }
    } catch (err) {
      console.warn("Qdrant searchRules query skipped, using in-memory cosine vectors:", err);
    }

    // In-memory Cosine Vector Search Fallback
    if (this.inMemRules.length > 0) {
      const scored = this.inMemRules.map((point) => ({
        ...point.payload,
        id: point.id,
        score: this.cosineSimilarity(queryVector, point.vector),
      }));
      return scored
        .filter((item) => item.score >= scoreThreshold)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    }

    // Default static fallback if not yet ingested
    return PLATFORM_RULES.slice(0, limit);
  }

  /**
   * Search dispute precedents by vector cosine similarity
   */
  public static async searchPrecedents(
    queryVector: number[],
    limit: number = 3,
    scoreThreshold: number = 0.4
  ): Promise<any[]> {
    try {
      if (this.isConnected || (await this.initCollections())) {
        const client: any = this.getClient();
        const searchFn = client.search || client.query;
        if (typeof searchFn === "function") {
          const results = await searchFn.call(client, PRECEDENTS_COLLECTION, {
            vector: queryVector,
            limit,
            score_threshold: scoreThreshold,
            with_payload: true,
          });

          if (results && results.length > 0) {
            return results.map((r: any) => ({
              ...(r.payload || {}),
              score: r.score,
              id: r.payload?.originalId || r.id,
            }));
          }
        }
      }
    } catch (err) {
      console.warn("Qdrant searchPrecedents query skipped, using in-memory cosine vectors:", err);
    }

    // In-memory Cosine Vector Search Fallback
    if (this.inMemPrecedents.length > 0) {
      const scored = this.inMemPrecedents.map((point) => ({
        ...point.payload,
        id: point.id,
        score: this.cosineSimilarity(queryVector, point.vector),
      }));
      return scored
        .filter((item) => item.score >= scoreThreshold)
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    }

    // Default static fallback if not yet ingested
    return DISPUTE_PRECEDENTS.slice(0, limit);
  }
}

function r_id(id: any): number {
  if (typeof id === "number") return id;
  const num = parseInt(String(id).replace(/\D/g, "").slice(0, 8));
  return isNaN(num) ? 1 : num;
}
