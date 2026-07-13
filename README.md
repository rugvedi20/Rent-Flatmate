# Rent & Flatmate Finder

A platform where owners list rooms, tenants create "looking for room" profiles, and an AI-powered
compatibility engine scores and ranks matches. Real-time chat opens once interest is accepted;
email notifications fire on key events.

---

## 1. Tech Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose), Socket.IO, JWT auth
- **Frontend:** React (Vite), React Router, Axios, Socket.IO client
- **LLM:** Google Gemini (`gemini-1.5-flash`) via `@google/generative-ai`
- **Email:** Nodemailer (any SMTP provider — Gmail app password, Mailtrap, SendGrid SMTP, etc.)

---

## 2. Project Structure

```
rent-flatmate-finder/
├── server/
│   ├── config/db.js
│   ├── models/            # User, Listing, TenantProfile, Compatibility, Interest, Message
│   ├── middleware/auth.js # JWT protect + role-based authorize
│   ├── controllers/
│   ├── routes/
│   ├── services/
│   │   ├── geminiService.js        # LLM call + prompt
│   │   ├── ruleEngineService.js    # fallback scoring
│   │   ├── compatibilityService.js # orchestrates cache/LLM/fallback
│   │   └── emailService.js
│   ├── sockets/chatSocket.js
│   ├── server.js
│   └── .env.example
└── client/
    ├── src/
    │   ├── pages/         # Login, Register, TenantDashboard, OwnerDashboard, AdminDashboard, Chat
    │   ├── context/AuthContext.jsx
    │   ├── services/api.js
    │   └── App.jsx
    └── .env.example
```

---

## 3. Setup Guide

