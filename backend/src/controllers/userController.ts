import { type Request, type Response } from "express";
import User from "../models/User.js";
import Project from "../models/Project.js";
import Thread from "../models/Thread.js";
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
    const user = await User.findOne({ publicKey: req.user.id });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const {
      username,
      displayName,
      firstName,
      lastName,
      fullName,
      email,
      avatarUrl,
      bio,
      languages,
      occupation,
      occupationStartYear,
      occupationEndYear,
      occupationSkills,
      skills,
      skillsDetail,
      education,
      certifications,
      personalWebsite,
      portfolioLinks,
      resumeUrl,
      resumeName,
      linkedAccounts,
      phone,
      hourlyRate,
      companyName,
      companySize,
      industry,
      buyingCategory,
      clientType,
      availabilityWindow,
      completenessScore,
    } = req.body;

    const resolvedName = fullName || displayName || (firstName && lastName ? `${firstName} ${lastName}`.trim() : user.fullName);
    if (resolvedName) {
      user.fullName = resolvedName;
      user.displayName = displayName || resolvedName;
    }
    if (username) user.username = username;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (avatarUrl) user.avatarUrl = avatarUrl;
    if (bio !== undefined) user.bio = bio;
    if (languages) user.languages = languages;
    if (occupation) user.occupation = occupation;
    if (occupationStartYear) user.occupationStartYear = occupationStartYear;
    if (occupationEndYear) user.occupationEndYear = occupationEndYear;
    if (occupationSkills) user.occupationSkills = occupationSkills;
    if (skills) user.skills = skills;
    if (skillsDetail) user.skillsDetail = skillsDetail;
    if (education) user.education = education;
    if (certifications) user.certifications = certifications;
    if (personalWebsite !== undefined) user.personalWebsite = personalWebsite;
    if (portfolioLinks) user.portfolioLinks = portfolioLinks;
    if (resumeUrl !== undefined) user.resumeUrl = resumeUrl;
    if (resumeName !== undefined) user.resumeName = resumeName;
    if (linkedAccounts) user.linkedAccounts = linkedAccounts;
    if (phone) user.phone = phone;
    if (hourlyRate !== undefined) {
      const parsedRate = Number(hourlyRate);
      if (!Number.isNaN(parsedRate)) user.hourlyRate = parsedRate;
    }
    if (companyName !== undefined) user.companyName = companyName;
    if (companySize !== undefined) user.companySize = companySize;
    if (industry !== undefined) user.industry = industry;
    if (buyingCategory !== undefined) user.buyingCategory = buyingCategory;
    if (clientType !== undefined) user.clientType = clientType;
    if (availabilityWindow) user.availabilityWindow = availabilityWindow;
    if (completenessScore !== undefined) user.completenessScore = Number(completenessScore);

    await user.save();

    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get all freelancers
