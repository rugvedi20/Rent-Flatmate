const Listing = require("../models/Listing");
const TenantProfile = require("../models/TenantProfile");
const Compatibility = require("../models/Compatibility");
const { getOrGenerateCompatibilityBatch } = require("../services/compatibilityAggregator");
const asyncHandler = require("../utils/asyncHandler");
const { geocodeAddress } = require("../utils/geocoder");

// POST /listings (owner only)
const createListing = asyncHandler(async (req, res) => {
  let locationCoords = req.body.locationCoords;
  if (!locationCoords || !locationCoords.coordinates || locationCoords.coordinates.length < 2) {
    const coords = await geocodeAddress(req.body.location);
    locationCoords = { type: "Point", coordinates: coords };
  }
  const listing = await Listing.create({ ...req.body, locationCoords, ownerId: req.user._id });
  res.status(201).json(listing);
});

// PUT /listings/:id (owner only, must own the listing)
const updateListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return res.status(404).json({ success: false, message: "Listing not found" });
  }
  if (String(listing.ownerId) !== String(req.user._id)) {
    return res.status(403).json({ success: false, message: "You do not own this listing" });
  }

  const locationChanged = req.body.location && req.body.location !== listing.location;
  const coordinatesProvided = req.body.locationCoords && req.body.locationCoords.coordinates && req.body.locationCoords.coordinates.length >= 2;
  
  Object.assign(listing, req.body);

  if (locationChanged && !coordinatesProvided) {
    const coords = await geocodeAddress(listing.location);
    listing.locationCoords = { type: "Point", coordinates: coords };
  }

  await listing.save();
  res.json(listing);
});

// DELETE /listings/:id (owner only)
const deleteListing = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return res.status(404).json({ success: false, message: "Listing not found" });
  }
  if (String(listing.ownerId) !== String(req.user._id)) {
    return res.status(403).json({ success: false, message: "You do not own this listing" });
  }
  await listing.deleteOne();
  res.json({ success: true, message: "Listing deleted" });
});

// PUT /listings/:id/fill (owner only) - mark as filled, hidden from search
const markFilled = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return res.status(404).json({ success: false, message: "Listing not found" });
  }
  if (String(listing.ownerId) !== String(req.user._id)) {
    return res.status(403).json({ success: false, message: "You do not own this listing" });
  }
  listing.status = "filled";
  await listing.save();
  res.json(listing);
});

// GET /listings/my (owner) - all of the owner's own listings, any status
const getMyListings = asyncHandler(async (req, res) => {
  const listings = await Listing.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
  res.json(listings);
});

/**
 * GET /listings (tenant) - browse & filter listings, ranked by compatibility score.
 * Requires the tenant to have a profile; generates/reuses compatibility scores
 * for every visible listing, filters by location/rent/type/furnishing, and paginates.
 */
const searchListings = asyncHandler(async (req, res) => {
  const { location, minRent, maxRent, roomType, furnishing, page = 1, limit = 10 } = req.query;

  const filter = { status: "available" };
  if (location) filter.location = new RegExp(location, "i");
  if (minRent || maxRent) {
    filter.rent = {};
    if (minRent) filter.rent.$gte = Number(minRent);
    if (maxRent) filter.rent.$lte = Number(maxRent);
  }
  if (roomType) filter.roomType = roomType;
  if (furnishing) filter.furnishing = furnishing;

  const tenantProfile = await TenantProfile.findOne({ tenantId: req.user._id });
  
  if (!tenantProfile) {
    // No profile yet — return unranked database paginated listings
    const totalListings = await Listing.countDocuments(filter);
    const totalPages = Math.ceil(totalListings / limit);
    const listings = await Listing.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({
      listings,
      ranked: false,
      pagination: {
        totalListings,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  }

  // Fetch all matching active listings for compatibility scoring
  const listings = await Listing.find(filter).sort({ createdAt: -1 });

  const scores = await getOrGenerateCompatibilityBatch(req.user._id, listings, tenantProfile);
  const scoreMap = new Map(scores.map((s) => [String(s.listingId), s]));

  const ranked = listings
    .map((listing) => ({
      listing,
      compatibility: scoreMap.get(String(listing._id)) || null,
    }))
    .sort((a, b) => (b.compatibility?.score || 0) - (a.compatibility?.score || 0));

  // Perform memory slicing for pagination of compatibility-ranked list
  const totalListings = ranked.length;
  const totalPages = Math.ceil(totalListings / limit);
  const slicedRanked = ranked.slice((page - 1) * limit, page * limit);

  res.json({
    listings: slicedRanked,
    ranked: true,
    pagination: {
      totalListings,
      totalPages,
      currentPage: page,
      limit,
    },
  });
});

// GET /listings/:id - single listing detail (with compatibility if tenant)
const getListingById = asyncHandler(async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    return res.status(404).json({ success: false, message: "Listing not found" });
  }

  let compatibility = null;
  if (req.user && req.user.role === "tenant") {
    compatibility = await Compatibility.findOne({ tenantId: req.user._id, listingId: listing._id });
  }

  res.json({ listing, compatibility });
});

module.exports = {
  createListing,
  updateListing,
  deleteListing,
  markFilled,
  getMyListings,
  searchListings,
  getListingById,
};
