import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Heart, 
  MapPin, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight, 
  Check,
  Wifi,
  Car,
  Wind,
  ChefHat,
  ShieldCheck,
  Calendar,
  Dumbbell
} from "lucide-react";

// Deterministic mock Unsplash photo collections for premium visual style
const PHOTO_COLLECTIONS = [
  [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&auto=format&fit=crop&q=80"
  ],
  [
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1502672014263-0c15ab4b415e?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&auto=format&fit=crop&q=80"
  ],
  [
    "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80"
  ]
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
  const [imageError, setImageError] = useState(false);

  // Determine which photos to use (listing photos or fallback deterministic Unsplash set)
  const getListingPhotos = () => {
    if (listing.photos && listing.photos.length > 0) {
      return listing.photos;
    }
    const idx = Math.abs(listing._id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % PHOTO_COLLECTIONS.length;
    return PHOTO_COLLECTIONS[idx];
  };

  const photos = getListingPhotos();

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

  // Helper to extract a realistic society name from listing title or details
  const getSocietyName = () => {
    const title = listing.title || "";
    // Regex matches common expressions like "in Ganga Acropolis", "at Jewel Residency", "near Signature Towers"
    const match = title.match(/(?:in|at|near|of)\s+([A-Za-z0-9\s]+?)(?:society|residency|towers|park|complex|lane|pg|flat|house|room|$)/i);
    if (match && match[1] && match[1].trim().length > 3) {
      return match[1].trim();
    }
    // Fallback based on locality or default
    const locality = (listing.location || "").split(",")[0].trim();
    return `${locality} Premium Complex`;
  };

  // Parse amenities from description keywords
  const getAmenities = () => {
    const desc = (listing.description || "").toLowerCase();
    const list = [];
    if (desc.includes("wifi") || desc.includes("internet") || desc.includes("net")) {
      list.push({ label: "WiFi", icon: Wifi });
    }
    if (desc.includes("parking") || desc.includes("park") || desc.includes("car") || desc.includes("garage")) {
      list.push({ label: "Parking", icon: Car });
    }
    if (desc.includes("ac") || desc.includes("air condition") || desc.includes("cooler") || desc.includes("split")) {
      list.push({ label: "AC", icon: Wind });
    }
    if (desc.includes("kitchen") || desc.includes("cook") || desc.includes("oven") || desc.includes("induction")) {
      list.push({ label: "Kitchen", icon: ChefHat });
    }
    if (desc.includes("gym") || desc.includes("fitness") || desc.includes("workout")) {
      list.push({ label: "Gym", icon: Dumbbell });
    }
    // Fallback to standard premium amenities if listing description is brief
    if (list.length === 0) {
      return [
        { label: "WiFi", icon: Wifi },
        { label: "Parking", icon: Car },
        { label: "Kitchen", icon: ChefHat },
        { label: "AC", icon: Wind }
      ];
    }
    return list.slice(0, 4);
  };

  const society = getSocietyName();
  const amenities = getAmenities();

  // Score badge layout helper
  let badgeColorClass = "moderate";
  let badgeLabel = "Moderate Match";
  if (compatibility) {
    const score = compatibility.score;
    if (score >= 85) {
      badgeColorClass = "excellent";
      badgeLabel = "Excellent Match";
    } else if (score >= 70) {
      badgeColorClass = "good";
      badgeLabel = "Good Match";
    } else if (score >= 50) {
      badgeColorClass = "moderate";
      badgeLabel = "Moderate Match";
    } else {
      badgeColorClass = "poor";
      badgeLabel = "Poor Match";
    }
  }

  // Format available date nicely
  const getFormattedDate = () => {
    if (!listing.availableFrom) return "Immediate";
    const date = new Date(listing.availableFrom);
    return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <motion.div 
      whileHover={{ y: -6, boxShadow: "0 18px 36px rgba(0, 0, 0, 0.06)" }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="card"
      style={{ 
        display: "flex", 
        flexDirection: "column", 
        padding: 0, 
        overflow: "hidden", 
        position: "relative",
        background: "#ffffff",
        height: "100%",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.02)"
      }}
    >
      
      {/* 1. Image Carousel Container */}
      <div style={{ position: "relative", height: "230px", background: "#f3f4f6", overflow: "hidden" }}>
        
        <Link to={`/listings/${listing._id}`}>
          <img 
            src={imageError ? "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80" : photos[photoIndex]} 
            alt={listing.title} 
            onError={() => setImageError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </Link>

        {/* AI Match Badge (Pill overlayed top left) */}
        {compatibility && (
          <span 
            className={`recommendation-badge ${badgeColorClass}`}
            style={{ 
              position: "absolute", 
              top: "14px", 
              left: "14px", 
              zIndex: 10,
              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
              fontSize: "11px",
              padding: "4px 12px"
            }}
          >
            <Sparkles size={11} style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }} />
            {compatibility.score}% {compatibility.badge || "Match"}
          </span>
        )}

        {/* Verified Owner Badge (Pill overlayed top left, below compatibility) */}
        <span 
          style={{ 
            position: "absolute", 
            top: compatibility ? "48px" : "14px", 
            left: "14px", 
            zIndex: 10,
            background: "rgba(31, 41, 55, 0.85)", 
            color: "#ffffff",
            backdropFilter: "blur(6px)",
            borderRadius: "999px",
            padding: "4px 10px",
            fontSize: "10.5px",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}
        >
          <ShieldCheck size={12} className="text-[#10b981]" />
          <span>Owner Verified</span>
        </span>

        {/* Carousel buttons */}
        {photos.length > 1 && (
          <>
            <button 
              onClick={prevPhoto}
              className="carousel-btn"
              style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", zIndex: 10, padding: 0, width: "32px", height: "32px", background: "rgba(255, 255, 255, 0.95)", color: "#1f2937", border: "1px solid #e5e7eb", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 8px rgba(0,0,0,0.08)" }}
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={nextPhoto}
              className="carousel-btn"
              style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", zIndex: 10, padding: 0, width: "32px", height: "32px", background: "rgba(255, 255, 255, 0.95)", color: "#1f2937", border: "1px solid #e5e7eb", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", boxShadow: "0 4px 8px rgba(0,0,0,0.08)" }}
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
                background: idx === photoIndex ? "#ffffff" : "rgba(255, 255, 255, 0.45)",
                transition: "background 0.2s"
              }} 
            />
          ))}
        </div>

        {/* Bookmark heart button */}
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); onToggleSave(listing._id); }}
          style={{ 
            position: "absolute", 
            top: "14px", 
            right: "14px", 
            zIndex: 10, 
            background: isSaved ? "#ffe4e6" : "rgba(255, 255, 255, 0.95)", 
            color: isSaved ? "#f43f5e" : "#6b7280", 
            border: "none", 
            width: "36px", 
            height: "36px", 
            borderRadius: "50%", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.06)",
            padding: 0,
            cursor: "pointer"
          }}
        >
          <Heart size={18} fill={isSaved ? "#f43f5e" : "none"} />
        </button>

        {/* Room type tag overlay */}
        <span 
          style={{ 
            position: "absolute", 
            bottom: "12px", 
            left: "12px", 
            zIndex: 10, 
            background: "rgba(17, 24, 39, 0.8)", 
            color: "#ffffff", 
            backdropFilter: "blur(4px)",
            padding: "4px 10px",
            borderRadius: "6px",
            fontSize: "10px",
            fontWeight: "700",
            textTransform: "uppercase",
            letterSpacing: "0.02em"
          }}
        >
          {listing.roomType} · {listing.furnishing}
        </span>
      </div>

      <div style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1, gap: "12px" }}>
        
        {/* Society & Title Row */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", width: "100%" }}>
            <Link to={`/listings/${listing._id}`} style={{ textDecoration: "none", color: "inherit", flex: 1, minWidth: 0, overflow: "hidden" }}>
              <span style={{ fontSize: "11px", fontWeight: "750", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {society}
              </span>
              <h3 style={{ margin: "4px 0 0", fontSize: "16px", fontWeight: "750", color: "var(--text-main)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {listing.title}
              </h3>
            </Link>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
              <span style={{ fontSize: "17px", fontWeight: "800", color: "var(--primary)" }}>
                ₹{listing.rent.toLocaleString()}
              </span>
              <span style={{ fontSize: "10px", fontWeight: "700", color: "var(--text-muted)", marginTop: "2px" }}>per month</span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)", fontSize: "12.5px", marginTop: "6px" }}>
            <MapPin size={13} style={{ color: "#9ca3af" }} />
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: "500" }}>
              {listing.location}
            </span>
          </div>
        </div>

        {/* Distance Proximity Indicator */}
        {compatibility && compatibility.distanceKm !== undefined && compatibility.distanceKm !== null && (
          <div style={{ fontSize: "12px", fontWeight: "600", color: "var(--primary)", display: "flex", alignItems: "center", gap: "4px", background: "var(--primary-light)", padding: "6px 10px", borderRadius: "8px", border: "1px solid rgba(16, 185, 129, 0.15)", width: "fit-content" }}>
            <span>📍 {compatibility.distanceKm} km from preferred tech corridor</span>
          </div>
        )}

        {/* Availability Date */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>
          <Calendar size={13} />
          <span>Available from: <strong style={{ color: "var(--text-main)" }}>{getFormattedDate()}</strong></span>
        </div>

        {/* Key Amenities (Wifi, AC, Parking, Kitchen) */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", margin: "4px 0" }}>
          {amenities.map((item, idx) => {
            const Icon = item.icon;
            return (
              <span 
                key={idx} 
                style={{ 
                  display: "inline-flex", 
                  alignItems: "center", 
                  gap: "4.5px", 
                  background: "#f3f4f6", 
                  color: "var(--text-main)", 
                  padding: "4px 8px", 
                  borderRadius: "6px", 
                  fontSize: "11px", 
                  fontWeight: "600" 
                }}
              >
                <Icon size={12} style={{ color: "#4b5563" }} />
                <span>{item.label}</span>
              </span>
            );
          })}
        </div>

        {/* Short AI Explanation Summary */}
        {compatibility && (
          <div style={{ borderTop: "1px solid var(--border)", paddingTop: "12px", marginTop: "2px" }}>
            <p style={{ fontSize: "11.5px", color: "var(--text-muted)", margin: 0, lineHeight: "1.5", overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
              <strong>AI Recommendation:</strong> {compatibility.explanation.split("[Distance")[0]}
            </p>
          </div>
        )}

        {/* 3. Button Action Row */}
        <div style={{ display: "flex", gap: "8px", marginTop: "auto", paddingTop: "12px" }}>
          <Link 
            to={`/listings/${listing._id}`} 
            className="btn" 
            style={{ 
              flex: 1, 
              padding: "10px 16px", 
              background: "transparent", 
              color: "var(--text-main)", 
              border: "1px solid var(--border)", 
              boxShadow: "none", 
              fontSize: "12.5px",
              textAlign: "center",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none"
            }}
          >
            View Details
          </Link>
          <button
            onClick={() => onExpressInterest(listing._id)}
            disabled={hasExpressedInterest}
            style={{ 
              flex: 1.2, 
              padding: "10px 16px", 
              fontSize: "12.5px",
              background: hasExpressedInterest ? "var(--primary-light)" : "var(--primary)",
              color: hasExpressedInterest ? "var(--primary)" : "#ffffff",
              boxShadow: "none",
              cursor: hasExpressedInterest ? "default" : "pointer"
            }}
          >
            {hasExpressedInterest ? (
              <span style={{ display: "flex", alignItems: "center", gap: "4px", width: "100%", justifyContent: "center" }}>
                <Check size={14} />
                <span>Interested Sent</span>
              </span>
            ) : (
              "Express Interest"
            )}
          </button>
        </div>

      </div>
    </motion.div>
  );
}
