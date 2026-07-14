const mongoose = require("mongoose");

/**
 * Deterministic fallback scoring engine.
 * Scores budget, location (geospatial), move-in date, room type, furnishing, and description checks.
 *
 * Max Weights:
 * - Location Match: 30 points
 * - Budget Match: 30 points
 * - Move-in Date Match: 10 points
 * - Room Type Match: 10 points
 * - Furnishing Match: 10 points
 * - Description Criteria Match: 10 points
 */
function getRuleBasedCompatibility(listing, tenantProfile) {
  // 1. Geospatial Location match (max 30 pts)
  let distanceKm = null;
  let locationScore = 5;
  let locationReason = "location is outside preferred range";

  if (
    listing.locationCoords &&
    listing.locationCoords.coordinates &&
    tenantProfile.locationCoords &&
    tenantProfile.locationCoords.coordinates
  ) {
    const [lng1, lat1] = listing.locationCoords.coordinates;
    const [lng2, lat2] = tenantProfile.locationCoords.coordinates;

    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    distanceKm = R * c;

    // Location scoring based on distance bands (max 30 pts)
    if (distanceKm <= 1.0) {
      locationScore = 30;
      locationReason = "Excellent location match (under 1 km)";
    } else if (distanceKm <= 3.0) {
      locationScore = 28;
      locationReason = "Good location match (1 to 3 km)";
    } else if (distanceKm <= 5.0) {
      locationScore = 24;
      locationReason = "Moderate location match (3 to 5 km)";
    } else if (distanceKm <= 8.0) {
      locationScore = 20;
      locationReason = "Fair location match (5 to 8 km)";
    } else if (distanceKm <= 12.0) {
      locationScore = 15;
      locationReason = "Distanced match (8 to 12 km)";
    } else if (distanceKm <= 20.0) {
      locationScore = 8;
      locationReason = "Far match (12 to 20 km)";
    } else {
      locationScore = 0;
      locationReason = "Location out of range (greater than 20 km)";
    }
  } else {
    // String fallback logic for safety (if coordinates are missing)
    const listingLocation = (listing.location || "").trim().toLowerCase();
    const preferredLocation = (tenantProfile.preferredLocation || "").trim().toLowerCase();
    if (listingLocation === preferredLocation) {
      locationScore = 30;
      locationReason = "Exact location string match";
      distanceKm = 0.0;
    } else if (listingLocation.includes(preferredLocation) || preferredLocation.includes(listingLocation)) {
      locationScore = 18;
      locationReason = "Partial location string match";
      distanceKm = 2.5;
    } else {
      distanceKm = 15.0;
    }
  }

  // 2. Budget match (max 30 pts)
  const { rent } = listing;
  const { budgetMin, budgetMax } = tenantProfile;

  let budgetScore = 0;
  let budgetReason = "rent is well outside budget";

  if (rent >= budgetMin && rent <= budgetMax) {
    budgetScore = 30;
    budgetReason = "rent fits within budget";
  } else if (rent > budgetMax && rent <= budgetMax * 1.1) {
    budgetScore = 15;
    budgetReason = "rent is slightly above budget";
  } else if (rent < budgetMin) {
    budgetScore = 30;
    budgetReason = "rent is below budget min (highly affordable)";
  }

  // 3. Move-in date match (max 10 pts)
  let moveInScore = 10;
  let moveInReason = "move-in date matches availability";

  if (listing.availableFrom && tenantProfile.moveInDate) {
    const avail = new Date(listing.availableFrom);
    const moveIn = new Date(tenantProfile.moveInDate);
    const diffTime = avail - moveIn;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) {
      moveInScore = 10;
      moveInReason = "room is available on/before move-in date";
    } else if (diffDays <= 15) {
      moveInScore = 5;
      moveInReason = `room is available ${diffDays} days after move-in date`;
    } else {
      moveInScore = 0;
      moveInReason = `room available ${diffDays} days after move-in date (too late)`;
    }
  }

  // 4. Room type match (max 10 pts)
  let roomTypeScore = 10;
  let roomTypeReason = "room type preference matches";
  if (tenantProfile.preferredRoomType) {
    if (listing.roomType === tenantProfile.preferredRoomType) {
      roomTypeScore = 10;
      roomTypeReason = "matching room type";
    } else {
      roomTypeScore = 0;
      roomTypeReason = `room type mismatch (${listing.roomType} vs preferred ${tenantProfile.preferredRoomType})`;
    }
  }

  // 5. Furnishing match (max 10 pts)
  let furnishingScore = 10;
  let furnishingReason = "furnishing preference matches";
  if (tenantProfile.preferredFurnishing) {
    if (listing.furnishing === tenantProfile.preferredFurnishing) {
      furnishingScore = 10;
      furnishingReason = "matching furnishing preference";
    } else if (
      (tenantProfile.preferredFurnishing === "semi-furnished" && listing.furnishing === "furnished") ||
      (tenantProfile.preferredFurnishing === "furnished" && listing.furnishing === "semi-furnished")
    ) {
      furnishingScore = 5;
      furnishingReason = "partial furnishing match";
    } else {
      furnishingScore = 0;
      furnishingReason = `furnishing mismatch (${listing.furnishing} vs preferred ${tenantProfile.preferredFurnishing})`;
    }
  }

  // 6. Description checks (max 10 pts)
  let descScore = 10;
  let descReason = "description details match preferences";
  const desc = String(listing.description || "").toLowerCase();
  const detailsMatched = [];

  if (tenantProfile.parkingRequired && !desc.includes("parking") && !desc.includes("garage")) {
    descScore -= 3;
    detailsMatched.push("no parking found");
  }
  if (tenantProfile.petsAllowed === false && (desc.includes("pet friendly") || desc.includes("pets allowed") || desc.includes("dog") || desc.includes("cat"))) {
    descScore -= 3;
    detailsMatched.push("pets allowed conflict");
  }
  if (tenantProfile.smokingAllowed === false && (desc.includes("smoking allowed") || desc.includes("smoking friendly") || desc.includes("smokers allowed"))) {
    descScore -= 3;
    detailsMatched.push("smoking allowed conflict");
  }
  if (tenantProfile.genderPreference && tenantProfile.genderPreference !== "any") {
    if (tenantProfile.genderPreference === "female" && (desc.includes("male only") || desc.includes("males only") || desc.includes("boys only"))) {
      descScore -= 4;
      detailsMatched.push("gender mismatch (boys only)");
    } else if (tenantProfile.genderPreference === "male" && (desc.includes("female only") || desc.includes("females only") || desc.includes("girls only"))) {
      descScore -= 4;
      detailsMatched.push("gender mismatch (girls only)");
    }
  }

  descScore = Math.max(0, descScore);
  if (detailsMatched.length > 0) {
    descReason = `conflicting details: ${detailsMatched.join(", ")}`;
  }

  const score = Math.min(100, locationScore + budgetScore + moveInScore + roomTypeScore + furnishingScore + descScore);
  const explanation = `Rule-based compatibility: ${locationReason} (+${locationScore}), ${budgetReason} (+${budgetScore}), ${moveInReason} (+${moveInScore}), ${roomTypeReason} (+${roomTypeScore}), ${furnishingReason} (+${furnishingScore}), ${descReason} (+${descScore}).`;

  return {
    score: Math.round(score),
    distanceKm: distanceKm !== null ? Number(distanceKm.toFixed(2)) : null,
    explanation,
  };
}

module.exports = { getRuleBasedCompatibility };
