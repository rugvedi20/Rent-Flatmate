import { Sparkles, DollarSign, MapPin, Calendar, LayoutGrid, Sofa, HelpCircle } from "lucide-react";

export default function MatchBreakdown({ compatibility }) {
  if (!compatibility) return null;

  // Destructure rule scores or details from the explanation snippet if necessary
  const ruleScore = compatibility.ruleScore || compatibility.score;
  const llmScore = compatibility.llmScore;
  const pros = compatibility.pros || [];
  const cons = compatibility.cons || [];
  const summary = compatibility.summary;

  // Standard matching percentages based on distance & rules
  const getProximityPercentage = () => {
    if (compatibility.distanceKm === null || compatibility.distanceKm === undefined) return 50;
    const dist = compatibility.distanceKm;
    if (dist <= 1.0) return 100;
    if (dist <= 3.0) return 90;
    if (dist <= 5.0) return 75;
    if (dist <= 8.0) return 60;
    if (dist <= 12.0) return 40;
    return 20;
  };

  const getPercentageColor = (pct) => {
    if (pct >= 85) return "#10b981"; // emerald
    if (pct >= 70) return "#0ea5e9"; // sky
    if (pct >= 50) return "#f59e0b"; // amber
    return "#f43f5e"; // rose
  };

  const getBudgetMatchVal = () => {
    if (compatibility?.inputSnapshot) {
      const { rent, budgetMax } = compatibility.inputSnapshot;
      if (rent !== undefined && budgetMax !== undefined) {
        if (rent <= budgetMax) return 100; // Anything within or below maximum budget is 100% match
        if (rent > budgetMax && rent <= budgetMax * 1.1) return 60;
        return 30;
      }
    }
    const textToSearch = (compatibility.explanation + " " + pros.join(" ") + " " + cons.join(" ")).toLowerCase();
    if (textToSearch.includes("fits within budget") || textToSearch.includes("below budget") || textToSearch.includes("fits budget") || textToSearch.includes("affordable") || textToSearch.includes("within budget")) return 100;
    if (textToSearch.includes("slightly above")) return 60;
    return 30;
  };

  const getMoveInMatchVal = () => {
    if (compatibility?.inputSnapshot) {
      const { availableFrom, moveInDate } = compatibility.inputSnapshot;
      if (availableFrom && moveInDate) {
        const avail = new Date(availableFrom);
        const moveIn = new Date(moveInDate);
        const diffTime = avail - moveIn;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) return 100;
        if (diffDays <= 15) return 60;
        return 20;
      }
    }
    const textToSearch = (compatibility.explanation + " " + pros.join(" ") + " " + cons.join(" ")).toLowerCase();
    if (textToSearch.includes("available on/before") || textToSearch.includes("available immediately") || textToSearch.includes("matches availability") || textToSearch.includes("immediate availability")) return 100;
    if (textToSearch.includes("days after")) return 60;
    return 20;
  };

  const metrics = [
    { label: "Budget Match", val: getBudgetMatchVal(), icon: DollarSign },
    { label: "Location Proximity", val: getProximityPercentage(), icon: MapPin },
    { label: "Move-In Schedule", val: getMoveInMatchVal(), icon: Calendar },
    { label: "Amenities & Details", val: ruleScore >= 80 ? 95 : ruleScore >= 60 ? 75 : 50, icon: LayoutGrid }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* Visual Analytics Bars */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {metrics.map((m, idx) => {
          const Icon = m.icon;
          return (
            <div key={idx} style={{ background: "#ffffff", padding: "16px", borderRadius: "14px", border: "1px solid var(--border)", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "13px", fontWeight: "600" }}>
                  <Icon size={14} style={{ color: "var(--primary)" }} />
                  <span>{m.label}</span>
                </div>
                <span style={{ fontSize: "13px", fontWeight: "700", color: getPercentageColor(m.val) }}>
                  {m.val}%
                </span>
              </div>
              <div style={{ height: "6px", background: "#f3f4f6", borderRadius: "99px", overflow: "hidden" }}>
                <div style={{ width: `${m.val}%`, height: "100%", borderRadius: "99px", background: getPercentageColor(m.val) }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Pros & Cons Columns */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
        
        {/* Pros card list */}
        <div style={{ background: "#fbfbfa", padding: "16px", borderRadius: "14px", border: "1px solid var(--border)" }}>
          <h4 style={{ margin: "0 0 10px", fontSize: "13px", fontWeight: "700", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            ✓ What Fits Well
          </h4>
          <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
            {pros.map((p, idx) => (
              <li key={idx} style={{ fontSize: "12.5px", color: "var(--text-main)", display: "flex", gap: "6px", alignItems: "flex-start" }}>
                <span style={{ color: "var(--primary)", fontWeight: "bold" }}>•</span>
                <span>{p}</span>
              </li>
            ))}
            {pros.length === 0 && (
              <li style={{ fontSize: "12px", color: "var(--text-muted)" }}>Meets standard listing details.</li>
            )}
          </ul>
        </div>

        {/* Cons card list */}
        <div style={{ background: "#fbfbfa", padding: "16px", borderRadius: "14px", border: "1px solid var(--border)" }}>
          <h4 style={{ margin: "0 0 10px", fontSize: "13px", fontWeight: "700", color: "#f43f5e", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            ✖ Possible Compromises
          </h4>
          <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
            {cons.map((c, idx) => (
              <li key={idx} style={{ fontSize: "12.5px", color: "var(--text-main)", display: "flex", gap: "6px", alignItems: "flex-start" }}>
                <span style={{ color: "#f43f5e", fontWeight: "bold" }}>•</span>
                <span>{c}</span>
              </li>
            ))}
            {cons.length === 0 && (
              <li style={{ fontSize: "12px", color: "var(--primary)" }}>No significant preferences mismatch found!</li>
            )}
          </ul>
        </div>

      </div>

      {/* Summary Box */}
      {summary && (
        <div style={{ background: "var(--primary-light)", padding: "14px 18px", borderRadius: "14px", border: "1px solid rgba(16, 185, 129, 0.1)", display: "flex", gap: "8px", alignItems: "flex-start" }}>
          <Sparkles size={16} style={{ color: "var(--primary)", flexShrink: 0, marginTop: "2px" }} />
          <p style={{ margin: 0, fontSize: "13px", color: "var(--text-main)", lineHeight: 1.45 }}>
            <strong>AI Summary:</strong> {summary}
          </p>
        </div>
      )}

    </div>
  );
}
