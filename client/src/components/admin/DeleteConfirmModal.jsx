import { ShieldAlert } from "lucide-react";

export default function DeleteConfirmModal({
  deleteConfirm,
  setDeleteConfirm,
  executeDeleteUser,
  executeDeleteListing,
}) {
  if (!deleteConfirm) return null;

  return (
    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justify: "center", zIndex: 99999, justifyContent: "center" }}>
      <div className="card" style={{ maxWidth: "400px", width: "100%", padding: "24px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#f43f5e" }}>
          <ShieldAlert size={22} />
          <h3 style={{ fontSize: "16px", fontWeight: "800", margin: 0 }}>Confirm Dangerous Action</h3>
        </div>
        
        <p style={{ fontSize: "13.5px", color: "var(--text-muted)", margin: 0, lineHeight: "1.5" }}>
          Are you sure you want to permanently delete the {deleteConfirm.type} <strong style={{ color: "var(--text-main)" }}>"{deleteConfirm.name}"</strong>? This process cannot be undone.
        </p>

        <div style={{ display: "flex", gap: "10px", marginTop: "8px" }}>
          <button 
            onClick={() => setDeleteConfirm(null)} 
            className="btn"
            style={{ flex: 1, background: "white", border: "1px solid var(--border)", color: "var(--text-main)" }}
          >
            Cancel
          </button>
          <button 
            onClick={() => {
              if (deleteConfirm.type === "user") {
                executeDeleteUser(deleteConfirm.id);
              } else {
                executeDeleteListing(deleteConfirm.id);
              }
            }}
            className="btn"
            style={{ flex: 1, background: "#ef4444" }}
          >
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
}
