const mongoose = require("mongoose");

const compatibilitySchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    explanation: { type: String, required: true },
    generatedBy: {
      type: String,
      enum: ["gemini", "rule-engine"],
      required: true,
    },
    // Snapshot of inputs used to generate this score, so we know when to regenerate
    inputSnapshot: {
      preferredLocation: String,
      budgetMin: Number,
      budgetMax: Number,
      listingLocation: String,
      rent: Number,
    },
  },
  { timestamps: true }
);

// One score per tenant-listing pair; recompute by upserting rather than duplicating
compatibilitySchema.index({ tenantId: 1, listingId: 1 }, { unique: true });

module.exports = mongoose.model("Compatibility", compatibilitySchema);
