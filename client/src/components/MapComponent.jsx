import { useEffect, useRef, useState } from "react";
import { Maximize2, Minimize2, MapPin, Search, ExternalLink } from "lucide-react";

export default function MapComponent({
  mode = "view", // view | edit
  lat = 18.5204, // Pune default lat
  lng = 73.8567, // Pune default lng
  initialSearch = "",
  onChange = null, // Callback for edit mode: ({ lat, lng, address })
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [coords, setCoords] = useState({ lat, lng });
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  // Load Leaflet dynamically from CDN to avoid huge node modules bundle sizing
  useEffect(() => {
    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    const cssId = "leaflet-cdn-css";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const jsId = "leaflet-cdn-js";
    if (!document.getElementById(jsId)) {
      const script = document.createElement("script");
      script.id = jsId;
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => setLeafletLoaded(true);
      document.body.appendChild(script);
    } else {
      // Script is already in DOM, check periodically if script finished loading
      const interval = setInterval(() => {
        if (window.L) {
          setLeafletLoaded(true);
          clearInterval(interval);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  // Update internal coordinates when props change
  useEffect(() => {
    if (lat && lng) {
      setCoords({ lat, lng });
      if (mapRef.current && markerRef.current) {
        mapRef.current.setView([lat, lng], 14);
        markerRef.current.setLatLng([lat, lng]);
      }
    }
  }, [lat, lng]);

  // Map initialization
  useEffect(() => {
    if (!leafletLoaded || !containerRef.current) return;

    // Clean up previous map instance to prevent double-initialization errors
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const L = window.L;
    const initialLat = coords.lat || 18.5204;
    const initialLng = coords.lng || 73.8567;

    const map = L.map(containerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    }).addTo(map);

    // Create marker icon styling logic for Leaflet
    const defaultIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const marker = L.marker([initialLat, initialLng], {
      icon: defaultIcon,
      draggable: mode === "edit",
    }).addTo(map);

    if (mode === "edit") {
      // Event handler for dragging the pin marker
      marker.on("dragend", async () => {
        const position = marker.getLatLng();
        setCoords({ lat: position.lat, lng: position.lng });
        if (onChange) {
          const address = await reverseGeocode(position.lat, position.lng);
          onChange({
            lat: Number(position.lat.toFixed(6)),
            lng: Number(position.lng.toFixed(6)),
            address,
          });
        }
      });

      // Event handler for clicking anywhere on the map to place pin
      map.on("click", async (e) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        setCoords({ lat, lng });
        if (onChange) {
          const address = await reverseGeocode(lat, lng);
          onChange({
            lat: Number(lat.toFixed(6)),
            lng: Number(lng.toFixed(6)),
            address,
          });
        }
      });
    }

    mapRef.current = map;
    markerRef.current = marker;

    // Trigger map invalidations to recalculate sizing when layout loads
    setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 150);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [leafletLoaded, mode, isFullscreen]);

  // OSM reverse geocoding to retrieve formatted address strings
  const reverseGeocode = async (latitude, longitude) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&zoom=18`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "RentFlatmateFinderAgent/1.0",
        },
      });
      const data = await res.json();
      return data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    } catch {
      return `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
    }
  };

  // OSM Nominatim address search
  const handleAddressSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    setSearchError("");

    try {
      // Add Pune focus if not specified to optimize local searches
      const searchStr = searchQuery.toLowerCase().includes("pune")
        ? searchQuery
        : `${searchQuery}, Pune, Maharashtra, India`;

      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchStr)}&format=json&limit=1`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "RentFlatmateFinderAgent/1.0",
        },
      });
      const data = await res.json();

      if (data && data.length > 0) {
        const item = data[0];
        const newLat = parseFloat(item.lat);
        const newLng = parseFloat(item.lon);
        const address = item.display_name;

        setCoords({ lat: newLat, lng: newLng });
        
        if (mapRef.current && markerRef.current) {
          mapRef.current.setView([newLat, newLng], 14);
          markerRef.current.setLatLng([newLat, newLng]);
        }

        if (onChange) {
          onChange({
            lat: Number(newLat.toFixed(6)),
            lng: Number(newLng.toFixed(6)),
            address,
          });
        }
      } else {
        setSearchError("No results found. Please check spelling or try a broader area.");
      }
    } catch (err) {
      console.error(err);
      setSearchError("Search failed. Check your internet connection.");
    } finally {
      setLoading(false);
    }
  };

  // Google Maps external link redirection helper
  const openInGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${coords.lat},${coords.lng}`;
    window.open(url, "_blank");
  };

  return (
    <div style={{ position: "relative", width: "100%", zIndex: 10 }}>
      {/* Search Input Bar (Edit Mode only) */}
      {mode === "edit" && (
        <div className="map-search-bar">
          <input
            type="text"
            placeholder="Search address (e.g. Balewadi High Street, Pune)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddressSearch();
              }
            }}
          />
          <button 
            type="button" 
            onClick={handleAddressSearch}
            disabled={loading}
            style={{ padding: "10px 16px", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }}
          >
            <Search size={14} />
            <span>{loading ? "Searching..." : "Locate"}</span>
          </button>
        </div>
      )}

      {searchError && (
        <p style={{ color: "var(--danger)", fontSize: "12px", margin: "0 0 8px", fontWeight: "600" }}>
          ⚠️ {searchError}
        </p>
      )}

      {/* Main Map Box */}
      <div 
        className={isFullscreen ? "fullscreen-map-overlay" : "map-wrapper"}
      >
        {isFullscreen && (
          <div className="fullscreen-map-header">
            <span style={{ fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
              <MapPin size={18} />
              Interactive Location Map Selector
            </span>
            <button 
              type="button"
              onClick={() => setIsFullscreen(false)} 
              className="btn"
              style={{ background: "#ef4444", color: "white", padding: "6px 12px", fontSize: "12px" }}
            >
              <Minimize2 size={14} style={{ marginRight: "4px" }} />
              Close Fullscreen
            </button>
          </div>
        )}

        {/* Leaflet DOM Node Element Container */}
        <div ref={containerRef} className="map-container-inner" />

        {/* Overlay action items */}
        {leafletLoaded && (
          <>
            {/* Coordinate display pill */}
            <div className="coordinate-display-pill">
              Lat: {coords.lat.toFixed(5)}, Lng: {coords.lng.toFixed(5)}
            </div>

            {/* Float action buttons overlay */}
            <div style={{ position: "absolute", top: "12px", right: "12px", display: "flex", gap: "6px", zIndex: 1000 }}>
              <button
                type="button"
                onClick={openInGoogleMaps}
                style={{
                  background: "white",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "8px 12px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11px",
                  fontWeight: "700",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                  color: "var(--text-main)",
                }}
                title="Open coordinates in Google Maps website"
              >
                <ExternalLink size={12} />
                <span>Open in GMaps</span>
              </button>
              
              {!isFullscreen && (
                <button
                  type="button"
                  onClick={() => setIsFullscreen(true)}
                  style={{
                    background: "white",
                    border: "1px solid var(--border)",
                    borderRadius: "8px",
                    width: "32px",
                    height: "32px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.15)",
                  }}
                  title="Expand Map to Fullscreen"
                >
                  <Maximize2 size={14} style={{ color: "var(--text-main)" }} />
                </button>
              )}
            </div>
          </>
        )}

        {!leafletLoaded && (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#f8fafc", color: "var(--text-muted)", fontSize: "14px", fontWeight: "600" }} className="skeleton-pulse">
            🌐 Initializing Map Engine...
          </div>
        )}
      </div>

      {mode === "edit" && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px", fontSize: "12px", color: "var(--text-muted)" }}>
          <span>💡 Click or drag the marker to set coordinates.</span>
          <strong>OSM Geocoder Active</strong>
        </div>
      )}
    </div>
  );
}
