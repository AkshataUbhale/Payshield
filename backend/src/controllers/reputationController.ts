import type { Request, Response } from "express";
import Review, { type IReview } from "../models/Review.js";

// @desc    Submit a review
// @route   POST /api/reputation/reviews
export const createReview = async (req: Request, res: Response) => {
  try {
    const { projectId, reviewer, targetUser, rating, comment, signature } =
      req.body;

    // Check if review already exists for this project by this reviewer
    const existingReview = await Review.findOne({
      projectId: projectId as string,
      reviewer: reviewer as string,
    });
    if (existingReview) {
      return res.status(400).json({ message: "Review already submitted" });
    }

    const review = new Review({
      projectId,
      reviewer,
      targetUser,
      rating,
      comment,
      signature,
    });

    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Get reviews for a user
// @route   GET /api/reputation/:userPubkey/reviews
export const getUserReviews = async (req: Request, res: Response) => {
  try {
    const { userPubkey } = req.params;
    const reviews = await Review.find({
      targetUser: userPubkey as string,
    }).sort({
      createdAt: -1,
    });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Get reputation stats
// @route   GET /api/reputation/:userPubkey/stats
export const getReputationStats = async (req: Request, res: Response) => {
  try {
    const { userPubkey } = req.params;
    const reviews = await Review.find({ targetUser: userPubkey as string });

    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((acc, review) => acc + (review.rating as number), 0) /
          totalReviews
        : 0;

    res.json({
      userPubkey,
      totalReviews,
      averageRating: parseFloat(averageRating.toFixed(2)),
      reviews,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
