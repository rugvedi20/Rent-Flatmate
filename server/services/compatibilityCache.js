const Compatibility = require("../models/Compatibility");

/**
 * Returns true if a cached score is stale relative to current inputs.
 */
function isStale(existing, listing, tenantProfile) {
  if (!existing) return true;
  const snap = existing.inputSnapshot || {};
  return (
    snap.preferredLocation !== tenantProfile.preferredLocation ||
    snap.budgetMin !== tenantProfile.budgetMin ||
    snap.budgetMax !== tenantProfile.budgetMax ||
    snap.listingLocation !== listing.location ||
    snap.rent !== listing.rent ||
    snap.preferredRoomType !== tenantProfile.preferredRoomType ||
    snap.preferredFurnishing !== tenantProfile.preferredFurnishing ||
    snap.parkingRequired !== tenantProfile.parkingRequired ||
    snap.petsAllowed !== tenantProfile.petsAllowed ||
    snap.smokingAllowed !== tenantProfile.smokingAllowed ||
    snap.genderPreference !== tenantProfile.genderPreference ||
    snap.listingRoomType !== listing.roomType ||
    snap.listingFurnishing !== listing.furnishing ||
    snap.listingDescription !== listing.description
  );
}

/**
 * Retrieves the cached compatibility score from the database.
 */
async function getCachedScore(tenantId, listingId) {
  return await Compatibility.findOne({ tenantId, listingId });
}

/**
 * Saves or updates a compatibility score inside Mongoose.
 */
async function saveScore(tenantId, listing, tenantProfile, result, generatedBy) {
  const inputSnapshot = {
    preferredLocation: tenantProfile.preferredLocation,
    budgetMin: tenantProfile.budgetMin,
    budgetMax: tenantProfile.budgetMax,
    listingLocation: listing.location,
    rent: listing.rent,
    preferredRoomType: tenantProfile.preferredRoomType,
    preferredFurnishing: tenantProfile.preferredFurnishing,
    parkingRequired: tenantProfile.parkingRequired,
    petsAllowed: tenantProfile.petsAllowed,
    smokingAllowed: tenantProfile.smokingAllowed,
    genderPreference: tenantProfile.genderPreference,
    listingRoomType: listing.roomType,
    listingFurnishing: listing.furnishing,
    listingDescription: listing.description,
  };

  return await Compatibility.findOneAndUpdate(
    { tenantId, listingId: listing._id },
    {
      tenantId,
      listingId: listing._id,
      score: result.score,
      ruleScore: result.ruleScore,
      llmScore: result.llmScore,
      confidence: result.confidence || 1.0,
      explanation: result.explanation,
      pros: result.pros || [],
      cons: result.cons || [],
      summary: result.summary || "",
      badge: result.badge || "Moderate",
      distanceKm: result.distanceKm,
      generatedBy,
      inputSnapshot,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

module.exports = { isStale, getCachedScore, saveScore };
