const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true, index: true },
    rent: { type: Number, required: true, min: 0 },
    availableFrom: { type: Date, required: true },
    roomType: {
      type: String,
      enum: ["single", "shared", "1bhk", "2bhk", "other"],
      default: "single",
    },
    furnishing: {
      type: String,
      enum: ["furnished", "semi-furnished", "unfurnished"],
      default: "unfurnished",
    },
    description: { type: String, default: "" },
    photos: [{ type: String }], // URLs / file paths
    status: {
      type: String,
      enum: ["available", "filled"],
      default: "available",
      index: true,
    },
  },
  { timestamps: true }
);

// Common query: active listings sorted by recency/location
listingSchema.index({ status: 1, location: 1, rent: 1 });

module.exports = mongoose.model("Listing", listingSchema);
