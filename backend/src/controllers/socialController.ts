import type { Request, Response } from "express";
import Post, { type IPost } from "../models/Post.js";

// @desc    Create a new post
// @route   POST /api/posts
export const createPost = async (req: Request, res: Response) => {
  try {
    const { postId, author, contentHash, type, signature } = req.body;

    const post = new Post({
      postId,
      author,
      contentHash,
      type,
      signature,
    });

    await post.save();
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Get all posts (Feed)
// @route   GET /api/posts
export const getFeed = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Like a post
// @route   POST /api/posts/:id/like
export const likePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userPubkey } = req.body;

    const post = await Post.findOne({ postId: id as string });
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.likes.includes(userPubkey as string)) {
      return res.status(400).json({ message: "Post already liked" });
    }

    post.likes.push(userPubkey as string);
    await post.save();

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
