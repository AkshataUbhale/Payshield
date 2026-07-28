import mongoose, { Schema, type Document } from "mongoose";

export interface IReview extends Document {
  projectId: string;
  reviewer: string; // Pubkey
  targetUser: string; // Pubkey
  rating: number; // 1-5
  comment?: string;
  signature: string; // Tx signature
  createdAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    projectId: { type: String, required: true },
    reviewer: { type: String, required: true },
    targetUser: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    signature: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

export default mongoose.model<IReview>("Review", ReviewSchema);
