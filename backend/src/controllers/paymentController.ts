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

    if (!project) {
      res.status(404).json({ message: "Project contract not found" });
      return;
    }

    if (project.clientPubkey !== clientPubkey) {
      res.status(403).json({ message: "Not authorized to approve payment for this project" });
      return;
    }

    const onChainTx = txSignature || signature;

    // Update Project Status and record on-chain tx hash
    project.status = "completed";
    if (onChainTx) {
      project.txSignature = onChainTx;
    }
    await project.save();

    // Mark submission status as approved
    await Submission.findOneAndUpdate(
      { projectId: project.projectId, status: "pending" },
      { status: "approved" },
    );

    res.status(200).json({
      message: "Payment approved and recorded on-chain successfully",
      project,
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

    if (!project) {
      res.status(404).json({ message: "Project contract not found" });
      return;
    }

    if (project.clientPubkey !== clientPubkey) {
      res.status(403).json({ message: "Not authorized to reject payment for this project" });
      return;
    }

    // Mark submission status as rejected
    await Submission.findOneAndUpdate(
      { projectId: project.projectId, status: "pending" },
      { status: "rejected" },
    );

    res.status(200).json({ message: "Payment rejected successfully" });
  } catch (error: any) {
    console.error("Error rejecting payment:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};
