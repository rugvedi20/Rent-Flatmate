import { Link } from "react-router-dom";
import { Sparkles, Info } from "lucide-react";

export default function PropertyAiCompatibility({
  compatibility,
  compatMetrics,
  getPercentageColor,
  badgeColorClass,
}) {
  if (!compatibility) {
    return (
      <div className="ai-compat-highlight-card">
        <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)" }}>
          <Info size={18} />
          <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "700" }}>AI Match Unavailable</h4>
        </div>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0, lineHeight: "1.5" }}>
          Please complete your flatmate profile preferences to calculate compatibility scores, commute times, and rule alignment meters.
        </p>
        <Link to="/tenant?tab=profile" className="btn" style={{ textAlign: "center", padding: "10px", fontSize: "12.5px" }}>
          Setup Match Profile
        </Link>
      </div>
    );
  }

  return (
    <div className="ai-compat-highlight-card">
      <div>
        <span className={`recommendation-badge ${badgeColorClass}`}>
          {compatibility.badge || "Moderate"} Match
        </span>
        
        <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginTop: "16px" }}>
          <span style={{ fontSize: "40px", fontWeight: "800", color: "var(--text-main)", lineHeight: "1" }}>
            {compatibility.score}%
          </span>
          <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-muted)" }}>
            compatibility rating
          </span>
        </div>
        {compatibility.distanceKm !== null && (
          <div className="distance-badge-prominent" style={{ marginTop: "12px", marginBottom: "0" }}>
            <span>📍 {compatibility.distanceKm} km from preferred location</span>
          </div>
        )}
      </div>

      {/* Specific Metric Progress Meters */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {compatMetrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", fontSize: "12.5px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontWeight: "600" }}>
                  <Icon size={13} style={{ color: "var(--primary)" }} />
                  <span>{m.label}</span>
                </span>
                <strong style={{ color: getPercentageColor(m.val) }}>{m.val}%</strong>
              </div>
              <div style={{ height: "6px", background: "#f3f4f6", borderRadius: "99px", overflow: "hidden" }}>
                <div style={{ width: `${m.val}%`, height: "100%", borderRadius: "99px", background: getPercentageColor(m.val) }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* AI Text explanation */}
      <div style={{ background: "rgba(16, 185, 129, 0.03)", border: "1px solid rgba(16, 185, 129, 0.12)", padding: "16px", borderRadius: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "800", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
          <Sparkles size={13} />
          <span>AI Analysis Insights</span>
        </div>
        <p style={{ fontSize: "13px", color: "var(--text-main)", margin: 0, lineHeight: "1.6" }}>
          {compatibility.explanation}
        </p>
      </div>

      {/* Pros & Cons Checklist */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px", borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
        <div>
          <h4 style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: "750", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            ✓ What Fits Well
          </h4>
          <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
            {compatibility.pros && compatibility.pros.length > 0 ? (
              compatibility.pros.map((p, idx) => (
                <li key={idx} style={{ fontSize: "12.5px", color: "var(--text-main)", display: "flex", gap: "6px", alignItems: "flex-start" }}>
                  <span style={{ color: "var(--primary)", fontWeight: "bold" }}>✓</span>
                  <span>{p}</span>
                </li>
              ))
            ) : (
              <li style={{ fontSize: "12px", color: "var(--text-muted)" }}>Meets standard parameters.</li>
            )}
          </ul>
        </div>

        <div>
          <h4 style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: "750", color: "#f43f5e", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            ✖ Possible Compromises
          </h4>
          <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
            {compatibility.cons && compatibility.cons.length > 0 ? (
              compatibility.cons.map((c, idx) => (
                <li key={idx} style={{ fontSize: "12.5px", color: "var(--text-main)", display: "flex", gap: "6px", alignItems: "flex-start" }}>
                  <span style={{ color: "#f43f5e", fontWeight: "bold" }}>✖</span>
                  <span>{c}</span>
                </li>
              ))
            ) : (
              <li style={{ fontSize: "12px", color: "var(--primary)" }}>No mismatches detected!</li>
            )}
          </ul>
        </div>
      </div>

      {compatibility.summary && (
        <div style={{ background: "rgba(241, 245, 249, 0.6)", padding: "12px", borderRadius: "10px", fontSize: "12px", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
          <strong>Match Verdict:</strong> {compatibility.summary}
        </div>
      )}
    </div>
  );
}
