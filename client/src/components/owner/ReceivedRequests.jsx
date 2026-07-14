export default function ReceivedRequests({ interests, respond }) {
  return (
    <div>
      <h2 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "16px" }}>Received Requests</h2>
      {interests.length === 0 && (
        <div style={{ padding: "30px", background: "white", borderRadius: "16px", border: "1px solid var(--border)", textAlign: "center", color: "var(--text-muted)" }}>
          <span style={{ fontSize: "28px" }}>📥</span>
          <p style={{ marginTop: "8px", fontWeight: "500" }}>No matching requests received yet.</p>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {interests.map((i) => {
          let compBadgeClass = "badge-low";
          if (i.compatibilityScoreAtRequest >= 85) compBadgeClass = "badge-high";
          else if (i.compatibilityScoreAtRequest >= 70) compBadgeClass = "badge-high";
          else if (i.compatibilityScoreAtRequest >= 50) compBadgeClass = "badge-mid";

          return (
            <div className="card" key={i._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", padding: "20px", margin: 0 }}>
              <div>
                <p style={{ margin: 0, fontWeight: "700", fontSize: "15px" }}>👤 {i.tenantId?.name || "Tenant"}</p>
                <p style={{ margin: "4px 0", fontSize: "13px", color: "var(--text-muted)" }}>
                  Ad: <strong style={{ color: "var(--text-main)" }}>{i.listingId?.title}</strong>
                </p>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "8px" }}>
                  <span className="badge" style={{ background: i.status === "accepted" ? "var(--success-light)" : i.status === "rejected" ? "var(--danger-light)" : "rgba(226,232,240,0.8)", color: i.status === "accepted" ? "var(--success)" : i.status === "rejected" ? "var(--danger)" : "var(--text-muted)" }}>
                    {i.status}
                  </span>
                  {i.compatibilityScoreAtRequest != null && (
                    <span className={`badge ${compBadgeClass}`} style={{ fontSize: "11px", fontWeight: "700" }}>
                      🔥 {i.compatibilityScoreAtRequest}% Match Score
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {i.status === "pending" && (
                  <>
                    <button onClick={() => respond(i._id, "accepted")} style={{ background: "var(--success)", boxShadow: "none", padding: "8px 16px" }}>Accept</button>
                    <button onClick={() => respond(i._id, "rejected")} style={{ background: "var(--danger)", boxShadow: "none", padding: "8px 16px" }}>Reject</button>
                  </>
                )}
                {i.status === "accepted" && (
                  <a href={`/chat/${i.listingId?._id}?receiverId=${i.tenantId?._id}`} className="btn" style={{ background: "var(--primary)", color: "white", boxShadow: "none", padding: "8px 16px" }}>
                    💬 Start Chat
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
