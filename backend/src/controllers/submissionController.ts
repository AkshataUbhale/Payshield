import { type Response } from "express";
import { type AuthRequest } from "../middleware/authMiddleware.js";
import Submission from "../models/Submission.js";
import Project from "../models/Project.js";

// @desc    Submit work (IPFS upload hash)
// @route   POST /api/submissions
// @access  Private (Freelancer)
export const createSubmission = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { contractId, ipfsHash, note, fileCount = 1 } = req.body;
    const freelancerPubkey = req.user.id;

    if (!contractId || !ipfsHash) {
      res.status(400).json({ message: "Contract ID and IPFS Hash are required" });
      return;
    }

    const project = await Project.findOne({ projectId: contractId });
    if (!project) {
      res.status(404).json({ message: "Project contract not found" });
      return;
    }

    // Save submission
    const submission = new Submission({
      projectId: contractId,
      freelancerPubkey,
      ipfsHash,
      note,
      fileCount,
      status: "pending",
    });

    await submission.save();

    // Mark project status as submitted/in_progress or handled accordingly
    // For demo/simplicity, we just record the submission
    res.status(201).json(submission);
  } catch (error) {
    console.error("Error creating submission:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all submissions for review
// @route   GET /api/submissions
// @access  Private
export const getSubmissions = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userPubkey = req.user.id;

    // Retrieve submissions either assigned to client projects or uploaded by freelancer
    const clientProjects = await Project.find({ clientPubkey: userPubkey });
    const projectIds = clientProjects.map(p => p.projectId);

    const submissions = await Submission.find({
      $or: [
        { freelancerPubkey: userPubkey },
        { projectId: { $in: projectIds } }
      ]
    }).sort({ createdAt: -1 });

    // Map fields to match UI expectations in frontend
    const mapped = submissions.map(sub => {
      const proj = clientProjects.find(p => p.projectId === sub.projectId);
      return {
        id: sub._id,
        contractId: sub.projectId,
        title: proj?.title || "Project Work Delivery",
        freelancer: sub.freelancerPubkey,
        amount: proj?.budget || 0,
        currency: "USDC",
        ipfsHash: sub.ipfsHash,
        submittedAt: new Date(sub.createdAt).toLocaleString(),
        note: sub.note,
        files: Array.from({ length: sub.fileCount }).map((_, i) => ({
          name: `deliverable_${i + 1}.zip`,
          size: "4.5 MB",
          type: "Archive"
        }))
      };
    });

    res.status(200).json(mapped);
  } catch (error) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
