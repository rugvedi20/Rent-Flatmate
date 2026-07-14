import { ShieldCheck, Edit3, X, Calendar, Clock, ThumbsUp, Globe } from "lucide-react";

export const COVER_PRESETS = [
  "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80"
];

export default function ProfileHeader({
  user,
  profile,
  reviewsStats,
  completion,
  isOwnProfile,
  isEditing,
  setIsEditing,
  getInitials,
}) {
  return (
    <div className="profile-card-header">
      <img 
        src={profile.coverImageUrl || COVER_PRESETS[0]} 
        alt="Profile Cover" 
        className="profile-cover-img" 
      />
      <div className="profile-avatar-container">
        <div className="profile-avatar-large">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} alt={user.name} />
          ) : (
            <span>{getInitials(user.name)}</span>
          )}
        </div>
        
        {isOwnProfile && (
          <div className="profile-header-actions">
            <button 
              onClick={() => setIsEditing(!isEditing)} 
              className="btn" 
              style={{ background: isEditing ? "#64748b" : "var(--primary)", color: "white", display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px" }}
            >
              {isEditing ? <X size={16} /> : <Edit3 size={16} />}
              <span>{isEditing ? "Cancel" : "Edit Profile"}</span>
            </button>
          </div>
        )}
      </div>

      <div className="profile-main-info">
        <div className="profile-name-role">
          <h1>{user.name}</h1>
          <span className="badge" style={{ textTransform: "uppercase", background: user.role === "owner" ? "var(--secondary)" : "var(--primary)", color: "white", padding: "4px 12px", fontSize: "11px", fontWeight: "700" }}>
            {user.role}
          </span>
          
          {/* Visual verification badges */}
          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
            <span className="badge badge-high" style={{ background: "#ecfdf5", color: "#059669", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "3px" }}>
              <ShieldCheck size={12} /> Email Verified
            </span>
            {(profile.phoneVerified || profile.phone) && (
              <span className="badge badge-high" style={{ background: "#ecfdf5", color: "#059669", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                <ShieldCheck size={12} /> Phone Verified
              </span>
            )}
            {profile.identityVerified && (
              <span className="badge badge-high" style={{ background: "#ecfdf5", color: "#059669", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                <ShieldCheck size={12} /> Verified User
              </span>
            )}
          </div>
        </div>

        <p style={{ color: "var(--text-muted)", fontSize: "14.5px", marginTop: "6px", fontWeight: "500" }}>
          {profile.occupation ? `${profile.occupation}` : "Explorer"}
          {profile.companyOrCollege ? ` at ${profile.companyOrCollege}` : ""}
        </p>

        {/* Core metadata details */}
        <div className="profile-meta-grid">
          <div className="profile-meta-item">
            <Calendar size={15} />
            <span>Member since <strong>{new Date(user.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</strong></span>
          </div>
          {user.role === "owner" && (
            <>
              <div className="profile-meta-item">
                <Clock size={15} />
                <span>Typical response: <strong>under 5 mins</strong></span>
              </div>
              <div className="profile-meta-item">
                <ThumbsUp size={15} />
                <span>Host Rating: <strong>{reviewsStats.averageRating > 0 ? `${reviewsStats.averageRating} ★ (${reviewsStats.totalReviews} reviews)` : "New Host"}</strong></span>
              </div>
            </>
          )}
          {profile.languages && (
            <div className="profile-meta-item">
              <Globe size={15} />
              <span>Languages: <strong>{profile.languages}</strong></span>
            </div>
          )}
        </div>

        {/* Profile Completion Bar */}
        <div className="profile-completion-wrapper">
          <div style={{ display: "flex", justify: "space-between", fontSize: "12px", fontWeight: "700" }}>
            <span style={{ color: "var(--primary-hover)" }}>Profile Trust Strength</span>
            <span style={{ color: "var(--primary-hover)" }}>{completion}% Complete</span>
          </div>
          <div className="profile-completion-bar">
            <div className="profile-completion-fill" style={{ width: `${completion}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
