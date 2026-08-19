import mongoose from "mongoose";
import dotenv from "dotenv";
import Project from "../models/Project.js";
import Thread from "../models/Thread.js";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/payshield";

async function cleanDummy() {
  await mongoose.connect(MONGO_URI);
  console.log("Connected to MongoDB for cleanup.");

  // Delete known test dummy projects
  const res = await Project.deleteMany({
    $or: [
      { projectId: "local-dispute-de" },
      { projectId: { $regex: /^PROJ-17871344/ } },
      { projectId: { $regex: /^178713422/ } },
      { title: { $regex: /Local dispute workflow demo/i } },
      { clientPubkey: { $in: ["client-wallet-123", "mock-client", "demo-client"] } },
      { freelancerPubkey: { $in: ["freelancer-wallet-456", "mock-freelancer", "demo-freelancer"] } },
    ]
  });

  console.log(`Deleted ${res.deletedCount} dummy test projects.`);

  // Clean old dummy threads
  const threadRes = await Thread.deleteMany({
    $or: [
      { threadId: { $regex: /mock|test|demo/i } },
      { participantA: { $regex: /mock|test|demo|user-1/i } },
    ]
  });

  console.log(`Deleted ${threadRes.deletedCount} dummy test threads.`);

  const remaining = await Project.find({});
  console.log(`Remaining real projects in database: ${remaining.length}`);
  remaining.forEach(p => {
    console.log(`- [${p.status}] ${p.title} (client: ${p.clientPubkey}, freelancer: ${p.freelancerPubkey || "none"}, proposals: ${p.proposals?.length})`);
  });

  await mongoose.disconnect();
}

cleanDummy().catch(err => {
  console.error("Cleanup error:", err);
  process.exit(1);
});
