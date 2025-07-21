import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  renterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Owner", required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, required: true }],
  lastMessage: { type: String },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model("Conversation", conversationSchema);
