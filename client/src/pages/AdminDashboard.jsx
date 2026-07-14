import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import {
  Users,
  Home,
  Inbox,
  CheckCircle,
  Search,
  Trash2,
  Eye,
  RefreshCw,
  UserCheck,
  ShieldAlert,
  ArrowLeft,
  ExternalLink,
  Info,
  Calendar,
  CheckSquare,
  Clock
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dashboard navigation tab: overview | users | listings
  const [activeTab, setActiveTab] = useState("overview");

  // Search filter states
  const [userSearch, setUserSearch] = useState("");
  const [listingSearch, setListingSearch] = useState("");

  // Toast alerts
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });

  // Detail & Delete modals states
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { type: 'user'|'listing', id: '', name: '' }

  const showToast = (msg, type = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [s, u, l] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/listings"),
      ]);
      setStats(s.data);
      setUsers(u.data);
      setListings(l.data);
    } catch (err) {
      console.error("Admin dashboard load failed:", err);
      showToast("Failed to load platform stats.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUserSearch = async (e) => {
    if (e) e.preventDefault();
    try {
      const { data } = await api.get(`/admin/users?search=${encodeURIComponent(userSearch)}`);
      setUsers(data);
    } catch {
      showToast("User search failed.", "error");
    }
  };

  const handleListingSearch = async (e) => {
    if (e) e.preventDefault();
    try {
      const { data } = await api.get(`/admin/listings?search=${encodeURIComponent(listingSearch)}`);
      setListings(data);
    } catch {
      showToast("Listing search failed.", "error");
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const executeDeleteUser = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      showToast("User account deleted successfully.");
      setDeleteConfirm(null);
      await loadAll();
    } catch {
      showToast("Failed to delete user.", "error");
    }
  };

  const executeDeleteListing = async (id) => {
    try {
      await api.delete(`/admin/listings/${id}`);
      showToast("Listing deleted successfully.");
      setDeleteConfirm(null);
      await loadAll();
    } catch {
      showToast("Failed to delete listing.", "error");
    }
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  };

  return (
    <div className="landing-container py-12" style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px" }}>
      {/* Toast Alert Header */}
      {toast.show && (
        <div 
          style={{
            position: "fixed",
            top: "24px",
            right: "24px",
            background: toast.type === "error" ? "#f43f5e" : "var(--primary)",
            color: "white",
            padding: "12px 24px",
            borderRadius: "10px",
            boxShadow: "var(--shadow-lg)",
            zIndex: 99999,
            fontWeight: "700",
            fontSize: "14px",
          }}
        >
          {toast.type === "error" ? "❌" : "👍"} {toast.message}
        </div>
      )}

      {/* Header Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <span style={{ fontSize: "11px", fontWeight: "800", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>System Operations</span>
          <h1 style={{ fontSize: "32px", fontWeight: "800", color: "var(--text-main)", marginTop: "4px" }}>Platform Admin Control Panel</h1>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => loadAll()}
            className="btn"
            style={{ background: "white", border: "1px solid var(--border)", color: "var(--text-main)", padding: "10px 16px", display: "flex", alignItems: "center", gap: "8px" }}
          >
            <RefreshCw size={14} />
            <span>Reload Overview</span>
          </button>
          <Link to="/" className="btn" style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
            <ArrowLeft size={14} />
            <span>Back to Portal</span>
          </Link>
        </div>
      </div>

      {/* Stats Summary Cards Grid (Displays when data loaded) */}
      {stats && (
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
      )}

      {/* Navigation Tabs bar */}
      <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid var(--border)", paddingBottom: "12px", marginBottom: "24px" }}>
        <button
          onClick={() => setActiveTab("overview")}
          className={`tab-btn ${activeTab === "overview" ? "active" : ""}`}
          style={{ padding: "8px 16px", fontSize: "13px", fontWeight: "700", border: "none", background: activeTab === "overview" ? "var(--primary-light)" : "transparent", color: activeTab === "overview" ? "var(--primary)" : "var(--text-muted)", borderRadius: "8px" }}
        >
          Activity Feed
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`tab-btn ${activeTab === "users" ? "active" : ""}`}
          style={{ padding: "8px 16px", fontSize: "13px", fontWeight: "700", border: "none", background: activeTab === "users" ? "var(--primary-light)" : "transparent", color: activeTab === "users" ? "var(--primary)" : "var(--text-muted)", borderRadius: "8px" }}
        >
          Users Directory ({users.length})
        </button>
        <button
          onClick={() => setActiveTab("listings")}
          className={`tab-btn ${activeTab === "listings" ? "active" : ""}`}
          style={{ padding: "8px 16px", fontSize: "13px", fontWeight: "700", border: "none", background: activeTab === "listings" ? "var(--primary-light)" : "transparent", color: activeTab === "listings" ? "var(--primary)" : "var(--text-muted)", borderRadius: "8px" }}
        >
          Properties Directory ({listings.length})
        </button>
      </div>

      {loading && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="skeleton-pulse" style={{ height: "180px", borderRadius: "16px" }} />
          <div className="skeleton-pulse" style={{ height: "300px", borderRadius: "16px" }} />
        </div>
      )}

      {!loading && (
        <>
          {/* TAB 1: OVERVIEW & RECENT ACTIVITY FEEDS */}
          {activeTab === "overview" && stats && (
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
          )}

          {/* TAB 2: USER DIRECTORY MANAGEMENT TABLE */}
          {activeTab === "users" && (
            <div className="card" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "18px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: "750", color: "var(--text-main)", margin: 0 }}>Active User Directory</h3>
                
                {/* Search form */}
                <form onSubmit={handleUserSearch} style={{ display: "flex", gap: "8px", border: "none", padding: 0, margin: 0 }}>
                  <input
                    type="text"
                    placeholder="Search name, email or role..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    style={{ fontSize: "12.5px", padding: "6px 12px", width: "240px" }}
                  />
                  <button type="submit" className="btn" style={{ padding: "6px 12px", fontSize: "12.5px", display: "flex", alignItems: "center", gap: "4px" }}>
                    <Search size={13} />
                    <span>Search</span>
                  </button>
                </form>
              </div>

              {users.length === 0 ? (
                <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
                  <span style={{ fontSize: "28px" }}>👥</span>
                  <p style={{ fontSize: "14px", fontWeight: "600", marginTop: "8px" }}>No users match the search query.</p>
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--border)", fontSize: "11px", textTransform: "uppercase", color: "var(--text-muted)" }}>
                        <th style={{ padding: "12px 16px" }}>Avatar</th>
                        <th style={{ padding: "12px 16px" }}>Name</th>
                        <th style={{ padding: "12px 16px" }}>Email</th>
                        <th style={{ padding: "12px 16px" }}>Role</th>
                        <th style={{ padding: "12px 16px" }}>Joined Date</th>
                        <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "13px", color: "var(--text-main)" }}>
                          <td style={{ padding: "10px 16px" }}>
                            <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700" }}>
                              {getInitials(u.name)}
                            </div>
                          </td>
                          <td style={{ padding: "10px 16px", fontWeight: "700" }}>{u.name}</td>
                          <td style={{ padding: "10px 16px", color: "var(--text-muted)" }}>{u.email}</td>
                          <td style={{ padding: "10px 16px" }}>
                            <span className="badge" style={{ background: u.role === "admin" ? "#fef2f2" : u.role === "owner" ? "#f0fdf4" : "#ecfeff", color: u.role === "admin" ? "#ef4444" : u.role === "owner" ? "#16a34a" : "#0891b2", textTransform: "capitalize", fontSize: "10px", fontWeight: "700" }}>
                              {u.role}
                            </span>
                            {u.role === "owner" && (
                              <span style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", fontWeight: "600" }}>
                                🏠 {listings.filter(l => String(l.ownerId?._id || l.ownerId) === String(u._id)).length} Ad(s)
                              </span>
                            )}
                            {u.role === "tenant" && (
                              <span style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", fontWeight: "600" }}>
                                ⚡ {stats?.recentActivity?.interests?.filter(i => String(i.tenantId?._id || i.tenantId) === String(u._id)).length} Recent Interest(s)
                              </span>
                            )}
                          </td>
                          <td style={{ padding: "10px 16px", color: "var(--text-muted)" }}>
                            {new Date(u.createdAt).toLocaleDateString("en-IN")}
                          </td>
                          <td style={{ padding: "10px 16px", textAlign: "right" }}>
                            <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                              <button
                                onClick={() => setSelectedUser(u)}
                                style={{ padding: "5px 10px", background: "white", border: "1px solid var(--border)", color: "var(--text-main)", fontSize: "11px" }}
                                title="View User Details"
                              >
                                <Eye size={11} style={{ marginRight: "4px" }} />
                                Details
                              </button>
                              {u.role !== "admin" && (
                                <button
                                  onClick={() => setDeleteConfirm({ type: "user", id: u._id, name: u.name })}
                                  style={{ padding: "5px 10px", background: "#fee2e2", border: "none", color: "#ef4444", fontSize: "11px" }}
                                  title="Delete User Account"
                                >
                                  <Trash2 size={11} style={{ marginRight: "4px" }} />
                                  Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: LISTINGS DIRECTORY MANAGEMENT TABLE */}
          {activeTab === "listings" && (
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
                                to={`/listing/${l._id}`}
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
          )}
        </>
      )}

      {/* USER DETAILS MODAL OVERLAY */}
      {selectedUser && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999 }}>
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
                        <Link to={`/listing/${l._id}`} target="_blank" style={{ color: "var(--primary)", display: "flex", alignItems: "center", gap: "2px", textDecoration: "none", fontSize: "11px", fontWeight: "700" }}>
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
      )}

      {/* DELETE CONFIRMATION MODAL OVERLAY */}
      {deleteConfirm && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 99999 }}>
          <div className="card" style={{ maxWidth: "400px", width: "100%", padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#f43f5e" }}>
              <ShieldAlert size={22} />
              <h3 style={{ fontSize: "16px", fontWeight: "800", margin: 0 }}>Confirm Dangerous Action</h3>
            </div>
            
            <p style={{ fontSize: "13.5px", color: "var(--text-muted)", margin: 0, lineHeight: "1.5" }}>
              Are you sure you want to permanently delete the {deleteConfirm.type} <strong style={{ color: "var(--text-main)" }}>"{deleteConfirm.name}"</strong>? This process cannot be undone.
            </p>

            <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
              <button 
                onClick={() => setDeleteConfirm(null)} 
                className="btn"
                style={{ flex: 1, background: "white", border: "1px solid var(--border)", color: "var(--text-main)" }}
              >
                Cancel
              </button>
              <button 
                onClick={() => {
                  if (deleteConfirm.type === "user") {
                    executeDeleteUser(deleteConfirm.id);
                  } else {
                    executeDeleteListing(deleteConfirm.id);
                  }
                }}
                className="btn"
                style={{ flex: 1, background: "#ef4444" }}
              >
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
