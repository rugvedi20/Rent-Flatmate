const TenantProfile = require("../models/TenantProfile");

// POST /tenants/profile (create or replace)
async function upsertProfile(req, res) {
  try {
    const { preferredLocation, budgetMin, budgetMax, moveInDate, notes } = req.body;

    const profile = await TenantProfile.findOneAndUpdate(
      { tenantId: req.user._id },
      { tenantId: req.user._id, preferredLocation, budgetMin, budgetMax, moveInDate, notes },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(profile);
  } catch (err) {
    res.status(400).json({ message: "Failed to save tenant profile", error: err.message });
  }
}

// GET /tenants/profile
async function getProfile(req, res) {
  const profile = await TenantProfile.findOne({ tenantId: req.user._id });
  if (!profile) return res.status(404).json({ message: "No profile found" });
  res.json(profile);
}

module.exports = { upsertProfile, getProfile };
