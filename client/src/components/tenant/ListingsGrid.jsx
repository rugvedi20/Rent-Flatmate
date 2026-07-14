import PropertyCard from "../PropertyCard";

export default function ListingsGrid({
  loading,
  listings,
  ranked,
  savedListings,
  sentInterests,
  toggleSave,
  expressInterest,
  handleReset,
  page,
  totalPages,
  loadListings,
}) {
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "750", color: "var(--text-main)" }}>
          Verified Property Matches {ranked && "· Ranked by Compatibility"}
        </h2>
        {ranked && <span className="badge badge-high" style={{ fontSize: "11px" }}>AI Matching Engine Active</span>}
      </div>

      {loading && (
        <div className="landing-grid-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="card" style={{ padding: 0, height: "380px", overflow: "hidden", borderRadius: "16px", border: "1px solid var(--border)", boxShadow: "none" }}>
              <div style={{ height: "230px" }} className="skeleton-pulse" />
              <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ height: "12px", width: "40%" }} className="skeleton-pulse skeleton-text" />
                <div style={{ height: "20px", width: "80%" }} className="skeleton-pulse skeleton-text heading" />
                <div style={{ height: "14px", width: "60%" }} className="skeleton-pulse skeleton-text" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && listings.length === 0 && (
        <div style={{ padding: "64px 24px", textAlign: "center", background: "white", borderRadius: "20px", border: "1px solid var(--border)", color: "var(--text-muted)" }}>
          <span style={{ fontSize: "48px" }}>🧭</span>
          <h3 style={{ fontSize: "18px", fontWeight: "750", color: "var(--text-main)", marginTop: "16px" }}>No matching rooms found</h3>
          <p style={{ fontSize: "13.5px", color: "var(--text-muted)", maxWidth: "340px", margin: "8px auto 20px" }}>
            We couldn't find any listings that match your search filters. Try adjusting your price range or locality criteria.
          </p>
          <button onClick={handleReset} className="btn" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>Reset All Filters</button>
        </div>
      )}

      {!loading && listings.length > 0 && (
        <div className="landing-grid-3">
          {listings.map((item) => {
            const listing = ranked ? item.listing : item;
            const compatibility = ranked ? item.compatibility : null;
            const isBookmarked = savedListings.some((s) => s._id === listing._id);
            const hasExpressedInterest = sentInterests.some((i) => String(i.listingId?._id) === String(listing._id));

            return (
              <PropertyCard
                key={listing._id}
                listing={listing}
                compatibility={compatibility}
                isSaved={isBookmarked}
                onToggleSave={toggleSave}
                onExpressInterest={expressInterest}
                hasExpressedInterest={hasExpressedInterest}
              />
            );
          })}
        </div>
      )}

      {/* Pagination controls */}
      {!loading && totalPages > 1 && (
        <div style={{ display: "flex", gap: "12px", alignItems: "center", justifyContent: "center", marginTop: "32px" }}>
          <button
            disabled={page <= 1}
            onClick={() => loadListings(page - 1)}
            style={{ background: "#64748b", padding: "10px 20px" }}
          >
            Previous
          </button>
          <span style={{ fontSize: "14px", fontWeight: "700" }}>Page {page} of {totalPages}</span>
          <button
            disabled={page >= totalPages}
            onClick={() => loadListings(page + 1)}
            style={{ background: "#64748b", padding: "10px 20px" }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
