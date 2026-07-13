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

  return (
    <>
      <nav>
        <strong>Rent & Flatmate Finder</strong>
        {user?.role === "tenant" && <Link to="/tenant">Dashboard</Link>}
        {user?.role === "owner" && <Link to="/owner">Dashboard</Link>}
        {user?.role === "admin" && <Link to="/admin">Admin</Link>}
        <div style={{ marginLeft: "auto" }}>
          {user ? (
            <button onClick={logout}>Logout ({user.name})</button>
          ) : (
            <Link to="/login">Login</Link>
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
