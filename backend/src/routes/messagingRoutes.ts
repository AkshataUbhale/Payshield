import express from "express";
import {
  createThread,
  getUserThreads,
  sendMessage,
  getThreadMessages,
} from "../controllers/messagingController.js";

const router = express.Router();

router.post("/", createThread);
router.get("/:userPubkey", getUserThreads);
router.post("/messages", sendMessage);
router.get("/:threadId/messages", getThreadMessages);

export default router;
