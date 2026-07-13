import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MapPin, Sparkles, ChevronLeft, ChevronRight, Check } from "lucide-react";

const DEFAULT_PHOTOS = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80"
];

export default function PropertyCard({ 
  listing, 
  compatibility, 
  isSaved, 
  onToggleSave, 
  onExpressInterest, 
  hasExpressedInterest 
}) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const photos = listing.photos && listing.photos.length > 0 ? listing.photos : DEFAULT_PHOTOS;

  const nextPhoto = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  // Determine score color wrapper classes
  let barColorClass = "poor";
  let badgeColorClass = "badge-low";
  if (compatibility) {
    const score = compatibility.score;
    if (score >= 85) {
      barColorClass = "excellent";
      badgeColorClass = "badge-high";
    } else if (score >= 70) {
      barColorClass = "good";
      badgeColorClass = "badge-high";
    } else if (score >= 50) {
      barColorClass = "moderate";
      badgeColorClass = "badge-mid";
    }
  }

  return (
    <motion.div 
      className="glass-card"
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      style={{ 
        display: "flex", 
        flexDirection: "column", 
        padding: 0, 
        overflow: "hidden", 
        position: "relative",
        background: "rgba(255, 255, 255, 0.9)",
        height: "100%",
        border: "1px solid var(--border)"
      }}
    >
      {/* Image Carousel */}
      <div style={{ position: "relative", height: "220px", background: "#f3f4f6", overflow: "hidden" }}>
        
        <Link to={`/listings/${listing._id}`}>
          <img 
            src={photos[photoIndex]} 
            alt={listing.title} 
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.4s ease" }}
            className="carousel-image"
          />
        </Link>

        {/* Carousel buttons */}
        {photos.length > 1 && (
          <>
            <button 
              onClick={prevPhoto}
              className="carousel-btn"
              style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", zIndex: 10, padding: 0, width: "30px", height: "30px", background: "rgba(255, 255, 255, 0.95)", color: "#1f2937", border: "1px solid #e5e7eb", borderRadius: "50%", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={nextPhoto}
              className="carousel-btn"
              style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", zIndex: 10, padding: 0, width: "30px", height: "30px", background: "rgba(255, 255, 255, 0.95)", color: "#1f2937", border: "1px solid #e5e7eb", borderRadius: "50%", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}
            >
              <ChevronRight size={16} />
            </button>
          </>
        )}

        {/* Dot Indicators */}
        <div style={{ position: "absolute", bottom: "12px", left: "50%", transform: "translateX(-50%)", display: "flex", gap: "6px", zIndex: 10 }}>
          {photos.map((_, idx) => (
            <span 
              key={idx} 
              style={{ 
                width: "6px", 
                height: "6px", 
                borderRadius: "50%", 
                background: idx === photoIndex ? "#ffffff" : "rgba(255, 255, 255, 0.5)",
                transition: "background 0.2s"
              }} 
            />
          ))}
        </div>

        {/* Save Toggle Badge */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSave(listing._id); }}
          style={{ 
            position: "absolute", 
            top: "14px", 
            right: "14px", 
            zIndex: 10, 
            background: isSaved ? "rgba(239, 68, 68, 0.15)" : "rgba(255, 255, 255, 0.9)", 
            color: isSaved ? "#f43f5e" : "#6b7280", 
            border: "none", 
            width: "36px", 
            height: "36px", 
            borderRadius: "50%", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
            padding: 0
          }}
        >
          <Heart size={18} fill={isSaved ? "#f43f5e" : "none"} />
        </button>

        {/* Room Type Tag overlay */}
        <span 
          className="badge" 
          style={{ 
            position: "absolute", 
            bottom: "14px", 
            left: "14px", 
            zIndex: 10, 
            background: "rgba(31, 41, 55, 0.8)", 
            color: "#ffffff", 
            backdropFilter: "blur(4px)",
            padding: "4px 10px",
            fontSize: "11px",
            textTransform: "capitalize"
          }}
        >
          {listing.roomType} · {listing.furnishing}
        </span>
      </div>

      {/* Details Box */}
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1, gap: "10px" }}>
        
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
            <Link to={`/listings/${listing._id}`} style={{ textDecoration: "none", color: "inherit", flex: 1 }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "700", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {listing.title}
              </h3>
            </Link>
            <span style={{ fontSize: "16px", fontWeight: "800", color: "var(--primary)", flexShrink: 0 }}>
              ₹{listing.rent.toLocaleString()}/mo
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)", fontSize: "13px", marginTop: "4px" }}>
            <MapPin size={13} style={{ color: "var(--primary)" }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {listing.location}
            </span>
          </div>
        </div>

        {/* Proximity / Distance tags */}
        {compatibility && compatibility.distanceKm !== undefined && compatibility.distanceKm !== null && (
          <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", background: "#fbfbfa", padding: "6px 10px", borderRadius: "8px", border: "1px solid var(--border)" }}>
            <span>📍 {compatibility.distanceKm} km from preferred location</span>
          </div>
        )}

        {/* AI Recommendations */}
        {compatibility && (
          <div style={{ background: "#f9fafb", border: "1px solid var(--border)", borderRadius: "12px", padding: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", fontWeight: "700" }}>
                <Sparkles size={13} style={{ color: "var(--primary)" }} />
                <span>AI recommendation</span>
              </div>
              <span className={`badge ${badgeColorClass}`} style={{ fontSize: "10.5px", padding: "2px 8px" }}>
                {compatibility.badge} ({compatibility.score}%)
              </span>
            </div>
            
            {/* Simple matching bar */}
            <div className="compat-container" style={{ height: "4px", margin: "6px 0 2px" }}>
              <div className={`compat-bar ${barColorClass}`} style={{ width: `${compatibility.score}%` }}></div>
            </div>

            <p style={{ fontSize: "11.5px", color: "var(--text-muted)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
              {compatibility.explanation.split("[Distance")[0]}
            </p>
          </div>
        )}

        {/* Action button trigger row */}
        <div style={{ display: "flex", gap: "8px", marginTop: "auto", paddingTop: "8px" }}>
          <Link to={`/listings/${listing._id}`} className="btn" style={{ flex: 1, padding: "8px 16px", background: "transparent", color: "var(--text-main)", border: "1px solid var(--border)", boxShadow: "none", fontSize: "12.5px" }}>
            View Details
          </Link>
          <button
            onClick={() => onExpressInterest(listing._id)}
            disabled={hasExpressedInterest}
            style={{ 
              flex: 1.2, 
              padding: "8px 16px", 
              fontSize: "12.5px",
              background: hasExpressedInterest ? "var(--primary-light)" : "var(--primary)",
              color: hasExpressedInterest ? "var(--primary)" : "white",
              boxShadow: "none"
            }}
          >
            {hasExpressedInterest ? (
              <>
                <Check size={14} />
                <span>Interested</span>
              </>
            ) : (
              "Express Interest"
            )}
          </button>
        </div>

      </div>
    </motion.div>
  );
}
