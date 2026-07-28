import mongoose, { Schema, Document } from "mongoose";

export interface IMilestone extends Document {
  projectId: mongoose.Types.ObjectId;
  milestoneIndex: number;
  title: string;
  amount: number;
  status: "pending" | "funded" | "released" | "disputed";
  createdAt: Date;
  updatedAt: Date;
}

const MilestoneSchema: Schema = new Schema(
  {
    projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
    milestoneIndex: { type: Number, required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "funded", "released", "disputed"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export default mongoose.model<IMilestone>("Milestone", MilestoneSchema);
