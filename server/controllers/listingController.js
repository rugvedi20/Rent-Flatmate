const Listing = require("../models/Listing");
const TenantProfile = require("../models/TenantProfile");
const Compatibility = require("../models/Compatibility");
const { getOrGenerateCompatibilityBatch } = require("../services/compatibilityService");

// POST /listings (owner only)
async function createListing(req, res) {
  try {
    const listing = await Listing.create({ ...req.body, ownerId: req.user._id });
    res.status(201).json(listing);
  } catch (err) {
    res.status(400).json({ message: "Failed to create listing", error: err.message });
  }
}

// PUT /listings/:id (owner only, must own the listing)
async function updateListing(req, res) {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (String(listing.ownerId) !== String(req.user._id)) {
      return res.status(403).json({ message: "You do not own this listing" });
    }

    Object.assign(listing, req.body);
    await listing.save();
    res.json(listing);
  } catch (err) {
    res.status(400).json({ message: "Failed to update listing", error: err.message });
  }
}

// DELETE /listings/:id (owner only)
async function deleteListing(req, res) {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (String(listing.ownerId) !== String(req.user._id)) {
      return res.status(403).json({ message: "You do not own this listing" });
    }
    await listing.deleteOne();
    res.json({ message: "Listing deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete listing", error: err.message });
  }
}

// PUT /listings/:id/fill (owner only) - mark as filled, hidden from search
async function markFilled(req, res) {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });
    if (String(listing.ownerId) !== String(req.user._id)) {
      return res.status(403).json({ message: "You do not own this listing" });
    }
    listing.status = "filled";
    await listing.save();
    res.json(listing);
  } catch (err) {
    res.status(500).json({ message: "Failed to update listing status", error: err.message });
  }
}

// GET /listings/my (owner) - all of the owner's own listings, any status
async function getMyListings(req, res) {
  const listings = await Listing.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
  res.json(listings);
}

/**
 * GET /listings (tenant) - browse & filter listings, ranked by compatibility score.
 * Requires the tenant to have a profile; generates/reuses compatibility scores
 * for every visible listing and sorts descending by score.
 */
async function searchListings(req, res) {
  try {
    const { location, minRent, maxRent } = req.query;

    const filter = { status: "available" };
    if (location) filter.location = new RegExp(location, "i");
    if (minRent || maxRent) {
      filter.rent = {};
      if (minRent) filter.rent.$gte = Number(minRent);
      if (maxRent) filter.rent.$lte = Number(maxRent);
    }

    const listings = await Listing.find(filter).sort({ createdAt: -1 });

    const tenantProfile = await TenantProfile.findOne({ tenantId: req.user._id });
    if (!tenantProfile) {
      // No profile yet — return unranked listings rather than blocking browsing
      return res.json({ listings, ranked: false });
    }

    const scores = await getOrGenerateCompatibilityBatch(req.user._id, listings, tenantProfile);
    const scoreMap = new Map(scores.map((s) => [String(s.listingId), s]));

    const ranked = listings
      .map((listing) => ({
        listing,
        compatibility: scoreMap.get(String(listing._id)) || null,
      }))
      .sort((a, b) => (b.compatibility?.score || 0) - (a.compatibility?.score || 0));

    res.json({ listings: ranked, ranked: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to search listings", error: err.message });
  }
}

// GET /listings/:id - single listing detail (with compatibility if tenant)
async function getListingById(req, res) {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ message: "Listing not found" });

    let compatibility = null;
    if (req.user.role === "tenant") {
      compatibility = await Compatibility.findOne({ tenantId: req.user._id, listingId: listing._id });
    }

    res.json({ listing, compatibility });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch listing", error: err.message });
  }
}

module.exports = {
  createListing,
  updateListing,
  deleteListing,
  markFilled,
  getMyListings,
  searchListings,
  getListingById,
};
