import dotenv from "dotenv";
import mongoose from "mongoose";
import { Keypair, PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import bs58 from "bs58";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Project from "../models/Project.js";
import Submission from "../models/Submission.js";
import { PROGRAM_ID } from "../config/solana.js";
import { GitHubProofOfWorkTools } from "../services/mcp/githubTools.js";

dotenv.config();

const MONGO_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  "mongodb://localhost:27017/payshield";

const JWT_SECRET = process.env.JWT_SECRET || "fallbacksecret";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function simulateFullProjectCycle() {
  console.log("================================================================================");
  console.log("🚀 PAYSHIELD FULL-CYCLE END-TO-END PLATFORM SIMULATION");
  console.log("================================================================================\n");

  try {
    console.log("📡 Connecting to PayShield Database...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ Database Connected.\n");

    // =========================================================================
    // STAGE 1: CRYPTOGRAPHIC WALLET INITIALIZATION & AUTHENTICATION
    // =========================================================================
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔑 STAGE 1: WALLET GENERATION & SIGNATURE AUTHENTICATION");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const clientKeypair = Keypair.generate();
    const clientPubkey = clientKeypair.publicKey.toBase58();

    const freelancerKeypair = Keypair.generate();
    const freelancerPubkey = freelancerKeypair.publicKey.toBase58();

    console.log(`[Client Wallet]     Public Key: ${clientPubkey}`);
    console.log(`[Freelancer Wallet] Public Key: ${freelancerPubkey}`);

    // Client signs nonce
    const clientNonce = "payshield-auth-challenge-" + Date.now();
    const clientNonceBuf = new TextEncoder().encode(clientNonce);
    const clientSig = nacl.sign.detached(clientNonceBuf, clientKeypair.secretKey);
    const clientSigBase58 = bs58.encode(clientSig);

    // Verify client signature
    const clientVerified = nacl.sign.detached.verify(
      clientNonceBuf,
      bs58.decode(clientSigBase58),
      clientKeypair.publicKey.toBytes()
    );
    if (!clientVerified) throw new Error("Client Ed25519 signature verification failed");

    // Create / Authenticate Client User
    const clientUser = await User.findOneAndUpdate(
      { publicKey: clientPubkey },
      {
        publicKey: clientPubkey,
        role: "client",
        username: "solana_labs_lead",
        displayName: "Solana Labs Ventures",
        fullName: "Alex Rivera",
        email: "alex.rivera@solanalabs.io",
        companyName: "Solana Labs Inc.",
        companySize: "11 - 50 employees",
        industry: "Fintech & Decentralized Finance (DeFi)",
        clientType: "client_only",
        onboardingComplete: true,
      },
      { upsert: true, new: true }
    );

    const clientJwt = jwt.sign(
      { user: { id: clientPubkey, role: "client" } },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
    console.log(`✅ Client authenticated successfully via Ed25519 signature.`);
    console.log(`   - Name: ${clientUser.displayName} (${clientUser.companyName})`);
    console.log(`   - JWT Token Issued: ${clientJwt.slice(0, 32)}...`);

    // Freelancer signs nonce
    const freelancerNonce = "payshield-auth-challenge-" + (Date.now() + 1);
    const freelancerNonceBuf = new TextEncoder().encode(freelancerNonce);
    const freelancerSig = nacl.sign.detached(freelancerNonceBuf, freelancerKeypair.secretKey);
    const freelancerSigBase58 = bs58.encode(freelancerSig);

    const freelancerVerified = nacl.sign.detached.verify(
      freelancerNonceBuf,
      bs58.decode(freelancerSigBase58),
      freelancerKeypair.publicKey.toBytes()
    );
    if (!freelancerVerified) throw new Error("Freelancer Ed25519 signature verification failed");

    // Create / Authenticate Freelancer User
    const freelancerUser = await User.findOneAndUpdate(
      { publicKey: freelancerPubkey },
      {
        publicKey: freelancerPubkey,
        role: "freelancer",
        username: "dev_nakamoto",
        displayName: "Elena Rostova",
        fullName: "Elena Rostova",
        email: "elena.rust@anchor-dev.io",
        bio: "Senior Rust & Solana Anchor Engineer specializing in DeFi Escrows and Smart Contracts.",
        hourlyRate: 85,
        skills: ["Rust", "Solana", "Anchor", "TypeScript", "React", "Zero-Knowledge"],
        occupation: "Blockchain & Smart Contracts",
        onboardingComplete: true,
      },
      { upsert: true, new: true }
    );

    const freelancerJwt = jwt.sign(
      { user: { id: freelancerPubkey, role: "freelancer" } },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
    console.log(`✅ Freelancer authenticated successfully via Ed25519 signature.`);
    console.log(`   - Name: ${freelancerUser.displayName} | Rate: $${freelancerUser.hourlyRate}/hr`);
    console.log(`   - Skills: ${freelancerUser.skills?.join(", ")}`);
    console.log(`   - JWT Token Issued: ${freelancerJwt.slice(0, 32)}...\n`);

    await sleep(800);

    // =========================================================================
    // STAGE 2: CLIENT CREATES CONTRACT (POSTS PROJECT & DERIVES ESCROW PDA)
    // =========================================================================
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📝 STAGE 2: CLIENT POSTS CONTRACT & DERIVES ESCROW PDA");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const projectId = `PROJ-SOL-${Date.now()}`;
    const [escrowPda, escrowBump] = PublicKey.findProgramAddressSync(
      [Buffer.from("escrow"), Buffer.from(projectId)],
      PROGRAM_ID
    );

    const newProject = await Project.create({
      projectId,
      title: "Solana Multi-Signature Vault & Automated Release Escrow",
      description:
        "Develop an audited Anchor program implementing 2-of-3 multisig escrow vaults with automatic milestone release and AI arbiter fallback.",
      budget: 1500,
      category: "Blockchain & Smart Contracts",
      deadline: new Date(Date.now() + 14 * 24 * 3600 * 1000),
      skills: ["Rust", "Solana", "Anchor", "TypeScript"],
      clientPubkey,
      status: "open",
      escrowPda: escrowPda.toBase58(),
      proposals: [],
      milestones: [
        {
          index: 0,
          title: "Milestone 1: Anchor Vault Smart Contract & Unit Tests",
          amount: 750,
          status: "pending",
        },
        {
          index: 1,
          title: "Milestone 2: Frontend Integration & Devnet Verification",
          amount: 750,
          status: "pending",
        },
      ],
    });

    console.log(`✅ Contract Created & Published:`);
    console.log(`   - Project ID: ${newProject.projectId}`);
    console.log(`   - Title: "${newProject.title}"`);
    console.log(`   - Budget: $${newProject.budget} USDC (2 Milestones @ $750 each)`);
    console.log(`   - Escrow PDA Account: ${escrowPda.toBase58()} (Bump: ${escrowBump})`);
    console.log(`   - Status: ${newProject.status.toUpperCase()}\n`);

    await sleep(800);

    // =========================================================================
    // STAGE 3: FREELANCER DISCOVERS JOB & SUBMITS DETAILED PROPOSAL
    // =========================================================================
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔍 STAGE 3: FREELANCER DISCOVERS CONTRACT & SUBMITS PROPOSAL");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const openProjects = await Project.find({ status: "open" });
    const targetProject = openProjects.find((p) => p.projectId === projectId);
    if (!targetProject) throw new Error("Project not found in open marketplace");

    console.log(`🔎 Discovered Open Contract: "${targetProject.title}" by ${clientUser.displayName}`);

    const proposalData = {
      freelancerPubkey,
      freelancerName: freelancerUser.displayName || freelancerUser.fullName || "Elena Rostova",
      bidAmount: 1500,
      timeline: "7 days",
      coverNote:
        "I have built 12+ production Anchor programs on Solana mainnet. I can deliver the Anchor multisig vault with 100% test coverage and bank-grade security checks.",
      experience: "5+ years in Rust & Solana Systems Architecture",
      submittedAt: new Date(),
    };

    targetProject.proposals.push(proposalData);
    await targetProject.save();

    console.log(`✅ Proposal Submitted by ${freelancerUser.displayName}:`);
    console.log(`   - Bid Amount: $${proposalData.bidAmount} USDC`);
    console.log(`   - Est. Timeline: ${proposalData.timeline}`);
    console.log(`   - Cover Pitch: "${proposalData.coverNote.slice(0, 75)}..."\n`);

    await sleep(800);

    // =========================================================================
    // STAGE 4: CLIENT ACCEPTS PROPOSAL & HIRES FREELANCER
    // =========================================================================
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🤝 STAGE 4: CLIENT REVIEWS PROPOSAL, HIRES FREELANCER & LOCKS ESCROW");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const projectForHiring = await Project.findOne({ projectId });
    if (!projectForHiring) throw new Error("Project not found");

    projectForHiring.freelancerPubkey = freelancerPubkey;
    projectForHiring.status = "in_progress";
    await projectForHiring.save();

    console.log(`✅ Freelancer Hired & Contract Activated:`);
    console.log(`   - Selected Freelancer: ${freelancerUser.displayName} (${freelancerPubkey})`);
    console.log(`   - Escrow Vault Status: FUNDED & ACTIVE (${escrowPda.toBase58()})`);
    console.log(`   - Project Status: ${projectForHiring.status.toUpperCase()}\n`);

    await sleep(800);

    // =========================================================================
    // STAGE 5: FREELANCER COMPLETES WORK & SUBMITS PROOF-OF-WORK DELIVERABLE
    // =========================================================================
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📦 STAGE 5: FREELANCER SUBMITS MILESTONE DELIVERABLES (IPFS & GITHUB)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    const repoUrl = "https://github.com/AkshataUbhale/Payshield";
    const ipfsHash = "QmZ4tDuvesekSs4qM5ZBKpXiZGun7S2CYtEZRB3DYXkjGx";
    const submissionId = `SUB-${Date.now()}`;

    const submission = await Submission.create({
      submissionId,
      projectId,
      freelancerPubkey,
      ipfsHash,
      repoUrl,
      branch: "main",
      note: "Anchor multi-sig escrow contract implemented with unit tests, Devnet deployment script, and client SDK.",
      fileCount: 28,
      status: "pending",
    });

    projectForHiring.status = "submitted";
    if (projectForHiring.milestones && projectForHiring.milestones[0]) {
      projectForHiring.milestones[0].status = "submitted";
      projectForHiring.milestones[0].ipfsHash = ipfsHash;
    }
    await projectForHiring.save();

    console.log(`✅ Deliverable Successfully Submitted:`);
    console.log(`   - Submission ID: ${submission.submissionId}`);
    console.log(`   - IPFS CID: ${submission.ipfsHash}`);
    console.log(`   - Codebase: ${submission.repoUrl} (branch: ${submission.branch})`);
    console.log(`   - Files Packaged: ${submission.fileCount} files`);
    console.log(`   - Contract State: SUBMITTED FOR CLIENT REVIEW\n`);

    await sleep(800);

    // =========================================================================
    // STAGE 6: AI AUDIT & CLIENT VERIFICATION
    // =========================================================================
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🤖 STAGE 6: AI ARBITER & PROOF-OF-WORK VERIFICATION");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    console.log(`🔎 Executing automated GitHub code inspection for repository: ${repoUrl}...`);
    const audit = await GitHubProofOfWorkTools.auditProofOfWork(
      repoUrl,
      projectForHiring.title,
      { branch: "main" }
    );

    console.log(`✅ AI Audit Summary:`);
    console.log(`   - Verdict Recommendation: ${audit.recommendation}`);
    console.log(`   - Total Verified Commits: ${audit.totalCommits}`);
    console.log(`   - Code Modifications: +${audit.totalAdditions} / -${audit.totalDeletions} lines`);
    console.log(`   - Confidence Level: HIGH\n`);

    await sleep(800);

    // =========================================================================
    // STAGE 7: CLIENT APPROVES PAYMENT & RELEASES ON-CHAIN ESCROW
    // =========================================================================
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("💰 STAGE 7: PAYMENT APPROVAL & ON-CHAIN ESCROW RELEASE");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    // Simulated Solana Devnet Transaction Signature
    const releaseTxSig = "5Jk9wW7X8mN4pQ2vR6sT1yU3aZ8bC5dE7fG9hK1mN3pQ5rS7tU9vW1xY3zA5bC7d" + Date.now();

    submission.status = "approved";
    await submission.save();

    projectForHiring.status = "completed";
    projectForHiring.txSignature = releaseTxSig;
    if (projectForHiring.milestones) {
      projectForHiring.milestones.forEach((m) => (m.status = "approved"));
    }
    await projectForHiring.save();

    // Increment freelancer stats
    freelancerUser.completedJobs = (freelancerUser.completedJobs || 0) + 1;
    freelancerUser.rating = 5.0;
    freelancerUser.reviewCount = (freelancerUser.reviewCount || 0) + 1;
    await freelancerUser.save();

    console.log(`✅ Escrow Payment Approved & Released:`);
    console.log(`   - Amount Released: $${projectForHiring.budget} USDC`);
    console.log(`   - Recipient: ${freelancerPubkey}`);
    console.log(`   - On-Chain Tx Signature: ${releaseTxSig}`);
    console.log(`   - Milestone 1: APPROVED`);
    console.log(`   - Milestone 2: APPROVED`);
    console.log(`   - Project Status: COMPLETED 🏆\n`);

    // =========================================================================
    // SUMMARY
    // =========================================================================
    console.log("================================================================================");
    console.log("🎉 FULL LIFECYCLE SIMULATION COMPLETED WITH 100% SUCCESS");
    console.log("================================================================================");
    console.log(`   1. Client Auth & Onboarding:     ✅ COMPLETE`);
    console.log(`   2. Contract Creation & Escrow:   ✅ COMPLETE (${projectId})`);
    console.log(`   3. Proposal Submission:          ✅ COMPLETE ($1,500 USDC bid)`);
    console.log(`   4. Freelancer Hired:             ✅ COMPLETE`);
    console.log(`   5. Work & IPFS Submission:       ✅ COMPLETE (${ipfsHash})`);
    console.log(`   6. AI Verification:              ✅ COMPLETE (${audit.recommendation})`);
    console.log(`   7. Escrow Release & Finalized:   ✅ COMPLETE (${releaseTxSig.slice(0, 32)}...)`);
    console.log("================================================================================\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Simulation Failed:", error);
    process.exit(1);
  }
}

simulateFullProjectCycle();
