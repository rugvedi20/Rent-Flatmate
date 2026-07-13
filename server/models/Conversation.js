const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
  },
  { timestamps: true }
);

// Compound unique index: only one conversation thread per listing-tenant-owner group
conversationSchema.index({ listingId: 1, tenantId: 1, ownerId: 1 }, { unique: true });

module.exports = mongoose.model("Conversation", conversationSchema);
