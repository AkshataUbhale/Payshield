import type { Request, Response } from "express";
import Thread, { type IThread, type IMessage } from "../models/Thread.js";
import Project from "../models/Project.js";
import User from "../models/User.js";

/**
 * Check if two users are allowed to communicate:
 * Only if they have a shared proposal, an active contract, or a previous contract together.
 */
async function canCommunicate(userA: string, userB: string): Promise<boolean> {
  const sharedProject = await Project.findOne({
    $or: [
      // Direct client & freelancer contract relationship
      { clientPubkey: userA, freelancerPubkey: userB },
      { clientPubkey: userB, freelancerPubkey: userA },
      // Proposal submitted by freelancer to client's project
      { clientPubkey: userA, "proposals.freelancerPubkey": userB },
      { clientPubkey: userB, "proposals.freelancerPubkey": userA },
    ],
  });

  return !!sharedProject;
}

// @desc    Get all eligible contacts for a user based on shared proposals or contracts
// @route   GET /api/messaging/contacts/:userPubkey
export const getEligibleContacts = async (req: Request, res: Response) => {
  try {
    const { userPubkey } = req.params;
    if (!userPubkey) {
      return res.status(400).json({ message: "userPubkey is required" });
    }

    // 1. Find all projects involving this user
    const projects = await Project.find({
      $or: [
        { clientPubkey: userPubkey },
        { freelancerPubkey: userPubkey },
        { "proposals.freelancerPubkey": userPubkey },
      ],
    });

    const contactMap = new Map<string, { projectTag: string; role: string }>();

    projects.forEach((proj) => {
      // If user is client, add all freelancers who applied or were hired
      if (proj.clientPubkey === userPubkey) {
        if (proj.freelancerPubkey && proj.freelancerPubkey !== userPubkey) {
          contactMap.set(proj.freelancerPubkey, {
            projectTag: proj.title,
            role: "freelancer",
          });
        }
        proj.proposals.forEach((prop) => {
          if (prop.freelancerPubkey && prop.freelancerPubkey !== userPubkey) {
            contactMap.set(prop.freelancerPubkey, {
              projectTag: proj.title,
              role: "freelancer",
            });
          }
        });
      }

      // If user is freelancer, add the project client
      if (
        proj.freelancerPubkey === userPubkey ||
        proj.proposals.some((p) => p.freelancerPubkey === userPubkey)
      ) {
        if (proj.clientPubkey && proj.clientPubkey !== userPubkey) {
          contactMap.set(proj.clientPubkey, {
            projectTag: proj.title,
            role: "client",
          });
        }
      }
    });

    const contactPubkeys = Array.from(contactMap.keys());
    if (contactPubkeys.length === 0) {
      return res.json([]);
    }

    // 2. Fetch user profile details
    const users = await User.find({ publicKey: { $in: contactPubkeys } });

    // 3. Fetch existing threads
    const threads = await Thread.find({
      $or: [
        { participantA: userPubkey, participantB: { $in: contactPubkeys } },
        { participantB: userPubkey, participantA: { $in: contactPubkeys } },
      ],
    });

    const formatted = contactPubkeys.map((pubkey) => {
      const u = users.find((item) => item.publicKey === pubkey);
      const meta = contactMap.get(pubkey)!;
      const thread = threads.find(
        (t) =>
          (t.participantA === userPubkey && t.participantB === pubkey) ||
          (t.participantB === userPubkey && t.participantA === pubkey)
      );

      const lastMsg = thread?.messages?.[thread.messages.length - 1];

      return {
        id: pubkey,
        publicKey: pubkey,
        name:
          u?.fullName ||
          u?.username ||
          (meta.role === "client" ? "Client" : "Freelancer") +
            ` (${pubkey.slice(0, 6)}...${pubkey.slice(-4)})`,
        role: meta.role,
        avatar: (u?.fullName || u?.username || "U").charAt(0).toUpperCase(),
        online: true,
        projectTag: meta.projectTag,
        threadId: thread?.threadId || [userPubkey, pubkey].sort().join("-"),
        lastMessage: lastMsg?.encryptedContent || "Connected via PayShield Proposal/Contract",
        time: lastMsg?.timestamp
          ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : "Active",
        unread: 0,
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching eligible contacts:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Create a new message thread
// @route   POST /api/messaging
export const createThread = async (req: Request, res: Response) => {
  try {
    const { threadId, participantA, participantB } = req.body;

    if (!participantA || !participantB) {
      return res.status(400).json({ message: "participantA and participantB are required" });
    }

    // Permission check: must share proposal or contract
    const allowed = await canCommunicate(participantA, participantB);
    if (!allowed) {
      return res.status(403).json({
        message:
          "Communication is only allowed between clients and freelancers who share a submitted proposal or an active/past contract.",
      });
    }

    const tId = threadId || [participantA, participantB].sort().join("-");

    let thread = await Thread.findOne({ threadId: tId });
    if (thread) {
      return res.status(200).json(thread);
    }

    thread = new Thread({
      threadId: tId,
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
// @route   GET /api/messaging/:userPubkey
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
// @route   POST /api/messaging/messages
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { threadId, sender, content, contentHash, encryptedContent } = req.body;

    const messageText = content || encryptedContent || "";
    if (!messageText.trim()) {
      return res.status(400).json({ message: "Message content cannot be empty" });
    }

    let thread = await Thread.findOne({ threadId: threadId as string });
    if (!thread) {
      // If thread doesn't exist, create it if communication is allowed
      const parts = (threadId as string).split("-");
      if (parts.length === 2 && parts[0] && parts[1]) {
        const allowed = await canCommunicate(parts[0], parts[1]);
        if (!allowed) {
          return res.status(403).json({
            message:
              "Communication restricted: You can only message users with whom you share a project proposal or contract.",
          });
        }
        thread = new Thread({
          threadId,
          participantA: parts[0],
          participantB: parts[1],
          messages: [],
        });
      } else {
        return res.status(404).json({ message: "Thread not found" });
      }
    }

    const newMessage: IMessage = {
      sender: sender as string,
      contentHash: contentHash || "E2E-PLAIN",
      encryptedContent: messageText,
      timestamp: new Date(),
    };

    thread.messages.push(newMessage);
    thread.lastMessageAt = newMessage.timestamp;

    await thread.save();
    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Server Error", error });
  }
};

// @desc    Get messages for a thread
// @route   GET /api/messaging/:threadId/messages
export const getThreadMessages = async (req: Request, res: Response) => {
  try {
    const { threadId } = req.params;
    const thread = await Thread.findOne({ threadId: threadId as string });

    if (!thread) {
      return res.json([]);
    }

    res.json(thread.messages);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};
