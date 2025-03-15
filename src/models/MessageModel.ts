import { Schema, model } from "mongoose";

const MessageSchema = new Schema(
  {
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    text: String,
    attachments: [String], // URLs or file references
    status: {
      type: String,
      enum: ["sent", "delivered", "read"],
      default: "sent",
    },
    isRead: { type: Boolean, default: false },

    // TODO: check
    // createdAt: { type: Date },
    // updatedAt: { type: Date },
  },
  { timestamps: true }
);

const Message = model("Message", MessageSchema);
export default Message;
