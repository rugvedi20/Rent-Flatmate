import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "tenant" });
  const [error, setError] = useState("");
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const user = await register(form);
      if (user.role === "owner") navigate("/owner");
      else if (user.role === "tenant") navigate("/tenant");
      else navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "85vh", padding: "20px" }}>
      <div className="card" style={{ maxWidth: "440px", width: "100%", padding: "40px 32px", background: "white", borderRadius: "24px" }}>
        <h2 style={{ fontSize: "28px", fontWeight: "700", textAlign: "center", marginBottom: "8px", color: "var(--text-main)" }}>Create Account</h2>
        <p style={{ color: "var(--text-muted)", fontSize: "14px", textAlign: "center", marginBottom: "28px" }}>Join the premium room rental &amp; flatmate matcher.</p>
        
        <form onSubmit={handleSubmit} style={{ border: "none", boxShadow: "none", padding: 0, margin: 0, gap: "16px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Full Name</label>
            <input name="name" placeholder="John Doe" value={form.name} onChange={handleChange} required style={{ marginTop: "4px" }} />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Email Address</label>
            <input name="email" type="email" placeholder="email@example.com" value={form.email} onChange={handleChange} required style={{ marginTop: "4px" }} />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Password</label>
            <input name="password" type="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required minLength={6} style={{ marginTop: "4px" }} />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Your Profile Role</label>
            <select name="role" value={form.role} onChange={handleChange} style={{ marginTop: "4px" }}>
              <option value="tenant">Tenant (Looking for Room)</option>
              <option value="owner">Owner (Listing a Room)</option>
            </select>
          </div>
          
          {error && (
            <p style={{ color: "var(--danger)", background: "var(--danger-light)", padding: "10px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", textAlign: "center", margin: 0 }}>
              ⚠️ {error}
            </p>
          )}
          
          <button type="submit" style={{ width: "100%", marginTop: "8px" }}>Get Started</button>
        </form>
        
        <p style={{ color: "var(--text-muted)", fontSize: "14px", textAlign: "center", marginTop: "24px" }}>
          Already have an account? <Link to="/login" style={{ color: "var(--primary)", fontWeight: "600", textDecoration: "none" }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
