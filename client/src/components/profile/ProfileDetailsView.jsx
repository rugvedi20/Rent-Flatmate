import { User, Star, MapPin } from "lucide-react";

export default function ProfileDetailsView({ user, profile }) {
  return (
    <>
      {/* Bio / About */}
      <div className="profile-content-card">
        <h2 className="profile-section-title">
          <User size={18} style={{ color: "var(--primary)" }} />
          <span>About Me</span>
        </h2>
        <p style={{ fontSize: "15px", lineHeight: "1.7", color: "var(--text-main)", whiteSpace: "pre-line", margin: 0 }}>
          {profile.bio || "This user hasn't added a bio yet. They are likely exploring listing opportunities!"}
        </p>
      </div>

      {/* Preferences for tenant */}
      {user.role === "tenant" && (
        <div className="profile-content-card">
          <h2 className="profile-section-title">
            <Star size={18} style={{ color: "var(--primary)" }} />
            <span>Matching Details</span>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <span style={{ fontSize: "12px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "600" }}>Preferred locations</span>
              <p style={{ margin: "4px 0 0", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                <MapPin size={14} style={{ color: "var(--primary)" }} />
                <span>{profile.preferredLocation || "Not specified"}</span>
              </p>
            </div>
            <div>
              <span style={{ fontSize: "12px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "600" }}>Ideal Budget</span>
              <p style={{ margin: "4px 0 0", fontWeight: "700", color: "var(--primary)" }}>
                ₹{profile.budgetMin?.toLocaleString()} - ₹{profile.budgetMax?.toLocaleString()}/mo
              </p>
            </div>
            <div>
              <span style={{ fontSize: "12px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "600" }}>Preferred Room &amp; Furnishing</span>
              <p style={{ margin: "4px 0 0", fontWeight: "700", textTransform: "capitalize" }}>
                {profile.preferredRoomType || "Any"} room · {profile.preferredFurnishing || "Any"}
              </p>
            </div>
            <div>
              <span style={{ fontSize: "12px", textTransform: "uppercase", color: "var(--text-muted)", fontWeight: "600" }}>Move-in Date</span>
              <p style={{ margin: "4px 0 0", fontWeight: "700" }}>
                {profile.moveInDate ? new Date(profile.moveInDate).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) : "Immediate"}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
