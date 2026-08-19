import express from "express";
import {
  createThread,
  getUserThreads,
  sendMessage,
  getThreadMessages,
  getEligibleContacts,
} from "../controllers/messagingController.js";

const router = express.Router();

router.get("/contacts/:userPubkey", getEligibleContacts);
router.post("/", createThread);
router.get("/:userPubkey", getUserThreads);
router.post("/messages", sendMessage);
router.get("/:threadId/messages", getThreadMessages);

export default router;
