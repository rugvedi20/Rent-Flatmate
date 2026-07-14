import { useEffect, useState } from "react";
import api from "../services/api";
import ProfilePage from "./ProfilePage";
import { useAuth } from "../context/AuthContext";
import MapComponent from "../components/MapComponent";

const PROPERTY_PHOTO_PRESETS = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&auto=format&fit=crop&q=80"
];

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

  const loadListings = async () => {
    try {
      const { data } = await api.get("/listings/my");
      setListings(data);
    } catch {
      // ignore
    }
  };

  const loadInterests = async () => {
    try {
      const { data } = await api.get("/interest/received");
      setInterests(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadListings();
    loadInterests();
  }, []);

  const createListing = async (e) => {
    e.preventDefault();
    await api.post("/listings", form);
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
  };

  const markFilled = async (id) => {
    await api.put(`/listings/${id}/fill`);
    loadListings();
  };

  const respond = async (id, status) => {
    await api.put(`/interest/${id}`, { status });
    loadInterests();
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
        <div className="card" style={{ padding: "24px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px" }}>Create a Room Listing</h2>
          <form onSubmit={createListing} style={{ border: "none", padding: 0, boxShadow: "none", margin: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Title</label>
              <input placeholder="e.g. Spacious 1BHK in Baner" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Locality/Address</label>
              <input placeholder="e.g. Baner, Pune" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
            </div>

            {/* Leaflet CDN Mapping Tool for Listing Location Coordinates */}
            <div style={{ marginBottom: "10px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Pin Location on Map</label>
              <MapComponent
                mode="edit"
                lat={form.locationCoords.coordinates[1]}
                lng={form.locationCoords.coordinates[0]}
                initialSearch={form.location}
                onChange={({ lat, lng, address }) => {
                  setForm(prev => ({
                    ...prev,
                    locationCoords: { type: "Point", coordinates: [lng, lat] },
                    location: address
                  }));
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Society Name</label>
                <input placeholder="e.g. Ganga Acropolis" value={form.societyName} onChange={(e) => setForm({ ...form, societyName: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Area / Locality</label>
                <input placeholder="e.g. Baner" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Landmark</label>
                <input placeholder="e.g. Near Balewadi High Street" value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Pincode</label>
                <input placeholder="e.g. 411045" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>City</label>
                <input placeholder="Pune" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>State</label>
                <input placeholder="Maharashtra" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Rent (₹/mo)</label>
                <input type="number" placeholder="Rent Amount" value={form.rent} onChange={(e) => setForm({ ...form, rent: e.target.value })} required />
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Availability Date</label>
                <input type="date" value={form.availableFrom} onChange={(e) => setForm({ ...form, availableFrom: e.target.value })} required />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Room Type</label>
                <select value={form.roomType} onChange={(e) => setForm({ ...form, roomType: e.target.value })}>
                  <option value="single">Single Room</option>
                  <option value="shared">Shared Room</option>
                  <option value="1bhk">1BHK</option>
                  <option value="2bhk">2BHK</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Furnishing</label>
                <select value={form.furnishing} onChange={(e) => setForm({ ...form, furnishing: e.target.value })}>
                  <option value="furnished">Furnished</option>
                  <option value="semi-furnished">Semi-furnished</option>
                  <option value="unfurnished">Unfurnished</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Description &amp; Rules</label>
              <textarea placeholder="e.g. Near highway, no pets allowed, washing machine present..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ height: "100px" }} />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Property Images</label>
              
              {/* Selected photos list */}
              {form.photos && form.photos.length > 0 && (
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
                  {form.photos.map((photo, idx) => (
                    <div key={idx} style={{ position: "relative", width: "60px", height: "60px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border)" }}>
                      <img src={photo} alt={`Upload ${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button
                        type="button"
                        onClick={() => setForm(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== idx) }))}
                        style={{
                          position: "absolute",
                          top: "2px",
                          right: "2px",
                          width: "16px",
                          height: "16px",
                          background: "rgba(0,0,0,0.6)",
                          color: "white",
                          borderRadius: "50%",
                          border: "none",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "10px",
                          cursor: "pointer",
                          padding: 0
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Preset selection clickables */}
              <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px", fontWeight: "600" }}>Choose from presets:</span>
              <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                {PROPERTY_PHOTO_PRESETS.map((preset, idx) => {
                  const isSelected = form.photos.includes(preset);
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (isSelected) {
                          setForm(prev => ({ ...prev, photos: prev.photos.filter(p => p !== preset) }));
                        } else {
                          setForm(prev => ({ ...prev, photos: [...prev.photos, preset] }));
                        }
                      }}
                      style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "6px",
                        overflow: "hidden",
                        cursor: "pointer",
                        border: isSelected ? "2px solid var(--primary)" : "1px solid var(--border)",
                        position: "relative",
                        opacity: isSelected ? 1 : 0.6
                      }}
                    >
                      <img src={preset} alt={`Preset ${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      {isSelected && (
                        <div style={{ position: "absolute", bottom: "2px", right: "2px", width: "12px", height: "12px", borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", color: "white" }}>
                          ✓
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Custom url input box */}
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  id="customPhotoInput"
                  placeholder="Or paste property image URL..."
                  style={{ flex: 1, fontSize: "12.5px", padding: "8px 10px" }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const val = e.target.value.trim();
                      if (val) {
                        setForm(prev => ({ ...prev, photos: [...prev.photos, val] }));
                        e.target.value = "";
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById("customPhotoInput");
                    const val = el ? el.value.trim() : "";
                    if (val) {
                      setForm(prev => ({ ...prev, photos: [...prev.photos, val] }));
                      el.value = "";
                    }
                  }}
                  className="btn"
                  style={{ padding: "8px 12px", fontSize: "12px", background: "white", color: "var(--text-main)", border: "1px solid var(--border)" }}
                >
                  Add
                </button>
              </div>
            </div>

            <button type="submit" style={{ width: "100%", marginTop: "10px" }}>Publish Ad</button>
          </form>
        </div>

        {/* Right Column: Listing Feeds & Incoming Requests */}
        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          
          {/* Interests Received section */}
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>Received Requests</h2>
            {interests.length === 0 && (
              <div style={{ padding: "30px", background: "white", borderRadius: "16px", border: "1px solid var(--border)", textAlign: "center", color: "var(--text-muted)" }}>
                <span style={{ fontSize: "28px" }}>📥</span>
                <p style={{ marginTop: "8px", fontWeight: "500" }}>No matching requests received yet.</p>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {interests.map((i) => {
                let compBadgeClass = "badge-low";
                if (i.compatibilityScoreAtRequest >= 85) compBadgeClass = "badge-high";
                else if (i.compatibilityScoreAtRequest >= 70) compBadgeClass = "badge-high";
                else if (i.compatibilityScoreAtRequest >= 50) compBadgeClass = "badge-mid";

                return (
                  <div className="card" key={i._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", padding: "20px", margin: 0 }}>
                    <div>
                      <p style={{ margin: 0, fontWeight: "700", fontSize: "15px" }}>👤 {i.tenantId?.name || "Tenant"}</p>
                      <p style={{ margin: "4px 0", fontSize: "13px", color: "var(--text-muted)" }}>
                        Ad: <strong style={{ color: "var(--text-main)" }}>{i.listingId?.title}</strong>
                      </p>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "8px" }}>
                        <span className="badge" style={{ background: i.status === "accepted" ? "var(--success-light)" : i.status === "rejected" ? "var(--danger-light)" : "rgba(226,232,240,0.8)", color: i.status === "accepted" ? "var(--success)" : i.status === "rejected" ? "var(--danger)" : "var(--text-muted)" }}>
                          {i.status}
                        </span>
                        {i.compatibilityScoreAtRequest != null && (
                          <span className={`badge ${compBadgeClass}`} style={{ fontSize: "11px", fontWeight: "700" }}>
                            🔥 {i.compatibilityScoreAtRequest}% Match Score
                          </span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {i.status === "pending" && (
                        <>
                          <button onClick={() => respond(i._id, "accepted")} style={{ background: "var(--success)", boxShadow: "none", padding: "8px 16px" }}>Accept</button>
                          <button onClick={() => respond(i._id, "rejected")} style={{ background: "var(--danger)", boxShadow: "none", padding: "8px 16px" }}>Reject</button>
                        </>
                      )}
                      {i.status === "accepted" && (
                        <a href={`/chat/${i.listingId?._id}?receiverId=${i.tenantId?._id}`} className="btn" style={{ background: "var(--primary)", color: "white", boxShadow: "none", padding: "8px 16px" }}>
                          💬 Start Chat
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active ads catalog */}
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>My Properties Catalog</h2>
            {listings.length === 0 && <p style={{ color: "var(--text-muted)" }}>No active rooms published yet.</p>}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              {listings.map((l) => (
                <div className="card" key={l._id} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", margin: 0, padding: "20px" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700" }}>{l.title}</h3>
                      <span className="badge" style={{ background: l.status === "available" ? "var(--success-light)" : "rgba(226,232,240,0.8)", color: l.status === "available" ? "var(--success)" : "var(--text-muted)", fontSize: "11px" }}>
                        {l.status}
                      </span>
                    </div>
                    <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0" }}>📍 {l.location}</p>
                    <p style={{ fontWeight: "700", color: "var(--primary)", fontSize: "16px", margin: "8px 0" }}>₹{l.rent}/mo</p>
                  </div>
                  {l.status === "available" && (
                    <button onClick={() => markFilled(l._id)} style={{ width: "100%", background: "#475569", color: "white", boxShadow: "none", padding: "8px", borderRadius: "10px", marginTop: "12px" }}>
                      Mark Ad as Filled
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
      </>
      )}
    </div>
  );
}
