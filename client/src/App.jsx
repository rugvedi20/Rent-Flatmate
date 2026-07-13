import { Routes, Route, Link, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import TenantDashboard from "./pages/TenantDashboard";
import OwnerDashboard from "./pages/OwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Chat from "./pages/Chat";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  const { user, logout } = useAuth();

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
              {/* Notification icon placeholder */}
              <div style={{ position: "relative", cursor: "pointer", display: "flex", alignItems: "center" }}>
                <span style={{ fontSize: "20px" }}>🔔</span>
                <span style={{ position: "absolute", top: "-2px", right: "-2px", width: "8px", height: "8px", borderRadius: "50%", background: "var(--danger)" }}></span>
              </div>
              
              {/* Profile Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justify: "center", fontSize: "14px", fontWeight: "700", border: "1px solid rgba(79, 70, 229, 0.15)", justifyContent: "center" }}>
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
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}
