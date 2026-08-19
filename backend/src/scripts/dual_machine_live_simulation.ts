import dotenv from "dotenv";
import mongoose from "mongoose";
import { PublicKey } from "@solana/web3.js";
import User from "../models/User.js";
import Project from "../models/Project.js";
import Submission from "../models/Submission.js";
import { PROGRAM_ID } from "../config/solana.js";
import { GitHubProofOfWorkTools } from "../services/mcp/githubTools.js";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://localhost:27017/payshield";

async function runDualMachineSimulation() {
  console.log("================================================================================");
  console.log("🌐 PAYSHIELD DUAL-MACHINE REAL-TIME COLLABORATION SIMULATION");
  console.log("================================================================================\n");

  try {
    console.log("🔌 Connecting to Database...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected Successfully.\n");

    // ── STEP 1: INITIALIZE USERS ─────────────────────────────────────────────
    const clientPubkey = "Client1111111111111111111111111111111111111";
    const freelancerPubkey = "Freelancer2222222222222222222222222222222222";

    await User.findOneAndUpdate(
      { publicKey: clientPubkey },
      {
        publicKey: clientPubkey,
        username: "Web3 Ventures (Client)",
        role: "client",
      },
      { upsert: true, new: true }
    );

    await User.findOneAndUpdate(
      { publicKey: freelancerPubkey },
      {
        publicKey: freelancerPubkey,
        username: "Solana Dev Pro (Freelancer)",
        role: "freelancer",
        skills: ["React", "Solana", "TypeScript", "AI"],
        hourlyRate: 60,
      },
      { upsert: true, new: true }
    );

    console.log("👤 Step 1: Users Registered / Authenticated");
    console.log(`   - Machine 1 (Client): ${clientPubkey}`);
    console.log(`   - Machine 2 (Freelancer): ${freelancerPubkey}\n`);

    // ── STEP 2: MACHINE 1 (CLIENT) CREATES JOB & DERIVES ESCROW PDA ──────────
    const projectId = `PROJ-${Date.now()}`;
    const [escrowPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), Buffer.from(projectId)],
      PROGRAM_ID
    );

    const newProject = await Project.create({
      projectId,
      title: "Full-Stack Solana Escrow & AI Arbitration Platform",
      description: "Build an audited Solana escrow smart contract with Anchor, React UI, and autonomous AI agents.",
      budget: 500,
      deadline: new Date(Date.now() + 7 * 24 * 3600 * 1000),
      skills: ["React", "Solana", "TypeScript", "AI"],
      clientPubkey,
      status: "open",
      escrowPda: escrowPda.toBase58(),
      proposals: [],
      milestones: [
        {
          index: 0,
          title: "Milestone 1: Solana Escrow Contract & UI",
          amount: 500,
          status: "pending",
        },
      ],
    });

    console.log("💼 Step 2: Machine 1 (Client) Created Job:");
    console.log(`   - Project ID: ${projectId}`);
    console.log(`   - Title: ${newProject.title}`);
    console.log(`   - Escrow PDA Derived: ${escrowPda.toBase58()}\n`);

    // ── STEP 3: MACHINE 2 (FREELANCER) QUERIES OPEN JOBS ─────────────────────
    const openJobs = await Project.find({ status: "open" });
    const discovered = openJobs.find((j) => j.projectId === projectId);
    console.log(`🔍 Step 3: Machine 2 (Freelancer) Discovered Open Jobs (Found: ${openJobs.length})`);
    console.log(`   - Discovered Target Project: '${discovered?.title}'\n`);

    // ── STEP 4: MACHINE 2 (FREELANCER) SUBMITS PROPOSAL ──────────────────────
    discovered?.proposals.push({
      freelancerPubkey,
      bidAmount: 500,
      timeline: "5 days",
      coverNote: "I have extensive experience building Anchor escrow contracts and React web3 apps.",
      coverLetter: "I have extensive experience building Anchor escrow contracts and React web3 apps.",
      submittedAt: new Date(),
    });
    await discovered?.save();

    console.log("📝 Step 4: Machine 2 (Freelancer) Submitted Proposal:");
    console.log(`   - Bid: 500 USDC in 5 days`);
    console.log(`   - Status: Proposal recorded in project document\n`);

    // ── STEP 5: MACHINE 1 (CLIENT) ACCEPTS PROPOSAL & HIRES FREELANCER ───────
    const projectToHire = await Project.findOne({ projectId });
    if (projectToHire) {
      projectToHire.freelancerPubkey = freelancerPubkey;
      projectToHire.status = "in_progress";
      await projectToHire.save();
    }

    console.log("🤝 Step 5: Machine 1 (Client) Accepted Proposal & Hired Freelancer:");
    console.log(`   - Locked Freelancer Public Key: ${freelancerPubkey}`);
    console.log(`   - Project Status Changed to: 'in_progress'\n`);

    // ── STEP 6: MACHINE 2 (FREELANCER) SUBMITS PROOF-OF-WORK ─────────────────
    const repoUrl = "https://github.com/AkshataUbhale/Payshield";
    const submission = await Submission.create({
      submissionId: `SUB-${Date.now()}`,
      projectId,
      freelancerPubkey,
      ipfsHash: "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco",
      repoUrl,
      branch: "main",
      note: "Anchor escrow program completed with Devnet deployment, IDL sync, and full-stack integration.",
      fileCount: 42,
      status: "submitted",
    });

    console.log("📦 Step 6: Machine 2 (Freelancer) Submitted Milestone Deliverables:");
    console.log(`   - Submission ID: ${submission.submissionId}`);
    console.log(`   - Repository: ${submission.repoUrl} (branch: ${submission.branch})`);
    console.log(`   - IPFS Hash: ${submission.ipfsHash}\n`);

    // ── STEP 7: MACHINE 1 (CLIENT) AUDITS POW & APPROVES PAYMENT ─────────────
    console.log("🤖 Step 7: Machine 1 (Client) AI Auditing GitHub Deliverables...");
    const audit = await GitHubProofOfWorkTools.auditProofOfWork(
      repoUrl,
      "Full-Stack Solana Escrow & AI Arbitration Platform",
      { branch: "main" }
    );
    console.log(`   - GitHub Audit Result: ${audit.recommendation}`);
    console.log(`   - Total Commits: ${audit.totalCommits}, PR Diffs: +${audit.totalAdditions}/-${audit.totalDeletions}`);

    const simulatedTxSig = "5Jk9wW7X8mN4pQ2vR6sT1yU3aZ8bC5dE7fG9hK1mN3pQ5rS7tU9vW1xY3zA5bC7d";
    submission.status = "approved";
    await submission.save();

    if (projectToHire) {
      projectToHire.status = "completed";
      projectToHire.txSignature = simulatedTxSig;
      if (projectToHire.milestones && projectToHire.milestones[0]) {
        projectToHire.milestones[0].status = "approved";
      }
      await projectToHire.save();
    }

    console.log(`\n💰 Step 8: Milestone Approved & Payment Released On-Chain:`);
    console.log(`   - Transaction Signature: ${simulatedTxSig}`);
    console.log(`   - Milestone Status: APPROVED`);
    console.log(`   - Final Project Status: COMPLETED\n`);

    console.log("================================================================================");
    console.log("🎉 DUAL-MACHINE REAL-TIME SIMULATION COMPLETED WITH 100% SUCCESS");
    console.log("================================================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Simulation Error:", error);
    process.exit(1);
  }
}

runDualMachineSimulation();
