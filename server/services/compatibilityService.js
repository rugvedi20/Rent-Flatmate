const Compatibility = require("../models/Compatibility");
const { getGeminiCompatibility } = require("./geminiService");
const { getRuleBasedCompatibility } = require("./ruleEngineService");

/**
 * Returns true if a stored compatibility score is stale relative to the
 * current listing/tenant inputs (so it should be regenerated).
 */
function isStale(existing, listing, tenantProfile) {
  if (!existing) return true;
  const snap = existing.inputSnapshot || {};
  return (
    snap.preferredLocation !== tenantProfile.preferredLocation ||
    snap.budgetMin !== tenantProfile.budgetMin ||
    snap.budgetMax !== tenantProfile.budgetMax ||
    snap.listingLocation !== listing.location ||
    snap.rent !== listing.rent
  );
}

/**
 * Core entry point: gets a compatibility score for a tenant-listing pair.
 * - Reuses a cached score if inputs haven't changed (per assignment requirement:
 *   "score and explanation stored in DB, not recomputed on every request").
 * - Otherwise tries Gemini first, falls back to the rule engine on any failure.
 * - Always persists the result via upsert.
 */
async function getOrGenerateCompatibility(tenantId, listing, tenantProfile) {
  const existing = await Compatibility.findOne({ tenantId, listingId: listing._id });

  if (existing && !isStale(existing, listing, tenantProfile)) {
    return existing; // cache hit — no LLM call, no recompute
  }

  let result;
  let generatedBy;

  try {
    result = await getGeminiCompatibility(listing, tenantProfile);
    generatedBy = "gemini";
  } catch (err) {
    console.warn(`Gemini compatibility failed, using rule-based fallback: ${err.message}`);
    result = getRuleBasedCompatibility(listing, tenantProfile);
    generatedBy = "rule-engine";
  }

  const inputSnapshot = {
    preferredLocation: tenantProfile.preferredLocation,
    budgetMin: tenantProfile.budgetMin,
    budgetMax: tenantProfile.budgetMax,
    listingLocation: listing.location,
    rent: listing.rent,
  };

  const saved = await Compatibility.findOneAndUpdate(
    { tenantId, listingId: listing._id },
    {
      tenantId,
      listingId: listing._id,
      score: result.score,
      explanation: result.explanation,
      generatedBy,
      inputSnapshot,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return saved;
}

/**
 * Batch version: scores one tenant against many listings in a single pass.
 * Used when a tenant profile is created/updated, or when browsing all listings.
 */
async function getOrGenerateCompatibilityBatch(tenantId, listings, tenantProfile) {
  const results = await Promise.all(
    listings.map((listing) => getOrGenerateCompatibility(tenantId, listing, tenantProfile))
  );
  return results;
}

module.exports = { getOrGenerateCompatibility, getOrGenerateCompatibilityBatch };
