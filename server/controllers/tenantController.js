const TenantProfile = require("../models/TenantProfile");
const asyncHandler = require("../utils/asyncHandler");
const { geocodeAddress } = require("../utils/geocoder");

// POST /tenants/profile (create or replace)
const upsertProfile = asyncHandler(async (req, res) => {
  let locationCoords = req.body.locationCoords;
  if (!locationCoords || !locationCoords.coordinates || locationCoords.coordinates.length < 2) {
    const coords = await geocodeAddress(req.body.preferredLocation);
    locationCoords = { type: "Point", coordinates: coords };
  }

  const profile = await TenantProfile.findOneAndUpdate(
    { tenantId: req.user._id },
    {
      ...req.body,
      tenantId: req.user._id,
      locationCoords,
    },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );

  res.status(200).json(profile);
});

// GET /tenants/profile
const getProfile = asyncHandler(async (req, res) => {
  const profile = await TenantProfile.findOne({ tenantId: req.user._id });
  if (!profile) {
    return res.status(404).json({ success: false, message: "No profile found" });
  }
  res.json(profile);
});

module.exports = { upsertProfile, getProfile };
