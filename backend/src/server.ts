import express, { type Express, type Request, type Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import messagingRoutes from "./routes/messagingRoutes.js";
import socialRoutes from "./routes/socialRoutes.js";
import reputationRoutes from "./routes/reputationRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import draftContractRoutes from "./routes/draftContractRoutes.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { startSolanaWatcher } from "./services/solanaWatcher.js";
import { RAGService } from "./services/rag/ragService.js";
import { purgeDummyRecordsInternal } from "./controllers/userController.js";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

// Connect to Database
connectDB();

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow all localhost origins (Vite uses 5173 by default, backend 3001)
    if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS: origin not allowed"));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messaging", messagingRoutes);
app.use("/api/social", socialRoutes);
app.use("/api/reputation", reputationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/draft-contracts", draftContractRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/payments", paymentRoutes);

// Centralized error handler to guarantee JSON error responses
app.use((err: any, _req: Request, res: Response, _next: any) => {
  console.error("Express unhandled error:", err);
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    message: err.message || "Internal Server Error",
  });
});

// Services
startSolanaWatcher();

// Health Check
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    solana: "connected", // We will verify this in a real scenario, for now assume connected if init didn't fail
    mongodb: "connected",
  });
});

app.get("/", (req: Request, res: Response) => {
  res.send("SolanaHub Backend is running");
});

import { initializeSolana } from "./config/solana.js";

// Start Server
async function start() {
  try {
    console.log("🚀 Starting SolanaHub backend...");

    // Connect to Solana
    const { connection, program } = await initializeSolana();
    console.log("✅ Solana connected");

    // Start Solana Watcher if needed
    startSolanaWatcher();

    // Initialize RAG Vector Search & Embeddings
    RAGService.initializeKnowledge().catch((err: any) =>
      console.warn("RAG knowledge initialization background warning:", err)
    );

    // Purge test placeholder records
    purgeDummyRecordsInternal().catch((err: any) =>
      console.warn("Dummy records purge warning:", err)
    );

    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`✅ Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

start();
