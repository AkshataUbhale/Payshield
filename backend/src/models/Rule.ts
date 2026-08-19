import mongoose, { Schema, Document } from "mongoose";

export interface IRule extends Document {
  id: string;
  title: string;
  content: string;
  keywords: string[];
  embedding?: number[];
  createdAt: Date;
  updatedAt: Date;
}

const RuleSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    keywords: [{ type: String }],
    embedding: { type: [Number], default: undefined },
  },
  { timestamps: true }
);

export default mongoose.model<IRule>("Rule", RuleSchema);
