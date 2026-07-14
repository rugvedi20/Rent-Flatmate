import { MapPin } from "lucide-react";

export default function PropertySpecs({ listing, society, amenities }) {
  return (
    <div className="details-main-card">
      <div>
        <span style={{ fontSize: "12px", fontWeight: "800", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {society} Gated Complex
        </span>
        <h1 style={{ fontSize: "26px", fontWeight: "800", color: "var(--text-main)", marginTop: "4px" }}>
          {listing.title}
        </h1>
        
        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontSize: "14px", marginTop: "8px", fontWeight: "500" }}>
          <MapPin size={15} style={{ color: "#9ca3af" }} />
          <span>{listing.location}</span>
        </div>
      </div>

      {/* Core Parameters Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", background: "#fbfbfa", border: "1px solid var(--border)", padding: "16px", borderRadius: "12px", textAlign: "center" }}>
        <div>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>Room Type</span>
          <p style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: "750", color: "var(--text-main)", textTransform: "capitalize" }}>{listing.roomType}</p>
        </div>
        <div style={{ borderLeft: "1px solid var(--border)", borderRight: "1px solid var(--border)" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>Furnishing</span>
          <p style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: "750", color: "var(--text-main)", textTransform: "capitalize" }}>{listing.furnishing}</p>
        </div>
        <div>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "700" }}>Availability</span>
          <p style={{ margin: "4px 0 0", fontSize: "15px", fontWeight: "750", color: "var(--text-main)" }}>
            {listing.availableFrom ? new Date(listing.availableFrom).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Immediate"}
          </p>
        </div>
      </div>

      {/* Description Panel */}
      <div>
        <h3 style={{ fontSize: "16px", fontWeight: "750", color: "var(--text-main)", marginBottom: "10px" }}>Property Description</h3>
        <p style={{ fontSize: "14px", color: "#4b5563", lineHeight: "1.7", margin: 0 }}>
          {listing.description || "No description provided for this listing. Contact the property owner directly for layout plans, rules, and additional specifications."}
        </p>
      </div>

      {/* Amenities Chip List */}
      <div>
        <h3 style={{ fontSize: "16px", fontWeight: "750", color: "var(--text-main)", marginBottom: "14px" }}>Key Amenities</h3>
        <div className="amenities-grid select-none">
          {amenities.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="amenity-chip">
                <Icon size={16} className="text-[#4b5563]" />
                <span>{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
