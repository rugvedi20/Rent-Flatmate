import { Search, Eye, Trash2 } from "lucide-react";

export default function UsersTab({
  users,
  listings,
  stats,
  userSearch,
  setUserSearch,
  handleUserSearch,
  setSelectedUser,
  setDeleteConfirm,
  getInitials,
}) {
  return (
    <div className="card" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "18px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: "750", color: "var(--text-main)", margin: 0 }}>Active User Directory</h3>
        
        {/* Search form */}
        <form onSubmit={handleUserSearch} style={{ display: "flex", gap: "8px", border: "none", padding: 0, margin: 0 }}>
          <input
            type="text"
            placeholder="Search name, email or role..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
            style={{ fontSize: "12.5px", padding: "6px 12px", width: "240px" }}
          />
          <button type="submit" className="btn" style={{ padding: "6px 12px", fontSize: "12.5px", display: "flex", alignItems: "center", gap: "4px" }}>
            <Search size={13} />
            <span>Search</span>
          </button>
        </form>
      </div>

      {users.length === 0 ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
          <span style={{ fontSize: "28px" }}>👥</span>
          <p style={{ fontSize: "14px", fontWeight: "600", marginTop: "8px" }}>No users match the search query.</p>
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)", fontSize: "11px", textTransform: "uppercase", color: "var(--text-muted)" }}>
                <th style={{ padding: "12px 16px" }}>Avatar</th>
                <th style={{ padding: "12px 16px" }}>Name</th>
                <th style={{ padding: "12px 16px" }}>Email</th>
                <th style={{ padding: "12px 16px" }}>Role</th>
                <th style={{ padding: "12px 16px" }}>Joined Date</th>
                <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} style={{ borderBottom: "1px solid #f1f5f9", fontSize: "13px", color: "var(--text-main)" }}>
                  <td style={{ padding: "10px 16px" }}>
                    <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "700" }}>
                      {getInitials(u.name)}
                    </div>
                  </td>
                  <td style={{ padding: "10px 16px", fontWeight: "700" }}>{u.name}</td>
                  <td style={{ padding: "10px 16px", color: "var(--text-muted)" }}>{u.email}</td>
                  <td style={{ padding: "10px 16px" }}>
                    <span className="badge" style={{ background: u.role === "admin" ? "#fef2f2" : u.role === "owner" ? "#f0fdf4" : "#ecfeff", color: u.role === "admin" ? "#ef4444" : u.role === "owner" ? "#16a34a" : "#0891b2", textTransform: "capitalize", fontSize: "10px", fontWeight: "700" }}>
                      {u.role}
                    </span>
                    {u.role === "owner" && (
                      <span style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", fontWeight: "600" }}>
                        🏠 {listings.filter(l => String(l.ownerId?._id || l.ownerId) === String(u._id)).length} Ad(s)
                      </span>
                    )}
                    {u.role === "tenant" && (
                      <span style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginTop: "4px", fontWeight: "600" }}>
                        ⚡ {stats?.recentActivity?.interests?.filter(i => String(i.tenantId?._id || i.tenantId) === String(u._id)).length} Recent Interest(s)
                      </span>
                    )}
                  </td>
                  <td style={{ padding: "10px 16px", color: "var(--text-muted)" }}>
                    {new Date(u.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td style={{ padding: "10px 16px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                      <button
                        onClick={() => setSelectedUser(u)}
                        style={{ padding: "5px 10px", background: "white", border: "1px solid var(--border)", color: "var(--text-main)", fontSize: "11px" }}
                        title="View User Details"
                      >
                        <Eye size={11} style={{ marginRight: "4px" }} />
                        Details
                      </button>
                      {u.role !== "admin" && (
                        <button
                          onClick={() => setDeleteConfirm({ type: "user", id: u._id, name: u.name })}
                          style={{ padding: "5px 10px", background: "#fee2e2", border: "none", color: "#ef4444", fontSize: "11px" }}
                          title="Delete User Account"
                        >
                          <Trash2 size={11} style={{ marginRight: "4px" }} />
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
