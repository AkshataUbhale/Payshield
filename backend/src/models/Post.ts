import mongoose, { Schema, type Document } from "mongoose";

export interface IPost extends Document {
  postId: string; // PDA or unique identifier
  author: string; // Pubkey
  contentHash: string; // IPFS Hash
  type: "Portfolio" | "JobListing" | "Update";
  likes: string[]; // Array of User Pubkeys who liked
  signature: string; // Tx signature
}

const PostSchema: Schema = new Schema(
  {
    postId: { type: String, required: true, unique: true },
    author: { type: String, required: true, index: true },
    contentHash: { type: String, required: true },
    type: {
      type: String,
      enum: ["Portfolio", "JobListing", "Update"],
      required: true,
    },
    likes: [{ type: String }], // Store pubkeys
    signature: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.model<IPost>("Post", PostSchema);
