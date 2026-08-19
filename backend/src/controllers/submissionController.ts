import { type Response } from "express";
import { type AuthRequest } from "../middleware/authMiddleware.js";
import Submission from "../models/Submission.js";
import Project from "../models/Project.js";

// @desc    Submit work (IPFS CID / deliverable notes)
// @route   POST /api/submissions
// @access  Private (Freelancer)
export const createSubmission = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { contractId, projectId: incomingProjectId, ipfsHash, note, fileCount = 1 } = req.body;
    const freelancerPubkey = req.user.id;
    const targetProjectId = contractId || incomingProjectId;

    if (!targetProjectId || !ipfsHash) {
      res.status(400).json({ message: "Project Contract ID and IPFS CID / Deliverable Hash are required" });
      return;
    }

    let project = await Project.findOne({ projectId: targetProjectId });
    if (!project && targetProjectId.match(/^[0-9a-fA-F]{24}$/)) {
      project = await Project.findById(targetProjectId);
    }

    if (!project) {
      res.status(404).json({ message: "Project contract not found" });
      return;
    }

    // Save submission
    const submission = new Submission({
      projectId: project.projectId,
      freelancerPubkey,
      ipfsHash,
      note: note || "",
      fileCount: Number(fileCount) || 1,
      status: "pending",
    });

    await submission.save();

    // Update project state so client and contract views show "Submitted"
    project.status = "submitted";
    if (project.milestones && project.milestones.length > 0 && project.milestones[0]) {
      project.milestones[0].status = "submitted";
      project.milestones[0].ipfsHash = ipfsHash;
    }
    await project.save();

    res.status(201).json({
      message: "Deliverable submitted successfully for client review",
      submission,
      projectId: project.projectId,
    });
  } catch (error: any) {
    console.error("Error creating submission:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

// @desc    Get all submissions for review
// @route   GET /api/submissions
// @access  Private
export const getSubmissions = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userPubkey = req.user.id;

    // Retrieve client's existing projects
    const clientProjects = await Project.find({ clientPubkey: userPubkey });
    const projectIds = clientProjects.map((p) => p.projectId);

    // Only return pending submissions that belong to these real existing projects
    const submissions = await Submission.find({
      projectId: { $in: projectIds },
      status: "pending",
    }).sort({ createdAt: -1 });

    // Map fields to match UI expectations in frontend
    const mapped = submissions
      .map((sub) => {
        const proj = clientProjects.find((p) => p.projectId === sub.projectId);
        if (!proj) return null;
        return {
          id: sub._id,
          contractId: proj.projectId,
          projectId: proj.projectId,
          title: proj.title,
          freelancer: sub.freelancerPubkey || proj.freelancerPubkey,
          amount: proj.budget || 0,
          currency: "USDC",
          ipfsHash: sub.ipfsHash,
          submittedAt: new Date(sub.createdAt).toLocaleString(),
          note: sub.note,
          status: sub.status,
          files: Array.from({ length: sub.fileCount || 1 }).map((_, i) => ({
            name: `deliverable_${i + 1}.zip`,
            size: "4.5 MB",
            type: "Archive",
          })),
        };
      })
      .filter(Boolean);

    res.status(200).json(mapped);
  } catch (error: any) {
    console.error("Error fetching submissions:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};
