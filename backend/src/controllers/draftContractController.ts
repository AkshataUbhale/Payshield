import { type Response } from "express";
import { type AuthRequest } from "../middleware/authMiddleware.js";
import DraftContract from "../models/DraftContract.js";

// Helper to audit contract text
const performContractAudit = (title: string, description: string, milestones: any[]) => {
  const descLower = description.toLowerCase();
  const titleLower = title.toLowerCase();
  const textCombined = `${titleLower} ${descLower}`;

  let scorePoints = 0;
  const checks = {
    ipTransfer: false,
    confidentiality: false,
    cancellation: false,
    specificity: false,
    paymentTerms: false,
  };

  const recommendations: string[] = [];

  // 1. IP Transfer check
  if (
    textCombined.includes("ip ") ||
    textCombined.includes("intellectual property") ||
    textCombined.includes("ownership") ||
    textCombined.includes("proprietary rights") ||
    textCombined.includes("copyright") ||
    textCombined.includes("assign rights")
  ) {
    checks.ipTransfer = true;
    scorePoints += 20;
  } else {
    recommendations.push(
      "Intellectual Property (IP) Transfer: Add a clause specifying that all rights, titles, and interests in the code/work products transfer to the client upon milestone payment release.",
    );
  }

  // 2. Confidentiality check
  if (
    textCombined.includes("confidential") ||
    textCombined.includes("nda") ||
    textCombined.includes("non-disclosure") ||
    textCombined.includes("privacy") ||
    textCombined.includes("secret")
  ) {
    checks.confidentiality = true;
    scorePoints += 20;
  } else {
    recommendations.push(
      "Confidentiality & NDA: Add terms requiring the freelancer to maintain secrecy regarding proprietary business data, codebases, or server access credentials.",
    );
  }

  // 3. Cancellation / Refund check
  if (
    textCombined.includes("cancel") ||
    textCombined.includes("terminate") ||
    textCombined.includes("refund") ||
    textCombined.includes("kill fee") ||
    textCombined.includes("breach")
  ) {
    checks.cancellation = true;
    scorePoints += 20;
  } else {
    recommendations.push(
      "Cancellation / Exit Clause: Include a procedure for early termination. e.g., 'Either party can terminate with 7 days notice; completed and approved milestones must be paid.'",
    );
  }

  // 4. Specificity check (description details & milestones)
  if (description.length > 120 && milestones.length >= 2) {
    checks.specificity = true;
    scorePoints += 20;
  } else {
    if (description.length <= 120) {
      recommendations.push(
        "Low Scope Specificity: Expand the project description with detailed deliverables, tools, and technical requirements to minimize scope creep.",
      );
    }
    if (milestones.length < 2) {
      recommendations.push(
        "Single-Milestone Risk: Split the budget into at least 2 milestones. Single-milestone escrows carry higher payment/delivery risks for large projects.",
      );
    }
  }

  // 5. Payment / Milestone breakdown check
  const totalMilestoneBudget = milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
  if (totalMilestoneBudget > 0) {
    checks.paymentTerms = true;
    scorePoints += 20;
  } else {
    recommendations.push(
      "Undefined Milestone Values: Ensure all milestone items have explicit funding amounts assigned before requesting approvals.",
    );
  }

  // Risk Score: 100 is high risk, 0 is low risk
  const riskScore = 100 - scorePoints;

  return {
    riskScore,
    checks,
    recommendations,
  };
};

