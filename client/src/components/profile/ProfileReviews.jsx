import { MessageSquare } from "lucide-react";

export default function ProfileReviews({
  user,
  currentUser,
  isOwnProfile,
  reviews,
  reviewsStats,
  newRating,
  setNewRating,
  newReviewText,
  setNewReviewText,
  reviewMessage,
  reviewSubmitting,
  handleReviewSubmit,
  getInitials,
}) {
  if (user.role !== "owner") return null;

  return (
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
  );
}
