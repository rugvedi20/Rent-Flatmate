import { Award, Mail, Phone } from "lucide-react";

export default function ProfileSidebar({ user, profile }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <div className="profile-sidebar-card">
        <h3 style={{ fontSize: "16px", fontWeight: "750", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
          <Award size={18} style={{ color: "var(--primary)" }} />
          <span>Trust Indicators</span>
        </h3>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13.5px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
            <span style={{ color: "var(--text-muted)" }}>ID Status</span>
            <strong style={{ color: "var(--success)" }}>Verified</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
            <span style={{ color: "var(--text-muted)" }}>Email Verification</span>
            <strong style={{ color: "var(--success)" }}>Complete</strong>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
            <span style={{ color: "var(--text-muted)" }}>Phone Verification</span>
            <strong style={{ color: profile.phone ? "var(--success)" : "var(--text-muted)" }}>
              {profile.phone ? "Verified" : "Pending"}
            </strong>
          </div>
          {user.role === "owner" && (
            <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid var(--border)", paddingBottom: "8px" }}>
              <span style={{ color: "var(--text-muted)" }}>Active Recently</span>
              <strong>Recently Active</strong>
            </div>
          )}
        </div>
      </div>

      {/* Contact Details box */}
      <div className="profile-sidebar-card">
        <h3 style={{ fontSize: "16px", fontWeight: "750", margin: 0 }}>Contact Details</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13.5px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Mail size={16} style={{ color: "var(--text-muted)" }} />
            <span>{user.email}</span>
          </div>
          {profile.phone && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Phone size={16} style={{ color: "var(--text-muted)" }} />
              <span>{profile.phone}</span>
            </div>
          )}
        </div>
      </div>

      {/* Lifestyle traits for tenant */}
      {user.role === "tenant" && (
        <div className="profile-sidebar-card">
          <h3 style={{ fontSize: "16px", fontWeight: "750", margin: 0 }}>Lifestyle Traits</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "13.5px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Parking Required</span>
              <strong>{profile.parkingRequired ? "Yes" : "No"}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Has/Allows Pets</span>
              <strong>{profile.petsAllowed ? "Yes" : "No"}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Smoking Allowed</span>
              <strong>{profile.smokingAllowed ? "Yes" : "No"}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Gender Preference</span>
              <strong style={{ textTransform: "capitalize" }}>{profile.genderPreference}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
