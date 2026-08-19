import mongoose, { Schema, Document } from "mongoose";

export interface IDisputeMessage {
  sender: string;
  text: string;
  timestamp: Date;
}

export interface IAIResolution {
  suggestion: string;
  splitPercentageFreelancer: number;
  splitPercentageClient: number;
  confidenceScore: number;
  rationale: string;
  oracleSignature?: string | undefined;
  oraclePubkey?: string | undefined;
  resolvedAt?: Date | undefined;
}

export interface IDispute extends Document {
  disputeId: string; // Unique dispute identifier
  projectId: string; // On-chain project ID
  milestoneIndex: number;
  raisedBy: string; // Public key of user who raised the dispute
  issue: string;
  evidence: string; // IPFS links or descriptions
  status: "under_review" | "resolved_by_ai" | "resolved_by_manual" | "dismissed";
  messages: IDisputeMessage[];
  aiResolution?: IAIResolution;
  auditLog: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DisputeSchema: Schema = new Schema(
  {
    disputeId: { type: String, required: true, unique: true, index: true },
    projectId: { type: String, required: true, ref: "Project" },
    milestoneIndex: { type: Number, required: true },
    raisedBy: { type: String, required: true },
    issue: { type: String, required: true },
    evidence: { type: String, default: "" },
    status: {
      type: String,
      enum: ["under_review", "resolved_by_ai", "resolved_by_manual", "dismissed"],
      default: "under_review",
    },
    messages: [
      {
        sender: { type: String, required: true },
        text: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    aiResolution: {
      suggestion: { type: String },
      splitPercentageFreelancer: { type: Number, default: 0 },
      splitPercentageClient: { type: Number, default: 0 },
      confidenceScore: { type: Number, default: 0 },
      rationale: { type: String },
      oracleSignature: { type: String },
      oraclePubkey: { type: String },
      resolvedAt: { type: Date },
    },
    auditLog: { type: [String], default: [] },
  },
  { timestamps: true },
);

export default mongoose.model<IDispute>("Dispute", DisputeSchema);
