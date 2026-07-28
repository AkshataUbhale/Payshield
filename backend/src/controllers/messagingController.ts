import type { Request, Response } from "express";
import Thread, { type IThread, type IMessage } from "../models/Thread.js";

// @desc    Create a new message thread
// @route   POST /api/threads
export const createThread = async (req: Request, res: Response) => {
  try {
    const { threadId, participantA, participantB } = req.body;

    let thread = await Thread.findOne({ threadId: threadId as string });
    if (thread) {
      return res.status(400).json({ message: "Thread already exists" });
    }

    thread = new Thread({
      threadId,
      participantA,
      participantB,
      messages: [],
    });

    await thread.save();
    res.status(201).json(thread);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Get all threads for a user
// @route   GET /api/threads/:userPubkey
export const getUserThreads = async (req: Request, res: Response) => {
  try {
    const { userPubkey } = req.params;
    const threads = await Thread.find({
      $or: [
        { participantA: userPubkey as string },
        { participantB: userPubkey as string },
      ],
    }).sort({ lastMessageAt: -1 });

    res.json(threads);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Send a message (add to thread)
// @route   POST /api/messages
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { threadId, sender, contentHash, encryptedContent } = req.body;

    const thread = await Thread.findOne({ threadId: threadId as string });
    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }

    const newMessage: IMessage = {
      sender: sender as string,
      contentHash: contentHash as string,
      encryptedContent: encryptedContent as string,
      timestamp: new Date(),
    };

    thread.messages.push(newMessage);
    thread.lastMessageAt = newMessage.timestamp;

    await thread.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Get messages for a thread
// @route   GET /api/threads/:threadId/messages
export const getThreadMessages = async (req: Request, res: Response) => {
  try {
    const { threadId } = req.params;
    const thread = await Thread.findOne({ threadId: threadId as string });

    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }

    res.json(thread.messages);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