// @desc    Create a new negotiation draft contract
// @route   POST /api/draft-contracts/create
// @access  Private (Client or Freelancer)
export const createDraft = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, budget, currency, deadline, freelancerPubkey, milestones } = req.body;
    const actorPubkey = req.user.id;

    if (!title || !description || !budget) {
      res.status(400).json({ message: "Please provide title, description, and budget." });
      return;
    }

    const draft = new DraftContract({
      clientPubkey: actorPubkey, // The initiator is treated as the client in this draft context
      freelancerPubkey,
      title,
      description,
      budget,
      currency: currency || "USDC",
      deadline,
      milestones: milestones || [],
      clientApproved: true, // Auto-approve for the creator
      freelancerApproved: false,
      status: "negotiating",
      logs: [
        {
          actor: actorPubkey,
          action: "CREATED",
          details: `Draft contract initiated with budget ${budget} ${currency || "USDC"} and ${milestones?.length || 0} milestones.`,
          timestamp: new Date(),
        },
      ],
      chat: [],
      version: 1,
    });

    await draft.save();
    res.status(201).json(draft);
  } catch (error) {
    console.error("Error creating draft contract:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all active drafts for current user
// @route   GET /api/draft-contracts
// @access  Private
export const getDrafts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userPubkey = req.user.id;

    const drafts = await DraftContract.find({
      $or: [{ clientPubkey: userPubkey }, { freelancerPubkey: userPubkey }],
    }).sort({ updatedAt: -1 });

    res.status(200).json(drafts);
  } catch (error) {
    console.error("Error fetching drafts:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get draft details by ID
// @route   GET /api/draft-contracts/:id
// @access  Private
export const getDraftById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const draft = await DraftContract.findById(req.params.id);

    if (!draft) {
      res.status(404).json({ message: "Draft contract not found" });
      return;
    }

    // Verify membership
    if (draft.clientPubkey !== req.user.id && draft.freelancerPubkey !== req.user.id) {
      res.status(403).json({ message: "Access denied: you are not a party to this negotiation." });
      return;
    }

    res.status(200).json(draft);
  } catch (error) {
    console.error("Error fetching draft details:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update draft contract parameters (collaboration edit)
// @route   PUT /api/draft-contracts/:id
// @access  Private
export const updateDraft = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const draft = await DraftContract.findById(req.params.id);

    if (!draft) {
      res.status(404).json({ message: "Draft contract not found" });
      return;
    }

    // Verify membership
    if (draft.clientPubkey !== req.user.id && draft.freelancerPubkey !== req.user.id) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    const { title, description, budget, currency, deadline, milestones, freelancerPubkey } = req.body;
    const actorPubkey = req.user.id;
    const actorLabel = actorPubkey === draft.clientPubkey ? "Client" : "Freelancer";

    const changes: string[] = [];

    if (title && title !== draft.title) {
      changes.push(`Title updated from "${draft.title}" to "${title}"`);
      draft.title = title;
    }

    if (description && description !== draft.description) {
      changes.push("Description updated");
      draft.description = description;
    }

    if (budget && Number(budget) !== draft.budget) {
      changes.push(`Budget adjusted from ${draft.budget} to ${budget}`);
      draft.budget = Number(budget);
    }

    if (currency && currency !== draft.currency) {
      changes.push(`Currency changed from ${draft.currency} to ${currency}`);
      draft.currency = currency;
    }

    if (deadline && new Date(deadline).getTime() !== new Date(draft.deadline || 0).getTime()) {
      changes.push("Deadline updated");
      draft.deadline = new Date(deadline);
    }

    if (freelancerPubkey && freelancerPubkey !== draft.freelancerPubkey) {
      changes.push(`Freelancer key updated to ${freelancerPubkey}`);
      draft.freelancerPubkey = freelancerPubkey;
    }

    if (milestones) {
      // Basic check if milestones changed
      const oldCount = draft.milestones?.length || 0;
      const newCount = milestones.length;
      if (oldCount !== newCount || JSON.stringify(draft.milestones) !== JSON.stringify(milestones)) {
        changes.push(`Milestones structure revised (${oldCount} milestones -> ${newCount} milestones)`);
        draft.milestones = milestones;
      }
    }

    if (changes.length > 0) {
      // Push log entry
      draft.logs.push({
        actor: actorPubkey,
        action: "EDITED",
        details: `${actorLabel} made changes: ${changes.join("; ")}`,
        timestamp: new Date(),
      });

      // Reset approvals
      draft.clientApproved = actorPubkey === draft.clientPubkey; // Auto-approve for the editor
      draft.freelancerApproved = actorPubkey === draft.freelancerPubkey; // Auto-approve for the editor
      draft.version += 1;

      // If budget changed, ensure milestones align or log warning
      const totalMilestoneBudget = draft.milestones.reduce((sum, m) => sum + (Number(m.amount) || 0), 0);
      if (totalMilestoneBudget !== draft.budget) {
        draft.logs.push({
          actor: "SYSTEM",
          action: "WARNING",
          details: `Milestone total (${totalMilestoneBudget} ${draft.currency}) mismatch with overall budget (${draft.budget} ${draft.currency}).`,
          timestamp: new Date(),
        });
      }

      await draft.save();
    }

    res.status(200).json(draft);
  } catch (error) {
    console.error("Error updating draft:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Approve/Sign the draft contract terms
// @route   POST /api/draft-contracts/:id/approve
// @access  Private
export const approveDraft = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const draft = await DraftContract.findById(req.params.id);

    if (!draft) {
      res.status(404).json({ message: "Draft contract not found" });
      return;
    }

    // Verify membership
    if (draft.clientPubkey !== req.user.id && draft.freelancerPubkey !== req.user.id) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    const actorPubkey = req.user.id;
    const isClient = actorPubkey === draft.clientPubkey;

    if (isClient) {
      draft.clientApproved = true;
      draft.logs.push({
        actor: actorPubkey,
        action: "APPROVED",
        details: "Terms approved and signed by Client.",
        timestamp: new Date(),
      });
    } else {
      draft.freelancerApproved = true;
      draft.logs.push({
        actor: actorPubkey,
        action: "APPROVED",
        details: "Terms approved and signed by Freelancer.",
        timestamp: new Date(),
      });
    }

    // Check if fully approved
    if (draft.clientApproved && draft.freelancerApproved) {
      draft.status = "approved";
      draft.logs.push({
        actor: "SYSTEM",
        action: "STATUS_CHANGE",
        details: "Negotiation successfully finalized. Contract ready for Solana Escrow deployment.",
        timestamp: new Date(),
      });
    }

    await draft.save();
    res.status(200).json(draft);
  } catch (error) {
    console.error("Error approving draft:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Add message to negotiation chat
// @route   POST /api/draft-contracts/:id/chat
// @access  Private
export const addChatMessage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { text } = req.body;
    const draft = await DraftContract.findById(req.params.id);

    if (!draft) {
      res.status(404).json({ message: "Draft contract not found" });
      return;
    }

    if (draft.clientPubkey !== req.user.id && draft.freelancerPubkey !== req.user.id) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    draft.chat.push({
      sender: req.user.id,
      text,
      timestamp: new Date(),
    });

    await draft.save();
    res.status(200).json(draft);
  } catch (error) {
    console.error("Error adding chat message:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get contract intelligence audit report
// @route   GET /api/draft-contracts/:id/audit
// @access  Private
export const getRiskAudit = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const draft = await DraftContract.findById(req.params.id);

    if (!draft) {
      res.status(404).json({ message: "Draft contract not found" });
      return;
    }

    if (draft.clientPubkey !== req.user.id && draft.freelancerPubkey !== req.user.id) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    const audit = performContractAudit(draft.title, draft.description, draft.milestones);
    res.status(200).json(audit);
  } catch (error) {
    console.error("Error running audit:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Ask a question to the contract intelligence agent
// @route   POST /api/draft-contracts/:id/ask
// @access  Private
export const askAIQuestion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { question } = req.body;
    const draft = await DraftContract.findById(req.params.id);

    if (!draft) {
      res.status(404).json({ message: "Draft contract not found" });
      return;
    }

    if (draft.clientPubkey !== req.user.id && draft.freelancerPubkey !== req.user.id) {
      res.status(403).json({ message: "Access denied" });
      return;
    }

    const qLower = question.toLowerCase();
    const descLower = draft.description.toLowerCase();
    const titleLower = draft.title.toLowerCase();
    const textCombined = `${titleLower} ${descLower}`;

    let answer = "";

    if (qLower.includes("ip") || qLower.includes("intellectual") || qLower.includes("owner")) {
      const hasIp =
        textCombined.includes("ip ") ||
        textCombined.includes("intellectual property") ||
        textCombined.includes("ownership") ||
        textCombined.includes("copyright") ||
        textCombined.includes("assign rights");
      if (hasIp) {
        answer =
          "🛡️ **Intellectual Property Ownership:** Intellectual property clauses are explicitly mentioned in this draft. According to standard marketplace rules, ownership and all proprietary rights transfer automatically from the Freelancer to the Client upon full milestone payment release.";
      } else {
        answer =
          "⚠️ **Missing IP Clauses:** There are no clauses regarding IP or copyrights in the description of this draft. By default, under many jurisdictions, the creator retains rights unless explicitly assigned. **Recommendation:** Add this sentence to your description: *'All intellectual property rights developed under this contract shall transfer to the client upon full payment of escrowed funds.'*";
      }
    } else if (qLower.includes("cancel") || qLower.includes("terminate") || qLower.includes("refund")) {
      const hasCancel =
        textCombined.includes("cancel") ||
        textCombined.includes("terminate") ||
        textCombined.includes("refund") ||
        textCombined.includes("exit");
      if (hasCancel) {
        answer =
          "📋 **Cancellation & Refund Terms:** The draft references cancellation/refund mechanisms. On PayShield, if a contract is terminated, the client can initiate a refund request, but it requires approval or arbitration if a dispute is raised. Approved milestones are locked as paid.";
      } else {
        answer =
          "⚠️ **No Cancellation Clause:** There are no explicit cancellation terms. **Recommendation:** To prevent deadlock, add a clause like: *'Either party may request contract cancellation. Work performed up to that point will be evaluated, and completed milestones will be released to the freelancer while remaining funds are refunded to the client.'*";
      }
    } else if (qLower.includes("confidential") || qLower.includes("nda") || qLower.includes("disclosure")) {
      const hasNda =
        textCombined.includes("confidential") ||
        textCombined.includes("nda") ||
        textCombined.includes("non-disclosure");
      if (hasNda) {
        answer =
          "🔒 **Confidentiality:** This contract includes confidentiality terms. The parties are legally bound to keep all project briefs, client data, and proprietary code secret.";
      } else {
        answer =
          "⚠️ **No Confidentiality terms:** This draft has no mention of confidentiality or NDA. If the project involves proprietary code or backend database access, we recommend adding: *'The freelancer agrees to hold all client proprietary data and project resources in strict confidence and shall not disclose them to third parties.'*";
      }
    } else if (qLower.includes("delay") || qLower.includes("late") || qLower.includes("overdue")) {
      answer =
        "⏳ **Milestone Deadlines & Delays:** PayShield enforces auto-release escrow rules (e.g. if work is submitted, payment releases in 14 days unless client objects). However, to govern delays, you should write specific terms. For example: *'Delays exceeding 7 days without prior communication will authorize the client to raise an automatic refund dispute.'*";
    } else {
      // Fallback: general analysis
      const ip = textCombined.includes("intellectual property") || textCombined.includes("ip ");
      const nda = textCombined.includes("confidential") || textCombined.includes("nda");
      const cancel = textCombined.includes("cancel") || textCombined.includes("terminate");

      answer = `💡 **PayShield Draft Analysis:**
- **Title:** "${draft.title}"
- **Budget:** ${draft.budget} ${draft.currency} divided into ${draft.milestones.length} milestones.
- **Intellectual Property:** ${ip ? "✅ Covered in terms" : "❌ Not found"}
- **Confidentiality (NDA):** ${nda ? "✅ Covered in terms" : "❌ Not found"}
- **Termination/Cancellation:** ${cancel ? "✅ Covered in terms" : "❌ Not found"}

You can ask me questions about "IP ownership", "cancellation policies", "confidentiality" or "milestones".`;
    }

    res.status(200).json({ answer });
  } catch (error) {
    console.error("Error asking AI question:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Finalize deployment status (on-chain escrow locked)
// @route   POST /api/draft-contracts/:id/deploy
// @access  Private
export const deployDraft = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const draft = await DraftContract.findById(req.params.id);

    if (!draft) {
      res.status(404).json({ message: "Draft contract not found" });
      return;
    }

    if (draft.clientPubkey !== req.user.id) {
      res.status(403).json({ message: "Only the client can lock and deploy the escrow." });
      return;
    }

    if (draft.status !== "approved") {
      res.status(400).json({ message: "Draft must be approved by both client and freelancer before deploying." });
      return;
    }

    draft.status = "deployed";
    draft.logs.push({
      actor: req.user.id,
      action: "DEPLOYED",
      details: "Escrow funds locked and contract deployed on-chain to Solana.",
      timestamp: new Date(),
    });

    await draft.save();
    res.status(200).json(draft);
  } catch (error) {
    console.error("Error deploying draft:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
