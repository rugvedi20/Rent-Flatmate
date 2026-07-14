import { Link } from "react-router-dom";
import { ShieldCheck, Clock, MessageSquare, Star } from "lucide-react";

export default function PropertyOwnerInfo({
  listing,
  ownerProfile,
  owner,
  reviewsStats,
  reviews,
  newRating,
  setNewRating,
  newReviewText,
  setNewReviewText,
  reviewMessage,
  reviewSubmitting,
  handleReviewSubmit,
  expressInterest,
  hasInterest,
  user,
  getInitials,
}) {
  return (
    <>
      <div className="details-main-card">
        <h3 style={{ fontSize: "16px", fontWeight: "750", color: "var(--text-main)", marginBottom: "6px" }}>Owner &amp; Landlord Info</h3>
        
        <Link to={`/profile/${listing.ownerId}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
          <div className="owner-section-card" style={{ cursor: "pointer" }}>
            <div className="owner-avatar-large">
              {ownerProfile?.profile?.avatarUrl ? (
                <img src={ownerProfile.profile.avatarUrl} alt={ownerProfile.user?.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
              ) : (
                <span>{getInitials(ownerProfile?.user?.name || owner.name)}</span>
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "750", color: "var(--text-main)" }}>
                  {ownerProfile?.user?.name || owner.name}
                </h4>
                <span style={{ background: "#ecfdf5", color: "#059669", fontSize: "10px", fontWeight: "700", padding: "2px 6px", borderRadius: "999px", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                  <ShieldCheck size={10} />Verified Host
                </span>
              </div>
              <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>
                {ownerProfile?.profile?.occupation 
                  ? `${ownerProfile.profile.occupation}${ownerProfile.profile.companyOrCollege ? ` at ${ownerProfile.profile.companyOrCollege}` : ""}`
                  : "Property Owner · Hinjewadi Corridor Local"}
              </p>
            </div>
          </div>
        </Link>

        {/* Response Stats */}
        <div className="owner-stats select-none">
          <div className="owner-stat-box">
            <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)", justifyContent: "center", marginBottom: "4px" }}>
              <Clock size={12} />
              <span>Response Rate</span>
            </div>
            <strong style={{ fontSize: "13px", color: "var(--text-main)" }}>98% (Excellent)</strong>
          </div>
          <div className="owner-stat-box">
            <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)", justifyContent: "center", marginBottom: "4px" }}>
              <MessageSquare size={12} />
              <span>Typical Response Time</span>
            </div>
            <strong style={{ fontSize: "13px", color: "var(--text-main)" }}>under 5 mins</strong>
          </div>
        </div>

        {/* Action Buttons inside Owner Panel */}
        <div style={{ display: "flex", gap: "12px", borderTop: "1px solid var(--border)", paddingTop: "20px", marginTop: "8px" }}>
          <Link 
            to={`/chat/${listing._id}`} 
            className="btn"
            style={{ 
              flex: 1, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: "8px", 
              padding: "12px", 
              fontSize: "13px", 
              fontWeight: "700",
              background: "white",
              border: "1px solid var(--border)",
              color: "var(--text-main)",
              boxShadow: "var(--shadow-sm)",
              textDecoration: "none"
            }}
          >
            <MessageSquare size={14} />
            <span>Start Secure Chat</span>
          </Link>
          <button
            onClick={expressInterest}
            disabled={hasInterest}
            className="btn"
            style={{ 
              flex: 1, 
              padding: "12px", 
              fontSize: "13px", 
              fontWeight: "700",
              background: hasInterest ? "var(--primary-light)" : "var(--primary)",
              color: hasInterest ? "var(--primary)" : "white",
              boxShadow: "var(--shadow-md)"
            }}
          >
            {hasInterest ? "Interest Sent" : "Express Match Interest"}
          </button>
        </div>
      </div>

      {/* Reviews Section on Listing details */}
      <div className="details-main-card">
        <h3 style={{ fontSize: "16px", fontWeight: "750", color: "var(--text-main)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Star size={16} style={{ color: "var(--warning)" }} />
          <span>Reviews &amp; Ratings ({reviewsStats.totalReviews})</span>
        </h3>
        
        {reviewsStats.totalReviews > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "var(--primary-light)", padding: "10px 16px", borderRadius: "10px", marginBottom: "16px" }}>
            <strong style={{ fontSize: "20px", color: "var(--primary-hover)" }}>{reviewsStats.averageRating} ★</strong>
            <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "600" }}>Average rating from flatmates</span>
          </div>
        )}

        {/* Review submit form */}
        {user && user.role === "tenant" && String(listing.ownerId) !== String(user._id) && (
          <form onSubmit={handleReviewSubmit} style={{ background: "#f8fafc", border: "1px solid var(--border)", padding: "16px", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
            <span style={{ fontSize: "13px", fontWeight: "750" }}>Write a review for this Host</span>
            {reviewMessage && (
              <div style={{ padding: "6px 10px", background: "var(--primary-light)", color: "var(--primary)", borderRadius: "6px", fontSize: "12px" }}>
                {reviewMessage}
              </div>
            )}
            <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>Rating:</span>
              <div style={{ display: "flex", gap: "2px" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span 
                    key={star} 
                    onClick={() => setNewRating(star)} 
                    style={{ cursor: "pointer", fontSize: "18px", color: star <= newRating ? "var(--warning)" : "#cbd5e1" }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
            <textarea
              rows="2"
              required
              value={newReviewText}
              onChange={(e) => setNewReviewText(e.target.value)}
              placeholder="Describe your host interaction or response time..."
              style={{ fontSize: "12.5px", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--border)", background: "white", resize: "none" }}
            />
            <button type="submit" disabled={reviewSubmitting} className="btn" style={{ padding: "6px 12px", fontSize: "12px", alignSelf: "flex-end" }}>
              {reviewSubmitting ? "Posting..." : "Post Review"}
            </button>
          </form>
        )}

        {/* Review list */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {reviews.length === 0 ? (
            <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0, fontStyle: "italic" }}>
              No reviews left for this landlord yet.
            </p>
          ) : (
            reviews.slice(0, 3).map((r) => (
              <div key={r._id} style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "10px", marginBottom: "4px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justify: "center", fontSize: "10px", fontWeight: "700" }}>
                      {getInitials(r.tenantId?.name || "T")}
                    </div>
                    <span style={{ fontSize: "12.5px", fontWeight: "700" }}>{r.tenantId?.name || "Tenant"}</span>
                  </div>
                  <span style={{ fontSize: "13px", color: "var(--warning)" }}>{"★".repeat(r.rating)}</span>
                </div>
                <p style={{ margin: 0, fontSize: "12.5px", color: "#475569" }}>{r.reviewText}</p>
              </div>
            ))
          )}
          {reviews.length > 3 && (
            <Link to={`/profile/${listing.ownerId}`} style={{ fontSize: "12.5px", color: "var(--primary)", fontWeight: "700", textDecoration: "none" }}>
              View all {reviews.length} reviews &rarr;
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
