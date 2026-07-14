import { Link } from "react-router-dom";
import { Search, Eye, Trash2 } from "lucide-react";

export default function ListingsTab({
  listings,
  listingSearch,
  setListingSearch,
  handleListingSearch,
  setDeleteConfirm,
}) {
  return (
    <div className="card" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "18px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "750", color: "var(--text-main)", margin: 0 }}>Property Listings Directory</h3>
        
        {/* Search form */}
        <form onSubmit={handleListingSearch} style={{ display: "flex", gap: "8px", border: "none", padding: 0, margin: 0 }}>
          <input
            type="text"
            placeholder="Search titles, localities, type..."
            value={listingSearch}
            onChange={(e) => setListingSearch(e.target.value)}
            style={{ fontSize: "12.5px", padding: "6px 12px", width: "240px" }}
          />
          <button type="submit" className="btn" style={{ padding: "6px 12px", fontSize: "12.5px", display: "flex", alignItems: "center", gap: "4px" }}>
            <Search size={13} />
            <span>Search</span>
          </button>
        </form>
      </div>

      {listings.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
          <span style={{ fontSize: "28px" }}>🏡</span>
          <p style={{ fontSize: "14px", fontWeight: "600", marginTop: "8px" }}>No property listings match search filters.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", fontSize: "11px", textTransform: "uppercase", color: "var(--text-muted)" }}>
                <th style={{ padding: "12px 16px" }}>Preview</th>
                <th style={{ padding: "12px 16px" }}>Title</th>
                <th style={{ padding: "12px 16px" }}>Society Name</th>
                <th style={{ padding: "12px 16px" }}>Owner</th>
                <th style={{ padding: "12px 16px" }}>Rent</th>
                <th style={{ padding: "12px 16px" }}>Status</th>
                <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l._id} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "13px", color: "var(--text-main)" }}>
                  <td style={{ padding: "10px 16px" }}>
                    <div style={{ width: "40px", height: "40px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border)", background: "#f8fafc" }}>
                      <img 
                        src={l.photos?.[0] || "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=120&auto=format&fit=crop&q=80"} 
                        alt={l.title} 
                        style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                      />
                    </div>
                  </td>
                  <td style={{ padding: "10px 16px", fontWeight: "700" }}>
                    <div>{l.title}</div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "500" }}>📍 {l.location}</span>
                  </td>
                  <td style={{ padding: "10px 16px" }}>{l.societyName || "N/A"}</td>
                  <td style={{ padding: "10px 16px", color: "var(--text-muted)" }}>{l.ownerId?.name || "Unknown"}</td>
                  <td style={{ padding: "10px 16px", fontWeight: "700", color: "var(--primary)" }}>₹{l.rent.toLocaleString()}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <span className={`badge ${l.status === "available" ? "badge-high" : "badge-low"}`} style={{ fontSize: "9px" }}>
                      {l.status}
                    </span>
                  </td>
                  <td style={{ padding: "10px 16px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <Link
                        to={`/listings/${l._id}`}
                        target="_blank"
                        className="btn"
                        style={{ padding: "5px 10px", background: "white", border: "1px solid var(--border)", color: "var(--text-main)", fontSize: "11px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        <Eye size={11} />
                        View
                      </Link>
                      <button
                        onClick={() => setDeleteConfirm({ type: "listing", id: l._id, name: l.title })}
                        style={{ padding: "5px 10px", background: "#fee2e2", border: "none", color: "#ef4444", fontSize: "11px" }}
                        title="Delete Listing"
                      >
                        <Trash2 size={11} style={{ marginRight: "4px" }} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
