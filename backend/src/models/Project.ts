import mongoose, { Schema, Document } from "mongoose";

export interface IMilestone {
  index: number;
  title: string;
  amount: number;
  status: "pending" | "submitted" | "approved" | "rejected";
  ipfsHash?: string;
}

export interface IProposal {
  freelancerPubkey: string;
  freelancerName?: string;
  resumeUrl?: string;
  bidAmount: number;
  timeline: string;
  coverNote?: string;
  coverLetter?: string;
  experience?: string;
  submittedAt?: Date;
}

export interface IProject extends Document {
  projectId: string; // Unique Project ID (e.g. on-chain or generated PROJ-xxxx)
  clientPubkey: string;
  freelancerPubkey?: string;
  title: string;
  description: string;
  budget: number;
  status: "open" | "in_progress" | "submitted" | "completed" | "cancelled" | "in_dispute";
  skills?: string[];
  category?: string;
  deadline?: Date;
  descriptionHash?: string;
  proposals: IProposal[];
  txSignature?: string;
  escrowPda?: string;
  milestones?: IMilestone[];
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema: Schema = new Schema({
  index: { type: Number, required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  status: {
    type: String,
    enum: ["pending", "submitted", "approved", "rejected"],
    default: "pending",
  },
  ipfsHash: { type: String },
});

const ProposalSchema: Schema = new Schema({
  freelancerPubkey: { type: String, required: true },
  freelancerName: { type: String, default: "" },
  resumeUrl: { type: String, default: "" },
  bidAmount: { type: Number, required: true },
  timeline: { type: String, default: "" },
  coverNote: { type: String, default: "" },
  coverLetter: { type: String, default: "" },
  experience: { type: String, default: "" },
  submittedAt: { type: Date, default: Date.now },
});

const ProjectSchema: Schema = new Schema(
  {
    projectId: { type: String, required: true, unique: true, index: true },
    clientPubkey: { type: String, required: true, index: true },
    freelancerPubkey: { type: String, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    budget: { type: Number, required: true },
    status: {
      type: String,
      enum: ["open", "in_progress", "submitted", "completed", "cancelled", "in_dispute"],
      default: "open",
      index: true,
    },
    skills: { type: [String], default: [] },
    category: { type: String, default: "General" },
    deadline: { type: Date },
    descriptionHash: { type: String },
    proposals: { type: [ProposalSchema], default: [] },
    txSignature: { type: String },
    escrowPda: { type: String },
    milestones: { type: [MilestoneSchema], default: [] },
  },
  { timestamps: true },
);

export default mongoose.model<IProject>("Project", ProjectSchema);
