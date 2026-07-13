const cache = require("./compatibilityCache");
const { getGroqCompatibility } = require("./groqService");
const { getRuleBasedCompatibility } = require("./ruleEngineService");
const logger = require("../utils/logger");

/**
 * Maps final compatibility scores to recommendation badges.
 */
function computeBadge(score) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Moderate";
  return "Poor";
}

/**
 * Resolves a compatibility score for a tenant-listing pair.
 * Checks cache first; otherwise runs Rule and Groq scoring and aggregates them.
 */
async function getOrGenerateCompatibility(tenantId, listing, tenantProfile, forceLlm = true) {
  const existing = await cache.getCachedScore(tenantId, listing._id);

  if (existing && !cache.isStale(existing, listing, tenantProfile)) {
    return existing; // Cache hit
  }

  let result;
  let generatedBy = "groq";

  // Calculate rule-based score first
  const ruleResult = getRuleBasedCompatibility(listing, tenantProfile);

  let llmResult = null;

  // Try Groq directly if allowed
  if (forceLlm && process.env.GROQ_API_KEY) {
    try {
      llmResult = await getGroqCompatibility(listing, tenantProfile);
      generatedBy = "groq";
    } catch (err) {
      logger.warn(`Groq scoring failed: ${err.message}.`);
    }
  }

  if (llmResult) {
    // Aggregate: 30% rule-based score + 70% LLM score
    const finalScore = Math.round((0.3 * ruleResult.score) + (0.7 * llmResult.score));
    
    result = {
      score: finalScore,
      ruleScore: ruleResult.score,
      llmScore: llmResult.score,
      confidence: llmResult.confidence,
      explanation: llmResult.explanation + (ruleResult.distanceKm !== null ? ` [Distance: ${ruleResult.distanceKm} km]` : ""),
      pros: llmResult.pros,
      cons: llmResult.cons,
      summary: llmResult.summary,
      distanceKm: ruleResult.distanceKm,
      badge: computeBadge(finalScore),
    };
  } else {
    // Fallback 100% to local Rule Engine
    logger.warn(`Groq engine fallback activated for listing ${listing._id} (forceLlm = ${forceLlm}).`);
    
    const ruleScore = ruleResult.score;
    
    // Apply a discount factor (0.7) for local fallbacks to ensure LLM matched rooms rank higher
    const finalScore = Math.round(ruleScore * 0.7);
    
    const pros = [];
    const cons = [];
    
    const expl = ruleResult.explanation.toLowerCase();
    
    // Parse pros
    if (expl.includes("excellent location")) pros.push("Under 1 km from preference");
    else if (expl.includes("good location")) pros.push("1 to 3 km from preference");
    else if (expl.includes("moderate location")) pros.push("3 to 5 km from preference");
    else if (expl.includes("partial location")) pros.push("Near preferred locality");
    
    if (expl.includes("fits within budget")) pros.push("Rent fits budget");
    else if (expl.includes("below budget")) pros.push("Highly affordable");
    else if (expl.includes("rent is slightly above")) cons.push("Rent is slightly above budget");
    else cons.push("Rent is outside budget");

    if (expl.includes("room is available on/before")) pros.push("Available on/before move-in date");
    else if (expl.includes("days after")) cons.push("Delayed availability");

    if (expl.includes("matching room type")) pros.push("Matching room type preference");
    else if (expl.includes("mismatch")) cons.push("Room type mismatch");

    if (expl.includes("matching furnishing")) pros.push("Matching furnishing preference");
    else if (expl.includes("furnishing mismatch")) cons.push("Furnishing mismatch");

    if (expl.includes("no parking")) cons.push("No dedicated parking");
    if (expl.includes("pets allowed conflict")) cons.push("Pet preference conflict");
    if (expl.includes("smoking allowed conflict")) cons.push("Smoking preference conflict");

    result = {
      score: finalScore,
      ruleScore: ruleScore,
      llmScore: null,
      confidence: 0.5,
      explanation: `Rule-Engine match: ${ruleResult.explanation.split("compatibility:")[1]?.trim() || ruleResult.explanation}` + (ruleResult.distanceKm !== null ? ` [Distance: ${ruleResult.distanceKm} km]` : ""),
      pros: pros.length > 0 ? pros : ["Standard match"],
      cons,
      summary: `Match scored deterministically by local rule matching (AI engine quota optimized).`,
      distanceKm: ruleResult.distanceKm,
      badge: computeBadge(finalScore),
    };
    generatedBy = "rule-engine";
  }

  const saved = await cache.saveScore(tenantId, listing, tenantProfile, result, generatedBy);
  return saved;
}

/**
 * Batch scores a list of listings for a tenant.
 * Uses a smart Top-N recommendation pattern to avoid API rate limits:
 * - Scores all items locally using the Rule Engine.
 * - Invokes Groq ONLY for the top 5 highest matching rule results.
 * - Falls back cleanly to rule score for other elements.
 */
async function getOrGenerateCompatibilityBatch(tenantId, listings, tenantProfile) {
  const listWithScores = [];
  const uncachedListings = [];

  // 1. Check cache hits first
  for (const listing of listings) {
    const existing = await cache.getCachedScore(tenantId, listing._id);
    if (existing && !cache.isStale(existing, listing, tenantProfile)) {
      listWithScores.push(existing);
    } else {
      uncachedListings.push(listing);
    }
  }

  if (uncachedListings.length === 0) {
    return listWithScores;
  }

  // 2. Sort uncached items by local rule score
  const uncachedWithRule = uncachedListings.map((listing) => {
    const ruleResult = getRuleBasedCompatibility(listing, tenantProfile);
    return { listing, ruleScore: ruleResult.score };
  });

  uncachedWithRule.sort((a, b) => b.ruleScore - a.ruleScore);

  // 3. Score top 5 candidates with Groq, and fallback rule score for others
  const maxLlmCalls = 5;
  let llmCallsCount = 0;

  for (let i = 0; i < uncachedWithRule.length; i++) {
    const { listing } = uncachedWithRule[i];
    const shouldCallLlm = llmCallsCount < maxLlmCalls;

    if (shouldCallLlm) {
      llmCallsCount++;
      // Add a slight 250ms sleep to prevent hitting Groq simultaneous rate limits
      if (llmCallsCount > 1) {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
      try {
        const score = await getOrGenerateCompatibility(tenantId, listing, tenantProfile, true);
        listWithScores.push(score);
      } catch (err) {
        const score = await getOrGenerateCompatibility(tenantId, listing, tenantProfile, false);
        listWithScores.push(score);
      }
    } else {
      const score = await getOrGenerateCompatibility(tenantId, listing, tenantProfile, false);
      listWithScores.push(score);
    }
  }

  return listWithScores;
}

module.exports = {
  getOrGenerateCompatibility,
  getOrGenerateCompatibilityBatch,
};
