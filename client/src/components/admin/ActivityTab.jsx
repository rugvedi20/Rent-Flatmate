import { Users, Home, Inbox, Clock } from "lucide-react";

export default function ActivityTab({ stats }) {
  if (!stats) return null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
      {/* New Users */}
      <div className="card" style={{ padding: "20px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: "750", color: "var(--text-main)", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Users size={16} style={{ color: "var(--primary)" }} />
          <span>Recently Registered Users</span>
        </h3>
        {stats.recentActivity?.users?.length === 0 ? (
          <p style={{ fontStyle: "italic", fontSize: "13px", color: "var(--text-muted)" }}>No new users registered recently.</p>
        ) : (
          stats.recentActivity.users.map((u) => (
            <div key={u._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px", marginBottom: "10px" }}>
              <div>
                <strong style={{ fontSize: "13px", color: "var(--text-main)" }}>{u.name}</strong>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>{u.email} · <span style={{ textTransform: "capitalize", fontWeight: "600" }}>{u.role}</span></div>
              </div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                <Clock size={10} />
                {new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
            </div>
          ))
        )}
      </div>

      {/* New Listings */}
      <div className="card" style={{ padding: "20px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: "750", color: "var(--text-main)", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Home size={16} style={{ color: "var(--primary)" }} />
          <span>Recently Added Properties</span>
        </h3>
        {stats.recentActivity?.listings?.length === 0 ? (
          <p style={{ fontStyle: "italic", fontSize: "13px", color: "var(--text-muted)" }}>No new property listings added recently.</p>
        ) : (
          stats.recentActivity.listings.map((l) => (
            <div key={l._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px", marginBottom: "10px" }}>
              <div>
                <strong style={{ fontSize: "13px", color: "var(--text-main)", display: "block" }}>{l.title}</strong>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>{l.location} · ₹{l.rent.toLocaleString()}</span>
              </div>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                <Clock size={10} />
                {new Date(l.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Recent Interests */}
      <div className="card" style={{ padding: "20px" }}>
        <h3 style={{ fontSize: "15px", fontWeight: "750", color: "var(--text-main)", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Inbox size={16} style={{ color: "var(--primary)" }} />
          <span>Recent Interest Requests</span>
        </h3>
        {stats.recentActivity?.interests?.length === 0 ? (
          <p style={{ fontStyle: "italic", fontSize: "13px", color: "var(--text-muted)" }}>No interest requests sent recently.</p>
        ) : (
          stats.recentActivity.interests.map((i) => (
            <div key={i._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px", marginBottom: "10px" }}>
              <div>
                <strong style={{ fontSize: "13.5px", color: "var(--text-main)", display: "block" }}>{i.tenantId?.name || "Tenant"}</strong>
                <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Room: {i.listingId?.title || "Listing"}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                <span className={`badge ${i.status === "accepted" ? "badge-high" : i.status === "rejected" ? "badge-low" : ""}`} style={{ fontSize: "9px", padding: "2px 6px" }}>
                  {i.status}
                </span>
                <span style={{ fontSize: "10px", color: "var(--text-muted)" }}>{new Date(i.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