### Prerequisites
- Node.js 18+
- A MongoDB instance (local or Atlas)
- A Gemini API key (https://aistudio.google.com/app/apikey) — optional; app works without one via the rule-based fallback
- An SMTP account for email (Gmail app password works for testing)

### Backend

```bash
cd server
cp .env.example .env
# edit .env with your MongoDB URI, JWT secret, Gemini key, and SMTP credentials
npm install
npm run dev
```

Server starts on `http://localhost:5000`. Health check: `GET /health`.

### Frontend

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

App starts on `http://localhost:5173`.

### Quick smoke test
1. Register an owner, create a listing.
2. Register a tenant, save a preference profile, browse listings — scores appear.
3. Tenant expresses interest → owner accepts → chat link appears for both sides.

---

## 4. Database Schema

### User
| Field | Type | Notes |
|---|---|---|
| name | String | required |
| email | String | required, unique |
| password | String | bcrypt-hashed |
| role | enum | owner / tenant / admin |
| isActive | Boolean | default true |

### Listing
| Field | Type | Notes |
|---|---|---|
| ownerId | ObjectId → User | |
| title, location | String | location indexed |
| rent | Number | |
| availableFrom | Date | |
| roomType | enum | single / shared / 1bhk / 2bhk / other |
| furnishing | enum | furnished / semi-furnished / unfurnished |
| photos | [String] | URLs |
| status | enum | available / filled (filled listings excluded from search) |

### TenantProfile
| Field | Type | Notes |
|---|---|---|
| tenantId | ObjectId → User | unique — one profile per tenant |
| preferredLocation | String | |
| budgetMin, budgetMax | Number | validated min ≤ max |
| moveInDate | Date | |
| notes | String | optional free text (reserved for future LLM enrichment) |

### Compatibility
| Field | Type | Notes |
|---|---|---|
| tenantId | ObjectId → User | |
| listingId | ObjectId → Listing | unique compound index with tenantId |
| score | Number | 0–100 |
| explanation | String | |
| generatedBy | enum | gemini / rule-engine |
| inputSnapshot | Object | location/budget/rent values used, so we can detect staleness and avoid recompute |

### Interest
| Field | Type | Notes |
|---|---|---|
| tenantId, ownerId, listingId | ObjectId | unique compound index (tenantId, listingId) — one request per pair |
| status | enum | pending / accepted / rejected |
| compatibilityScoreAtRequest | Number | snapshot used to decide the high-compatibility owner email |

### Message
| Field | Type | Notes |
|---|---|---|
| listingId | ObjectId → Listing | conversation is scoped per listing |
| sender, receiver | ObjectId → User | |
| message | String | |
| createdAt | Date | acts as timestamp (via schema `timestamps: true`) |

---

## 5. API Documentation

All routes except `/auth/*` and `/health` require `Authorization: Bearer <token>`.

### Auth
| Method | Route | Access | Body |
|---|---|---|---|
| POST | /api/auth/register | public | `{ name, email, password, role }` |
| POST | /api/auth/login | public | `{ email, password }` |

### Listings
| Method | Route | Access | Notes |
|---|---|---|---|
| POST | /api/listings | owner | create listing |
| PUT | /api/listings/:id | owner (own) | edit listing |
| DELETE | /api/listings/:id | owner (own) | delete listing |
| PUT | /api/listings/:id/fill | owner (own) | mark filled, hides from search |
| GET | /api/listings/my | owner | all of the owner's listings |
| GET | /api/listings?location=&minRent=&maxRent= | tenant | filtered, ranked by compatibility if profile exists |
| GET | /api/listings/:id | any authenticated | single listing + compatibility if tenant |

### Tenant Profile
| Method | Route | Access |
|---|---|---|
| POST | /api/tenants/profile | tenant — create/update |
| GET | /api/tenants/profile | tenant |

### Interest
| Method | Route | Access | Notes |
|---|---|---|---|
| POST | /api/interest | tenant | `{ listingId }`; triggers owner email if compatibility > 80 |
| PUT | /api/interest/:id | owner (own) | `{ status: "accepted" \| "rejected" }`; triggers tenant email |
| GET | /api/interest/received | owner | requests on the owner's listings |
| GET | /api/interest/sent | tenant | requests the tenant has sent |

### Messages
| Method | Route | Access |
|---|---|---|
| GET | /api/messages/:listingId | tenant/owner on an **accepted** interest for that listing only |

### Admin
| Method | Route | Access |
|---|---|---|
| GET | /api/admin/users | admin |
| DELETE | /api/admin/users/:id | admin |
| GET | /api/admin/listings | admin |
| DELETE | /api/admin/listings/:id | admin |
| GET | /api/admin/stats | admin |

### Socket.IO events
Connect with `io(url, { auth: { token } })`.
- `join_chat({ listingId }, callback)` — joins the room, rejected unless the interest is accepted
- `send_message({ listingId, receiverId, message }, callback)` — persists then broadcasts
- `receive_message` — server → client broadcast of a new persisted message

---

## 6. LLM Integration — Prompt and Example I/O

**Prompt template** (`server/services/geminiService.js`), following the assignment's guidance exactly
(scoring based on budget and location only):

```
You are a compatibility scoring engine for a room rental platform.

Given this room listing:
- Location: Baner
- Rent: ₹9000

And this tenant profile:
- Preferred Location: Baner
- Budget Range: ₹8000 - ₹10000

Compute a compatibility score from 0 to 100 based on budget and location match.

Respond with ONLY valid JSON in this exact shape, with no markdown formatting, no code fences, and no extra text:
{"score": <number 0-100>, "explanation": "<one short sentence>"}
```

**Example response:**
```json
{"score": 95, "explanation": "Excellent location match and budget comfortably fits within range."}
```

**Storage:** the score, explanation, `generatedBy: "gemini"`, and an `inputSnapshot` are upserted into
the `Compatibility` collection keyed by `(tenantId, listingId)`. On the next request, if the tenant's
preferences and the listing's location/rent haven't changed, the cached document is returned — no
new Gemini call is made. See `compatibilityService.isStale()`.

**Fallback:** if the Gemini call throws (missing key, network failure, malformed JSON), the same
inputs are scored deterministically by `ruleEngineService.js`:
- Location: exact match = 60 pts, partial match = 35 pts, no match = 10 pts
- Budget: within range = 40 pts, ≤10% over budget = 20 pts, below budget = 30 pts, otherwise = 0 pts

Example fallback output for the same listing/tenant pair:
```json
{"score": 100, "explanation": "Rule-based score: exact location match (+60), rent fits comfortably within budget (+40)."}
```

`generatedBy` is set to `"rule-engine"` so the discrepancy between the two scoring paths is
always visible and auditable in the database.

---

## 7. Notes for Deployment

- Set `CLIENT_URL` (server) and `VITE_API_URL` (client) to your deployed URLs.
- MongoDB Atlas free tier works fine for `MONGO_URI`.
- Render/Railway both support long-lived WebSocket connections needed for Socket.IO — confirm the
  hosting plan doesn't sleep the process between chat messages during a demo.
- Gemini API key is optional at deploy time; omitting it forces every score through the rule-based
  path, which is still fully functional and a good way to demonstrate graceful degradation live.
