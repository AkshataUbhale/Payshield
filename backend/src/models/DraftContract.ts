import mongoose, { Schema, Document } from "mongoose";

export interface IMilestoneDraft {
  title: string;
  amount: number;
  deadline?: Date;
}

export interface IChatMessage {
  sender: string;
  text: string;
  timestamp: Date;
}

export interface IChangeLog {
  actor: string;
  action: string;
  details: string;
  timestamp: Date;
}

export interface IDraftContract extends Document {
  clientPubkey: string;
  freelancerPubkey?: string;
  title: string;
  description: string;
  budget: number;
  currency: string;
  deadline?: Date;
  milestones: IMilestoneDraft[];
  clientApproved: boolean;
  freelancerApproved: boolean;
  status: "negotiating" | "approved" | "deployed";
  chat: IChatMessage[];
  logs: IChangeLog[];
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneDraftSchema = new Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  deadline: { type: Date },
});

const ChatMessageSchema = new Schema({
  sender: { type: String, required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const ChangeLogSchema = new Schema({
  actor: { type: String, required: true },
  action: { type: String, required: true },
  details: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const DraftContractSchema: Schema = new Schema(
  {
    clientPubkey: { type: String, required: true },
    freelancerPubkey: { type: String },
    title: { type: String, required: true },
    description: { type: String, required: true },
    budget: { type: Number, required: true },
    currency: { type: String, default: "USDC" },
    deadline: { type: Date },
    milestones: { type: [MilestoneDraftSchema], default: [] },
    clientApproved: { type: Boolean, default: false },
    freelancerApproved: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["negotiating", "approved", "deployed"],
      default: "negotiating",
    },
    chat: { type: [ChatMessageSchema], default: [] },
    logs: { type: [ChangeLogSchema], default: [] },
    version: { type: Number, default: 1 },
  },
  { timestamps: true },
);

export default mongoose.model<IDraftContract>("DraftContract", DraftContractSchema);
