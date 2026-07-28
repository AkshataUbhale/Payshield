import { type Request, type Response } from "express";
import User from "../models/User.js";
import { type AuthRequest } from "../middleware/authMiddleware.js";

// @desc    Register new user
// @route   POST /api/users
// @access  Public
export const createUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { walletAddress, role, email } = req.body;

    if (!walletAddress || !role || !email) {
      res
        .status(400)
        .json({ message: "Missing walletAddress, role, or email" });
      return;
    }

    let user = await User.findOne({ publicKey: walletAddress });

    if (user) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    user = new User({
      publicKey: walletAddress,
      role,
      email,
      username: `User_${walletAddress.slice(0, 6)}`, // Default username
    });

    await user.save();

    res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get user by public key (Public for auth check)
// @route   GET /api/users/:publicKey
// @access  Public
export const getUserByPublicKey = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { publicKey } = req.params;
    if (!publicKey) {
      res.status(400).json({ message: "Public key is required" });
      return;
    }

    const user = await User.findOne({ publicKey });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = await User.findOne({ publicKey: req.user.id });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/update
// @access  Private
export const updateProfile = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { username, email, avatarUrl, skills, hourlyRate, bio } = req.body;

    const user = await User.findOne({ publicKey: req.user.id });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    // Update fields if provided
    if (username) user.username = username;
    if (email) user.email = email;
    if (avatarUrl) user.avatarUrl = avatarUrl;
    if (skills) user.skills = skills;
    if (hourlyRate) user.hourlyRate = hourlyRate;
    if (bio) user.bio = bio;

    await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
