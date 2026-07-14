const axios = require("axios");
const logger = require("../utils/logger");

/**
 * Builds the compatibility prompt for Groq, requesting detailed match analytics.
 */
function buildPrompt(listing, tenantProfile, distanceKm = null) {
  let preferencesStr = "";
  if (tenantProfile.preferredRoomType) preferencesStr += `- Preferred Room Type: ${tenantProfile.preferredRoomType}\n`;
  if (tenantProfile.preferredFurnishing) preferencesStr += `- Preferred Furnishing: ${tenantProfile.preferredFurnishing}\n`;
  if (tenantProfile.parkingRequired !== undefined) preferencesStr += `- Parking Required: ${tenantProfile.parkingRequired ? "Yes" : "No"}\n`;
  if (tenantProfile.petsAllowed !== undefined) preferencesStr += `- Pets Allowed Preference: ${tenantProfile.petsAllowed ? "Yes" : "No"}\n`;
  if (tenantProfile.smokingAllowed !== undefined) preferencesStr += `- Smoking Allowed Preference: ${tenantProfile.smokingAllowed ? "Yes" : "No"}\n`;
  if (tenantProfile.genderPreference) preferencesStr += `- Gender Preference: ${tenantProfile.genderPreference}\n`;
  if (tenantProfile.notes) preferencesStr += `- Custom Preferences Notes: ${tenantProfile.notes}\n`;

  let distanceExplanation = "";
  if (distanceKm !== null) {
    distanceExplanation = `- Calculated Distance from Tenant's Preferred Location: ${distanceKm} km. Incorporate this specific distance and convenience detail directly in your explanation and summary.\n`;
  }

  return `You are a compatibility scoring engine for a room rental platform.

Given this room listing:
- Location: ${listing.location}
- Rent: ₹${listing.rent}
- Room Type: ${listing.roomType}
- Furnishing: ${listing.furnishing}
- Description: ${listing.description || "N/A"}
- Available From: ${listing.availableFrom ? new Date(listing.availableFrom).toLocaleDateString() : "N/A"}

And this tenant profile:
- Preferred Location: ${tenantProfile.preferredLocation}
${distanceExplanation}- Budget Range: ₹${tenantProfile.budgetMin} - ₹${tenantProfile.budgetMax}
- Desired Move-in Date: ${tenantProfile.moveInDate ? new Date(tenantProfile.moveInDate).toLocaleDateString() : "N/A"}
${preferencesStr}

Compute a compatibility score from 0 to 100 based on budget, location match, move-in availability, room type, furnishing, and descriptions matching parking, pets, smoking, gender, and notes.

Respond with ONLY valid JSON in this exact shape, with no markdown formatting, no code fences, and no extra text:
{
  "score": <number 0-100>,
  "confidence": <number 0.0-1.0 representing matching confidence>,
  "explanation": "<one short sentence of the main match reason, incorporating distance if convenient>",
  "pros": ["<pro bullet 1>", "<pro bullet 2>", ...],
  "cons": ["<con bullet 1>", "<con bullet 2>", ...],
  "summary": "<brief final match summary sentence, explaining why it is a convenient alternative if it's nearby>"
}`;
}

/**
 * Connects to Groq cloud API to fetch compatibility scoring using Llama 3 models.
 * Automatically parses JSON response format.
 */
async function getGroqCompatibility(listing, tenantProfile, distanceKm = null) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY not configured");
  }

  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
  const prompt = buildPrompt(listing, tenantProfile, distanceKm);
  const maxRetries = 2;
  let attempt = 0;

  while (attempt < maxRetries) {
    attempt++;
    try {
      logger.info(`Calling Groq API (Attempt ${attempt}/${maxRetries}) using model ${model} for tenant ${tenantProfile._id}`);
      
      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model,
          messages: [
            {
              role: "system",
              content: "You are a compatibility scoring engine for a room rental platform. You must output valid JSON.",
            },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          timeout: 8000,
        }
      );

      const rawText = response.data.choices[0].message.content.trim();
      const parsed = JSON.parse(rawText);

      // Verify schema
      if (
        typeof parsed.score !== "number" ||
        parsed.score < 0 ||
        parsed.score > 100 ||
        typeof parsed.confidence !== "number" ||
        !Array.isArray(parsed.pros) ||
        !Array.isArray(parsed.cons) ||
        typeof parsed.explanation !== "string" ||
        typeof parsed.summary !== "string"
      ) {
        throw new Error("Malformed response schema from Groq API");
      }

      return {
        score: Math.round(parsed.score),
        confidence: Number(parsed.confidence.toFixed(2)),
        explanation: parsed.explanation,
        pros: parsed.pros,
        cons: parsed.cons,
        summary: parsed.summary,
      };
    } catch (err) {
      logger.error(`Groq API Attempt ${attempt} failed: ${err.message}`);
      if (attempt === maxRetries) {
        throw err;
      }
    }
  }
}

module.exports = { getGroqCompatibility, buildPrompt };
