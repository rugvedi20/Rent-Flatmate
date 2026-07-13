import { useEffect, useState } from "react";
import api from "../services/api";

export default function OwnerDashboard() {
  const [listings, setListings] = useState([]);
  const [interests, setInterests] = useState([]);
  const [form, setForm] = useState({
    title: "", location: "", rent: "", availableFrom: "",
    roomType: "single", furnishing: "unfurnished", description: "",
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
    setForm({ title: "", location: "", rent: "", availableFrom: "", roomType: "single", furnishing: "unfurnished", description: "" });
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
    </div>
  );
}
