import express from "express";
import {
  createPost,
  getFeed,
  likePost,
} from "../controllers/socialController.js";

const router = express.Router();

router.post("/", createPost);
router.get("/", getFeed);
router.post("/:id/like", likePost);

export default router;
