const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

/**
 * Builds the compatibility prompt exactly per the assignment's LLM usage guidance:
 * score based on budget and location match only, returned as strict JSON.
 */
function buildPrompt(listing, tenantProfile) {
  return `You are a compatibility scoring engine for a room rental platform.

Given this room listing:
- Location: ${listing.location}
- Rent: ₹${listing.rent}

And this tenant profile:
- Preferred Location: ${tenantProfile.preferredLocation}
- Budget Range: ₹${tenantProfile.budgetMin} - ₹${tenantProfile.budgetMax}

Compute a compatibility score from 0 to 100 based on budget and location match.

Respond with ONLY valid JSON in this exact shape, with no markdown formatting, no code fences, and no extra text:
{"score": <number 0-100>, "explanation": "<one short sentence>"}`;
}

/**
 * Calls Gemini to generate a compatibility score.
 * Throws on any failure (network, malformed response, missing API key) so the
 * caller (compatibilityService) can catch it and fall back to the rule engine.
 */
async function getGeminiCompatibility(listing, tenantProfile) {
  if (!genAI) {
    throw new Error("GEMINI_API_KEY not configured");
  }

  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
  });

  const prompt = buildPrompt(listing, tenantProfile);

  const result = await model.generateContent(prompt);
  const rawText = result.response.text().trim();

  // Strip accidental code fences if the model adds them despite instructions
  const cleaned = rawText.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Gemini returned non-JSON response: ${rawText}`);
  }

  if (
    typeof parsed.score !== "number" ||
    parsed.score < 0 ||
    parsed.score > 100 ||
    typeof parsed.explanation !== "string"
  ) {
    throw new Error(`Gemini returned malformed compatibility payload: ${JSON.stringify(parsed)}`);
  }

  return {
    score: Math.round(parsed.score),
    explanation: parsed.explanation,
  };
}

module.exports = { getGeminiCompatibility, buildPrompt };
