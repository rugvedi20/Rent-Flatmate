import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import adminService from "../services/admin.service";
import StatsSection from "../components/admin/StatsSection";
import ActivityTab from "../components/admin/ActivityTab";
import UsersTab from "../components/admin/UsersTab";
import ListingsTab from "../components/admin/ListingsTab";
import UserDetailsModal from "../components/admin/UserDetailsModal";
import DeleteConfirmModal from "../components/admin/DeleteConfirmModal";
import { RefreshCw, ArrowLeft } from "lucide-react";

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

  const showToast = useCallback((msg, type = "success") => {
    setToast({ show: true, message: msg, type });
    setTimeout(() => setToast({ show: false, message: "", type: "success" }), 3500);
  }, []);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [s, u, l] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
        adminService.getListings(),
      ]);
      setStats(s);
      setUsers(u);
      setListings(l);
    } catch (err) {
      console.error("Admin dashboard load failed:", err);
      showToast("Failed to load platform stats.", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const handleUserSearch = async (e) => {
    if (e) e.preventDefault();
    try {
      const data = await adminService.getUsers(userSearch);
      setUsers(data);
    } catch {
      showToast("User search failed.", "error");
    }
  };

  const handleListingSearch = async (e) => {
    if (e) e.preventDefault();
    try {
      const data = await adminService.getListings(listingSearch);
      setListings(data);
    } catch {
      showToast("Listing search failed.", "error");
    }
  };

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const executeDeleteUser = async (id) => {
    try {
      await adminService.deleteUser(id);
      showToast("User account deleted successfully.");
      setDeleteConfirm(null);
      await loadAll();
    } catch {
      showToast("Failed to delete user.", "error");
    }
  };

  const executeDeleteListing = async (id) => {
    try {
      await adminService.deleteListing(id);
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

      {/* Stats Summary Cards Grid */}
      <StatsSection stats={stats} />

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
            <ActivityTab stats={stats} />
          )}

          {/* TAB 2: USER DIRECTORY MANAGEMENT TABLE */}
          {activeTab === "users" && (
            <UsersTab
              users={users}
              listings={listings}
              stats={stats}
              userSearch={userSearch}
              setUserSearch={setUserSearch}
              handleUserSearch={handleUserSearch}
              setSelectedUser={setSelectedUser}
              setDeleteConfirm={setDeleteConfirm}
              getInitials={getInitials}
            />
          )}

          {/* TAB 3: LISTINGS DIRECTORY MANAGEMENT TABLE */}
          {activeTab === "listings" && (
            <ListingsTab
              listings={listings}
              listingSearch={listingSearch}
              setListingSearch={setListingSearch}
              handleListingSearch={handleListingSearch}
              setDeleteConfirm={setDeleteConfirm}
            />
          )}
        </>
      )}

      {/* USER DETAILS MODAL OVERLAY */}
      <UserDetailsModal
        selectedUser={selectedUser}
        setSelectedUser={setSelectedUser}
        listings={listings}
        stats={stats}
        getInitials={getInitials}
      />

      {/* DELETE CONFIRMATION MODAL OVERLAY */}
      <DeleteConfirmModal
        deleteConfirm={deleteConfirm}
        setDeleteConfirm={setDeleteConfirm}
        executeDeleteUser={executeDeleteUser}
        executeDeleteListing={executeDeleteListing}
      />
    </div>
  );
}
