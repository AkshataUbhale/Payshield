import mongoose, { Schema, type Document } from "mongoose";

export interface IMessage {
  sender: string; // Pubkey
  contentHash: string; // IPFS Hash or Encrypted Text
  encryptedContent?: string; // Optional: Store encrypted text directly if small
  timestamp: Date;
}

export interface IThread extends Document {
  threadId: string; // PDA Address
  participantA: string; // Pubkey
  participantB: string; // Pubkey
  messages: IMessage[];
  lastMessageAt: Date;
}

const MessageSchema: Schema = new Schema({
  sender: { type: String, required: true },
  contentHash: { type: String, required: true },
  encryptedContent: { type: String },
  timestamp: { type: Date, default: Date.now },
});

const ThreadSchema: Schema = new Schema(
  {
    threadId: { type: String, required: true, unique: true },
    participantA: { type: String, required: true },
    participantB: { type: String, required: true },
    messages: [MessageSchema],
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

// Index for efficient retrieval of user threads
ThreadSchema.index({ participantA: 1, participantB: 1 });
ThreadSchema.index({ participantA: 1 });
ThreadSchema.index({ participantB: 1 });

export default mongoose.model<IThread>("Thread", ThreadSchema);
