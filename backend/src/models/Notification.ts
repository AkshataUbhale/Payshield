import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userPubkey: string;
  type:
    | "project_invite"
    | "milestone_funded"
    | "milestone_released"
    | "general";
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userPubkey: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: [
        "project_invite",
        "milestone_funded",
        "milestone_released",
        "general",
      ],
      required: true,
    },
    message: { type: String, required: true },
    link: { type: String },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model<INotification>(
  "Notification",
  NotificationSchema,
);
