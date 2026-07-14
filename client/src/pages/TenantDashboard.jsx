import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import PropertyCard from "../components/PropertyCard";
import ProfilePage from "./ProfilePage";
import useAuth from "../hooks/useAuth";
import useListings from "../hooks/useListings";
import SearchFilters from "../components/tenant/SearchFilters";
import ListingsGrid from "../components/tenant/ListingsGrid";

export default function TenantDashboard() {
  const { user } = useAuth();
  
  // Unused state preserved to maintain 100% compatibility with potential external tools/tests
  const [profile] = useState({
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

  const {
    listings,
    ranked,
    loading,
    page,
    totalPages,
    message,
    searchLoc,
    setSearchLoc,
    searchMin,
    setSearchMin,
    searchMax,
    setSearchMax,
    searchRoomType,
    setSearchRoomType,
    searchFurnishing,
    setSearchFurnishing,
    savedListings,
    sentInterests,
    loadSentInterests,
    loadSavedListings,
    toggleSave,
    loadListings,
    expressInterest,
    handleReset,
  } = useListings();

  useEffect(() => {
    loadListings(1);
    loadSentInterests();
    loadSavedListings();
  }, [loadListings, loadSentInterests, loadSavedListings]);

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab && (tab === "explore" || tab === "saved" || tab === "profile")) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Helper preserved to maintain 100% compatibility
  const getProfileCompletion = useCallback(() => {
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
  }, [profile]);

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
          Explore &amp; Matches
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
          Saved Rooms ({savedListings.length})
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
          Profile &amp; Preferences
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
          <SearchFilters
            searchLoc={searchLoc}
            setSearchLoc={setSearchLoc}
            searchMin={searchMin}
            setSearchMin={setSearchMin}
            searchMax={searchMax}
            setSearchMax={setSearchMax}
            searchRoomType={searchRoomType}
            setSearchRoomType={setSearchRoomType}
            searchFurnishing={searchFurnishing}
            setSearchFurnishing={setSearchFurnishing}
            loadListings={loadListings}
            handleReset={handleReset}
          />

          {/* Grid Layout containing Property Cards */}
          <ListingsGrid
            loading={loading}
            listings={listings}
            ranked={ranked}
            savedListings={savedListings}
            sentInterests={sentInterests}
            toggleSave={toggleSave}
            expressInterest={expressInterest}
            handleReset={handleReset}
            page={page}
            totalPages={totalPages}
            loadListings={loadListings}
          />
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
