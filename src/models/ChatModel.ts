import { Schema, model } from "mongoose";

const ChatSchema = new Schema(
  {
    participants: [
      { type: Schema.Types.ObjectId, ref: "User", required: true },
    ],
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    customerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    lastMessage: {
      text: String,
      senderId: { type: Schema.Types.ObjectId, ref: "User" },
      createdAt: Date,
    },
    unreadCount: { type: Number, default: 0 },

    // TODO: check
    // createdAt: { type: Date },
    // updatedAt: { type: Date },
  },
  { timestamps: true }
);

const Chat = model("Chat", ChatSchema);
export default Chat;
