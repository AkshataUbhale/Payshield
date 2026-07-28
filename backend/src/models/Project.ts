import mongoose, { Schema, Document } from "mongoose";

export interface IProject extends Document {
  projectId: string; // On-chain ID
  clientPubkey: string;
  freelancerPubkey?: string;
  title: string;
  description: string;
  budget: number;
  status: "open" | "in_progress" | "completed" | "cancelled";
  deadline?: Date;
  descriptionHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema: Schema = new Schema(
  {
    projectId: { type: String, required: true, unique: true, index: true },
    clientPubkey: { type: String, required: true },
    freelancerPubkey: { type: String },
    title: { type: String, required: true },
    description: { type: String, required: true },
    budget: { type: Number, required: true },
    status: {
      type: String,
      enum: ["open", "in_progress", "completed", "cancelled"],
      default: "open",
    },
    deadline: { type: Date },
    descriptionHash: { type: String },
  },
  { timestamps: true },
);

export default mongoose.model<IProject>("Project", ProjectSchema);
