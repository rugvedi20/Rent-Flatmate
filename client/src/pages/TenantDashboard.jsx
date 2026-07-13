import { useEffect, useState } from "react";
import api from "../services/api";

function ScoreBadge({ score }) {
  const cls = score >= 80 ? "badge-high" : score >= 50 ? "badge-mid" : "badge-low";
  return <span className={`badge ${cls}`}>{score}% Match</span>;
}

export default function TenantDashboard() {
  const [profile, setProfile] = useState({
    preferredLocation: "",
    budgetMin: "",
    budgetMax: "",
    moveInDate: "",
    preferredRoomType: "",
    preferredFurnishing: "",
    parkingRequired: false,
    petsAllowed: false,
    smokingAllowed: false,
    genderPreference: "any",
    bio: "",
    occupation: "",
    languages: "",
    phone: "",
    avatarUrl: "",
    phoneVerified: false,
    identityVerified: false,
  });

  const [activeTab, setActiveTab] = useState("explore"); // explore | saved | profile
  const [listings, setListings] = useState([]);
  const [savedListings, setSavedListings] = useState([]);
  const [ranked, setRanked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [sentInterests, setSentInterests] = useState([]);

  // Filter States
  const [searchLoc, setSearchLoc] = useState("");
  const [searchMin, setSearchMin] = useState("");
  const [searchMax, setSearchMax] = useState("");
  const [searchRoomType, setSearchRoomType] = useState("");
  const [searchFurnishing, setSearchFurnishing] = useState("");

  // Pagination States
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Expandable matching breakdowns
  const [expandedInsights, setExpandedInsights] = useState({});

  const toggleInsights = (id) => {
    setExpandedInsights((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const loadSentInterests = async () => {
    try {
      const { data } = await api.get("/interest/sent");
      setSentInterests(data);
    } catch {
      // ignore
    }
  };

  const loadSavedListings = async () => {
    try {
      const { data } = await api.get("/saved");
      setSavedListings(data);
    } catch {
      // ignore
    }
  };

  const toggleSave = async (listingId) => {
    try {
      const { data } = await api.post("/saved/toggle", { listingId });
      setMessage(data.message);
      await loadSavedListings();
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage("Failed to update bookmark.");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const loadProfile = async () => {
    try {
      const { data } = await api.get("/tenants/profile");
      setProfile({
        preferredLocation: data.preferredLocation || "",
        budgetMin: data.budgetMin || "",
        budgetMax: data.budgetMax || "",
        moveInDate: data.moveInDate?.slice(0, 10) || "",
        preferredRoomType: data.preferredRoomType || "",
        preferredFurnishing: data.preferredFurnishing || "",
        parkingRequired: !!data.parkingRequired,
        petsAllowed: !!data.petsAllowed,
        smokingAllowed: !!data.smokingAllowed,
        genderPreference: data.genderPreference || "any",
        bio: data.bio || "",
        occupation: data.occupation || "",
        languages: data.languages || "",
        phone: data.phone || "",
        avatarUrl: data.avatarUrl || "",
        phoneVerified: !!data.phoneVerified,
        identityVerified: !!data.identityVerified,
      });
    } catch {
      // no profile yet — fine
    }
  };

  const loadListings = async (targetPage = 1, currentFilters = {}) => {
    setLoading(true);
    try {
      const params = {
        page: targetPage,
        limit: 5,
        location: currentFilters.location !== undefined ? currentFilters.location : (searchLoc || undefined),
        minRent: currentFilters.minRent !== undefined ? currentFilters.minRent : (searchMin || undefined),
        maxRent: currentFilters.maxRent !== undefined ? currentFilters.maxRent : (searchMax || undefined),
        roomType: currentFilters.roomType !== undefined ? currentFilters.roomType : (searchRoomType || undefined),
        furnishing: currentFilters.furnishing !== undefined ? currentFilters.furnishing : (searchFurnishing || undefined),
      };

      const { data } = await api.get("/listings", { params });
      setRanked(data.ranked);
      setListings(data.listings);
      setTotalPages(data.pagination?.totalPages || 1);
      setPage(targetPage);
    } catch (err) {
      console.error("Failed to load listings:", err);
      setMessage("Failed to retrieve listings. If your session has expired, please sign out and sign in again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    loadListings(1);
    loadSentInterests();
    loadSavedListings();
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setMessage("Saving profile preferences & recalculating AI compatibility...");
    await api.post("/tenants/profile", profile);
    await loadListings(1);
    setMessage("Profile preferences saved and matches re-ranked successfully.");
    setTimeout(() => setMessage(""), 4000);
  };

  const expressInterest = async (listingId) => {
    try {
      await api.post("/interest", { listingId });
      setMessage("Interest expressed successfully! Notification sent to owner.");
      await loadSentInterests();
      setTimeout(() => setMessage(""), 3500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to express interest");
      setTimeout(() => setMessage(""), 4000);
    }
  };

  const handleReset = () => {
    setSearchLoc("");
    setSearchMin("");
    setSearchMax("");
    setSearchRoomType("");
    setSearchFurnishing("");
    loadListings(1, {
      location: "",
      minRent: "",
      maxRent: "",
      roomType: "",
      furnishing: ""
    });
  };

  // Helper to calculate profile completion percentage
  const getProfileCompletion = () => {
    let completed = 2; // preferredLocation & moveInDate are required
    if (profile.budgetMin) completed += 1;
    if (profile.budgetMax) completed += 1;
    if (profile.bio) completed += 1;
    if (profile.occupation) completed += 1;
    if (profile.languages) completed += 1;
    if (profile.phone) completed += 1;
    if (profile.phoneVerified) completed += 1;
    if (profile.identityVerified) completed += 1;
    return Math.round((completed / 10) * 100);
  };

  return (
    <div className="container">
      
      {/* Subpage Tab Selection Bar */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid var(--border)", marginBottom: "32px", paddingBottom: "12px", overflowX: "auto" }}>
        <button
          onClick={() => setActiveTab("explore")}
          style={{
            background: activeTab === "explore" ? "var(--primary)" : "transparent",
            color: activeTab === "explore" ? "white" : "var(--text-muted)",
            boxShadow: "none",
            padding: "8px 24px",
            fontSize: "14px"
          }}
        >
          🔍 Explore &amp; Matches
        </button>
        <button
          onClick={() => setActiveTab("saved")}
          style={{
            background: activeTab === "saved" ? "var(--primary)" : "transparent",
            color: activeTab === "saved" ? "white" : "var(--text-muted)",
            boxShadow: "none",
            padding: "8px 24px",
            fontSize: "14px"
          }}
        >
          ❤️ Saved Rooms ({savedListings.length})
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          style={{
            background: activeTab === "profile" ? "var(--primary)" : "transparent",
            color: activeTab === "profile" ? "white" : "var(--text-muted)",
            boxShadow: "none",
            padding: "8px 24px",
            fontSize: "14px"
          }}
        >
          👤 Profile &amp; Preferences
        </button>
      </div>

      {message && (
        <div style={{ padding: "12px 20px", background: "var(--primary-light)", color: "var(--primary)", borderLeft: "4px solid var(--primary)", borderRadius: "12px", marginBottom: "24px", fontWeight: "600", fontSize: "14px" }}>
          💡 {message}
        </div>
      )}

      {/* RENDER EXPLORE TAB */}
      {activeTab === "explore" && (
        <>
          <div className="hero" style={{ padding: "20px 0 40px" }}>
            <h1>Find a Room That Feels Right</h1>
            <p>AI-powered recommendation matching that maps to your budget, localities, and lifestyle traits.</p>
            
            <form onSubmit={(e) => { e.preventDefault(); loadListings(1); }} style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "10px", padding: "12px 18px", background: "white", borderRadius: "20px", border: "1px solid var(--border)", boxShadow: "var(--shadow-md)" }}>
              <input
                placeholder="Search localities in Pune (e.g. Baner, Wakad, Kothrud)..."
                value={searchLoc}
                onChange={(e) => setSearchLoc(e.target.value)}
                style={{ flex: "2 1 250px", border: "none", boxShadow: "none", background: "transparent" }}
              />
              <select
                value={searchRoomType}
                onChange={(e) => setSearchRoomType(e.target.value)}
                style={{ flex: "1 1 120px", border: "none", boxShadow: "none", background: "transparent" }}
              >
                <option value="">Any Room Type</option>
                <option value="single">Single</option>
                <option value="shared">Shared</option>
                <option value="1bhk">1BHK</option>
                <option value="2bhk">2BHK</option>
              </select>
              <button type="submit" style={{ padding: "10px 24px" }}>Search</button>
              {(searchLoc || searchRoomType) && (
                <button type="button" onClick={handleReset} style={{ background: "#64748b", padding: "10px 16px" }}>Reset</button>
              )}
            </form>
          </div>

          <div className="split-view-container">
            {/* Listing feed */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h2 style={{ fontSize: "18px", fontWeight: "700" }}>
                  Rooms Recommendations {ranked && "· Reranked Matches"}
                </h2>
                {ranked && <span className="badge badge-high" style={{ fontSize: "11px" }}>AI Reranking Active</span>}
              </div>

              {loading && (
                <>
                  <div className="skeleton-card skeleton" />
                  <div className="skeleton-card skeleton" />
                </>
              )}

              {!loading && listings.length === 0 && (
                <div style={{ padding: "40px", textAlign: "center", background: "white", borderRadius: "20px", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                  <span style={{ fontSize: "36px" }}>🧭</span>
                  <p style={{ marginTop: "12px", fontWeight: "600" }}>No rooms fit the search criteria.</p>
                  <button onClick={handleReset} style={{ marginTop: "16px", background: "var(--primary-light)", color: "var(--primary)" }}>Reset All Filters</button>
                </div>
              )}

              {!loading && listings.map((item) => {
                const listing = ranked ? item.listing : item;
                const compatibility = ranked ? item.compatibility : null;

                let scoreClass = "poor";
                let scoreBadgeClass = "badge-low";
                if (compatibility) {
                  const score = compatibility.score;
                  if (score >= 85) {
                    scoreClass = "excellent";
                    scoreBadgeClass = "badge-high";
                  } else if (score >= 70) {
                    scoreClass = "good";
                    scoreBadgeClass = "badge-high";
                  } else if (score >= 50) {
                    scoreClass = "moderate";
                    scoreBadgeClass = "badge-mid";
                  }
                }

                let distanceLabel = "";
                let locationRatingText = "";
                if (compatibility && compatibility.distanceKm !== undefined && compatibility.distanceKm !== null) {
                  const dist = compatibility.distanceKm;
                  distanceLabel = `📍 ${dist} km from preferred location`;
                  if (dist <= 1.0) locationRatingText = "★★★★★ Excellent Proximity";
                  else if (dist <= 3.0) locationRatingText = "★★★★☆ Good Proximity";
                  else if (dist <= 5.0) locationRatingText = "★★★☆☆ Moderate Proximity";
                  else if (dist <= 8.0) locationRatingText = "★★☆☆☆ Fair Proximity";
                  else locationRatingText = "★☆☆☆☆ Distanced Proximity";
                }

                const isInsightsExpanded = !!expandedInsights[listing._id];
                const isBookmarked = savedListings.some((s) => s._id === listing._id);

                return (
                  <div className="card" key={listing._id} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    
                    {/* Title Details */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "700" }}>{listing.title}</h3>
                        <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0" }}>📍 {listing.location}</p>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                        <span style={{ fontSize: "18px", fontWeight: "700", color: "var(--primary)" }}>₹{listing.rent}/mo</span>
                        <span className="badge" style={{ background: "rgba(226, 232, 240, 0.6)", color: "var(--text-main)", fontSize: "11px", marginTop: "4px", padding: "2px 8px" }}>
                          {listing.roomType} · {listing.furnishing}
                        </span>
                      </div>
                    </div>

                    <p style={{ fontSize: "14px", color: "#4b5563", margin: 0 }}>{listing.description}</p>

                    {/* Proximity / Distance Buffer */}
                    {distanceLabel && (
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(79, 70, 229, 0.04)", border: "1px dashed rgba(79, 70, 229, 0.15)", padding: "10px 14px", borderRadius: "12px" }}>
                        <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--primary)" }}>{distanceLabel}</span>
                        <span style={{ fontSize: "11.5px", fontWeight: "700", color: "var(--success)" }}>{locationRatingText}</span>
                      </div>
                    )}

                    {/* AI Scoring */}
                    {compatibility && (
                      <div style={{ background: "#f8fafc", border: "1px solid var(--border)", borderRadius: "16px", padding: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                          <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-main)" }}>AI Compatibility Score</span>
                          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                            <span className={`badge ${scoreBadgeClass}`}>{compatibility.badge || "Moderate"} Match</span>
                            <span style={{ fontSize: "14px", fontWeight: "700" }}>{compatibility.score}%</span>
                          </div>
                        </div>

                        <div className="compat-container">
                          <div className={`compat-bar ${scoreClass}`} style={{ width: `${compatibility.score}%` }}></div>
                        </div>

                        <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "8px 0" }}>
                          💡 {compatibility.explanation.split("[Distance")[0]}
                        </p>

                        {/* Insights Expander Toggle */}
                        <div style={{ marginTop: "12px" }}>
                          <button
                            type="button"
                            onClick={() => toggleInsights(listing._id)}
                            style={{ background: "transparent", color: "var(--primary)", boxShadow: "none", padding: "2px 0", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}
                          >
                            {isInsightsExpanded ? "▲ Collapse Match Score Insights" : "▼ Expand Match Score Insights"}
                          </button>

                          {isInsightsExpanded && (
                            <div style={{ marginTop: "14px", background: "white", padding: "16px", borderRadius: "12px", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "12px" }}>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                <div style={{ background: "#f8fafc", padding: "8px", borderRadius: "8px", textAlign: "center" }}>
                                  <p style={{ fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>Rule compatibility</p>
                                  <p style={{ fontSize: "16px", fontWeight: "700", color: "var(--primary)" }}>{compatibility.ruleScore}%</p>
                                </div>
                                <div style={{ background: "#f8fafc", padding: "8px", borderRadius: "8px", textAlign: "center" }}>
                                  <p style={{ fontSize: "9px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>AI Semantic Scorer</p>
                                  <p style={{ fontSize: "16px", fontWeight: "700", color: "var(--primary)" }}>
                                    {compatibility.llmScore !== null ? `${compatibility.llmScore}%` : "Fallback Engine"}
                                  </p>
                                </div>
                              </div>

                              <div>
                                <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", letterSpacing: "0.05em" }}>AI Match Pros &amp; Cons</span>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "6px" }}>
                                  {compatibility.pros && compatibility.pros.length > 0 && (
                                    <div>
                                      {compatibility.pros.map((p, idx) => (
                                        <div key={idx} style={{ color: "var(--success)", fontSize: "12.5px", marginBottom: "4px" }}>✓ {p}</div>
                                      ))}
                                    </div>
                                  )}
                                  {compatibility.cons && compatibility.cons.length > 0 && (
                                    <div>
                                      {compatibility.cons.map((c, idx) => (
                                        <div key={idx} style={{ color: "var(--danger)", fontSize: "12.5px", marginBottom: "4px" }}>✖ {c}</div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {compatibility.summary && (
                                <div style={{ background: "rgba(241, 245, 249, 0.5)", padding: "10px", borderRadius: "8px", fontSize: "12px", color: "var(--text-muted)" }}>
                                  <strong>AI Summary:</strong> {compatibility.summary}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Panel */}
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => expressInterest(listing._id)}
                        disabled={sentInterests.some((i) => String(i.listingId?._id) === String(listing._id))}
                        style={{ flex: 1 }}
                      >
                        {sentInterests.some((i) => String(i.listingId?._id) === String(listing._id))
                          ? "Interest Request Sent"
                          : "Express Match Interest"
                        }
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleSave(listing._id)}
                        style={{ background: isBookmarked ? "var(--danger)" : "#f1f5f9", color: isBookmarked ? "white" : "var(--text-muted)", boxShadow: "none", padding: "10px 18px" }}
                      >
                        {isBookmarked ? "❤️ Saved" : "🤍 Save"}
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Pagination controls */}
              {!loading && totalPages > 1 && (
                <div style={{ display: "flex", gap: "12px", alignItems: "center", justifyContent: "center", marginTop: "16px" }}>
                  <button disabled={page <= 1} onClick={() => loadListings(page - 1)} style={{ background: "#64748b" }}>Previous</button>
                  <span style={{ fontSize: "14px", fontWeight: "600" }}>Page {page} of {totalPages}</span>
                  <button disabled={page >= totalPages} onClick={() => loadListings(page + 1)} style={{ background: "#64748b" }}>Next</button>
                </div>
              )}
            </div>

            {/* Proximity map indicator */}
            <div className="map-placeholder">
              <div style={{ padding: "30px", textAlign: "center" }}>
                <span style={{ fontSize: "48px" }}>🗺️</span>
                <h4 style={{ margin: "12px 0 6px", fontWeight: "700" }}>Pune Proximity Map</h4>
                <p style={{ fontSize: "12.5px", color: "var(--text-muted)", maxWidth: "260px", margin: "0 auto 16px" }}>
                  Showing distance buffers from your preference centroid.
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", textAlign: "left", background: "white", padding: "12px", borderRadius: "12px", border: "1px solid var(--border)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px" }}>
                    <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--success)" }}></span>
                    <span>Excellent Match (0 - 1 km)</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px" }}>
                    <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--primary)" }}></span>
                    <span>Good Match (1 - 3 km)</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px" }}>
                    <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--warning)" }}></span>
                    <span>Distanced Match (&gt; 5 km)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* RENDER SAVED ROOMS TAB */}
      {activeTab === "saved" && (
        <div>
          <h2>Saved Room Collections</h2>
          <p style={{ color: "var(--text-muted)", marginBottom: "24px" }}>Bookmark listings to review later and calculate match offsets.</p>
          
          {savedListings.length === 0 && (
            <div style={{ padding: "40px", textAlign: "center", background: "white", borderRadius: "20px", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
              <span style={{ fontSize: "40px" }}>🤍</span>
              <p style={{ marginTop: "12px", fontWeight: "600" }}>No saved listings yet.</p>
              <button onClick={() => setActiveTab("explore")} style={{ marginTop: "16px" }}>Go Find Rooms</button>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" }}>
            {savedListings.map((l) => (
              <div className="card" key={l._id} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", margin: 0 }}>
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: "700" }}>{l.title}</h3>
                  <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0" }}>📍 {l.location}</p>
                  <p style={{ fontWeight: "700", color: "var(--primary)", fontSize: "16px", margin: "8px 0" }}>₹{l.rent}/mo</p>
                  <p style={{ fontSize: "13px", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
                    {l.description}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
                  <button onClick={() => expressInterest(l._id)} style={{ flex: 1, padding: "8px" }}>Express Interest</button>
                  <button onClick={() => toggleSave(l._id)} style={{ background: "var(--danger)", color: "white", padding: "8px 12px" }}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* RENDER PROFILE & PREFERENCES TAB */}
      {activeTab === "profile" && (
        <div className="split-layout">
          
          {/* Profile Card Left Panel */}
          <div className="card" style={{ padding: "28px", display: "flex", flexDirection: "column", alignItems: "center", gap: "20px" }}>
            
            {/* Simulated Profile Pic */}
            <div style={{ width: "100px", height: "100px", borderRadius: "50%", background: "var(--primary-light)", color: "var(--primary)", border: "2px solid rgba(79, 70, 229, 0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "36px", fontWeight: "bold" }}>
              👤
            </div>
            
            <div style={{ textAlign: "center" }}>
              <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>Active Tenant Profile</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0" }}>{profile.occupation || "Profession Unspecified"}</p>
              
              {/* Verification indicators */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", justifyContent: "center", marginTop: "10px" }}>
                <span className="badge badge-high" style={{ fontSize: "10px", padding: "2px 8px" }}>Email Verified</span>
                {profile.phoneVerified && <span className="badge badge-high" style={{ fontSize: "10px", padding: "2px 8px" }}>Phone Verified</span>}
                {profile.identityVerified && <span className="badge badge-high" style={{ fontSize: "10px", padding: "2px 8px" }}>Identity Verified</span>}
              </div>
            </div>

            {/* Profile Completion */}
            <div style={{ width: "100%", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", fontSize: "13px", fontWeight: "600" }}>
                <span>Profile Completion</span>
                <span>{getProfileCompletion()}%</span>
              </div>
              <div className="compat-container" style={{ margin: 0, height: "6px" }}>
                <div className="compat-bar excellent" style={{ width: `${getProfileCompletion()}%` }}></div>
              </div>
            </div>

            {/* Trust Info */}
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "8px", fontSize: "12.5px", color: "var(--text-muted)", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
              <div>📅 Member since: **July 2026**</div>
              <div>⚡ Response Rate: **98% (Excellent)**</div>
              <div>💬 Average response time: **5 mins**</div>
            </div>
          </div>

          {/* Edit Form Right Panel */}
          <div className="card" style={{ padding: "28px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "20px" }}>Edit AI Match Preferences &amp; Profile</h2>
            
            <form onSubmit={saveProfile} style={{ border: "none", padding: 0, boxShadow: "none", margin: 0, display: "flex", flexDirection: "column", gap: "16px" }}>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Locality Search centroid</label>
                  <input
                    placeholder="locality center (e.g. Baner)"
                    value={profile.preferredLocation}
                    onChange={(e) => setProfile({ ...profile, preferredLocation: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Move-in Date</label>
                  <input
                    type="date"
                    value={profile.moveInDate}
                    onChange={(e) => setProfile({ ...profile, moveInDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Min Budget (₹)</label>
                  <input
                    type="number"
                    value={profile.budgetMin}
                    onChange={(e) => setProfile({ ...profile, budgetMin: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Max Budget (₹)</label>
                  <input
                    type="number"
                    value={profile.budgetMax}
                    onChange={(e) => setProfile({ ...profile, budgetMax: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Preferred Room Type</label>
                  <select
                    value={profile.preferredRoomType}
                    onChange={(e) => setProfile({ ...profile, preferredRoomType: e.target.value })}
                  >
                    <option value="">Any Room Type</option>
                    <option value="single">Single</option>
                    <option value="shared">Shared</option>
                    <option value="1bhk">1BHK</option>
                    <option value="2bhk">2BHK</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Furnishing Preference</label>
                  <select
                    value={profile.preferredFurnishing}
                    onChange={(e) => setProfile({ ...profile, preferredFurnishing: e.target.value })}
                  >
                    <option value="">Any Furnishing</option>
                    <option value="furnished">Furnished</option>
                    <option value="semi-furnished">Semi-furnished</option>
                    <option value="unfurnished">Unfurnished</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Occupation / College</label>
                  <input
                    placeholder="e.g. Software Engineer at Google"
                    value={profile.occupation}
                    onChange={(e) => setProfile({ ...profile, occupation: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Languages spoken</label>
                  <input
                    placeholder="e.g. English, Hindi, Marathi"
                    value={profile.languages}
                    onChange={(e) => setProfile({ ...profile, languages: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Phone Number</label>
                  <input
                    placeholder="Phone number"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Flatmate Gender Preference</label>
                  <select
                    value={profile.genderPreference}
                    onChange={(e) => setProfile({ ...profile, genderPreference: e.target.value })}
                  >
                    <option value="any">Any Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-muted)", textTransform: "uppercase" }}>Your Bio / Intro</label>
                <textarea
                  placeholder="Introduce yourself to flatmates..."
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  style={{ height: "80px" }}
                />
              </div>

              {/* Lifestyle checkmarks */}
              <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", margin: "5px 0" }}>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={profile.parkingRequired}
                    onChange={(e) => setProfile({ ...profile, parkingRequired: e.target.checked })}
                  />
                  Parking Required
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={profile.petsAllowed}
                    onChange={(e) => setProfile({ ...profile, petsAllowed: e.target.checked })}
                  />
                  Pets Allowed
                </label>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={profile.smokingAllowed}
                    onChange={(e) => setProfile({ ...profile, smokingAllowed: e.target.checked })}
                  />
                  Smoking Allowed
                </label>
              </div>

              {/* Verifications sandbox controls */}
              <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "12px", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "8px", marginTop: "6px" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)" }}>Demo Verification Credentials Checklist</span>
                <div style={{ display: "flex", gap: "16px" }}>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={profile.phoneVerified}
                      onChange={(e) => setProfile({ ...profile, phoneVerified: e.target.checked })}
                    />
                    Verify Phone
                  </label>
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={profile.identityVerified}
                      onChange={(e) => setProfile({ ...profile, identityVerified: e.target.checked })}
                    />
                    Verify Identity Proof
                  </label>
                </div>
              </div>

              <button type="submit" style={{ width: "100%", marginTop: "10px" }}>Save Preferences Profile</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
