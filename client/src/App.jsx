import { useState } from "react";
import { Routes, Route, Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TenantDashboard from "./pages/TenantDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Chat from "./pages/Chat";
import Landing from "./pages/Landing";
import ProtectedRoute from "./components/ProtectedRoute";
import PropertyDetails from "./pages/PropertyDetails";
import ProfilePage from "./pages/ProfilePage";


export default function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [showNotif, setShowNotif] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  // Get initials for profile avatar
  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  };

  return (
    <>
      <nav>
        <Link to="/" className="nav-logo">
          <span style={{ fontSize: "22px" }}>✨</span>
          <span>NestAI</span>
        </Link>
        <div className="nav-links">
          {user?.role === "tenant" && (
            <>
              <Link to="/tenant" className="active">Explore &amp; Matches</Link>
              <Link to="/chat/active?receiverId=none">Messages</Link>
            </>
          )}
          {user?.role === "owner" && (
            <>
              <Link to="/owner" className="active">Workspace Dashboard</Link>
              <Link to="/chat/active?receiverId=none">Messages</Link>
            </>
          )}
          {user?.role === "admin" && <Link to="/admin">Admin Console</Link>}
        </div>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          {user ? (
            <>
              {/* Notification icon with Dropdown */}
              <div 
                style={{ position: "relative", cursor: "pointer", display: "flex", alignItems: "center" }}
                onClick={() => setShowNotif(!showNotif)}
              >
                <span style={{ fontSize: "20px" }}>🔔</span>
                {hasUnread && (
                  <span style={{ position: "absolute", top: "-2px", right: "-2px", width: "8px", height: "8px", borderRadius: "50%", background: "var(--danger)" }}></span>
                )}

                {showNotif && (
                  <div style={{
                    position: "absolute",
                    top: "40px",
                    right: "0",
                    width: "290px",
                    background: "#ffffff",
                    border: "1px solid var(--border)",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
                    zIndex: 1000,
                    padding: "16px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px"
                  }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)", paddingBottom: "8px", marginBottom: "4px" }}>
                      <strong style={{ fontSize: "13.5px", color: "var(--text-main)" }}>🔔 Activity Updates</strong>
                      {hasUnread && (
                        <button 
                          onClick={() => setHasUnread(false)}
                          style={{ background: "transparent", border: "none", color: "var(--primary)", fontSize: "11px", fontWeight: "750", cursor: "pointer", padding: 0, boxShadow: "none" }}
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "200px", overflowY: "auto", textAlign: "left" }}>
                      {user?.role === "tenant" ? (
                        <>
                          <div style={{ fontSize: "12px", color: "var(--text-main)", background: "#f8fafc", padding: "8px 10px", borderRadius: "8px", border: "1px solid #f1f5f9", lineHeight: "1.4" }}>
                            ✅ Your interest in <strong>Ganga Acropolis</strong> has been sent to the landlord.
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--text-main)", background: "#f8fafc", padding: "8px 10px", borderRadius: "8px", border: "1px solid #f1f5f9", lineHeight: "1.4" }}>
                            💬 Secure chat unlocked with <strong>Rahul Sharma</strong>.
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={{ fontSize: "12px", color: "var(--text-main)", background: "#f8fafc", padding: "8px 10px", borderRadius: "8px", border: "1px solid #f1f5f9", lineHeight: "1.4" }}>
                            ⚡ <strong>Vikram Singh</strong> expressed interest in Ganga Acropolis.
                          </div>
                          <div style={{ fontSize: "12px", color: "var(--text-main)", background: "#f8fafc", padding: "8px 10px", borderRadius: "8px", border: "1px solid #f1f5f9", lineHeight: "1.4" }}>
                            🏠 Your workspace listing <strong>Hinjewadi Room</strong> is verified.
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Clickable Profile Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div 
                  onClick={() => navigate(`/profile/${user._id}`)}
                  style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justify: "center", fontSize: "14px", fontWeight: "700", border: "1px solid rgba(79, 70, 229, 0.15)", justifyContent: "center", cursor: "pointer" }}
                  title="Profile & Preferences"
                >
                  {getInitials(user.name)}
                </div>
                <button onClick={logout} style={{ padding: "8px 14px", fontSize: "12px", background: "#f1f5f9", color: "#475569", boxShadow: "none" }}>
                  Sign Out
                </button>
              </div>
            </>
          ) : (
            <Link to="/login" className="btn" style={{ padding: "8px 20px" }}>Login</Link>
          )}
        </div>
      </nav>

      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/tenant"
          element={<ProtectedRoute allowedRoles={["tenant"]}><TenantDashboard /></ProtectedRoute>}
        />
        <Route
          path="/owner"
          element={<ProtectedRoute allowedRoles={["owner"]}><OwnerDashboard /></ProtectedRoute>}
        />
        <Route
          path="/admin"
          element={<ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>}
        />
        <Route
          path="/chat/:listingId"
          element={<ProtectedRoute><Chat /></ProtectedRoute>}
        />
        <Route
          path="/listings/:id"
          element={<ProtectedRoute><PropertyDetails /></ProtectedRoute>}
        />
        <Route
          path="/profile/:userId"
          element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
