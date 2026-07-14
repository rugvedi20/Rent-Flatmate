import { useEffect, useState, useCallback } from "react";
import listingService from "../services/listing.service";
import interestService from "../services/interest.service";
import ProfilePage from "./ProfilePage";
import useAuth from "../hooks/useAuth";
import CreateListingForm from "../components/owner/CreateListingForm";
import ReceivedRequests from "../components/owner/ReceivedRequests";
import MyPropertiesCatalog from "../components/owner/MyPropertiesCatalog";

export default function OwnerDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard | profile
  const [listings, setListings] = useState([]);
  const [interests, setInterests] = useState([]);
  const [form, setForm] = useState({
    title: "", location: "", rent: "", availableFrom: "",
    roomType: "single", furnishing: "unfurnished", description: "",
    societyName: "", area: "", city: "Pune", state: "Maharashtra",
    pincode: "", landmark: "",
    locationCoords: { type: "Point", coordinates: [73.8567, 18.5204] },
    photos: []
  });
  const [message, setMessage] = useState("");

  const loadListings = useCallback(async () => {
    try {
      const data = await listingService.getMyListings();
      setListings(data);
    } catch {
      // ignore
    }
  }, []);

  const loadInterests = useCallback(async () => {
    try {
      const data = await interestService.getReceivedInterests();
      setInterests(data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    loadListings();
    loadInterests();
  }, [loadListings, loadInterests]);

  const createListing = async (e) => {
    e.preventDefault();
    try {
      await listingService.createListing(form);
      setMessage("Listing created successfully!");
      setForm({
        title: "", location: "", rent: "", availableFrom: "",
        roomType: "single", furnishing: "unfurnished", description: "",
        societyName: "", area: "", city: "Pune", state: "Maharashtra",
        pincode: "", landmark: "",
        locationCoords: { type: "Point", coordinates: [73.8567, 18.5204] },
        photos: []
      });
      loadListings();
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage("Failed to create listing.");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const markFilled = async (id) => {
    try {
      await listingService.markListingAsFilled(id);
      loadListings();
    } catch {
      // ignore
    }
  };

  const respond = async (id, status) => {
    try {
      await interestService.updateInterestStatus(id, status);
      loadInterests();
    } catch {
      // ignore
    }
  };

  // Compute analytics card stats dynamically
  const pendingRequests = interests.filter((i) => i.status === "pending").length;
  const acceptedMatches = interests.filter((i) => i.status === "accepted").length;
  
  const scoreRequestsCount = interests.filter((i) => i.compatibilityScoreAtRequest != null).length;
  const avgCompatibility = scoreRequestsCount > 0
    ? Math.round(interests.reduce((acc, curr) => acc + (curr.compatibilityScoreAtRequest || 0), 0) / scoreRequestsCount)
    : 0;

  return (
    <div className="container">
      {/* Title */}
      <div style={{ marginBottom: "32px" }}>
        <h1 style={{ fontSize: "36px", fontWeight: "700", letterSpacing: "-0.03em" }}>Owner Workspace</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "16px" }}>Manage listings, review incoming interest, and check compatibility insights.</p>
      </div>

      {/* Subpage Tab Selection Bar */}
      <div style={{ display: "flex", gap: "12px", borderBottom: "1px solid var(--border)", marginBottom: "32px", paddingBottom: "12px", overflowX: "auto" }}>
        <button
          onClick={() => setActiveTab("dashboard")}
          style={{
            background: activeTab === "dashboard" ? "var(--primary)" : "transparent",
            color: activeTab === "dashboard" ? "white" : "var(--text-muted)",
            boxShadow: "none",
            padding: "8px 24px",
            fontSize: "14px",
            fontWeight: "700"
          }}
        >
          💼 Workspace Dashboard
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          style={{
            background: activeTab === "profile" ? "var(--primary)" : "transparent",
            color: activeTab === "profile" ? "white" : "var(--text-muted)",
            boxShadow: "none",
            padding: "8px 24px",
            fontSize: "14px",
            fontWeight: "700"
          }}
        >
          👤 Profile &amp; Reviews
        </button>
      </div>

      {activeTab === "profile" && (
        <ProfilePage userId={user?._id} isDashboard={true} />
      )}

      {activeTab === "dashboard" && (
        <>
          {/* Analytics grid cards instead of basic tables */}
          <div className="analytics-grid">
            <div className="stat-card">
              <div className="stat-value">{listings.length}</div>
              <div className="stat-label">Active Ads</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{pendingRequests}</div>
              <div className="stat-label">Pending Requests</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{acceptedMatches}</div>
              <div className="stat-label">Accepted Matches</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{avgCompatibility}%</div>
              <div className="stat-label">Avg Compatibility</div>
            </div>
          </div>

          {message && (
            <div style={{ padding: "12px 20px", background: "var(--success-light)", color: "var(--success)", borderRadius: "8px", marginBottom: "24px", fontWeight: "600", fontSize: "14px" }}>
              ✔ {message}
            </div>
          )}

          {/* Split creation/listing structure */}
          <div className="split-layout">
            {/* Left Column: Create Form */}
            <CreateListingForm
              form={form}
              setForm={setForm}
              createListing={createListing}
            />

            {/* Right Column: Listing Feeds & Incoming Requests */}
            <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
              {/* Interests Received section */}
              <ReceivedRequests
                interests={interests}
                respond={respond}
              />

              {/* Active ads catalog */}
              <MyPropertiesCatalog
                listings={listings}
                markFilled={markFilled}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
