const axios = require("axios");
const logger = require("./logger");

// Predefined centroids for key areas in Pune to ensure 100% reliable local matching and seeding
const PUNE_CENTROIDS = {
  baner: [73.7997, 18.5590],
  aundh: [73.8078, 18.5626],
  wakad: [73.7570, 18.5987],
  pashan: [73.7963, 18.5372],
  kothrud: [73.8075, 18.5074],
  hinjewadi: [73.7383, 18.5913],
  hinjaywadi: [73.7383, 18.5913],
  kharadi: [73.9405, 18.5516],
  "viman nagar": [73.9143, 18.5679],
  vimannagar: [73.9143, 18.5679],
  pune: [73.8567, 18.5204],
};

/**
 * Resolves an address string to [longitude, latitude] coordinates.
 * Tries public Nominatim OSM API, falls back to Pune local dictionary.
 */
async function geocodeAddress(address) {
  if (!address || typeof address !== "string") {
    return PUNE_CENTROIDS.pune;
  }

  const cleanAddress = address.trim().toLowerCase();

  // 1. Try local dictionary matches first for immediate response
  for (const [key, coords] of Object.entries(PUNE_CENTROIDS)) {
    if (cleanAddress.includes(key)) {
      logger.info(`Geocoder: Resolved "${address}" via local Pune dictionary -> ${coords}`);
      return coords;
    }
  }

  // 2. Try Nominatim OpenStreetMap API
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address + ", Pune, India")}&format=json&limit=1`;
    logger.info(`Geocoder: Fetching Nominatim OSM coordinates for "${address}"`);
    
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "RentFlatmateFinderAgent/1.0 (contact: admin@rentflatmate.com)",
      },
      timeout: 3000,
    });

    if (response.data && response.data.length > 0) {
      const lon = parseFloat(response.data[0].lon);
      const lat = parseFloat(response.data[0].lat);
      logger.info(`Geocoder: Nominatim match found -> [${lon}, ${lat}]`);
      return [lon, lat];
    }
  } catch (err) {
    logger.warn(`Geocoder: Nominatim request failed: ${err.message}. Defaulting to Pune center.`);
  }

  return PUNE_CENTROIDS.pune;
}

module.exports = { geocodeAddress };
