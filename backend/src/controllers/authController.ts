import { type Request, type Response } from "express";
import jwt from "jsonwebtoken";
import nacl from "tweetnacl";
import bs58 from "bs58";
import crypto from "crypto";
import User from "../models/User.js";

// Generate a random nonce
const generateNonce = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

// @desc    Get authentication nonce for a public key
// @route   GET /api/auth/nonce/:publicKey
// @access  Public
export const getNonce = async (req: Request, res: Response): Promise<void> => {
  try {
    const { publicKey } = req.params;

    if (!publicKey) {
      res.status(400).json({ message: "Public key is required" });
      return;
    }

    let user = await User.findOne({ publicKey });

    const nonce = generateNonce();

    if (!user) {
      // Create new user if not exists
      user = new User({
        publicKey,
        nonce,
      });
    } else {
      // Update existing user's nonce
      user.nonce = nonce;
    }

    await user.save();

    res.status(200).json({ nonce });
  } catch (error) {
    console.error("Error in getNonce:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Login with Solana wallet
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { publicKey, signature } = req.body;

    if (!publicKey || !signature) {
      res
        .status(400)
        .json({ message: "Public key and signature are required" });
      return;
    }

    const user = await User.findOne({ publicKey });

    if (!user || !user.nonce) {
      res
        .status(400)
        .json({
          message: "User not found or nonce missing. Request nonce first.",
        });
      return;
    }

    try {
      const nonceBuffer = new TextEncoder().encode(user.nonce);
      const signatureBuffer = bs58.decode(signature);
      const publicKeyBuffer = bs58.decode(publicKey);

      const verified = nacl.sign.detached.verify(
        nonceBuffer,
        signatureBuffer,
        publicKeyBuffer,
      );

      if (!verified) {
        res.status(401).json({ message: "Invalid signature" });
        return;
      }
    } catch (err) {
      res.status(400).json({ message: "Error verifying signature" });
      return;
    }

    // Signature verified, generate JWT
    const payload = {
      user: {
        id: user.publicKey,
        role: user.role,
      },
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || "fallbacksecret",
      {
        expiresIn: "24h",
      },
    );

    // Rotate nonce to prevent replay
    user.nonce = generateNonce();
    await user.save();

    res.status(200).json({ token, user });
  } catch (error) {
    console.error("Error in login:", error);
    res.status(500).json({ message: "Server Error" });
  }
};
