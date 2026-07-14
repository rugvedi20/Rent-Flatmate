import MapComponent from "../../components/MapComponent";

const PROPERTY_PHOTO_PRESETS = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&auto=format&fit=crop&q=80"
];

export default function CreateListingForm({ form, setForm, createListing }) {
  return (
    <div className="card" style={{ padding: "24px" }}>
      <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px" }}>Create a Room Listing</h2>
      <form onSubmit={createListing} style={{ border: "none", padding: 0, boxShadow: "none", margin: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
        <div>
          <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Title</label>
          <input placeholder="e.g. Spacious 1BHK in Baner" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        </div>

        <div>
          <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Locality/Address</label>
          <input placeholder="e.g. Baner, Pune" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
        </div>

        {/* Leaflet CDN Mapping Tool for Listing Location Coordinates */}
        <div style={{ marginBottom: "10px" }}>
          <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Pin Location on Map</label>
          <MapComponent
            mode="edit"
            lat={form.locationCoords.coordinates[1]}
            lng={form.locationCoords.coordinates[0]}
            initialSearch={form.location}
            onChange={({ lat, lng, address }) => {
              setForm(prev => ({
                ...prev,
                locationCoords: { type: "Point", coordinates: [lng, lat] },
                location: address
              }));
            }}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Society Name</label>
            <input placeholder="e.g. Ganga Acropolis" value={form.societyName} onChange={(e) => setForm({ ...form, societyName: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Area / Locality</label>
            <input placeholder="e.g. Baner" value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Landmark</label>
            <input placeholder="e.g. Near Balewadi High Street" value={form.landmark} onChange={(e) => setForm({ ...form, landmark: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Pincode</label>
            <input placeholder="e.g. 411045" value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>City</label>
            <input placeholder="Pune" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>State</label>
            <input placeholder="Maharashtra" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Rent (₹/mo)</label>
            <input type="number" placeholder="Rent Amount" value={form.rent} onChange={(e) => setForm({ ...form, rent: e.target.value })} required />
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Availability Date</label>
            <input type="date" value={form.availableFrom} onChange={(e) => setForm({ ...form, availableFrom: e.target.value })} required />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Room Type</label>
            <select value={form.roomType} onChange={(e) => setForm({ ...form, roomType: e.target.value })}>
              <option value="single">Single Room</option>
              <option value="shared">Shared Room</option>
              <option value="1bhk">1BHK</option>
              <option value="2bhk">2BHK</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Furnishing</label>
            <select value={form.furnishing} onChange={(e) => setForm({ ...form, furnishing: e.target.value })}>
              <option value="furnished">Furnished</option>
              <option value="semi-furnished">Semi-furnished</option>
              <option value="unfurnished">Unfurnished</option>
            </select>
          </div>
        </div>

        <div>
          <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Description &amp; Rules</label>
          <textarea placeholder="e.g. Near highway, no pets allowed, washing machine present..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ height: "100px" }} />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase" }}>Property Images</label>
          
          {/* Selected photos list */}
          {form.photos && form.photos.length > 0 && (
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "10px" }}>
              {form.photos.map((photo, idx) => (
                <div key={idx} style={{ position: "relative", width: "60px", height: "60px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--border)" }}>
                  <img src={photo} alt={`Upload ${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== idx) }))}
                    style={{
                      position: "absolute",
                      top: "2px",
                      right: "2px",
                      width: "16px",
                      height: "16px",
                      background: "rgba(0,0,0,0.6)",
                      color: "white",
                      borderRadius: "50%",
                      border: "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "10px",
                      cursor: "pointer",
                      padding: 0
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Preset selection clickables */}
          <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block", marginBottom: "4px", fontWeight: "600" }}>Choose from presets:</span>
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            {PROPERTY_PHOTO_PRESETS.map((preset, idx) => {
              const isSelected = form.photos.includes(preset);
              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (isSelected) {
                      setForm(prev => ({ ...prev, photos: prev.photos.filter(p => p !== preset) }));
                    } else {
                      setForm(prev => ({ ...prev, photos: [...prev.photos, preset] }));
                    }
                  }}
                  style={{
                    width: "50px",
                    height: "50px",
                    borderRadius: "6px",
                    overflow: "hidden",
                    cursor: "pointer",
                    border: isSelected ? "2px solid var(--primary)" : "1px solid var(--border)",
                    position: "relative",
                    opacity: isSelected ? 1 : 0.6
                  }}
                >
                  <img src={preset} alt={`Preset ${idx}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  {isSelected && (
                    <div style={{ position: "absolute", bottom: "2px", right: "2px", width: "12px", height: "12px", borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "8px", color: "white" }}>
                      ✓
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Custom url input box */}
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              id="customPhotoInput"
              placeholder="Or paste property image URL..."
              style={{ flex: 1, fontSize: "12.5px", padding: "8px 10px" }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  const val = e.target.value.trim();
                  if (val) {
                    setForm(prev => ({ ...prev, photos: [...prev.photos, val] }));
                    e.target.value = "";
                  }
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("customPhotoInput");
                const val = el ? el.value.trim() : "";
                if (val) {
                  setForm(prev => ({ ...prev, photos: [...prev.photos, val] }));
                  el.value = "";
                }
              }}
              className="btn"
              style={{ padding: "8px 12px", fontSize: "12px", background: "white", color: "var(--text-main)", border: "1px solid var(--border)" }}
            >
              Add
            </button>
          </div>
        </div>

        <button type="submit" style={{ width: "100%", marginTop: "10px" }}>Publish Ad</button>
      </form>
    </div>
  );
}
