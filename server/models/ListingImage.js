const mongoose = require("mongoose");

const listingImageSchema = new mongoose.Schema(
  {
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: "Listing", required: true, index: true },
    url: { type: String, required: true, trim: true },
    isPrimary: { type: Boolean, default: false },
    caption: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ListingImage", listingImageSchema);
