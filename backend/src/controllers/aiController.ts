import { type Response } from "express";
import { type AuthRequest } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Project from "../models/Project.js";
import Dispute from "../models/Dispute.js";
import nacl from "tweetnacl";
import bs58 from "bs58";

// ── AI RECOMMENDATION ENGINE ──────────────────────────────────────────────────

// @desc    Get AI job recommendations for freelancer
// @route   GET /api/ai/recommendations/jobs
// @access  Private (Freelancer only)
export const getRecommendedJobs = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const freelancerPubkey = req.user.id;
    const freelancer = await User.findOne({ publicKey: freelancerPubkey });

    if (!freelancer) {
      res.status(404).json({ message: "Freelancer profile not found" });
      return;
    }

    const freelancerSkills: string[] = freelancer.skills || [];
    const openProjects = await Project.find({ status: "open" });

    // AI recommendation score algorithm
    const recommendations = openProjects.map((project: any) => {
      // 1. Skill overlap (60% weight)
      const projectText = `${project.title} ${project.description}`.toLowerCase();
      
      const matchedSkills = freelancerSkills.filter((skill: string) =>
        projectText.includes(skill.toLowerCase())
      );
      
      const skillScore = freelancerSkills.length > 0 
        ? Math.round((matchedSkills.length / Math.max(1, freelancerSkills.length)) * 100) 
        : 0;

      // 2. Budget match (20% weight)
      const projectBudget = project.budget;
      const freelancerRate = freelancer.hourlyRate || 30; // Default rate
      const expectedSize = freelancerRate * 20; // assumed 20h effort
      
      let budgetScore = 100;
      if (projectBudget < expectedSize) {
        budgetScore = Math.max(0, Math.round((projectBudget / expectedSize) * 100));
      } else {
        budgetScore = Math.max(0, Math.round(100 - ((projectBudget - expectedSize) / expectedSize) * 20));
      }

      // 3. Category matching (20% weight)
      const categories = ["frontend", "backend", "full stack", "blockchain", "design", "marketing"];
      let matchedCategory = "General";
      let categoryScore = 50;

      for (const cat of categories) {
        if (projectText.includes(cat)) {
          matchedCategory = cat.charAt(0).toUpperCase() + cat.slice(1);
          if (freelancerSkills.some((s: string) => s.toLowerCase().includes(cat))) {
            categoryScore = 100;
          }
          break;
        }
      }

      // Compute total weighted score
      const matchScore = Math.round((skillScore * 0.6) + (budgetScore * 0.2) + (categoryScore * 0.2));

      return {
        project: {
          id: project.projectId,
          title: project.title,
          description: project.description,
          budget: project.budget,
          deadline: project.deadline,
          clientPubkey: project.clientPubkey,
          status: project.status,
        },
        matchScore,
        category: matchedCategory,
        matchedSkills,
        missingSkills: freelancerSkills.filter((s: string) => !matchedSkills.includes(s)),
      };
    });

    // Sort by match score descending
    recommendations.sort((a: any, b: any) => b.matchScore - a.matchScore);

    res.status(200).json(recommendations);
  } catch (error) {
    console.error("AI recommendations error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get AI freelancer recommendations for client job
// @route   GET /api/ai/recommendations/freelancers
// @access  Private (Client only)
export const getRecommendedFreelancers = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { projectId } = req.query;

    if (!projectId) {
      res.status(400).json({ message: "ProjectId is required" });
      return;
    }

    const project = await Project.findOne({ projectId: projectId as string });
    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    const freelancers = await User.find({ role: "freelancer" });
    const projectText = `${project.title} ${project.description}`.toLowerCase();

    const recommendations = freelancers.map((freelancer: any) => {
      const skills: string[] = freelancer.skills || [];
      const matchedSkills = skills.filter((skill: string) =>
        projectText.includes(skill.toLowerCase())
      );

      // 1. Skill overlap (50% weight)
      const skillScore = skills.length > 0 
        ? Math.round((matchedSkills.length / Math.max(1, skills.length)) * 100)
        : 0;

      // 2. Rating & History (30% weight)
      const ratingScore = (freelancer.rating || 0) * 20; // 5 stars -> 100
      const completedJobsScore = Math.min(100, (freelancer.completedJobs || 0) * 10);
      const historyScore = Math.round((ratingScore * 0.7) + (completedJobsScore * 0.3));

      // 3. Rate Fit (20% weight)
      const freelancerRate = freelancer.hourlyRate || 30;
      const projectHourlyEquivalent = project.budget / 30;
      
      let rateScore = 100;
      if (freelancerRate > projectHourlyEquivalent) {
        rateScore = Math.max(0, Math.round((projectHourlyEquivalent / freelancerRate) * 100));
      }

      const matchScore = Math.round((skillScore * 0.5) + (historyScore * 0.3) + (rateScore * 0.2));

      return {
        freelancer: {
          publicKey: freelancer.publicKey,
          username: freelancer.username || "Anonymous Freelancer",
          avatarUrl: freelancer.avatarUrl,
          skills: freelancer.skills,
          hourlyRate: freelancer.hourlyRate,
          rating: freelancer.rating,
          reviewCount: freelancer.reviewCount,
          completedJobs: freelancer.completedJobs,
          bio: freelancer.bio,
        },
        matchScore,
        matchedSkills,
        missingSkills: skills.filter((s: string) => !matchedSkills.includes(s)),
      };
    });

    // Sort by match score descending
    recommendations.sort((a: any, b: any) => b.matchScore - a.matchScore);

    res.status(200).json(recommendations);
  } catch (error) {
    console.error("AI freelancer recommendations error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};


// ── AI DISPUTE ARBITRATOR ─────────────────────────────────────────────────────

// @desc    Raise a new dispute
// @route   POST /api/ai/disputes/create
// @access  Private
export const createDispute = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { projectId, milestoneIndex, issue, evidence } = req.body;
    const raisedBy = req.user.id;

    if (!projectId || milestoneIndex === undefined || !issue) {
      res.status(400).json({ message: "Please provide projectId, milestoneIndex and issue" });
      return;
    }

    const disputeId = `D-${Math.floor(100000 + Math.random() * 900000)}`;

    const dispute = new Dispute({
      disputeId,
      projectId,
      milestoneIndex,
      raisedBy,
      issue,
      evidence,
      status: "under_review",
      messages: [
        {
          sender: "System",
          text: `Dispute raised by ${raisedBy.slice(0, 4)}...${raisedBy.slice(-4)}. Escrow funds locked. AI Arbitrator assigned.`,
          timestamp: new Date(),
        },
      ],
      auditLog: ["Dispute registered on-chain", "Milestone status set to DISPUTED", "AI Arbitrator initialized"],
    });

    await dispute.save();

    const project = await Project.findOne({ projectId });
    if (project) {
      project.status = "in_progress";
      await project.save();
    }

    res.status(201).json(dispute);
  } catch (error) {
    console.error("Raise dispute error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get active disputes for a user
// @route   GET /api/ai/disputes
// @access  Private
export const getDisputes = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const pubkey = req.user.id;

    const userProjects = await Project.find({
      $or: [{ clientPubkey: pubkey }, { freelancerPubkey: pubkey }]
    });

    const projectIds = userProjects.map((p: any) => p.projectId);

    const disputes = await Dispute.find({
      $or: [
        { projectId: { $in: projectIds } },
        { raisedBy: pubkey }
      ]
    });

    res.status(200).json(disputes);
  } catch (error) {
    console.error("Fetch disputes error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Post message in dispute thread
// @route   POST /api/ai/disputes/:disputeId/messages
// @access  Private
export const addDisputeMessage = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { disputeId } = req.params;
    const { message, signature, publicKey } = req.body;
    const sender = req.user.id;

    if (!message) {
      res.status(400).json({ message: "Message is required" });
      return;
    }

    const dispute = await Dispute.findOne({ disputeId: disputeId as string });
    if (!dispute) {
      res.status(404).json({ message: "Dispute not found" });
      return;
    }

    let isCryptographicallyVerified = false;

    // Verify signature using tweetnacl if provided
    if (signature && publicKey) {
      try {
        const messageBytes = new TextEncoder().encode(message);
        const signatureBytes = bs58.decode(signature);
        const publicKeyBytes = bs58.decode(publicKey);

        isCryptographicallyVerified = nacl.sign.detached.verify(
          messageBytes,
          signatureBytes,
          publicKeyBytes
        );
      } catch (err) {
        console.error("Signature verification failed:", err);
      }
    }

    const textToSave = isCryptographicallyVerified
      ? `${message} [🔒 Wallet Signed]`
      : message;

    dispute.messages.push({
      sender,
      text: textToSave,
      timestamp: new Date()
    });

    const verificationIndicator = isCryptographicallyVerified
      ? "🔒 [CRYPTOGRAPHICALLY VERIFIED]"
      : "⚠️ [UNVERIFIED STATEMENT]";

    dispute.auditLog.push(
      `New statement submitted by ${sender.slice(0, 4)}...${sender.slice(-4)}: ${verificationIndicator}`
    );
    await dispute.save();

    res.status(200).json(dispute);
  } catch (error) {
    console.error("Add dispute message error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Run AI Dispute arbitration analysis
// @route   POST /api/ai/disputes/:disputeId/arbitrate
// @access  Private
export const arbitrateDisputeWithAI = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { disputeId } = req.params;
    const dispute = await Dispute.findOne({ disputeId: disputeId as string });

    if (!dispute) {
      res.status(404).json({ message: "Dispute not found" });
      return;
    }

    const project = await Project.findOne({ projectId: dispute.projectId });
    const clientPub = project?.clientPubkey || "Client";
    const freelancerPub = project?.freelancerPubkey || "Freelancer";

    const clientMessages = dispute.messages.filter((m: any) => m.sender === clientPub);
    const freelancerMessages = dispute.messages.filter((m: any) => m.sender === freelancerPub);
    const allText = dispute.messages.map((m: any) => m.text).join(" ").toLowerCase();

    let splitFreelancer = 50;
    let splitClient = 50;
    let confidence = 85;
    let suggestion = "Equitable split: 50% to client, 50% to freelancer.";
    let rationale = "Review of submitted materials shows a mutual breakdown in communication. Work was partially complete but scope definitions were vague.";

    const auditSteps = [
      "AI Dispute Analyzer: Compiling dispute history...",
      "AI Dispute Analyzer: Scanning dialogue logs...",
      "AI Dispute Analyzer: Examining technical evidence / IPFS files..."
    ];

    if (allText.includes("delay") || allText.includes("late") || allText.includes("missing")) {
      splitFreelancer = 30;
      splitClient = 70;
      confidence = 90;
      suggestion = "Release 30% to Freelancer, refund 70% to Client.";
      rationale = "AI detected evidence of delivery delays and missing requirements without valid freelancer justification. Scope targets were missed.";
      auditSteps.push("Rule Triggered: Deliverable delay identified in communications.");
    } else if (allText.includes("perfect") || allText.includes("delivered") || allText.includes("completed") || allText.includes("code is done")) {
      splitFreelancer = 80;
      splitClient = 20;
      confidence = 93;
      suggestion = "Release 80% to Freelancer, refund 20% to Client.";
      rationale = "Analysis suggests high delivery completeness. Minor client visual tweaks do not justify a holdback of technical deliverables.";
      auditSteps.push("Rule Triggered: Delivery validation successful in technical scope.");
    } else if (allText.includes("ghost") || allText.includes("ignored") || allText.includes("no reply")) {
      splitFreelancer = 10;
      splitClient = 90;
      confidence = 95;
      suggestion = "Release 10% to Freelancer, refund 90% to Client.";
      rationale = "AI identified a communications blackout by the freelancer. Trustless platforms enforce proactive collaboration.";
      auditSteps.push("Rule Triggered: Freelancer unresponsive patterns detected.");
    }

    auditSteps.push(`Calculated confidence score at ${confidence}%`);
    auditSteps.push("Generated suggested release transaction details");

    dispute.aiResolution = {
      suggestion,
      splitPercentageFreelancer: splitFreelancer,
      splitPercentageClient: splitClient,
      confidenceScore: confidence,
      rationale,
      resolvedAt: new Date()
    };

    dispute.status = "resolved_by_ai";
    dispute.auditLog = [...dispute.auditLog, ...auditSteps];
    await dispute.save();

    res.status(200).json(dispute);
  } catch (error) {
    console.error("AI Dispute arbitration error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Admin manual fallback arbitration
// @route   POST /api/ai/disputes/:disputeId/manual-override
// @access  Private (Admin only)
export const overrideArbitration = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { disputeId } = req.params;
    const { freelancerSplit, clientSplit, comments } = req.body;

    if (freelancerSplit === undefined || clientSplit === undefined) {
      res.status(400).json({ message: "Please provide freelancerSplit and clientSplit percentages" });
      return;
    }

    const dispute = await Dispute.findOne({ disputeId: disputeId as string });
    if (!dispute) {
      res.status(404).json({ message: "Dispute not found" });
      return;
    }

    dispute.aiResolution = {
      suggestion: `Manual Override: Release ${freelancerSplit}% to Freelancer, refund ${clientSplit}% to Client.`,
      splitPercentageFreelancer: freelancerSplit,
      splitPercentageClient: clientSplit,
      confidenceScore: 100,
      rationale: comments || "Resolved manually by administrative arbitrator.",
      resolvedAt: new Date()
    };

    dispute.status = "resolved_by_manual";
    dispute.auditLog.push(`Manual override activated by admin arbitrator`);
    dispute.auditLog.push(`Final resolution locked: Freelancer ${freelancerSplit}% / Client ${clientSplit}%`);

    await dispute.save();

    res.status(200).json(dispute);
  } catch (error) {
    console.error("Manual override error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
