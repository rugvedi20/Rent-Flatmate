const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    reviewText: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
  },
  { timestamps: true }
);

// Ensure one review per tenant-owner pair
reviewSchema.index({ ownerId: 1, tenantId: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