// @route   GET /api/users/freelancers
// @access  Public
export const getFreelancers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const freelancers = await User.find({
      role: "freelancer",
      onboardingComplete: true,
      username: { $not: { $regex: /DevSpecialist|Solana Dev Pro|mock|test|demo/i } },
      fullName: { $exists: true, $ne: "" },
    });
    res.status(200).json(freelancers);
  } catch (error) {
    console.error("Error fetching freelancers:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Save user selected role
// @route   POST /api/users/role
// @access  Private / Optional Public with publicKey
export const saveUserRole = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userPublicKey = req.user?.id || req.body.publicKey;
    const { role } = req.body;

    if (!userPublicKey) {
      res.status(400).json({ message: "User public key is required" });
      return;
    }

    if (!role || !["freelancer", "client"].includes(role)) {
      res.status(400).json({ message: "Valid role ('freelancer' | 'client') is required" });
      return;
    }

    let user = await User.findOne({ publicKey: userPublicKey });
    if (!user) {
      user = new User({
        publicKey: userPublicKey,
        role,
        username: `User_${userPublicKey.slice(0, 6)}`,
        onboardingComplete: false,
      });
    } else {
      user.role = role;
    }

    await user.save();
    res.status(200).json({
      message: "Role updated successfully",
      user,
      onboardingComplete: user.onboardingComplete,
      role: user.role,
    });
  } catch (error) {
    console.error("Error saving user role:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Submit freelancer onboarding details
// @route   POST /api/users/freelancer
// @access  Private
export const saveFreelancerOnboarding = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userPublicKey = req.user?.id || req.body.publicKey;
    if (!userPublicKey) {
      res.status(400).json({ message: "User identifier required" });
      return;
    }

    const {
      firstName,
      lastName,
      displayName,
      name,
      fullName,
      bio,
      avatarUrl,
      languages,
      occupation,
      occupationStartYear,
      occupationEndYear,
      occupationSkills,
      skills,
      skillsDetail,
      education,
      certifications,
      personalWebsite,
      portfolioLinks,
      portfolioCaseStudies,
      resumeUrl,
      resumeName,
      linkedAccounts,
      email,
      emailVerified,
      phone,
      hourlyRate,
      completenessScore,
    } = req.body;

    const resolvedName = fullName || displayName || (firstName && lastName ? `${firstName} ${lastName}`.trim() : name);
    if (!resolvedName || !resolvedName.trim()) {
      res.status(400).json({ message: "Display name or Full name is required" });
      return;
    }

    let user = await User.findOne({ publicKey: userPublicKey });
    if (!user) {
      user = new User({
        publicKey: userPublicKey,
        role: "freelancer",
      });
    }

    user.role = "freelancer";
    user.fullName = resolvedName.trim();
    user.firstName = firstName || user.firstName || "";
    user.lastName = lastName || user.lastName || "";
    user.displayName = displayName || resolvedName.trim();
    user.username = user.username || displayName || resolvedName.trim();
    user.bio = (bio || "").slice(0, 600);
    if (avatarUrl) user.avatarUrl = avatarUrl;
    user.languages = Array.isArray(languages) ? languages : [];
    user.occupation = occupation || "";
    user.occupationStartYear = occupationStartYear || "";
    user.occupationEndYear = occupationEndYear || "";
    user.occupationSkills = Array.isArray(occupationSkills) ? occupationSkills : [];
    user.skills = Array.isArray(skills) ? skills : [];
    user.skillsDetail = Array.isArray(skillsDetail) ? skillsDetail : [];
    user.education = Array.isArray(education) ? education : [];
    user.certifications = Array.isArray(certifications) ? certifications : [];
    user.personalWebsite = personalWebsite || "";
    user.portfolioLinks = Array.isArray(portfolioLinks) ? portfolioLinks : [];
    user.portfolioCaseStudies = Array.isArray(portfolioCaseStudies) ? portfolioCaseStudies : [];
    user.resumeUrl = resumeUrl || "";
    user.resumeName = resumeName || "";
    if (linkedAccounts) user.linkedAccounts = linkedAccounts;
    if (email) user.email = email;
    if (typeof emailVerified === "boolean") user.emailVerified = emailVerified;
    if (phone) user.phone = phone;
    user.hourlyRate = Number(hourlyRate) > 0 ? Number(hourlyRate) : 50;
    user.completenessScore = Number(completenessScore) || 75;
    user.onboardingComplete = true;

    await user.save();

    res.status(200).json({
      message: "Freelancer profile completed successfully",
      user,
      onboardingComplete: true,
      role: "freelancer",
      completenessScore: user.completenessScore,
    });
  } catch (error) {
    console.error("Error saving freelancer onboarding:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Submit client onboarding details (Fiverr-style multi-step)
// @route   POST /api/users/client
// @access  Private
export const saveClientOnboarding = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userPublicKey = req.user?.id || req.body.publicKey;
    if (!userPublicKey) {
      res.status(400).json({ message: "User identifier required" });
      return;
    }

    const {
      email,
      username,
      displayName,
      fullName,
      clientType,
      buyingCategory,
      companyName,
      companySize,
      industry,
      avatarUrl,
      bio,
      aboutMe,
      languages,
      availabilityWindow,
      completenessScore,
    } = req.body;

    const resolvedName = displayName || fullName || username;
    if (!resolvedName || !resolvedName.trim()) {
      res.status(400).json({ message: "Display Name or Username is required" });
      return;
    }

    // Check if username is already taken by another user
    if (username) {
      const existingUser = await User.findOne({ username: username.trim(), publicKey: { $ne: userPublicKey } });
      if (existingUser) {
        res.status(400).json({ message: "Username is already taken by another account." });
        return;
      }
    }

    let user = await User.findOne({ publicKey: userPublicKey });
    if (!user) {
      user = new User({
        publicKey: userPublicKey,
        role: "client",
      });
    }

    user.role = "client";
    user.email = email || user.email || "";
    user.emailVerified = true;
    user.username = username ? username.trim() : user.username || resolvedName.trim();
    user.displayName = displayName || resolvedName.trim();
    user.fullName = resolvedName.trim();
    user.clientType = clientType || "client_only";
    user.buyingCategory = buyingCategory || "";
    user.companyName = companyName || "";
    user.companySize = companySize || "";
    user.industry = industry || "";
    if (avatarUrl) user.avatarUrl = avatarUrl;
    user.bio = (aboutMe || bio || "").slice(0, 600);
    user.languages = Array.isArray(languages) ? languages : [];
    if (availabilityWindow) user.availabilityWindow = availabilityWindow;
    user.completenessScore = Number(completenessScore) || 75;
    user.onboardingComplete = true;

    await user.save();

    res.status(200).json({
      message: "Client profile completed successfully",
      user,
      onboardingComplete: true,
      role: "client",
      completenessScore: user.completenessScore,
    });
  } catch (error) {
    console.error("Error saving client onboarding:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Get user onboarding status
// @route   GET /api/users/onboarding-status
// @access  Private / Public with query param publicKey
export const getOnboardingStatus = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userPublicKey = req.user?.id || (req.query.publicKey as string);
    if (!userPublicKey) {
      res.status(400).json({ message: "Public key is required" });
      return;
    }

    const user = await User.findOne({ publicKey: userPublicKey });
    if (!user) {
      res.status(200).json({
        exists: false,
        onboardingComplete: false,
        role: null,
      });
      return;
    }

    res.status(200).json({
      exists: true,
      onboardingComplete: !!user.onboardingComplete,
      role: user.role,
      user,
    });
  } catch (error) {
    console.error("Error checking onboarding status:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Helper to purge placeholder/test records from MongoDB
export const purgeDummyRecordsInternal = async () => {
  try {
    const res = await Project.deleteMany({
      $or: [
        { projectId: "local-dispute-de" },
        { projectId: { $regex: /^PROJ-17871344/ } },
        { projectId: { $regex: /^178713422/ } },
        { title: { $regex: /Local dispute workflow demo/i } },
        { clientPubkey: { $in: ["client-wallet-123", "mock-client", "demo-client"] } },
        { freelancerPubkey: { $in: ["freelancer-wallet-456", "mock-freelancer", "demo-freelancer"] } },
      ]
    });
    if (res.deletedCount > 0) {
      console.log(`🧹 Auto-purged ${res.deletedCount} dummy test projects from database.`);
    }

    const userRes = await User.deleteMany({
      $or: [
        { username: { $regex: /DevSpecialist|Solana Dev Pro|mock|test|demo/i } },
        { fullName: { $regex: /DevSpecialist|Solana Dev Pro|mock|test|demo/i } },
        { publicKey: { $in: ["freelancer-wallet-456", "client-wallet-123", "mock-freelancer", "mock-client", "demo-freelancer", "demo-client"] } },
        { publicKey: { $regex: /^dev_|^test_/i } },
      ]
    });
    if (userRes.deletedCount > 0) {
      console.log(`🧹 Auto-purged ${userRes.deletedCount} dummy test users from database.`);
    }
  } catch (err) {
    console.warn("Could not purge dummy records:", err);
  }
};

// @desc    Wipe dummy data for user
// @route   DELETE /api/users/dummy-data
// @access  Private / Public
export const clearDummyData = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const userPublicKey = req.user?.id || req.body?.publicKey;

    // Purge test contracts
    const deletedProjects = await Project.deleteMany({
      $or: [
        { projectId: "local-dispute-de" },
        { projectId: { $regex: /^PROJ-17871344/ } },
        { projectId: { $regex: /^178713422/ } },
        { title: { $regex: /Local dispute workflow demo/i } },
        { clientPubkey: { $in: ["client-wallet-123", "mock-client", "demo-client"] } },
        { freelancerPubkey: { $in: ["freelancer-wallet-456", "mock-freelancer", "demo-freelancer"] } },
      ]
    });

    res.status(200).json({
      message: "Dummy data cleanup completed",
      cleanedProjectsCount: deletedProjects.deletedCount,
      userPublicKey,
    });
  } catch (error) {
    console.error("Error clearing dummy data:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

