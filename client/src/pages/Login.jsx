import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await login(email, password);
      if (user.role === "owner") navigate("/owner");
      else if (user.role === "tenant") navigate("/tenant");
      else navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", padding: "20px" }}>
      <div className="card" style={{ maxWidth: "420px", width: "100%", padding: "40px 32px", background: "white", borderRadius: "24px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "700", textAlign: "center", marginBottom: "8px", color: "var(--text-main)" }}>Welcome Back</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", textAlign: "center", marginBottom: "28px" }}>Sign in to continue matching flatmates.</p>
        
        <form onSubmit={handleSubmit} style={{ border: "none", boxShadow: "none", padding: 0, margin: 0, gap: "16px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Email Address</label>
            <input type="email" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ marginTop: "4px" }} />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Password</label>
            <input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ marginTop: "4px" }} />
          </div>
          
          {error && (
            <p style={{ color: "var(--danger)", background: "var(--danger-light)", padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", textAlign: "center", margin: 0 }}>
              ⚠️ {error}
            </p>
          )}
          
          <button type="submit" style={{ width: "100%", marginTop: "8px" }}>Sign In</button>
        </form>
        
        <p style={{ color: "var(--text-muted)", fontSize: "14px", textAlign: "center", marginTop: "24px" }}>
          Don't have an account? <Link to="/register" style={{ color: "var(--primary)", fontWeight: "600", textDecoration: "none" }}>Register</Link>
        </p>
      </div>
    </div>
  );
}
