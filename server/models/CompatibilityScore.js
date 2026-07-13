const mongoose = require("mongoose");

const compatibilityScoreSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    ruleScore: { type: Number, required: true, min: 0, max: 100 },
    llmScore: { type: Number, min: 0, max: 100 },
    distanceKm: { type: Number },
    confidence: { type: Number, default: 1.0 },
    pros: [{ type: String }],
    cons: [{ type: String }],
    summary: { type: String, default: "" },
    badge: {
      type: String,
      enum: ["Excellent", "Good", "Moderate", "Poor"],
      default: "Moderate",
    },
    explanation: { type: String, required: true },
    generatedBy: {
      type: String,
      enum: ["groq", "rule-engine"],
      required: true,
    },
    inputSnapshot: {
      preferredLocation: String,
      budgetMin: Number,
      budgetMax: Number,
      listingLocation: String,
      rent: Number,
      preferredRoomType: String,
      preferredFurnishing: String,
      parkingRequired: Boolean,
      petsAllowed: Boolean,
      smokingAllowed: Boolean,
      genderPreference: String,
      listingRoomType: String,
      listingFurnishing: String,
      listingDescription: String,
    },
  },
  { timestamps: true }
);

compatibilityScoreSchema.index({ tenantId: 1, listingId: 1 }, { unique: true });

module.exports = mongoose.model("CompatibilityScore", compatibilityScoreSchema);
