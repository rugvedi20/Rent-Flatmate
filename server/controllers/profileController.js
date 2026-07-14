const TenantProfile = require("../models/TenantProfile");
const User = require("../models/User");
const Review = require("../models/Review");
const asyncHandler = require("../utils/asyncHandler");
const { geocodeAddress } = require("../utils/geocoder");

// GET /api/profile/:userId
const getProfileByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select("name email role createdAt");
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  let profile = await TenantProfile.findOne({ tenantId: userId });
  
  // If profile doesn't exist, provide a default structure for unified UI usage
  if (!profile) {
    profile = {
      tenantId: userId,
      preferredLocation: "",
      budgetMin: 0,
      budgetMax: 0,
      moveInDate: null,
      notes: "",
      bio: "",
      occupation: "",
      companyOrCollege: "",
      languages: "",
      phone: "",
      avatarUrl: "",
      coverImageUrl: "",
      phoneVerified: false,
      identityVerified: false,
    };
  }

  let reviews = [];
  let reviewsStats = { averageRating: 0, totalReviews: 0 };

  if (user.role === "owner") {
    reviews = await Review.find({ ownerId: userId })
      .populate("tenantId", "name email")
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
      : 0;

    reviewsStats = { averageRating, totalReviews };
  }

  res.json({
    user,
    profile,
    reviews,
    reviewsStats,
  });
});

// POST /api/profile
const upsertProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // 1. Update user model details (name) if provided
  if (req.body.name) {
    await User.findByIdAndUpdate(userId, { name: req.body.name.trim() });
  }

  // 2. Process location coordinates if preferredLocation is modified and coords not sent
  let locationCoords = req.body.locationCoords;
  const coordinatesProvided = locationCoords && locationCoords.coordinates && locationCoords.coordinates.length >= 2;

  if (req.body.preferredLocation && !coordinatesProvided) {
    const coords = await geocodeAddress(req.body.preferredLocation);
    locationCoords = { type: "Point", coordinates: coords };
  }

  // 3. Upsert profile fields in TenantProfile collection
  const updateData = {
    ...req.body,
    tenantId: userId,
  };
  if (locationCoords) {
    updateData.locationCoords = locationCoords;
  }

  // Clean values to prevent validation issues for null values or types
  if (updateData.budgetMin !== undefined) updateData.budgetMin = Number(updateData.budgetMin) || 0;
  if (updateData.budgetMax !== undefined) updateData.budgetMax = Number(updateData.budgetMax) || 0;
  if (updateData.moveInDate === "" || updateData.moveInDate === null) {
    delete updateData.moveInDate;
  }

  const profile = await TenantProfile.findOneAndUpdate(
    { tenantId: userId },
    { $set: updateData },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );

  res.status(200).json(profile);
});

module.exports = {
  getProfileByUserId,
  upsertProfile,
};
