const mongoose = require("mongoose");

const tenantProfileSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one profile per tenant
      index: true,
    },
    preferredLocation: { type: String, required: true, trim: true },
    budgetMin: { type: Number, required: true, min: 0 },
    budgetMax: { type: Number, required: true, min: 0 },
    moveInDate: { type: Date, required: true },
    notes: { type: String, default: "" }, // free-text preferences, optional LLM input
  },
  { timestamps: true }
);

tenantProfileSchema.pre("validate", function (next) {
  if (this.budgetMin > this.budgetMax) {
    return next(new Error("budgetMin cannot be greater than budgetMax"));
  }
  next();
});

module.exports = mongoose.model("TenantProfile", tenantProfileSchema);
