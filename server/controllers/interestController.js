const Interest = require("../models/Interest");
const Listing = require("../models/Listing");
const Compatibility = require("../models/Compatibility");
const User = require("../models/User");
const Conversation = require("../models/Conversation");
const {
  sendHighCompatibilityInterestEmail,
  sendInterestAcceptedEmail,
  sendInterestRejectedEmail,
} = require("../services/emailService");
const asyncHandler = require("../utils/asyncHandler");

const HIGH_COMPATIBILITY_THRESHOLD = Number(process.env.HIGH_COMPATIBILITY_THRESHOLD || 80);

// POST /interest (tenant only)
const createInterest = asyncHandler(async (req, res) => {
  const { listingId } = req.body;

  const listing = await Listing.findById(listingId);
  if (!listing) return res.status(404).json({ success: false, message: "Listing not found" });
  if (listing.status === "filled") {
    return res.status(400).json({ success: false, message: "This listing is already filled" });
  }

  const compatibility = await Compatibility.findOne({
    tenantId: req.user._id,
    listingId,
  });

  const interest = await Interest.create({
    tenantId: req.user._id,
    listingId,
    ownerId: listing.ownerId,
    compatibilityScoreAtRequest: compatibility?.score ?? null,
  });

  // Trigger: email owner when a high-compatibility tenant expresses interest
  if (compatibility && compatibility.score > HIGH_COMPATIBILITY_THRESHOLD) {
    const owner = await User.findById(listing.ownerId);
    if (owner) {
      await sendHighCompatibilityInterestEmail({
        ownerEmail: owner.email,
        tenantName: req.user.name,
        listingTitle: listing.title,
        score: compatibility.score,
      });
    }
  }

  res.status(201).json(interest);
});

// PUT /interest/:id (owner only) - accept or reject
const updateInterestStatus = asyncHandler(async (req, res) => {
  const { status } = req.body; // "accepted" | "rejected"

  const interest = await Interest.findById(req.params.id).populate("listingId tenantId");
  if (!interest) return res.status(404).json({ success: false, message: "Interest request not found" });
  if (String(interest.ownerId) !== String(req.user._id)) {
    return res.status(403).json({ success: false, message: "You do not own this listing" });
  }

  interest.status = status;
  await interest.save();

  const tenant = interest.tenantId; // populated
  const listing = interest.listingId; // populated

  if (status === "accepted") {
    // Initialize standard Conversation thread
    await Conversation.findOneAndUpdate(
      { listingId: listing._id, tenantId: tenant._id, ownerId: req.user._id },
      { listingId: listing._id, tenantId: tenant._id, ownerId: req.user._id },
      { upsert: true, new: true }
    );
    await sendInterestAcceptedEmail({ tenantEmail: tenant.email, listingTitle: listing.title });
  } else {
    await sendInterestRejectedEmail({ tenantEmail: tenant.email, listingTitle: listing.title });
  }

  res.json(interest);
});

// GET /interest/received (owner) - interest requests on the owner's listings
const getReceivedInterests = asyncHandler(async (req, res) => {
  const interests = await Interest.find({ ownerId: req.user._id })
    .populate("tenantId", "name email")
    .populate("listingId", "title location rent")
    .sort({ createdAt: -1 });
  res.json(interests);
});

// GET /interest/sent (tenant) - interest requests the tenant has sent
const getSentInterests = asyncHandler(async (req, res) => {
  const interests = await Interest.find({ tenantId: req.user._id })
    .populate("listingId", "title location rent status ownerId")
    .sort({ createdAt: -1 });
  res.json(interests);
});

module.exports = {
  createInterest,
  updateInterestStatus,
  getReceivedInterests,
  getSentInterests,
};
