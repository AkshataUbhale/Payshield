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
import { startSolanaWatcher } from "./services/solanaWatcher.js";

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/users", userRoutes);
app.use("/api/messaging", messagingRoutes);
app.use("/api/social", socialRoutes);
app.use("/api/reputation", reputationRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/draft-contracts", draftContractRoutes);

// Services
// startSolanaWatcher();

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
    // startSolanaWatcher();

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
