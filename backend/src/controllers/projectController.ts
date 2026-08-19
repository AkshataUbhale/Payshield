import { type Request, type Response } from "express";
import crypto from "crypto";
import Project, { type IProject } from "../models/Project.js";
import { type AuthRequest } from "../middleware/authMiddleware.js";

// @desc    Create a new project / job (Client)
// @route   POST /api/projects or POST /api/projects/create
// @access  Private (Client)
export const createProject = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const {
      title,
      description,
      budget,
      deadline,
      skills,
      category,
      projectId: incomingProjectId,
      freelancerPubkey,
    } = req.body;
    const clientPubkey = req.user.id;

    if (!title || !description || budget === undefined || budget === null) {
      res.status(400).json({ message: "Please provide title, description, and budget" });
      return;
    }

    // Auto-generate unique projectId if not provided
    const projectId =
      incomingProjectId ||
      `PROJ-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Generate SHA-256 hash of description for on-chain/IPFS verification
    const descriptionHash = crypto
      .createHash("sha256")
      .update(description)
      .digest("hex");

    const project = new Project({
      projectId,
      clientPubkey,
      freelancerPubkey: freelancerPubkey || undefined,
      title,
      description,
      budget: Number(budget),
      skills: Array.isArray(skills) ? skills : [],
      category: category || "General",
      deadline: deadline ? new Date(deadline) : undefined,
      status: "open",
      descriptionHash,
      proposals: [],
    });

    await project.save();

    res.status(201).json(project);
  } catch (error: any) {
    console.error("Error creating project:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

// @desc    Get all open projects available for bidding (Freelancer)
// @route   GET /api/projects/open
// @access  Public / Freelancers
export const getOpenProjects = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const projects = await Project.find({ status: "open" }).sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error: any) {
    console.error("Error fetching open projects:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all projects with dynamic query filters
// @route   GET /api/projects
// @access  Public
export const getProjects = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      status,
      minBudget,
      maxBudget,
      clientPubkey,
      freelancerPubkey,
      category,
      limit = 20,
      page = 1,
    } = req.query;

    const query: any = {};

    if (status && status !== "All") {
      query.status = status;
    }

    if (clientPubkey) {
      query.clientPubkey = clientPubkey;
    }

    if (freelancerPubkey) {
      query.freelancerPubkey = freelancerPubkey;
    }

    if (category) {
      query.category = category;
    }

    if (minBudget || maxBudget) {
      query.budget = {};
      if (minBudget) query.budget.$gte = Number(minBudget);
      if (maxBudget) query.budget.$lte = Number(maxBudget);
    }

    const projects = await Project.find(query)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 });

    const total = await Project.countDocuments(query);

    res.status(200).json({
      projects,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total,
    });
  } catch (error: any) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get single project by projectId or MongoDB _id
// @route   GET /api/projects/:id
// @access  Public
export const getProjectById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    let project = await Project.findOne({ projectId: id });

    if (!project && id.match(/^[0-9a-fA-F]{24}$/)) {
      project = await Project.findById(id);
    }

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    res.status(200).json(project);
  } catch (error: any) {
    console.error("Error fetching project:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Submit a proposal to an open project (Freelancer)
// @route   POST /api/projects/:id/apply
// @access  Private (Freelancer)
export const applyToProject = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const freelancerPubkey = req.user.id;
    const { proposal, coverNote, bid, bidAmount, timeline, experience } = req.body;

    const finalCoverNote = proposal || coverNote;
    const finalBid = bid !== undefined ? Number(bid) : bidAmount !== undefined ? Number(bidAmount) : null;

    if (!finalCoverNote || finalBid === null || isNaN(finalBid)) {
      res.status(400).json({ message: "Proposal cover letter and valid bid amount are required" });
      return;
    }

    let project = await Project.findOne({ projectId: id });
    if (!project && id.match(/^[0-9a-fA-F]{24}$/)) {
      project = await Project.findById(id);
    }

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    if (project.clientPubkey === freelancerPubkey) {
      res.status(400).json({ message: "You cannot apply to your own posted project" });
      return;
    }

    if (project.status !== "open") {
      res.status(400).json({ message: `Cannot apply: Project is currently ${project.status}` });
      return;
    }

    // Check if freelancer has already applied
    const existingIndex = project.proposals.findIndex(
      (p) => p.freelancerPubkey === freelancerPubkey,
    );

    const proposalData = {
      freelancerPubkey,
      bidAmount: finalBid,
      timeline: timeline || "",
      coverNote: finalCoverNote,
      experience: experience || "",
      submittedAt: new Date(),
    };

    if (existingIndex >= 0) {
      project.proposals[existingIndex] = proposalData;
    } else {
      project.proposals.push(proposalData);
    }

    await project.save();

    res.status(200).json({
      message: "Proposal submitted successfully",
      project,
      proposal: proposalData,
    });
  } catch (error: any) {
    console.error("Error applying to project:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};

// @desc    Hire a freelancer for a project (Client)
// @route   POST /api/projects/:id/hire
// @access  Private (Client)
export const hireFreelancer = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const clientPubkey = req.user.id;
    const { freelancerPubkey } = req.body;

    if (!freelancerPubkey) {
      res.status(400).json({ message: "freelancerPubkey is required" });
      return;
    }

    let project = await Project.findOne({ projectId: id });
    if (!project && id.match(/^[0-9a-fA-F]{24}$/)) {
      project = await Project.findById(id);
    }

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    if (project.clientPubkey !== clientPubkey) {
      res.status(403).json({ message: "Only the project owner can hire for this project" });
      return;
    }

    project.freelancerPubkey = freelancerPubkey;
    project.status = "in_progress";
    await project.save();

    res.status(200).json({
      message: "Freelancer hired successfully",
      project,
    });
  } catch (error: any) {
    console.error("Error hiring freelancer:", error);
    res.status(500).json({ message: error.message || "Server Error" });
  }
};
