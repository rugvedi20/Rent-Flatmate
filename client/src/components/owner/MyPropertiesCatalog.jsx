export default function MyPropertiesCatalog({ listings, markFilled }) {
  return (
    <div>
      <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>My Properties Catalog</h2>
      {listings.length === 0 && <p style={{ color: "var(--text-muted)" }}>No active rooms published yet.</p>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
        {listings.map((l) => (
          <div className="card" key={l._id} style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", margin: 0, padding: "20px" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                <h3 style={{ margin: 0, fontSize: "15px", fontWeight: "700" }}>{l.title}</h3>
                <span className="badge" style={{ background: l.status === "available" ? "var(--success-light)" : "rgba(226,232,240,0.8)", color: l.status === "available" ? "var(--success)" : "var(--text-muted)", fontSize: "11px" }}>
                  {l.status}
                </span>
              </div>
              <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: "4px 0" }}>📍 {l.location}</p>
              <p style={{ fontWeight: "700", color: "var(--primary)", fontSize: "16px", margin: "8px 0" }}>₹{l.rent}/mo</p>
            </div>
            {l.status === "available" && (
              <button onClick={() => markFilled(l._id)} style={{ width: "100%", background: "#475569", color: "white", boxShadow: "none", padding: "8px", borderRadius: "10px", marginTop: "12px" }}>
                Mark Ad as Filled
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
