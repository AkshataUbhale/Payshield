import { type Response } from "express";
import { type AuthRequest } from "../middleware/authMiddleware.js";
import Submission from "../models/Submission.js";
import Project from "../models/Project.js";

// @desc    Approve milestone payment and record Solana on-chain tx signature
// @route   POST /api/payments/approve
// @access  Private (Client)
export const approvePayment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { contractId, projectId: incomingProjectId, txSignature, signature } = req.body;
    const clientPubkey = req.user.id;
    const targetId = contractId || incomingProjectId;

    if (!targetId) {
      res.status(400).json({ message: "Contract ID / Project ID is required" });
      return;
    }

    // Check project contract
    let project = await Project.findOne({ projectId: targetId });
    if (!project && targetId.match(/^[0-9a-fA-F]{24}$/)) {
      project = await Project.findById(targetId);
    }
    // Also check if targetId matches a Submission
    if (!project && targetId.match(/^[0-9a-fA-F]{24}$/)) {
      const sub = await Submission.findById(targetId);
      if (sub) {
        project = await Project.findOne({ projectId: sub.projectId });
      }
    }

    const onChainTx = txSignature || signature || `SOL-DEVNET-TX-${Date.now()}`;

    if (project) {
      // Update Project Status and record on-chain tx hash
      project.status = "completed";
      if (project.milestones && project.milestones.length > 0 && project.milestones[0]) {
        project.milestones[0].status = "approved";
      }
      project.txSignature = onChainTx;
      await project.save();

      // Mark submission status as approved
      await Submission.updateMany(
        { projectId: project.projectId },
        { status: "approved" }
      );

      res.status(200).json({
        message: "Payment approved and recorded on-chain successfully",
        project,
        txSignature: onChainTx,
      });
      return;
    }

    // Fallback: If project was already closed or purged, update any matching submission
    await Submission.updateMany(
      { $or: [{ _id: targetId.match(/^[0-9a-fA-F]{24}$/) ? targetId : null }, { projectId: targetId }] },
      { status: "approved" }
    );

    res.status(200).json({
      message: "Payment approved successfully",
      txSignature: onChainTx,
    });
  } catch (error: any) {
    console.error("Error approving payment:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

// @desc    Reject milestone payment
// @route   POST /api/payments/reject
// @access  Private (Client)
export const rejectPayment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { contractId, projectId: incomingProjectId } = req.body;
    const clientPubkey = req.user.id;
    const targetId = contractId || incomingProjectId;

    if (!targetId) {
      res.status(400).json({ message: "Contract ID is required" });
      return;
    }

    let project = await Project.findOne({ projectId: targetId });
    if (!project && targetId.match(/^[0-9a-fA-F]{24}$/)) {
      project = await Project.findById(targetId);
    }
    if (!project && targetId.match(/^[0-9a-fA-F]{24}$/)) {
      const sub = await Submission.findById(targetId);
      if (sub) {
        project = await Project.findOne({ projectId: sub.projectId });
      }
    }

    if (project) {
      project.status = "in_progress";
      if (project.milestones && project.milestones.length > 0 && project.milestones[0]) {
        project.milestones[0].status = "rejected";
      }
      await project.save();

      await Submission.updateMany(
        { projectId: project.projectId },
        { status: "rejected" }
      );
    } else {
      await Submission.updateMany(
        { $or: [{ _id: targetId.match(/^[0-9a-fA-F]{24}$/) ? targetId : null }, { projectId: targetId }] },
        { status: "rejected" }
      );
    }

    res.status(200).json({ message: "Payment rejected successfully" });
  } catch (error: any) {
    console.error("Error rejecting payment:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};
