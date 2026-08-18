import mongoose, { Schema, Document } from "mongoose";

export interface ISubmission extends Document {
  projectId: string; // matches Project.projectId
  freelancerPubkey: string;
  ipfsHash: string;
  note: string;
  fileCount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  updatedAt: Date;
}

const SubmissionSchema: Schema = new Schema(
  {
    projectId: { type: String, required: true, index: true },
    freelancerPubkey: { type: String, required: true },
    ipfsHash: { type: String, required: true },
    note: { type: String, default: "" },
    fileCount: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISubmission>("Submission", SubmissionSchema);
