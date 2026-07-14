import MapComponent from "../../components/MapComponent";

export const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
];

export const COVER_PRESETS = [
  "https://images.unsplash.com/photo-1557683316-973673baf926?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&auto=format&fit=crop&q=80"
];

export default function ProfileEditForm({
  role,
  formName,
  setFormName,
  formPhone,
  setFormPhone,
  formOccupation,
  setFormOccupation,
  formCompanyOrCollege,
  setFormCompanyOrCollege,
  formLanguages,
  setFormLanguages,
  formBio,
  setFormBio,
  formAvatarUrl,
  setFormAvatarUrl,
  formCoverImageUrl,
  setFormCoverImageUrl,
  formPreferredLocation,
  setFormPreferredLocation,
  formLocationCoords,
  setFormLocationCoords,
  formMoveInDate,
  setFormMoveInDate,
  formBudgetMin,
  setFormBudgetMin,
  formBudgetMax,
  setFormBudgetMax,
  formPreferredRoomType,
  setFormPreferredRoomType,
  formPreferredFurnishing,
  setFormPreferredFurnishing,
  formGenderPreference,
  setFormGenderPreference,
  formParkingRequired,
  setFormParkingRequired,
  formPetsAllowed,
  setFormPetsAllowed,
  formSmokingAllowed,
  setFormSmokingAllowed,
  handleSave,
  setIsEditing,
}) {
  return (
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
        {role === "tenant" && (
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "20px", marginTop: "10px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: "750" }}>Match Preferences (Tenant fields)</h3>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
              <div className="form-group">
                <label>Preferred Locality *</label>
                <input
                  required
                  placeholder="e.g. Baner"
                  value={formPreferredLocation}
                  onChange={(e) => setFormPreferredLocation(e.target.value)}
                />
              </div>

              {/* Leaflet CDN Mapping Tool for Tenant Preferred Location */}
              <div style={{ marginBottom: "10px" }}>
                <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>Search & Pick Locality on Map</label>
                <MapComponent
                  mode="edit"
                  lat={formLocationCoords?.coordinates[1] || 18.5204}
                  lng={formLocationCoords?.coordinates[0] || 73.8567}
                  initialSearch={formPreferredLocation}
                  onChange={({ lat, lng, address }) => {
                    setFormLocationCoords({ type: "Point", coordinates: [lng, lat] });
                    setFormPreferredLocation(address);
                  }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px" }}>
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
  );
}
