const Review = require("../models/Review");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");

// POST /api/reviews
const createReview = asyncHandler(async (req, res) => {
  const { ownerId, rating, reviewText } = req.body;
  const tenantId = req.user._id;

  if (req.user.role !== "tenant") {
    return res.status(403).json({ success: false, message: "Only tenants can leave reviews." });
  }

  if (!ownerId || !rating || !reviewText) {
    return res.status(400).json({ success: false, message: "Please provide all required fields: ownerId, rating, and reviewText." });
  }

  const ratingNum = Number(rating);
  if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
    return res.status(400).json({ success: false, message: "Rating must be a number between 1 and 5." });
  }

  const owner = await User.findById(ownerId);
  if (!owner || owner.role !== "owner") {
    return res.status(400).json({ success: false, message: "Reviews can only be left for owners." });
  }

  if (String(ownerId) === String(tenantId)) {
    return res.status(400).json({ success: false, message: "You cannot review yourself." });
  }

  const existingReview = await Review.findOne({ ownerId, tenantId });
  if (existingReview) {
    return res.status(400).json({ success: false, message: "You have already left a review for this landlord." });
  }

  const review = await Review.create({
    ownerId,
    tenantId,
    rating: ratingNum,
    reviewText: reviewText.trim(),
  });

  const populatedReview = await Review.findById(review._id).populate("tenantId", "name email");

  res.status(201).json(populatedReview);
});

// GET /api/reviews/owner/:ownerId
const getReviewsForOwner = asyncHandler(async (req, res) => {
  const { ownerId } = req.params;

  const reviews = await Review.find({ ownerId })
    .populate("tenantId", "name email")
    .sort({ createdAt: -1 });

  res.json(reviews);
});

module.exports = {
  createReview,
  getReviewsForOwner,
};
