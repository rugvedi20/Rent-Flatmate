const mongoose = require("mongoose");

const searchHistorySchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    query: {
      location: { type: String, trim: true },
      minRent: { type: Number },
      maxRent: { type: Number },
      roomType: { type: String },
      furnishing: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SearchHistory", searchHistorySchema);
