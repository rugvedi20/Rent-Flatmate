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
    budgetMax: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function (value) {
          const budgetMin = this instanceof mongoose.Document 
            ? this.budgetMin 
            : (this.getUpdate ? (this.getUpdate().$set?.budgetMin || this.getUpdate().budgetMin) : undefined);
          if (budgetMin !== undefined && budgetMin > value) {
            return false;
          }
          return true;
        },
        message: "budgetMin cannot be greater than budgetMax",
      },
    },
    moveInDate: { type: Date, required: true },
    notes: { type: String, default: "" }, // free-text preferences, optional LLM input
    preferredRoomType: {
      type: String,
      enum: ["single", "shared", "1bhk", "2bhk", "other"],
    },
    preferredFurnishing: {
      type: String,
      enum: ["furnished", "semi-furnished", "unfurnished"],
    },
    parkingRequired: { type: Boolean },
    petsAllowed: { type: Boolean },
    smokingAllowed: { type: Boolean },
    genderPreference: {
      type: String,
      enum: ["any", "male", "female", "other"],
      default: "any",
    },
    locationCoords: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [73.8567, 18.5204] }, // [lng, lat]
    },
    bio: { type: String, default: "" },
    occupation: { type: String, default: "" },
    languages: { type: String, default: "" },
    phone: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    phoneVerified: { type: Boolean, default: false },
    identityVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

tenantProfileSchema.index({ locationCoords: "2dsphere" });

module.exports = mongoose.model("TenantProfile", tenantProfileSchema);
