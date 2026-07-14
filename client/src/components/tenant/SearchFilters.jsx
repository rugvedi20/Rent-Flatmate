export default function SearchFilters({
  searchLoc,
  setSearchLoc,
  searchMin,
  setSearchMin,
  searchMax,
  setSearchMax,
  searchRoomType,
  setSearchRoomType,
  searchFurnishing,
  setSearchFurnishing,
  loadListings,
  handleReset,
}) {
  const hasFilters = searchLoc || searchRoomType || searchFurnishing || searchMin || searchMax;

  return (
    <div className="filter-card-bar">
      <div className="filter-group">
        <label>Locality / Area</label>
        <input
          type="text"
          placeholder="Search localities (e.g. Baner, Wakad)..."
          value={searchLoc}
          onChange={(e) => setSearchLoc(e.target.value)}
        />
      </div>

      <div className="filter-group">
        <label>Room Type</label>
        <select value={searchRoomType} onChange={(e) => setSearchRoomType(e.target.value)}>
          <option value="">Any Room Type</option>
          <option value="single">Single Room</option>
          <option value="shared">Shared Room</option>
          <option value="1bhk">1 BHK</option>
          <option value="2bhk">2 BHK</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Furnishing</label>
        <select value={searchFurnishing} onChange={(e) => setSearchFurnishing(e.target.value)}>
          <option value="">Any Furnishing</option>
          <option value="furnished">Furnished</option>
          <option value="semi-furnished">Semi-Furnished</option>
          <option value="unfurnished">Unfurnished</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Min Price (₹)</label>
        <input
          type="number"
          placeholder="Min Budget"
          value={searchMin}
          onChange={(e) => setSearchMin(e.target.value)}
        />
      </div>

      <div className="filter-group">
        <label>Max Price (₹)</label>
        <input
          type="number"
          placeholder="Max Budget"
          value={searchMax}
          onChange={(e) => setSearchMax(e.target.value)}
        />
      </div>

      <div style={{ display: "flex", gap: "8px", alignSelf: "flex-end", height: "42px" }}>
        <button
          type="button"
          onClick={() => loadListings(1)}
          style={{ padding: "0 24px", height: "100%", fontWeight: "700" }}
        >
          Apply Filters
        </button>
        {hasFilters && (
          <button
            type="button"
            onClick={handleReset}
            style={{ background: "#f1f5f9", color: "#475569", border: "1px solid var(--border)", padding: "0 16px", height: "100%", fontWeight: "700" }}
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
