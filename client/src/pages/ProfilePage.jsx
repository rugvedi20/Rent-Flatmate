import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  ShieldCheck,
  Briefcase,
  GraduationCap,
  Star,
  Award,
  Edit3,
  MapPin,
  Calendar,
  DollarSign,
  Globe,
  User,
  Check,
  X,
  MessageSquare,
  Clock,
  ThumbsUp
} from "lucide-react";

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
];

const COVER_PRESETS = [
  "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80"
];

export default function ProfilePage({ userId: propUserId, isDashboard = false }) {
  const { userId: routeUserId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  // Decide which user's profile we are looking at
  const userId = propUserId || routeUserId || (currentUser ? currentUser._id : null);
  const isOwnProfile = currentUser && String(userId) === String(currentUser._id);

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formBio, setFormBio] = useState("");
  const [formOccupation, setFormOccupation] = useState("");
  const [formCompanyOrCollege, setFormCompanyOrCollege] = useState("");
  const [formLanguages, setFormLanguages] = useState("");
  const [formAvatarUrl, setFormAvatarUrl] = useState("");
  const [formCoverImageUrl, setFormCoverImageUrl] = useState("");
  
  // Tenant-specific edit preferences
  const [formPreferredLocation, setFormPreferredLocation] = useState("");
  const [formBudgetMin, setFormBudgetMin] = useState("");
  const [formBudgetMax, setFormBudgetMax] = useState("");
  const [formMoveInDate, setFormMoveInDate] = useState("");
  const [formPreferredRoomType, setFormPreferredRoomType] = useState("");
  const [formPreferredFurnishing, setFormPreferredFurnishing] = useState("");
  const [formParkingRequired, setFormParkingRequired] = useState(false);
  const [formPetsAllowed, setFormPetsAllowed] = useState(false);
  const [formSmokingAllowed, setFormSmokingAllowed] = useState(false);
  const [formGenderPreference, setFormGenderPreference] = useState("any");

  // Review states
  const [reviews, setReviews] = useState([]);
  const [reviewsStats, setReviewsStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Message notifications inside page
  const [message, setMessage] = useState("");

  const loadProfile = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/profile/${userId}`);
      setProfileData(data);
      setReviews(data.reviews || []);
      setReviewsStats(data.reviewsStats || { averageRating: 0, totalReviews: 0 });
      
      // Initialize edit form states
      setFormName(data.user?.name || "");
      setFormPhone(data.profile?.phone || "");
      setFormBio(data.profile?.bio || "");
      setFormOccupation(data.profile?.occupation || "");
      setFormCompanyOrCollege(data.profile?.companyOrCollege || "");
      setFormLanguages(data.profile?.languages || "");
      setFormAvatarUrl(data.profile?.avatarUrl || "");
      setFormCoverImageUrl(data.profile?.coverImageUrl || "");
      
      setFormPreferredLocation(data.profile?.preferredLocation || "");
      setFormBudgetMin(data.profile?.budgetMin || "");
      setFormBudgetMax(data.profile?.budgetMax || "");
      setFormMoveInDate(data.profile?.moveInDate?.slice(0, 10) || "");
      setFormPreferredRoomType(data.profile?.preferredRoomType || "single");
      setFormPreferredFurnishing(data.profile?.preferredFurnishing || "unfurnished");
      setFormParkingRequired(!!data.profile?.parkingRequired);
      setFormPetsAllowed(!!data.profile?.petsAllowed);
      setFormSmokingAllowed(!!data.profile?.smokingAllowed);
      setFormGenderPreference(data.profile?.genderPreference || "any");

      setError(null);
    } catch (err) {
      console.error("Failed to load profile:", err);
      setError("Unable to retrieve user profile details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setMessage("Saving profile...");
      const payload = {
        name: formName,
        phone: formPhone,
        bio: formBio,
        occupation: formOccupation,
        companyOrCollege: formCompanyOrCollege,
        languages: formLanguages,
        avatarUrl: formAvatarUrl,
        coverImageUrl: formCoverImageUrl,
      };

      // Add tenant-specific fields only if they have the tenant role
      if (profileData?.user?.role === "tenant") {
        payload.preferredLocation = formPreferredLocation;
        payload.budgetMin = Number(formBudgetMin) || 0;
        payload.budgetMax = Number(formBudgetMax) || 0;
        payload.moveInDate = formMoveInDate || undefined;
        payload.preferredRoomType = formPreferredRoomType;
        payload.preferredFurnishing = formPreferredFurnishing;
        payload.parkingRequired = formParkingRequired;
        payload.petsAllowed = formPetsAllowed;
        payload.smokingAllowed = formSmokingAllowed;
        payload.genderPreference = formGenderPreference;
      }

      await api.post("/profile", payload);
      setMessage("Profile saved successfully!");
      setIsEditing(false);
      await loadProfile();
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error(err);
      setMessage("Failed to save profile. Check details and try again.");
      setTimeout(() => setMessage(""), 4000);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;
    setReviewSubmitting(true);
    try {
      const { data } = await api.post("/reviews", {
        ownerId: userId,
        rating: newRating,
        reviewText: newReviewText.trim(),
      });
      setReviews(prev => [data, ...prev]);
      setReviewsStats(prev => {
        const total = prev.totalReviews + 1;
        const avg = ((prev.averageRating * prev.totalReviews + newRating) / total).toFixed(1);
        return { averageRating: parseFloat(avg), totalReviews: total };
      });
      setNewReviewText("");
      setNewRating(5);
      setReviewMessage("Review submitted successfully! Thank you.");
      setTimeout(() => setReviewMessage(""), 3500);
    } catch (err) {
      console.error(err);
      setReviewMessage(err.response?.data?.message || "Failed to submit review.");
      setTimeout(() => setReviewMessage(""), 4000);
    } finally {
      setReviewSubmitting(false);
    }
  };

  // Helper to calculate profile completion
  const getProfileCompletion = () => {
    if (!profileData?.profile) return 0;
    const p = profileData.profile;
    let completed = 0;
    let total = 7; // base fields

    if (profileData.user?.name) completed += 1;
    if (p.bio) completed += 1;
    if (p.occupation) completed += 1;
    if (p.companyOrCollege) completed += 1;
    if (p.languages) completed += 1;
    if (p.phone) completed += 1;
    if (p.avatarUrl) completed += 1;
    
    if (profileData.user?.role === "tenant") {
      total += 4; // preference fields
      if (p.preferredLocation) completed += 1;
      if (p.budgetMax) completed += 1;
      if (p.moveInDate) completed += 1;
      if (p.preferredRoomType) completed += 1;
    }

    return Math.round((completed / total) * 100);
  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  };

  if (loading) {
    return (
      <div className="profile-container py-12">
        <div style={{ height: "240px", borderRadius: "16px" }} className="skeleton-pulse" />
        <div className="profile-grid mt-6">
          <div style={{ height: "400px", borderRadius: "16px" }} className="skeleton-pulse" />
          <div style={{ height: "500px", borderRadius: "16px" }} className="skeleton-pulse" />
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="profile-container py-24 text-center">
        <span style={{ fontSize: "48px" }}>👤</span>
        <h2 style={{ fontSize: "22px", fontWeight: "750", marginTop: "16px" }}>Profile Unavailable</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>{error || "User could not be found."}</p>
        <button onClick={() => navigate(-1)} className="btn mt-4">Go Back</button>
      </div>
    );
  }

  const { user, profile } = profileData;
  const completion = getProfileCompletion();

  return (
    <div className="profile-container">
      
      {/* Back button link if not inside dashboard tabs */}
      {!isDashboard && (
        <button 
          onClick={() => navigate(-1)}
          className="btn"
          style={{ background: "transparent", color: "var(--text-main)", border: "none", boxShadow: "none", display: "flex", alignItems: "center", gap: "6px", fontWeight: "700", cursor: "pointer", alignSelf: "flex-start", padding: 0 }}
        >
          &larr; Back
        </button>
      )}

      {message && (
        <div style={{ padding: "12px 20px", background: "var(--primary-light)", color: "var(--primary)", borderLeft: "4px solid var(--primary)", borderRadius: "12px", fontWeight: "600", fontSize: "14px" }}>
          💡 {message}
        </div>
      )}

      {/* Profile Card Header */}
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
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: "700" }}>
              <span style={{ color: "var(--primary-hover)" }}>Profile Trust Strength</span>
              <span style={{ color: "var(--primary-hover)" }}>{completion}% Complete</span>
            </div>
            <div className="profile-completion-bar">
              <div className="profile-completion-fill" style={{ width: `${completion}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Profile Main Body Grid */}
      {!isEditing ? (
        <div className="profile-grid">
          
          {/* Left Column: Sidebar details */}
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

          {/* Right Column: Bio, Work, Preferences and Reviews */}
          <div className="profile-content-area">
            
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

            {/* Owner Reviews Section */}
            {user.role === "owner" && (
              <div className="profile-content-card">
                <h2 className="profile-section-title">
                  <MessageSquare size={18} style={{ color: "var(--primary)" }} />
                  <span>Tenant Reviews &amp; Ratings</span>
                </h2>

                {/* Rating Stats Banner */}
                <div className="review-stats-summary">
                  <div style={{ textAlign: "center", paddingRight: "20px", borderRight: "1px solid var(--border)" }}>
                    <span style={{ fontSize: "36px", fontWeight: "800", color: "var(--text-main)" }}>{reviewsStats.averageRating}</span>
                    <div style={{ color: "var(--text-muted)", fontSize: "12px", fontWeight: "600" }}>out of 5 stars</div>
                  </div>
                  <div>
                    <div className="rating-stars-container" style={{ marginBottom: "4px" }}>
                      {[1, 2, 3, 4, 5].map(star => (
                        <span 
                          key={star} 
                          className="rating-star" 
                          style={{ color: star <= Math.round(reviewsStats.averageRating) ? "var(--warning)" : "#e2e8f0" }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <div style={{ fontSize: "13.5px", color: "var(--text-muted)" }}>
                      Based on <strong>{reviewsStats.totalReviews}</strong> reviews left by verified tenants
                    </div>
                  </div>
                </div>

                {/* Review Form - only for logged-in tenants reviewing other owners */}
                {currentUser && currentUser.role === "tenant" && !isOwnProfile && (
                  <form onSubmit={handleReviewSubmit} className="review-form-card">
                    <h3 style={{ fontSize: "14.5px", fontWeight: "750", marginBottom: "12px" }}>Post a Landlord Review</h3>
                    {reviewMessage && (
                      <div style={{ padding: "8px 12px", background: "var(--primary-light)", color: "var(--primary)", borderLeft: "4px solid var(--primary)", borderRadius: "8px", marginBottom: "12px", fontSize: "12.5px" }}>
                        {reviewMessage}
                      </div>
                    )}
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                      <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-muted)" }}>Select Rating:</span>
                      <div className="rating-stars-container">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            onClick={() => setNewRating(star)}
                            className="rating-star interactive"
                            style={{ cursor: "pointer", fontSize: "22px", color: star <= newRating ? "var(--warning)" : "#e2e8f0" }}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="form-group" style={{ margin: 0 }}>
                      <textarea
                        rows="3"
                        required
                        value={newReviewText}
                        onChange={(e) => setNewReviewText(e.target.value)}
                        placeholder="Write your review here... Mention response speed, property conditions, support during move-in..."
                        style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid var(--border)", background: "white" }}
                      />
                    </div>
                    <button type="submit" disabled={reviewSubmitting} className="btn mt-2" style={{ padding: "8px 16px", fontSize: "13px" }}>
                      {reviewSubmitting ? "Submitting..." : "Submit Review"}
                    </button>
                  </form>
                )}

                {/* Reviews List */}
                <div style={{ marginTop: "24px" }}>
                  {reviews.length === 0 ? (
                    <div style={{ padding: "32px 16px", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "12px", color: "var(--text-muted)" }}>
                      <span>💬</span>
                      <h4 style={{ margin: "8px 0 0", fontSize: "14px", fontWeight: "700" }}>No reviews yet</h4>
                      <p style={{ margin: "4px 0 0", fontSize: "12.5px" }}>Tenant feedback builds reputation. Verified interactions will list rating summaries here.</p>
                    </div>
                  ) : (
                    reviews.map((r) => (
                      <div key={r._id} className="review-card">
                        <div className="review-card-header">
                          <div className="reviewer-info">
                            <div className="reviewer-avatar">
                              {r.tenantId?.avatarUrl ? (
                                <img src={r.tenantId.avatarUrl} alt={r.tenantId.name} />
                              ) : (
                                <span>{getInitials(r.tenantId?.name || "Tenant")}</span>
                              )}
                            </div>
                            <div>
                              <h4 style={{ margin: 0, fontSize: "14px", fontWeight: "750" }}>{r.tenantId?.name || "Verified Tenant"}</h4>
                              <div className="rating-stars-container" style={{ marginTop: "2px" }}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <span key={star} style={{ fontSize: "13px", color: star <= r.rating ? "var(--warning)" : "#e2e8f0" }}>★</span>
                                ))}
                              </div>
                            </div>
                          </div>
                          <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                            {new Date(r.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: "13.5px", color: "#475569", lineHeight: "1.6", whiteSpace: "pre-line" }}>
                          {r.reviewText}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>

        </div>
      ) : (
        
        /* Edit profile form mode */
        <div className="profile-content-card" style={{ maxWidth: "800px", margin: "0 auto", width: "100%" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "24px", borderBottom: "1px solid var(--border)", paddingBottom: "12px" }}>
            Edit Profile details
          </h2>

          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            
            {/* Pick avatar preset */}
            <div>
              <label style={{ fontSize: "13px", fontWeight: "750", color: "var(--text-muted)" }}>Choose Profile Avatar Preset</label>
              <div className="preset-grid">
                {AVATAR_PRESETS.map((preset, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setFormAvatarUrl(preset)}
                    className={`preset-avatar-option ${formAvatarUrl === preset ? "active" : ""}`}
                  >
                    <img src={preset} alt={`Avatar Preset ${idx + 1}`} />
                  </div>
                ))}
              </div>
              <div className="form-group">
                <input 
                  type="text" 
                  placeholder="Or enter custom avatar URL..." 
                  value={formAvatarUrl}
                  onChange={(e) => setFormAvatarUrl(e.target.value)}
                  style={{ width: "100%", fontSize: "13px" }}
                />
              </div>
            </div>

            {/* Pick cover preset */}
            <div>
              <label style={{ fontSize: "13px", fontWeight: "750", color: "var(--text-muted)" }}>Choose Profile Cover Photo</label>
              <div className="preset-grid">
                {COVER_PRESETS.map((preset, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setFormCoverImageUrl(preset)}
                    className={`preset-cover-option ${formCoverImageUrl === preset ? "active" : ""}`}
                  >
                    <img src={preset} alt={`Cover Preset ${idx + 1}`} />
                  </div>
                ))}
              </div>
              <div className="form-group">
                <input 
                  type="text" 
                  placeholder="Or enter custom cover image URL..." 
                  value={formCoverImageUrl}
                  onChange={(e) => setFormCoverImageUrl(e.target.value)}
                  style={{ width: "100%", fontSize: "13px" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  required
                  type="text" 
                  value={formName} 
                  onChange={(e) => setFormName(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label>Phone Contact Number</label>
                <input 
                  type="text" 
                  placeholder="e.g. +91 9999999999"
                  value={formPhone} 
                  onChange={(e) => setFormPhone(e.target.value)} 
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div className="form-group">
                <label>Occupation</label>
                <input 
                  type="text" 
                  placeholder="e.g. Software Engineer"
                  value={formOccupation} 
                  onChange={(e) => setFormOccupation(e.target.value)} 
                />
              </div>
              <div className="form-group">
                <label>Company or College</label>
                <input 
                  type="text" 
                  placeholder="e.g. Google / COEP"
                  value={formCompanyOrCollege} 
                  onChange={(e) => setFormCompanyOrCollege(e.target.value)} 
                />
              </div>
            </div>

            <div className="form-group">
              <label>Languages Spoken</label>
              <input 
                type="text" 
                placeholder="e.g. English, Hindi, Marathi"
                value={formLanguages} 
                onChange={(e) => setFormLanguages(e.target.value)} 
              />
            </div>

            <div className="form-group">
              <label>Bio / About section</label>
              <textarea 
                rows="4" 
                placeholder="Tell potential matches about your daily routine, guidelines, preferences, hobbies..."
                value={formBio}
                onChange={(e) => setFormBio(e.target.value)}
                style={{ resize: "none" }}
              />
            </div>

            {/* Tenant specific match settings inside edit form */}
            {profileData.user?.role === "tenant" && (
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "20px", marginTop: "10px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: "750" }}>Match Preferences (Tenant fields)</h3>
                
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label>Preferred Locality *</label>
                    <input
                      required
                      placeholder="e.g. Baner"
                      value={formPreferredLocation}
                      onChange={(e) => setFormPreferredLocation(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Preferred Move-In Date *</label>
                    <input
                      required
                      type="date"
                      value={formMoveInDate}
                      onChange={(e) => setFormMoveInDate(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label>Min Budget (₹/mo)</label>
                    <input
                      type="number"
                      placeholder="Min rent"
                      value={formBudgetMin}
                      onChange={(e) => setFormBudgetMin(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Max Budget (₹/mo)</label>
                    <input
                      type="number"
                      placeholder="Max rent"
                      value={formBudgetMax}
                      onChange={(e) => setFormBudgetMax(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                  <div className="form-group">
                    <label>Preferred Room Type</label>
                    <select
                      value={formPreferredRoomType}
                      onChange={(e) => setFormPreferredRoomType(e.target.value)}
                    >
                      <option value="single">Single room</option>
                      <option value="shared">Shared room</option>
                      <option value="1bhk">1 BHK</option>
                      <option value="2bhk">2 BHK</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Preferred Furnishing</label>
                    <select
                      value={formPreferredFurnishing}
                      onChange={(e) => setFormPreferredFurnishing(e.target.value)}
                    >
                      <option value="furnished">Furnished</option>
                      <option value="semi-furnished">Semi-Furnished</option>
                      <option value="unfurnished">Unfurnished</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Roommate Gender Preference</label>
                  <select
                    value={formGenderPreference}
                    onChange={(e) => setFormGenderPreference(e.target.value)}
                  >
                    <option value="any">No preference</option>
                    <option value="male">Male roommates only</option>
                    <option value="female">Female roommates only</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", background: "var(--background)", padding: "12px", borderRadius: "10px", border: "1px solid var(--border)", alignItems: "center" }}>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <input
                      type="checkbox"
                      id="formParkingRequired"
                      checked={formParkingRequired}
                      onChange={(e) => setFormParkingRequired(e.target.checked)}
                    />
                    <label htmlFor="formParkingRequired" style={{ fontSize: "11.5px", fontWeight: "700", margin: 0 }}>Needs Parking</label>
                  </div>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <input
                      type="checkbox"
                      id="formPetsAllowed"
                      checked={formPetsAllowed}
                      onChange={(e) => setFormPetsAllowed(e.target.checked)}
                    />
                    <label htmlFor="formPetsAllowed" style={{ fontSize: "11.5px", fontWeight: "700", margin: 0 }}>Has Pets</label>
                  </div>
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <input
                      type="checkbox"
                      id="formSmokingAllowed"
                      checked={formSmokingAllowed}
                      onChange={(e) => setFormSmokingAllowed(e.target.checked)}
                    />
                    <label htmlFor="formSmokingAllowed" style={{ fontSize: "11.5px", fontWeight: "700", margin: 0 }}>Allows Smoking</label>
                  </div>
                </div>

              </div>
            )}

            <div style={{ display: "flex", gap: "12px", borderTop: "1px solid var(--border)", paddingTop: "20px", marginTop: "10px" }}>
              <button type="submit" className="btn" style={{ flex: 1, padding: "12px" }}>
                Save Profile
              </button>
              <button 
                type="button" 
                onClick={() => setIsEditing(false)} 
                className="btn" 
                style={{ flex: 1, padding: "12px", background: "#f1f5f9", color: "#475569", border: "1px solid var(--border)" }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
