import { type Request, type Response } from "express";
import crypto from "crypto";
import Project from "../models/Project.js";
import { type AuthRequest } from "../middleware/authMiddleware.js";

// @desc    Create a new project (Off-chain preparation)
// @route   POST /api/projects/create
// @access  Private
export const createProject = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { title, description, budget, deadline, projectId } = req.body;
    const clientPubkey = req.user.id; // From auth middleware

    // Validate required fields
    if (!title || !description || !budget || !projectId) {
      res.status(400).json({ message: "Please provide all required fields" });
      return;
    }

    // Generate description hash for on-chain verification
    // In a real app, this might be IPFS CID
    const descriptionHash = crypto
      .createHash("sha256")
      .update(description)
      .digest("hex");

    const project = new Project({
      projectId, // On-chain ID provided by frontend
      clientPubkey,
      title,
      description,
      budget,
      deadline,
      status: "open", // Should technically be 'pending' until verified on-chain, but simplified for now
      descriptionHash,
    });

    await project.save();

    res.status(201).json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all projects with filters
// @route   GET /api/projects
// @access  Public
export const getProjects = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { status, minBudget, maxBudget, limit = 10, page = 1 } = req.query;

    const query: any = {};

    if (status) {
      query.status = status;
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
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get single project by ID
// @route   GET /api/projects/:id
// @access  Public
export const getProjectById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const project = await Project.findOne({
      projectId: req.params.id as string,
    });

    if (!project) {
      res.status(404).json({ message: "Project not found" });
      return;
    }

    res.status(200).json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
