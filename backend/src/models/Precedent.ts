import mongoose, { Schema, Document } from "mongoose";

export interface IPrecedent extends Document {
  id: string;
  title: string;
  category: string;
  caseSummary: string;
  evidenceSummary: string;
  clientSplitPercent: number;
  freelancerSplitPercent: number;
  rulingRationale: string;
  applicableRules: string[];
  keywords: string[];
  embedding?: number[];
  createdAt: Date;
  updatedAt: Date;
}

const PrecedentSchema: Schema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    category: { type: String, required: true },
    caseSummary: { type: String, required: true },
    evidenceSummary: { type: String, required: true },
    clientSplitPercent: { type: Number, required: true },
    freelancerSplitPercent: { type: Number, required: true },
    rulingRationale: { type: String, required: true },
    applicableRules: [{ type: String }],
    keywords: [{ type: String }],
    embedding: { type: [Number], default: undefined },
  },
  { timestamps: true }
);

export default mongoose.model<IPrecedent>("Precedent", PrecedentSchema);
