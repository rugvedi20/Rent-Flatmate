import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import PropertyCard from "../components/PropertyCard";
import ProfilePage from "./ProfilePage";
import { useAuth } from "../context/AuthContext";

export default function TenantDashboard() {
  const { user } = useAuth();
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

  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabParam || "explore"); // explore | saved | profile
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
        limit: 6, // Show 6 per page for a balanced responsive 3-column grid
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

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && (tab === "explore" || tab === "saved" || tab === "profile")) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      setMessage("Saving profile preferences & recalculating AI compatibility...");
      
      const payload = {
        ...profile,
        budgetMin: Number(profile.budgetMin) || 0,
        budgetMax: Number(profile.budgetMax) || 0,
        preferredRoomType: profile.preferredRoomType || undefined,
        preferredFurnishing: profile.preferredFurnishing || undefined,
      };

      await api.post("/tenants/profile", payload);
      await loadListings(1);
      setMessage("Profile preferences saved successfully.");
    } catch (err) {
      console.error("Failed to save profile:", err);
      const errMsg = err.response?.data?.message || err.response?.data?.error || "Failed to save profile preferences.";
      setMessage(`Error: ${errMsg}`);
    } finally {
      setTimeout(() => setMessage(""), 4000);
    }
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
    <div className="container py-8">
      
      {/* Subpage Tab Selection Bar */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid var(--border)", marginBottom: "32px", paddingBottom: "12px", overflowX: "auto" }}>
        <button
          onClick={() => { setActiveTab("explore"); setSearchParams({ tab: "explore" }); }}
          style={{
            background: activeTab === "explore" ? "var(--primary)" : "transparent",
            color: activeTab === "explore" ? "white" : "var(--text-muted)",
            boxShadow: "none",
            padding: "8px 24px",
            fontSize: "14px",
            fontWeight: "700"
          }}
        >
          🔍 Explore &amp; Matches
        </button>
        <button
          onClick={() => { setActiveTab("saved"); setSearchParams({ tab: "saved" }); }}
          style={{
            background: activeTab === "saved" ? "var(--primary)" : "transparent",
            color: activeTab === "saved" ? "white" : "var(--text-muted)",
            boxShadow: "none",
            padding: "8px 24px",
            fontSize: "14px",
            fontWeight: "700"
          }}
        >
          ❤️ Saved Rooms ({savedListings.length})
        </button>
        <button
          onClick={() => { setActiveTab("profile"); setSearchParams({ tab: "profile" }); }}
          style={{
            background: activeTab === "profile" ? "var(--primary)" : "transparent",
            color: activeTab === "profile" ? "white" : "var(--text-muted)",
            boxShadow: "none",
            padding: "8px 24px",
            fontSize: "14px",
            fontWeight: "700"
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
          <div style={{ marginBottom: "32px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-main)", margin: "0 0 6px" }}>
              Find a Room That Feels Right
            </h1>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0, fontWeight: "500" }}>
              AI-powered recommendation matching that maps to your budget, localities, and lifestyle traits.
            </p>
          </div>

          {/* Upgraded Premium Filter Layout */}
          <div className="filter-card-bar">
            <div className="filter-group">
              <label>Locality / Area</label>
              <input
                type="text"
                placeholder="Search localities (e.g. Baner, Wakad)..."
                value={searchLoc}
                onChange={(e) => setSearchLoc(e.target.value)}
              />
            </div>
            
            <div className="filter-group">
              <label>Room Type</label>
              <select value={searchRoomType} onChange={(e) => setSearchRoomType(e.target.value)}>
                <option value="">Any Room Type</option>
                <option value="single">Single Room</option>
                <option value="shared">Shared Room</option>
                <option value="1bhk">1 BHK</option>
                <option value="2bhk">2 BHK</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Furnishing</label>
              <select value={searchFurnishing} onChange={(e) => setSearchFurnishing(e.target.value)}>
                <option value="">Any Furnishing</option>
                <option value="furnished">Furnished</option>
                <option value="semi-furnished">Semi-Furnished</option>
                <option value="unfurnished">Unfurnished</option>
              </select>
            </div>

            <div className="filter-group">
              <label>Min Price (₹)</label>
              <input
                type="number"
                placeholder="Min Budget"
                value={searchMin}
                onChange={(e) => setSearchMin(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <label>Max Price (₹)</label>
              <input
                type="number"
                placeholder="Max Budget"
                value={searchMax}
                onChange={(e) => setSearchMax(e.target.value)}
              />
            </div>

            <div style={{ display: "flex", gap: "8px", alignSelf: "flex-end", height: "42px" }}>
              <button 
                type="button" 
                onClick={() => loadListings(1)} 
                style={{ padding: "0 24px", height: "100%", fontWeight: "700" }}
              >
                Apply Filters
              </button>
              {(searchLoc || searchRoomType || searchFurnishing || searchMin || searchMax) && (
                <button 
                  type="button" 
                  onClick={handleReset} 
                  style={{ background: "#f1f5f9", color: "#475569", border: "1px solid var(--border)", padding: "0 16px", height: "100%", fontWeight: "700" }}
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Grid Layout containing Property Cards */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h2 style={{ fontSize: "18px", fontWeight: "750", color: "var(--text-main)" }}>
                Verified Property Matches {ranked && "· Ranked by Compatibility"}
              </h2>
              {ranked && <span className="badge badge-high" style={{ fontSize: "11px" }}>AI Matching Engine Active</span>}
            </div>

            {loading && (
              <div className="landing-grid-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="card" style={{ padding: 0, height: "380px", overflow: "hidden", borderRadius: "16px", border: "1px solid var(--border)", boxShadow: "none" }}>
                    <div style={{ height: "230px" }} className="skeleton-pulse" />
                    <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ height: "12px", width: "40%" }} className="skeleton-pulse skeleton-text" />
                      <div style={{ height: "20px", width: "80%" }} className="skeleton-pulse skeleton-text heading" />
                      <div style={{ height: "14px", width: "60%" }} className="skeleton-pulse skeleton-text" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!loading && listings.length === 0 && (
              <div style={{ padding: "64px 24px", textAlign: "center", background: "white", borderRadius: "20px", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
                <span style={{ fontSize: "48px" }}>🧭</span>
                <h3 style={{ fontSize: "18px", fontWeight: "750", color: "var(--text-main)", marginTop: "16px" }}>No matching rooms found</h3>
                <p style={{ fontSize: "13.5px", color: "var(--text-muted)", maxWidth: "340px", margin: "8px auto 20px" }}>
                  We couldn't find any listings that match your search filters. Try adjusting your price range or locality criteria.
                </p>
                <button onClick={handleReset} className="btn" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>Reset All Filters</button>
              </div>
            )}

            {!loading && listings.length > 0 && (
              <div className="landing-grid-3">
                {listings.map((item) => {
                  const listing = ranked ? item.listing : item;
                  const compatibility = ranked ? item.compatibility : null;
                  const isBookmarked = savedListings.some((s) => s._id === listing._id);
                  const hasExpressedInterest = sentInterests.some((i) => String(i.listingId?._id) === String(listing._id));

                  return (
                    <PropertyCard
                      key={listing._id}
                      listing={listing}
                      compatibility={compatibility}
                      isSaved={isBookmarked}
                      onToggleSave={toggleSave}
                      onExpressInterest={expressInterest}
                      hasExpressedInterest={hasExpressedInterest}
                    />
                  );
                })}
              </div>
            )}

            {/* Pagination controls */}
            {!loading && totalPages > 1 && (
              <div style={{ display: "flex", gap: "12px", alignItems: "center", justifyContent: "center", marginTop: "32px" }}>
                <button 
                  disabled={page <= 1} 
                  onClick={() => loadListings(page - 1)} 
                  style={{ background: "#64748b", padding: "10px 20px" }}
                >
                  Previous
                </button>
                <span style={{ fontSize: "14px", fontWeight: "700" }}>Page {page} of {totalPages}</span>
                <button 
                  disabled={page >= totalPages} 
                  onClick={() => loadListings(page + 1)} 
                  style={{ background: "#64748b", padding: "10px 20px" }}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* RENDER SAVED ROOMS TAB */}
      {activeTab === "saved" && (
        <div>
          <div style={{ marginBottom: "24px" }}>
            <h2 style={{ fontSize: "24px", fontWeight: "800", color: "var(--text-main)", margin: "0 0 6px" }}>
              Saved Room Collections
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0, fontWeight: "500" }}>
              Bookmark listings to review later and calculate match offsets.
            </p>
          </div>
          
          {savedListings.length === 0 && (
            <div style={{ padding: "64px 24px", textAlign: "center", background: "white", borderRadius: "20px", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
              <span style={{ fontSize: "48px" }}>🤍</span>
              <h3 style={{ fontSize: "18px", fontWeight: "750", color: "var(--text-main)", marginTop: "16px" }}>Your saved collection is empty</h3>
              <p style={{ fontSize: "13.5px", color: "var(--text-muted)", maxWidth: "340px", margin: "8px auto 20px" }}>
                Bookmark rooms while browsing the explore feed to keep track of premium options and calculate matching scores.
              </p>
              <button onClick={() => setActiveTab("explore")} className="btn">Browse Available Rooms</button>
            </div>
          )}

          {savedListings.length > 0 && (
            <div className="landing-grid-3">
              {savedListings.map((l) => {
                const hasExpressedInterest = sentInterests.some((i) => String(i.listingId?._id) === String(l._id));
                return (
                  <PropertyCard
                    key={l._id}
                    listing={l}
                    compatibility={null}
                    isSaved={true}
                    onToggleSave={toggleSave}
                    onExpressInterest={expressInterest}
                    hasExpressedInterest={hasExpressedInterest}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* RENDER PROFILE & PREFERENCES TAB */}
      {activeTab === "profile" && (
        <ProfilePage userId={user?._id} isDashboard={true} />
      )}
    </div>
  );
}
