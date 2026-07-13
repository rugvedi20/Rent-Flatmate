const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true, trim: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true } // createdAt acts as the message timestamp
);

// Fetch a conversation thread for a listing, ordered by time
messageSchema.index({ listingId: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);
