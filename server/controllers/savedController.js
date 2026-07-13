const SavedListing = require("../models/SavedListing");
const Listing = require("../models/Listing");
const asyncHandler = require("../utils/asyncHandler");

// POST /api/saved/toggle
const toggleSaveListing = asyncHandler(async (req, res) => {
  const { listingId } = req.body;
  const tenantId = req.user._id;

  const existing = await SavedListing.findOne({ tenantId, listingId });
  if (existing) {
    await existing.deleteOne();
    return res.json({ success: true, saved: false, message: "Listing removed from bookmarks" });
  }

  const listing = await Listing.findById(listingId);
  if (!listing) {
    return res.status(404).json({ success: false, message: "Listing not found" });
  }

  await SavedListing.create({ tenantId, listingId });
  res.json({ success: true, saved: true, message: "Listing added to bookmarks" });
});

// GET /api/saved
const getSavedListings = asyncHandler(async (req, res) => {
  const tenantId = req.user._id;
  const saved = await SavedListing.find({ tenantId }).populate("listingId");
  
  // Filter out any populated listingId that might have been deleted
  const listings = saved
    .filter((s) => s.listingId != null)
    .map((s) => s.listingId);

  res.json(listings);
});

module.exports = { toggleSaveListing, getSavedListings };
