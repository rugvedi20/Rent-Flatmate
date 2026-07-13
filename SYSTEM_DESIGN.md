# System Design Write-up — Rent & Flatmate Finder

## 1. Compatibility Scoring Design

The compatibility engine is scoped to exactly what the assignment specifies: **budget and location
match** between a tenant's profile and a listing. Other listing attributes (furnishing, room type,
move-in date) are kept as filter/display fields rather than scoring inputs, so the score stays
interpretable and directly comparable to the assignment's example prompt.

Scores are stored per `(tenantId, listingId)` pair in a dedicated `Compatibility` collection rather
than computed on every page load. Each stored document carries an `inputSnapshot` — the exact
location/budget/rent values used to generate it. When a tenant browses listings, the service
compares the snapshot against current inputs; if nothing has changed, the cached score is reused
with zero LLM calls. If the tenant updates their profile, or a listing's rent/location changes, the
snapshot mismatch triggers regeneration. This keeps cost bounded: with N tenants and M listings, the
system makes at most N×M LLM calls total, not N×M per page view — the difference between "expensive
but tractable" and "unusable at scale," as the assignment's own math on 100 users × 500 listings
makes clear.

Search results are ranked by simply sorting the joined listing+score array descending, so ranking
logic lives in the API layer, not in the LLM — the model's only job is to produce a per-pair number
and explanation, not decide ordering.

## 2. LLM Integration and Fallback

`geminiService.js` builds a strict prompt asking for JSON only, and `compatibilityService.js` wraps
the call in a try/catch. On any failure — missing API key, network error, or a response that fails
JSON parsing or shape validation (score not a number in [0,100], missing explanation) — control
passes to `ruleEngineService.js`, a deterministic scorer using the same two inputs (location,
budget) with fixed point weights: location match up to 60 points, budget match up to 40 points. This
means the two engines are directly comparable and a demo can toggle between them (e.g., by unsetting
`GEMINI_API_KEY`) without any behavioral surprise to the rest of the system — the API contract
`{score, explanation, generatedBy}` is identical either way.

`generatedBy` is persisted alongside every score specifically so failures are auditable after the
fact: an admin or grader can query the `Compatibility` collection and see exactly which scores came
from Gemini versus the fallback, rather than that information being lost once the request completes.

This design treats "LLM fails gracefully" as an architectural property, not a UI message — the
frontend never needs special-case error handling for LLM outages because the fallback produces a
structurally identical response.

## 3. Chat Implementation

Chat is intentionally gated: a Socket.IO connection can `join_chat` for a given listing only if an
**accepted** `Interest` document exists linking the requesting user (as tenant or owner) to that
listing. This check (`assertChatAccess`) is shared code between the REST history endpoint
(`GET /messages/:listingId`) and the socket handlers, so the access rule can't drift between the two
paths. This prevents the exact failure mode the assignment calls out — owners being spammed by every
tenant who merely views a listing.

Socket.IO authenticates each connection via a JWT passed in the handshake (`socket.handshake.auth.token`),
verified with the same secret used for REST auth, so there's a single source of truth for identity
across both transports. Messages are persisted to MongoDB *before* being broadcast (`send_message`
awaits `Message.create` first), so a message is never visible to a recipient without also being
durable — refreshing the page always reconstructs the exact same conversation via
`GET /messages/:listingId`, sorted by `createdAt`.

Rooms are scoped per-listing (`listing:<id>`) rather than per-conversation-pair, which keeps the
model simple for the single-tenant-per-accepted-listing case the assignment describes, while still
allowing multiple accepted tenants on different listings to have independent, isolated threads.

## 4. Notification Flow

Two email triggers fire from the REST controllers, not from a background job, so they execute
synchronously within the request that causes them and are easy to trace and test:

1. **On interest creation** (`POST /interest`): if the stored compatibility score for that
   tenant-listing pair exceeds `HIGH_COMPATIBILITY_THRESHOLD` (default 80, configurable via `.env`),
   the owner receives a "High Compatibility Tenant Interested" email immediately.
2. **On interest status change** (`PUT /interest/:id`): the tenant receives an acceptance or
   rejection email depending on the owner's decision.

`emailService.js` wraps Nodemailer calls in their own try/catch so an SMTP outage degrades to a
logged warning rather than failing the underlying interest/accept/reject request — the core
transaction always succeeds even if the notification doesn't, which mirrors the same
graceful-degradation philosophy applied to the LLM layer.
