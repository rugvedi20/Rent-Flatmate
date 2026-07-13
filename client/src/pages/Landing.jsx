import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, Search, Compass, ShieldCheck, Heart, ArrowRight } from "lucide-react";
import api from "../services/api";

export default function Landing() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  const suggestionChips = [
    "Baner",
    "Under ₹10K",
    "Furnished room in Hinjewadi",
    "1BHK in Wakad",
    "Room with Parking",
    "Koregaon Park"
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/tenant?search=${encodeURIComponent(query.trim())}`);
    } else {
      navigate("/tenant");
    }
  };

  const handleChipClick = (chip) => {
    navigate(`/tenant?search=${encodeURIComponent(chip)}`);
  };

  useEffect(() => {
    // Load first 3 available listings
    api.get("/listings", { params: { limit: 3 } })
      .then(({ data }) => {
        setFeatured(data.listings || []);
      })
      .catch(() => {
        // Fallback mock properties if server fails
        setFeatured([
          { _id: "1", title: "Premium 1BHK Flat in Baner", location: "Baner, Pune", rent: 16000, roomType: "1bhk", furnishing: "furnished", description: "Modern studio room in gated society" },
          { _id: "2", title: "Cozy Single Suite Koregaon Park", location: "Koregaon Park, Pune", rent: 12000, roomType: "single", furnishing: "furnished", description: "Private room in premium lane" },
          { _id: "3", title: "Affordable Single Bed in Wakad", location: "Wakad, Pune", rent: 7000, roomType: "single", furnishing: "semi-furnished", description: "Near metro stop and tech park" }
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: "var(--background)", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      
      {/* Hero Section */}
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "100px 24px 60px", textRendering: "optimizeLegibility" }}>
        
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: "var(--primary-light)", color: "var(--primary)", padding: "6px 16px", borderRadius: "99px", fontSize: "12.5px", fontWeight: "700" }}
          >
            <Sparkles size={14} />
            <span>AI-First PropTech Platform</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ fontSize: "56px", fontWeight: "800", color: "var(--text-main)", letterSpacing: "-0.03em", lineHeight: 1.1, maxWidth: "780px" }}
          >
            Find the perfect room, <br/>
            <span style={{ color: "var(--primary)" }}>not just a place to stay.</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ fontSize: "18px", color: "var(--text-muted)", maxWidth: "580px", margin: "8px 0 24px", lineHeight: 1.6 }}
          >
            NestAI combines geospatial location parsing, budget rules, and Llama 3 semantic scoring to recommend roommates and rooms that fit your lifestyle.
          </motion.p>

          {/* AI Search Prompt Bar */}
          <motion.form 
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            onSubmit={handleSearchSubmit}
            style={{ 
              width: "100%", 
              maxWidth: "680px", 
              display: "flex", 
              background: "white", 
              border: "1px solid var(--border)", 
              borderRadius: "20px", 
              padding: "8px 12px", 
              alignItems: "center",
              boxShadow: "var(--shadow-lg)",
              gap: "10px"
            }}
          >
            <Search size={20} style={{ color: "var(--text-muted)", marginLeft: "8px" }} />
            <input 
              placeholder="e.g. furnished single room in Baner with parking under 12k..." 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{ border: "none", boxShadow: "none", background: "transparent", padding: "10px", fontSize: "15px" }}
            />
            <button type="submit" style={{ padding: "12px 28px", borderRadius: "14px", flexShrink: 0 }}>
              Search
            </button>
          </motion.form>

          {/* Suggestion Chips */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px", maxWidth: "680px", marginTop: "16px" }}
          >
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleChipClick(chip)}
                style={{ 
                  background: "white", 
                  color: "var(--text-main)", 
                  border: "1px solid var(--border)", 
                  padding: "6px 14px", 
                  borderRadius: "99px", 
                  fontSize: "12px", 
                  fontWeight: "500",
                  boxShadow: "var(--shadow-sm)",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
                className="chip"
              >
                {chip}
              </button>
            ))}
          </motion.div>

        </div>

      </div>

      {/* Feature stats cards section */}
      <div style={{ maxWidth: "1100px", margin: "40px auto 80px", width: "100%", padding: "0 24px" }}>
        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
          
          <div className="glass-card" style={{ padding: "30px", margin: 0 }}>
            <div style={{ width: "40px", height: "40px", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justify: "center", borderRadius: "10px", marginBottom: "16px", justifyContent: "center" }}>
              <Compass size={20} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>Geospatial Matching</h3>
            <p style={{ fontSize: "13.5px", color: "var(--text-muted)", margin: 0 }}>
              Calculates precise distances between preferred target locations and listing addresses using distance bands.
            </p>
          </div>

          <div className="glass-card" style={{ padding: "30px", margin: 0 }}>
            <div style={{ width: "40px", height: "40px", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justify: "center", borderRadius: "10px", marginBottom: "16px", justifyContent: "center" }}>
              <Sparkles size={20} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>Groq Llama 3 Scorer</h3>
            <p style={{ fontSize: "13.5px", color: "var(--text-muted)", margin: 0 }}>
              Semantic analyzer evaluates custom description preferences to output detailed match explanation pros &amp; cons.
            </p>
          </div>

          <div className="glass-card" style={{ padding: "30px", margin: 0 }}>
            <div style={{ width: "40px", height: "40px", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justify: "center", borderRadius: "10px", marginBottom: "16px", justifyContent: "center" }}>
              <ShieldCheck size={20} />
            </div>
            <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "8px" }}>Trust &amp; Gated Scores</h3>
            <p style={{ fontSize: "13.5px", color: "var(--text-muted)", margin: 0 }}>
              Verifies host identities, gated society parameters, and responsiveness rates to offer secure roommate search.
            </p>
          </div>

        </div>

      </div>

      {/* Featured Properties Showcase */}
      <div style={{ background: "#ffffff", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "80px 0" }}>
        <div className="container">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
            <div>
              <h2 style={{ fontSize: "28px", fontWeight: "800", color: "var(--text-main)" }}>Featured Nestings</h2>
              <p style={{ color: "var(--text-muted)", fontSize: "14.5px", margin: "4px 0" }}>Redefining student and professional living arrangements across Pune.</p>
            </div>
            <Link to="/tenant" style={{ fontSize: "14px", fontWeight: "700", color: "var(--primary)", textDecoration: "none", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>View All Properties</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
              <div className="skeleton-card skeleton" />
              <div className="skeleton-card skeleton" />
              <div className="skeleton-card skeleton" />
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px" }}>
              {featured.map((f) => (
                <div key={f._id} className="glass-card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", height: "100%", margin: 0 }}>
                  <div style={{ height: "180px", background: "#f3f4f6", overflow: "hidden" }}>
                    <img 
                      src={
                        f.photos && f.photos.length > 0 
                          ? f.photos[0] 
                          : "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=500"
                      } 
                      alt={f.title} 
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </div>
                  <div style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1, gap: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "15px", fontWeight: "700", color: "var(--primary)" }}>₹{f.rent.toLocaleString()}/mo</span>
                      <span style={{ fontSize: "11px", fontWeight: "600", textTransform: "capitalize", background: "#f3f4f6", padding: "2px 8px", borderRadius: "4px" }}>{f.roomType}</span>
                    </div>
                    <h3 style={{ fontSize: "15.5px", fontWeight: "700", margin: 0 }}>{f.title}</h3>
                    <p style={{ fontSize: "12.5px", color: "var(--text-muted)", margin: 0 }}>📍 {f.location}</p>
                    
                    <Link to={`/listings/${f._id}`} className="btn" style={{ width: "100%", padding: "8px", fontSize: "12.5px", marginTop: "12px", background: "transparent", color: "var(--primary)", border: "1px solid var(--primary)", boxShadow: "none" }}>
                      Check Compatibility
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Premium Explanations Section */}
      <div className="container" style={{ padding: "80px 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.1fr", gap: "48px", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "32px", fontWeight: "800", color: "var(--text-main)", lineHeight: 1.2 }}>
              How our hybrid matching algorithm works
            </h2>
            <p style={{ fontSize: "14.5px", color: "var(--text-muted)", margin: "16px 0 24px" }}>
              Unlike simple filters, NestAI uses a dual-engine architecture to evaluate compatibility from different dimensions:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ display: "flex", gap: "12px" }}>
                <span style={{ fontSize: "20px" }}>⚡</span>
                <div>
                  <h4 style={{ fontSize: "15px", fontWeight: "700" }}>30% Rule-Based Matching</h4>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>Deterministic scoring checks your hard constraints like budgets, room types, and geocoded location boundaries.</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <span style={{ fontSize: "20px" }}>🧠</span>
                <div>
                  <h4 style={{ fontSize: "15px", fontWeight: "700" }}>70% Groq AI Matching</h4>
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>Semantic Llama-3 parsing analyzes lifestyle factors, roommate compatibility comments, and custom description flags.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "16px", background: "rgba(255, 255, 255, 0.95)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "14px", fontWeight: "700" }}>Sample Profile Matches</span>
              <span className="badge badge-high">94% AI Match</span>
            </div>
            
            <div className="compat-container" style={{ height: "6px", margin: 0 }}>
              <div className="compat-bar excellent" style={{ width: "94%" }}></div>
            </div>

            <div style={{ border: "1px solid var(--border)", borderRadius: "12px", padding: "14px", background: "#fbfbfa" }}>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0 0 8px" }}>💡 AI Explanations Insights:</p>
              <p style={{ fontSize: "13px", color: "var(--text-main)", margin: 0, fontWeight: "500" }}>
                "The roommate description shows strong lifestyle matches for clean kitchens and quiet study settings, and is in excellent proximity [Distance: 0.8 km]."
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", fontSize: "12.5px" }}>
              <div style={{ flex: 1, padding: "8px", background: "#d1fae5", color: "#065f46", borderRadius: "8px", fontWeight: "600", textPadding: "center", textAlign: "center" }}>
                ✓ Gated Society
              </div>
              <div style={{ flex: 1, padding: "8px", background: "#d1fae5", color: "#065f46", borderRadius: "8px", fontWeight: "600", textPadding: "center", textAlign: "center" }}>
                ✓ Verified Owner
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Footer */}
      <footer style={{ marginTop: "auto", borderTop: "1px solid var(--border)", background: "rgba(255,255,255,0.75)", padding: "40px 0" }}>
        <div className="container" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "20px", fontSize: "13.5px", color: "var(--text-muted)" }}>
          <div>
            <strong>✨ NestAI</strong>
            <p style={{ marginTop: "6px", fontSize: "12.5px" }}>Premium AI-First PropTech Startup © 2026. All rights reserved.</p>
          </div>
          <div style={{ display: "flex", gap: "32px" }}>
            <Link to="/tenant" style={{ color: "inherit", textDecoration: "none" }}>Search Rooms</Link>
            <Link to="/owner" style={{ color: "inherit", textDecoration: "none" }}>Publish Listing</Link>
            <Link to="/login" style={{ color: "inherit", textDecoration: "none" }}>Sign In</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
