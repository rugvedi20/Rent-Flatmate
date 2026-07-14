import { Users, UserCheck, Home, Inbox, CheckCircle, CheckSquare } from "lucide-react";

export default function StatsSection({ stats }) {
  if (!stats) return null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "14px", marginBottom: "28px" }}>
      {/* Total Users */}
      <div style={{ background: "white", border: "1px solid var(--border)", padding: "16px", borderRadius: "14px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#eff6ff", color: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Users size={18} />
        </div>
        <div>
          <span style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", display: "block" }}>Total Users</span>
          <strong style={{ fontSize: "18px", color: "var(--text-main)", display: "block" }}>{stats.totalUsers}</strong>
        </div>
      </div>

      {/* Owners */}
      <div style={{ background: "white", border: "1px solid var(--border)", padding: "16px", borderRadius: "14px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#f0fdf4", color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <UserCheck size={18} />
        </div>
        <div>
          <span style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", display: "block" }}>Owners</span>
          <strong style={{ fontSize: "18px", color: "var(--text-main)", display: "block" }}>{stats.totalOwners}</strong>
        </div>
      </div>

      {/* Tenants */}
      <div style={{ background: "white", border: "1px solid var(--border)", padding: "16px", borderRadius: "14px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#ecfeff", color: "#06b6d4", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Users size={18} />
        </div>
        <div>
          <span style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", display: "block" }}>Tenants</span>
          <strong style={{ fontSize: "18px", color: "var(--text-main)", display: "block" }}>{stats.totalTenants}</strong>
        </div>
      </div>

      {/* Total Listings */}
      <div style={{ background: "white", border: "1px solid var(--border)", padding: "16px", borderRadius: "14px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#e0e7ff", color: "#4f46e5", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Home size={18} />
        </div>
        <div>
          <span style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", display: "block" }}>Total Ads</span>
          <strong style={{ fontSize: "18px", color: "var(--text-main)", display: "block" }}>{stats.totalListings}</strong>
        </div>
      </div>

      {/* Active Listings */}
      <div style={{ background: "white", border: "1px solid var(--border)", padding: "16px", borderRadius: "14px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#f0fdf4", color: "#16a34a", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CheckSquare size={18} />
        </div>
        <div>
          <span style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", display: "block" }}>Active Ads</span>
          <strong style={{ fontSize: "18px", color: "var(--text-main)", display: "block" }}>{stats.activeListings}</strong>
        </div>
      </div>

      {/* Interest Requests */}
      <div style={{ background: "white", border: "1px solid var(--border)", padding: "16px", borderRadius: "14px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#fffbeb", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Inbox size={18} />
        </div>
        <div>
          <span style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", display: "block" }}>Interests</span>
          <strong style={{ fontSize: "18px", color: "var(--text-main)", display: "block" }}>{stats.totalInterests}</strong>
        </div>
      </div>

      {/* Accepted Requests */}
      <div style={{ background: "white", border: "1px solid var(--border)", padding: "16px", borderRadius: "14px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "var(--shadow-sm)" }}>
        <div style={{ width: "38px", height: "38px", borderRadius: "10px", background: "#f0fdf4", color: "#15803d", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CheckCircle size={18} />
        </div>
        <div>
          <span style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", color: "var(--text-muted)", display: "block" }}>Accepted</span>
          <strong style={{ fontSize: "18px", color: "var(--text-main)", display: "block" }}>{stats.acceptedInterests}</strong>
        </div>
      </div>
    </div>
  );
}
