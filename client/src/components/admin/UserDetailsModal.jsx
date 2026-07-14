import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

export default function UserDetailsModal({
  selectedUser,
  setSelectedUser,
  listings,
  stats,
  getInitials,
}) {
  if (!selectedUser) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justify: "center", zIndex: 99999, justifyContent: "center" }}>
      <div className="card" style={{ maxWidth: "480px", width: "100%", padding: "28px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: "750", margin: 0 }}>System Account Details</h3>
          <button onClick={() => setSelectedUser(null)} style={{ background: "transparent", border: "none", fontSize: "16px", cursor: "pointer", color: "var(--text-muted)" }}>×</button>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "14px", background: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid var(--border)" }}>
          <div style={{ width: "42px", height: "42px", borderRadius: "50%", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "800" }}>
            {getInitials(selectedUser.name)}
          </div>
          <div>
            <strong style={{ fontSize: "15px", display: "block" }}>{selectedUser.name}</strong>
            <span style={{ fontSize: "12.5px", color: "var(--text-muted)" }}>Joined on {new Date(selectedUser.createdAt).toLocaleDateString("en-IN")}</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13.5px" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)", fontWeight: "600" }}>Email Address:</span>
            <span style={{ fontWeight: "700" }}>{selectedUser.email}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)", fontWeight: "600" }}>Account Role:</span>
            <span className="badge" style={{ textTransform: "capitalize", background: "var(--primary-light)", color: "var(--primary)" }}>{selectedUser.role}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ color: "var(--text-muted)", fontWeight: "600" }}>Status:</span>
            <span className="badge" style={{ background: selectedUser.isActive ? "#f0fdf4" : "#fef2f2", color: selectedUser.isActive ? "#16a34a" : "#ef4444" }}>
              {selectedUser.isActive ? "Active Account" : "Deactivated"}
            </span>
          </div>
        </div>

        {/* Owner listings details */}
        {selectedUser.role === "owner" && (
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px", marginTop: "12px" }}>
            <span style={{ color: "var(--text-muted)", fontWeight: "600", fontSize: "13px", display: "block", marginBottom: "8px" }}>Owned Properties:</span>
            {listings.filter(l => String(l.ownerId?._id || l.ownerId) === String(selectedUser._id)).length === 0 ? (
              <p style={{ fontStyle: "italic", fontSize: "12.5px", color: "var(--text-muted)", margin: 0 }}>No properties listed by this owner.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "120px", overflowY: "auto" }}>
                {listings.filter(l => String(l.ownerId?._id || l.ownerId) === String(selectedUser._id)).map(l => (
                  <div key={l._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "6px 10px", borderRadius: "6px", fontSize: "12.5px", border: "1px solid #f1f5f9" }}>
                    <span style={{ fontWeight: "600" }}>{l.title}</span>
                    <Link to={`/listings/${l._id}`} target="_blank" style={{ color: "var(--primary)", display: "flex", alignItems: "center", gap: "2px", textDecoration: "none", fontSize: "11px", fontWeight: "700" }}>
                      View <ExternalLink size={10} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tenant interests details */}
        {selectedUser.role === "tenant" && (
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px", marginTop: "12px" }}>
            <span style={{ color: "var(--text-muted)", fontWeight: "600", fontSize: "13px", display: "block", marginBottom: "8px" }}>Expressed Interests (Recent logs):</span>
            {stats?.recentActivity?.interests?.filter(i => String(i.tenantId?._id || i.tenantId) === String(selectedUser._id)).length === 0 ? (
              <p style={{ fontStyle: "italic", fontSize: "12.5px", color: "var(--text-muted)", margin: 0 }}>No recent interests recorded in platform logs.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "120px", overflowY: "auto" }}>
                {stats.recentActivity.interests.filter(i => String(i.tenantId?._id || i.tenantId) === String(selectedUser._id)).map(i => (
                  <div key={i._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "6px 10px", borderRadius: "6px", fontSize: "12.5px", border: "1px solid #f1f5f9" }}>
                    <span style={{ fontWeight: "600" }}>{i.listingId?.title || "Property"}</span>
                    <span className={`badge ${i.status === "accepted" ? "badge-high" : "badge-low"}`} style={{ fontSize: "9px" }}>{i.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <button 
          className="btn" 
          onClick={() => setSelectedUser(null)} 
          style={{ width: "100%", marginTop: "8px" }}
        >
          Close Details Window
        </button>
      </div>
    </div>
  );
}
