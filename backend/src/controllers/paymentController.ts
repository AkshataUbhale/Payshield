import { type Response } from "express";
import { type AuthRequest } from "../middleware/authMiddleware.js";
import Submission from "../models/Submission.js";
import Project from "../models/Project.js";

// @desc    Approve milestone payment
// @route   POST /api/payments/approve
// @access  Private (Client)
export const approvePayment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { contractId } = req.body;
    const clientPubkey = req.user.id;

    if (!contractId) {
      res.status(400).json({ message: "Contract ID is required" });
      return;
    }

    // Check project contract
    const project = await Project.findOne({ projectId: contractId });
    if (!project) {
      res.status(404).json({ message: "Project contract not found" });
      return;
    }

    if (project.clientPubkey !== clientPubkey) {
      res.status(403).json({ message: "Not authorized to approve this payment" });
      return;
    }

    // Update Project Status
    project.status = "completed";
    await project.save();

    // Mark submission status as approved
    await Submission.findOneAndUpdate(
      { projectId: contractId, status: "pending" },
      { status: "approved" }
    );

    res.status(200).json({ message: "Payment approved successfully", project });
  } catch (error) {
    console.error("Error approving payment:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Reject milestone payment
// @route   POST /api/payments/reject
// @access  Private (Client)
export const rejectPayment = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { contractId } = req.body;
    const clientPubkey = req.user.id;

    if (!contractId) {
      res.status(400).json({ message: "Contract ID is required" });
      return;
    }

    const project = await Project.findOne({ projectId: contractId });
    if (!project) {
      res.status(404).json({ message: "Project contract not found" });
      return;
    }

    if (project.clientPubkey !== clientPubkey) {
      res.status(403).json({ message: "Not authorized to reject this payment" });
      return;
    }

    // Mark submission status as rejected
    await Submission.findOneAndUpdate(
      { projectId: contractId, status: "pending" },
      { status: "rejected" }
    );

    res.status(200).json({ message: "Payment rejected successfully" });
  } catch (error) {
    console.error("Error rejecting payment:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
