import mongoose, { Schema, Document } from "mongoose";

export interface ISubmission extends Document {
  submissionId?: string;
  projectId: string; // matches Project.projectId
  freelancerPubkey: string;
  ipfsHash: string;
  repoUrl?: string;
  branch?: string;
  note: string;
  fileCount: number;
  status: "pending" | "submitted" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema: Schema = new Schema(
  {
    submissionId: { type: String, index: true },
    projectId: { type: String, required: true, index: true },
    freelancerPubkey: { type: String, required: true },
    ipfsHash: { type: String, required: true },
    repoUrl: { type: String },
    branch: { type: String, default: "main" },
    note: { type: String, default: "" },
    fileCount: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ["pending", "submitted", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISubmission>("Submission", SubmissionSchema);
