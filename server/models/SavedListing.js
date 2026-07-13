const mongoose = require("mongoose");

const savedListingSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
  },
  { timestamps: true }
);

// Unique compound index: a tenant can save a listing only once
savedListingSchema.index({ tenantId: 1, listingId: 1 }, { unique: true });

module.exports = mongoose.model("SavedListing", savedListingSchema);
