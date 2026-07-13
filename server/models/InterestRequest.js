const mongoose = require("mongoose");

const interestRequestSchema = new mongoose.Schema(
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
    compatibilityScoreAtRequest: { type: Number },
  },
  { timestamps: true }
);

// Unique compound index: a tenant can express interest in a listing only once
interestRequestSchema.index({ tenantId: 1, listingId: 1 }, { unique: true });

// Optimize dashboard queries
interestRequestSchema.index({ ownerId: 1, status: 1 });
interestRequestSchema.index({ tenantId: 1, status: 1 });

module.exports = mongoose.model("InterestRequest", interestRequestSchema);
