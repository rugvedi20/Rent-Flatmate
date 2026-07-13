/**
 * Deterministic fallback used when the Gemini API is unavailable or returns
 * a malformed response. Mirrors the same two factors the LLM prompt uses
 * (budget and location) so both engines are directly comparable.
 *
 * Location match: 60 points max
 *   - Exact (case-insensitive) match: 60
 *   - Partial match (one string contains the other, e.g. "Baner" vs "Baner West"): 35
 *   - No match: 10
 *
 * Budget match: 40 points max
 *   - Rent within [budgetMin, budgetMax]: 40
 *   - Rent within 10% above budgetMax: 20
 *   - Otherwise: 0
 */
function getRuleBasedCompatibility(listing, tenantProfile) {
  const listingLocation = (listing.location || "").trim().toLowerCase();
  const preferredLocation = (tenantProfile.preferredLocation || "").trim().toLowerCase();

  let locationScore = 10;
  let locationReason = "location does not match preference";

  if (listingLocation && preferredLocation) {
    if (listingLocation === preferredLocation) {
      locationScore = 60;
      locationReason = "exact location match";
    } else if (
      listingLocation.includes(preferredLocation) ||
      preferredLocation.includes(listingLocation)
    ) {
      locationScore = 35;
      locationReason = "partial location match";
    }
  }

  const { rent } = listing;
  const { budgetMin, budgetMax } = tenantProfile;

  let budgetScore = 0;
  let budgetReason = "rent is well outside budget";

  if (rent >= budgetMin && rent <= budgetMax) {
    budgetScore = 40;
    budgetReason = "rent fits comfortably within budget";
  } else if (rent > budgetMax && rent <= budgetMax * 1.1) {
    budgetScore = 20;
    budgetReason = "rent is slightly above budget";
  } else if (rent < budgetMin) {
    // Cheaper than desired range still counts as a reasonable match
    budgetScore = 30;
    budgetReason = "rent is below budget range (still affordable)";
  }

  const score = Math.min(100, locationScore + budgetScore);

  const explanation = `Rule-based score: ${locationReason} (+${locationScore}), ${budgetReason} (+${budgetScore}).`;

  return { score, explanation };
}

module.exports = { getRuleBasedCompatibility };
