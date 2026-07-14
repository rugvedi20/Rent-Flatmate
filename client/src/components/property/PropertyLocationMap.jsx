import MapComponent from "../../components/MapComponent";

export default function PropertyLocationMap({
  listing,
  loadingPOIs,
  nearbyPOIs,
  getPoiIcon,
}) {
  const hasCoords = listing.locationCoords?.coordinates && listing.locationCoords.coordinates.length >= 2;

  if (!hasCoords) return null;

  return (
    <>
      <div className="details-main-card" style={{ zIndex: 1 }}>
        <h3 style={{ fontSize: "16px", fontWeight: "750", color: "var(--text-main)", marginBottom: "14px" }}>Property Location Map</h3>
        <MapComponent
          mode="view"
          lat={listing.locationCoords.coordinates[1]}
          lng={listing.locationCoords.coordinates[0]}
        />
      </div>

      <div className="details-main-card">
        <h3 style={{ fontSize: "16px", fontWeight: "750", color: "var(--text-main)", marginBottom: "4px" }}>Nearby Places &amp; Transit</h3>
        <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: "0 0 14px" }}>Approximate distance from the property</p>
        {loadingPOIs ? (
          <div className="skeleton-pulse" style={{ height: "100px", borderRadius: "10px", background: "#f1f5f9" }} />
        ) : (
          <div className="poi-grid">
            {nearbyPOIs.map((poi, idx) => (
              <div key={idx} className="poi-chip">
                <div className="poi-icon-box">
                  {getPoiIcon(poi.category)}
                </div>
                <div className="poi-info">
                  <span className="name">{poi.name}</span>
                  <span className="dist">{poi.category} · {poi.distance} km away</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
