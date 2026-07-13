const mongoose = require("mongoose");

const interestSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
      index: true,
    },
    compatibilityScoreAtRequest: { type: Number }, // snapshot for email trigger / analytics
  },
  { timestamps: true }
);

// A tenant can only express interest once per listing
interestSchema.index({ tenantId: 1, listingId: 1 }, { unique: true });

module.exports = mongoose.model("Interest", interestSchema);
