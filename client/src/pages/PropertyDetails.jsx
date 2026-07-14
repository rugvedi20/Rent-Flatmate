import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import MapComponent from "../components/MapComponent";
import { 
  ArrowLeft, 
  Heart, 
  MapPin, 
  Sparkles, 
  ShieldCheck, 
  Calendar, 
  Wifi, 
  Car, 
  Wind, 
  ChefHat, 
  Dumbbell, 
  Lock, 
  Shield, 
  Check, 
  MessageSquare,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  User,
  Clock,
  DollarSign,
  Info,
  Star
} from "lucide-react";
import api from "../services/api";

const PHOTO_COLLECTIONS = [
  [
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1000&auto=format&fit=crop&q=80"
  ],
  [
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1000&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1502672014263-0c15ab4b415e?w=1000&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1000&auto=format&fit=crop&q=80"
  ],
  [
    "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?w=1000&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80"
  ]
];

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [compatibility, setCompatibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // UX states
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [hasInterest, setHasInterest] = useState(false);
  const [message, setMessage] = useState("");

  // Real owner & review states
  const { user } = useAuth();
  const [ownerProfile, setOwnerProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsStats, setReviewsStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [newRating, setNewRating] = useState(5);
  const [newReviewText, setNewReviewText] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  // Nearby POIs states
  const [nearbyPOIs, setNearbyPOIs] = useState([]);
  const [loadingPOIs, setLoadingPOIs] = useState(false);

  // Get POI icon helper
  const getPoiIcon = (category) => {
    switch (category.toLowerCase()) {
      case "hospital":
        return <ShieldCheck size={16} />;
      case "metro/bus stop":
        return <Car size={16} />;
      case "gym":
        return <Dumbbell size={16} />;
      case "grocery / supermarket":
        return <ChefHat size={16} />;
      case "restaurant":
        return <ChefHat size={16} />;
      default:
        return <User size={16} />;
    }
  };

  useEffect(() => {
    if (!listing || !listing.locationCoords?.coordinates || listing.locationCoords.coordinates.length < 2) return;
    const [lng, lat] = listing.locationCoords.coordinates;

    const fetchPOIs = async () => {
      setLoadingPOIs(true);
      try {
        const categories = [
          { key: "hospital", label: "Hospital", query: "hospital" },
          { key: "transport", label: "Metro/Bus Stop", query: "bus stop" },
          { key: "gym", label: "Gym", query: "gym" },
          { key: "grocery", label: "Grocery / Supermarket", query: "supermarket" },
          { key: "restaurant", label: "Restaurant", query: "restaurant" },
          { key: "college", label: "College / University", query: "university" },
        ];

        const viewbox = `${lng - 0.025},${lat + 0.025},${lng + 0.025},${lat - 0.025}`;
        const promises = categories.map(async (cat) => {
          try {
            const url = `https://nominatim.openstreetmap.org/search?q=${cat.query}&format=json&limit=1&viewbox=${viewbox}&bounded=1`;
            const res = await fetch(url, {
              headers: { "User-Agent": "RentFlatmateFinderAgent/1.0" }
            });
            const data = await res.json();
            if (data && data.length > 0) {
              const item = data[0];
              const lat2 = parseFloat(item.lat);
              const lng2 = parseFloat(item.lon);
              const R = 6371;
              const dLat = (lat2 - lat) * Math.PI / 180;
              const dLng = (lng2 - lng) * Math.PI / 180;
              const a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
              const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
              const dist = R * c;
              return {
                category: cat.label,
                name: item.name || item.display_name.split(",")[0],
                distance: Number(dist.toFixed(1))
              };
            }
          } catch (e) {
            console.error("POI search failed", cat.key, e);
          }
          return null;
        });

        const results = await Promise.all(promises);
        const filtered = results.filter(r => r !== null);
        
        if (filtered.length === 0) {
          const area = listing.area || listing.location.split(",")[0] || "Baner";
          setNearbyPOIs([
            { category: "Metro/Bus Stop", name: `${area} Main Road Bus Stop`, distance: 0.4 },
            { category: "Grocery / Supermarket", name: `D-Mart Express ${area}`, distance: 0.7 },
            { category: "Gym", name: `Gold's Gym ${area}`, distance: 0.9 },
            { category: "Restaurant", name: `The Local Bistro`, distance: 0.3 },
            { category: "Hospital", name: `Life Care Hospital`, distance: 1.2 },
            { category: "College / University", name: `Symbiosis Center ${area}`, distance: 1.8 }
          ]);
        } else {
          setNearbyPOIs(filtered);
        }
      } catch (err) {
        console.error("Nearby places fetch error:", err);
      } finally {
        setLoadingPOIs(false);
      }
    };

    fetchPOIs();
  }, [listing]);

  // Get initials helper
  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  };

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/listings/${id}`);
        setListing(data.listing);
        setCompatibility(data.compatibility);

        // Fetch bookmark list to check saved state
        const savedRes = await api.get("/saved");
        const alreadySaved = savedRes.data.some(s => s._id === data.listing._id);
        setIsSaved(alreadySaved);

        // Fetch interest requests to check express interest state
        const interestRes = await api.get("/interest/sent");
        const alreadyInterested = interestRes.data.some(i => String(i.listingId?._id) === String(data.listing._id));
        setHasInterest(alreadyInterested);

        // Fetch actual owner profile and review details
        try {
          const ownerRes = await api.get(`/profile/${data.listing.ownerId}`);
          setOwnerProfile(ownerRes.data);
          setReviews(ownerRes.data.reviews || []);
          setReviewsStats(ownerRes.data.reviewsStats || { averageRating: 0, totalReviews: 0 });
        } catch (err) {
          console.error("Failed to load owner profile:", err);
        }
      } catch (err) {
        console.error("Failed to load property details:", err);
        setError("Unable to find listing details. It may have been filled or removed.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id]);

  const toggleSave = async () => {
    if (!listing) return;
    try {
      const { data } = await api.post("/saved/toggle", { listingId: listing._id });
      setIsSaved(prev => !prev);
      setMessage(data.message);
      setTimeout(() => setMessage(""), 3000);
    } catch {
      setMessage("Failed to update bookmark.");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const expressInterest = async () => {
    if (!listing) return;
    try {
      await api.post("/interest", { listingId: listing._id });
      setHasInterest(true);
      setMessage("Interest expressed successfully! Landlord has been notified.");
      setTimeout(() => setMessage(""), 3500);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to express interest");
      setTimeout(() => setMessage(""), 4000);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReviewText.trim()) return;
    setReviewSubmitting(true);
    try {
      const { data } = await api.post("/reviews", {
        ownerId: listing.ownerId,
        rating: newRating,
        reviewText: newReviewText.trim(),
      });
      setReviews(prev => [data, ...prev]);
      setReviewsStats(prev => {
        const total = prev.totalReviews + 1;
        const avg = ((prev.averageRating * prev.totalReviews + newRating) / total).toFixed(1);
        return { averageRating: parseFloat(avg), totalReviews: total };
      });
      setNewReviewText("");
      setNewRating(5);
      setReviewMessage("Review submitted successfully!");
      setTimeout(() => setReviewMessage(""), 3500);
    } catch (err) {
      console.error(err);
      setReviewMessage(err.response?.data?.message || "Failed to submit review.");
      setTimeout(() => setReviewMessage(""), 4000);
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="landing-container py-12">
        <div style={{ width: "100px", height: "30px" }} className="skeleton-pulse skeleton-text" />
        <div className="details-container">
          <div className="details-main-card">
            <div style={{ height: "350px", borderRadius: "12px" }} className="skeleton-pulse" />
            <div style={{ height: "40px" }} className="skeleton-pulse skeleton-text heading" />
            <div className="skeleton-pulse skeleton-text" />
            <div className="skeleton-pulse skeleton-text" />
            <div className="skeleton-pulse skeleton-text short" />
          </div>
          <div style={{ height: "450px", borderRadius: "12px" }} className="skeleton-pulse" />
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="landing-container py-24 text-center">
        <span style={{ fontSize: "48px" }}>⚠️</span>
        <h2 style={{ fontSize: "22px", fontWeight: "750", marginTop: "16px" }}>Property Details Unavailable</h2>
        <p style={{ color: "var(--text-muted)", marginTop: "8px", maxWidth: "420px", margin: "8px auto 24px" }}>
          {error || "We encountered an issue loading this listing. Please double check the ID."}
        </p>
        <button onClick={() => navigate("/tenant")} className="btn">
          Back to Listings Explore
        </button>
      </div>
    );
  }

  // Fallback photo index parsing
  const getListingPhotos = () => {
    if (listing.photos && listing.photos.length > 0) {
      return listing.photos;
    }
    const idx = Math.abs(listing._id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % PHOTO_COLLECTIONS.length;
    return PHOTO_COLLECTIONS[idx];
  };

  const photos = getListingPhotos();

  // Helper to extract society name
  const getSocietyName = () => {
    const title = listing.title || "";
    const match = title.match(/(?:in|at|near|of)\s+([A-Za-z0-9\s]+?)(?:society|residency|towers|park|complex|lane|pg|flat|house|room|$)/i);
    if (match && match[1] && match[1].trim().length > 3) {
      return match[1].trim();
    }
    const locality = listing.location.split(",")[0].trim();
    return `${locality} Premium Heights`;
  };

  // Helper to parse description for standard amenities
  const getAmenities = () => {
    const desc = (listing.description || "").toLowerCase();
    const list = [
      { label: "WiFi Internet", icon: Wifi, present: desc.includes("wifi") || desc.includes("internet") },
      { label: "Reserved Parking", icon: Car, present: desc.includes("parking") || desc.includes("park") || desc.includes("car") },
      { label: "Air Conditioning", icon: Wind, present: desc.includes("ac") || desc.includes("air condition") || desc.includes("cooler") },
      { label: "Modular Kitchen", icon: ChefHat, present: desc.includes("kitchen") || desc.includes("cook") },
      { label: "Society Gym", icon: Dumbbell, present: desc.includes("gym") || desc.includes("fitness") || desc.includes("workout") },
      { label: "Power Backup", icon: Shield, present: desc.includes("backup") || desc.includes("power") || desc.includes("generator") }
    ];
    // Filter to present ones, or fallback if none
    const presentList = list.filter(item => item.present);
    if (presentList.length === 0) {
      return list.slice(0, 4); // return first 4 as standard premium features
    }
    return presentList;
  };

  // Deterministic owner data extraction
  const getMockOwner = () => {
    const names = ["Rajesh Nambiar", "Aarav Sharma", "Neha Kulkarni", "Amit Deshmukh", "Pooja Patil"];
    const avatars = ["RN", "AS", "NK", "AD", "PP"];
    const idx = Math.abs(listing.ownerId.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)) % names.length;
    return {
      name: names[idx],
      avatar: avatars[idx],
      responseRate: "98% (Excellent)",
      responseTime: "under 5 mins",
      verified: true
    };
  };

  const society = getSocietyName();
  const amenities = getAmenities();
  const owner = getMockOwner();

  // AI Matching metric meters
  const getProximityPercentage = () => {
    if (!compatibility || compatibility.distanceKm === null || compatibility.distanceKm === undefined) return 50;
    const dist = compatibility.distanceKm;
    if (dist <= 1.0) return 100;
    if (dist <= 3.0) return 90;
    if (dist <= 5.0) return 75;
    if (dist <= 8.0) return 60;
    if (dist <= 12.0) return 40;
    return 20;
  };

  const aiExplanation = compatibility?.explanation || "Matching rules indicate moderate alignment with your budget and location constraints.";
  const isBudgetMatch = aiExplanation.toLowerCase().includes("fits within budget") || aiExplanation.toLowerCase().includes("below budget");
  const isMoveInMatch = aiExplanation.toLowerCase().includes("available on/before");

  const compatMetrics = [
    { label: "Budget Match", val: isBudgetMatch ? 100 : aiExplanation.toLowerCase().includes("slightly above") ? 60 : 30, icon: DollarSign },
    { label: "Location Match", val: getProximityPercentage(), icon: MapPin },
    { label: "Move-In Match", val: isMoveInMatch ? 100 : aiExplanation.toLowerCase().includes("days after") ? 60 : 20, icon: Calendar }
  ];

  const getPercentageColor = (pct) => {
    if (pct >= 85) return "#10b981"; // emerald
    if (pct >= 70) return "#0ea5e9"; // sky
    if (pct >= 50) return "#f59e0b"; // amber
    return "#f43f5e"; // rose
  };

  const badgeColorClass = compatibility?.badge?.toLowerCase() || "moderate";

  const nextFullscreenPhoto = () => {
    setPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevFullscreenPhoto = () => {
    setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="bg-[#faf9f6] text-[#1f2937] min-h-screen pb-24">
      
      {/* Centered Max-Width Container */}
      <div className="landing-container pt-8">
        
        {/* Back navigation & bookmark quick actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button 
            onClick={() => navigate(-1)}
            style={{ 
              background: "transparent", 
              color: "var(--text-main)", 
              border: "none", 
              boxShadow: "none", 
              display: "flex", 
              alignItems: "center", 
              gap: "6px", 
              fontWeight: "700",
              fontSize: "14px",
              cursor: "pointer",
              padding: "8px 0"
            }}
          >
            <ArrowLeft size={16} />
            <span>Back to explore</span>
          </button>
          
          <button
            onClick={toggleSave}
            style={{
              background: isSaved ? "#ffe4e6" : "white",
              color: isSaved ? "#f43f5e" : "var(--text-main)",
              border: "1px solid var(--border)",
              boxShadow: "var(--shadow-sm)",
              padding: "10px 18px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              borderRadius: "999px"
            }}
          >
            <Heart size={16} fill={isSaved ? "#f43f5e" : "none"} />
            <span>{isSaved ? "Saved" : "Save Property"}</span>
          </button>
        </div>

        {/* Global Toast Alert */}
        {message && (
          <div style={{ padding: "12px 20px", background: "var(--primary-light)", color: "var(--primary)", borderLeft: "4px solid var(--primary)", borderRadius: "12px", margin: "16px 0 0", fontWeight: "600", fontSize: "14px" }}>
            💡 {message}
          </div>
        )}

        {/* Primary Page Grid */}
        <div className="details-container">
          
          {/* LEFT COLUMN: Image Gallery & General Specs */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            
            {/* 1. Main Gallery Display */}
            <div className="details-main-card" style={{ padding: "20px" }}>
              <div className="gallery-main-container" onClick={() => setIsFullscreen(true)}>
                <img 
                  src={photos[photoIndex]} 
                  alt={listing.title} 
                  className="gallery-main-img" 
                />
                
                {/* Maximize zoom overlay tag */}
                <div style={{ position: "absolute", bottom: "14px", right: "14px", background: "rgba(0,0,0,0.7)", color: "white", padding: "6px 12px", borderRadius: "8px", display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: "600" }}>
                  <Maximize2 size={13} />
                  <span>Click to expand</span>
                </div>
              </div>

              {/* Gallery Thumbnails List */}
              {photos.length > 1 && (
                <div className="gallery-thumbnails select-none">
                  {photos.map((photo, idx) => (
                    <div 
                      key={idx} 
                      className={`gallery-thumb ${idx === photoIndex ? "active" : ""}`}
                      onClick={() => setPhotoIndex(idx)}
                    >
                      <img 
                        src={photo} 
                        alt={`Thumbnail preview ${idx}`} 
                        style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Core Property Specifications */}
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

            {/* Society & Address Details */}
            <div className="details-main-card">
              <h3 style={{ fontSize: "16px", fontWeight: "750", color: "var(--text-main)", marginBottom: "14px" }}>Society &amp; Address Details</h3>
              <div className="society-details-grid">
                <div className="society-detail-item">
                  <label>Society Name</label>
                  <span>{listing.societyName || "Not Available"}</span>
                </div>
                <div className="society-detail-item">
                  <label>Area / Locality</label>
                  <span>{listing.area || listing.location.split(",")[0] || "Not Available"}</span>
                </div>
                <div className="society-detail-item">
                  <label>City</label>
                  <span>{listing.city || "Pune"}</span>
                </div>
                <div className="society-detail-item">
                  <label>State</label>
                  <span>{listing.state || "Maharashtra"}</span>
                </div>
                {listing.pincode && (
                  <div className="society-detail-item">
                    <label>Pincode</label>
                    <span>{listing.pincode}</span>
                  </div>
                )}
                {listing.landmark && (
                  <div className="society-detail-item">
                    <label>Landmark</label>
                    <span>{listing.landmark}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Interactive Map */}
            {listing.locationCoords?.coordinates && listing.locationCoords.coordinates.length >= 2 ? (
              <div className="details-main-card" style={{ zIndex: 1 }}>
                <h3 style={{ fontSize: "16px", fontWeight: "750", color: "var(--text-main)", marginBottom: "14px" }}>Property Location Map</h3>
                <MapComponent
                  mode="view"
                  lat={listing.locationCoords.coordinates[1]}
                  lng={listing.locationCoords.coordinates[0]}
                />
              </div>
            ) : null}

            {/* Nearby Places Section */}
            {listing.locationCoords?.coordinates && (
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
            )}

            {/* 3. Owner section */}
            <div className="details-main-card">
              <h3 style={{ fontSize: "16px", fontWeight: "750", color: "var(--text-main)", marginBottom: "6px" }}>Owner &amp; Landlord Info</h3>
              
              <Link to={`/profile/${listing.ownerId}`} style={{ textDecoration: "none", color: "inherit", display: "block" }}>
                <div className="owner-section-card" style={{ cursor: "pointer" }}>
                  <div className="owner-avatar-large">
                    {ownerProfile?.profile?.avatarUrl ? (
                      <img src={ownerProfile.profile.avatarUrl} alt={ownerProfile.user?.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "50%" }} />
                    ) : (
                      <span>{getInitials(ownerProfile?.user?.name || owner.name)}</span>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                      <h4 style={{ margin: 0, fontSize: "16px", fontWeight: "750", color: "var(--text-main)" }}>
                        {ownerProfile?.user?.name || owner.name}
                      </h4>
                      <span style={{ background: "#ecfdf5", color: "#059669", fontSize: "10px", fontWeight: "700", padding: "2px 6px", borderRadius: "999px", display: "inline-flex", alignItems: "center", gap: "2px" }}>
                        <ShieldCheck size={10} />Verified Host
                      </span>
                    </div>
                    <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>
                      {ownerProfile?.profile?.occupation 
                        ? `${ownerProfile.profile.occupation}${ownerProfile.profile.companyOrCollege ? ` at ${ownerProfile.profile.companyOrCollege}` : ""}`
                        : "Property Owner · Hinjewadi Corridor Local"}
                    </p>
                  </div>
                </div>
              </Link>

              {/* Response Stats */}
              <div className="owner-stats select-none">
                <div className="owner-stat-box">
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)", justifyContent: "center", marginBottom: "4px" }}>
                    <Clock size={12} />
                    <span>Response Rate</span>
                  </div>
                  <strong style={{ fontSize: "13px", color: "var(--text-main)" }}>98% (Excellent)</strong>
                </div>
                <div className="owner-stat-box">
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "var(--text-muted)", justifyContent: "center", marginBottom: "4px" }}>
                    <MessageSquare size={12} />
                    <span>Typical Response Time</span>
                  </div>
                  <strong style={{ fontSize: "13px", color: "var(--text-main)" }}>under 5 mins</strong>
                </div>
              </div>

              {/* Action Buttons inside Owner Panel */}
              <div style={{ display: "flex", gap: "12px", borderTop: "1px solid var(--border)", paddingTop: "20px", marginTop: "8px" }}>
                <Link 
                  to={`/chat/${listing._id}`} 
                  className="btn"
                  style={{ 
                    flex: 1, 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    gap: "8px", 
                    padding: "12px", 
                    fontSize: "13px", 
                    fontWeight: "700",
                    background: "white",
                    border: "1px solid var(--border)",
                    color: "var(--text-main)",
                    boxShadow: "var(--shadow-sm)",
                    textDecoration: "none"
                  }}
                >
                  <MessageSquare size={14} />
                  <span>Start Secure Chat</span>
                </Link>
                <button
                  onClick={expressInterest}
                  disabled={hasInterest}
                  className="btn"
                  style={{ 
                    flex: 1, 
                    padding: "12px", 
                    fontSize: "13px", 
                    fontWeight: "700",
                    background: hasInterest ? "var(--primary-light)" : "var(--primary)",
                    color: hasInterest ? "var(--primary)" : "white",
                    boxShadow: "var(--shadow-md)"
                  }}
                >
                  {hasInterest ? "Interest Sent" : "Express Match Interest"}
                </button>
              </div>
            </div>

            {/* Reviews Section on Listing details */}
            <div className="details-main-card">
              <h3 style={{ fontSize: "16px", fontWeight: "750", color: "var(--text-main)", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Star size={16} style={{ color: "var(--warning)" }} />
                <span>Reviews &amp; Ratings ({reviewsStats.totalReviews})</span>
              </h3>
              
              {reviewsStats.totalReviews > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "var(--primary-light)", padding: "10px 16px", borderRadius: "10px", marginBottom: "16px" }}>
                  <strong style={{ fontSize: "20px", color: "var(--primary-hover)" }}>{reviewsStats.averageRating} ★</strong>
                  <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: "600" }}>Average rating from flatmates</span>
                </div>
              )}

              {/* Review submit form */}
              {user && user.role === "tenant" && String(listing.ownerId) !== String(user._id) && (
                <form onSubmit={handleReviewSubmit} style={{ background: "#f8fafc", border: "1px solid var(--border)", padding: "16px", borderRadius: "10px", display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                  <span style={{ fontSize: "13px", fontWeight: "750" }}>Write a review for this Host</span>
                  {reviewMessage && (
                    <div style={{ padding: "6px 10px", background: "var(--primary-light)", color: "var(--primary)", borderRadius: "6px", fontSize: "12px" }}>
                      {reviewMessage}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "600" }}>Rating:</span>
                    <div style={{ display: "flex", gap: "2px" }}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span 
                          key={star} 
                          onClick={() => setNewRating(star)} 
                          style={{ cursor: "pointer", fontSize: "18px", color: star <= newRating ? "var(--warning)" : "#cbd5e1" }}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  <textarea
                    rows="2"
                    required
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    placeholder="Describe your host interaction or response time..."
                    style={{ fontSize: "12.5px", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--border)", background: "white", resize: "none" }}
                  />
                  <button type="submit" disabled={reviewSubmitting} className="btn" style={{ padding: "6px 12px", fontSize: "12px", alignSelf: "flex-end" }}>
                    {reviewSubmitting ? "Posting..." : "Post Review"}
                  </button>
                </form>
              )}

              {/* Review list */}
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {reviews.length === 0 ? (
                  <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0, fontStyle: "italic" }}>
                    No reviews left for this landlord yet.
                  </p>
                ) : (
                  reviews.slice(0, 3).map((r) => (
                    <div key={r._id} style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: "10px", marginBottom: "4px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: "24px", height: "24px", borderRadius: "50%", background: "var(--primary-light)", color: "var(--primary)", display: "flex", alignItems: "center", justify: "center", fontSize: "10px", fontWeight: "700" }}>
                            {getInitials(r.tenantId?.name || "T")}
                          </div>
                          <span style={{ fontSize: "12.5px", fontWeight: "700" }}>{r.tenantId?.name || "Tenant"}</span>
                        </div>
                        <span style={{ fontSize: "13px", color: "var(--warning)" }}>{"★".repeat(r.rating)}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: "12.5px", color: "#475569" }}>{r.reviewText}</p>
                    </div>
                  ))
                )}
                {reviews.length > 3 && (
                  <Link to={`/profile/${listing.ownerId}`} style={{ fontSize: "12.5px", color: "var(--primary)", fontWeight: "700", textDecoration: "none" }}>
                    View all {reviews.length} reviews &rarr;
                  </Link>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: AI Compatibility & Quick Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", position: "sticky", top: "84px" }}>
            
            {/* 1. Highlighted AI Compatibility Section */}
            {compatibility ? (
              <div className="ai-compat-highlight-card">
                <div>
                  <span className={`recommendation-badge ${badgeColorClass}`}>
                    {compatibility.badge || "Moderate"} Match
                  </span>
                  
                  <div style={{ display: "flex", alignItems: "baseline", gap: "4px", marginTop: "16px" }}>
                    <span style={{ fontSize: "40px", fontWeight: "800", color: "var(--text-main)", lineHeight: "1" }}>
                      {compatibility.score}%
                    </span>
                    <span style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-muted)" }}>
                      compatibility rating
                    </span>
                  </div>
                  {compatibility.distanceKm !== null && (
                    <div className="distance-badge-prominent" style={{ marginTop: "12px", marginBottom: "0" }}>
                      <span>📍 {compatibility.distanceKm} km from preferred location</span>
                    </div>
                  )}
                </div>

                {/* Specific Metric Progress Meters */}
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {compatMetrics.map((m, idx) => {
                    const Icon = m.icon;
                    return (
                      <div key={idx}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", fontSize: "12.5px" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontWeight: "600" }}>
                            <Icon size={13} style={{ color: "var(--primary)" }} />
                            <span>{m.label}</span>
                          </span>
                          <strong style={{ color: getPercentageColor(m.val) }}>{m.val}%</strong>
                        </div>
                        <div style={{ height: "6px", background: "#f3f4f6", borderRadius: "99px", overflow: "hidden" }}>
                          <div style={{ width: `${m.val}%`, height: "100%", borderRadius: "99px", background: getPercentageColor(m.val) }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* AI Text explanation */}
                <div style={{ background: "rgba(16, 185, 129, 0.03)", border: "1px solid rgba(16, 185, 129, 0.12)", padding: "16px", borderRadius: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", fontWeight: "800", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                    <Sparkles size={13} />
                    <span>AI Analysis Insights</span>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--text-main)", margin: 0, lineHeight: "1.6" }}>
                    {compatibility.explanation}
                  </p>
                </div>

                {/* Pros & Cons Checklist */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px", borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
                  <div>
                    <h4 style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: "750", color: "var(--primary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      ✓ What Fits Well
                    </h4>
                    <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                      {compatibility.pros && compatibility.pros.length > 0 ? (
                        compatibility.pros.map((p, idx) => (
                          <li key={idx} style={{ fontSize: "12.5px", color: "var(--text-main)", display: "flex", gap: "6px", alignItems: "flex-start" }}>
                            <span style={{ color: "var(--primary)", fontWeight: "bold" }}>✓</span>
                            <span>{p}</span>
                          </li>
                        ))
                      ) : (
                        <li style={{ fontSize: "12px", color: "var(--text-muted)" }}>Meets standard parameters.</li>
                      )}
                    </ul>
                  </div>

                  <div>
                    <h4 style={{ margin: "0 0 8px", fontSize: "12px", fontWeight: "750", color: "#f43f5e", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      ✖ Possible Compromises
                    </h4>
                    <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "6px" }}>
                      {compatibility.cons && compatibility.cons.length > 0 ? (
                        compatibility.cons.map((c, idx) => (
                          <li key={idx} style={{ fontSize: "12.5px", color: "var(--text-main)", display: "flex", gap: "6px", alignItems: "flex-start" }}>
                            <span style={{ color: "#f43f5e", fontWeight: "bold" }}>✖</span>
                            <span>{c}</span>
                          </li>
                        ))
                      ) : (
                        <li style={{ fontSize: "12px", color: "var(--primary)" }}>No mismatches detected!</li>
                      )}
                    </ul>
                  </div>
                </div>

                {compatibility.summary && (
                  <div style={{ background: "rgba(241, 245, 249, 0.6)", padding: "12px", borderRadius: "10px", fontSize: "12px", color: "var(--text-muted)", border: "1px solid var(--border)" }}>
                    <strong>Match Verdict:</strong> {compatibility.summary}
                  </div>
                )}
              </div>
            ) : (
              <div className="ai-compat-highlight-card">
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "var(--text-muted)" }}>
                  <Info size={18} />
                  <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "700" }}>AI Match Unavailable</h4>
                </div>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0, lineHeight: "1.5" }}>
                  Please complete your flatmate profile preferences to calculate compatibility scores, commute times, and rule alignment meters.
                </p>
                <Link to="/tenant?tab=profile" className="btn" style={{ textAlign: "center", padding: "10px", fontSize: "12.5px" }}>
                  Setup Match Profile
                </Link>
              </div>
            )}

            {/* 2. Direct Booking / Transaction card */}
            <div className="details-main-card" style={{ gap: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", fontWeight: "700", textTransform: "uppercase" }}>Rent Value</span>
                  <p style={{ margin: 0, fontSize: "24px", fontWeight: "800", color: "var(--primary)" }}>
                    ₹{listing.rent.toLocaleString()}<span style={{ fontSize: "12px", color: "var(--text-muted)", fontWeight: "500" }}>/mo</span>
                  </p>
                </div>
                <span className="badge badge-high" style={{ fontSize: "11px", padding: "4px 10px" }}>Available</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <button
                  onClick={expressInterest}
                  disabled={hasInterest}
                  className="btn w-full"
                  style={{ 
                    padding: "14px", 
                    fontSize: "13.5px", 
                    fontWeight: "700",
                    background: hasInterest ? "var(--primary-light)" : "var(--primary)",
                    color: hasInterest ? "var(--primary)" : "white",
                    boxShadow: "var(--shadow-md)"
                  }}
                >
                  {hasInterest ? "Interest Expressed Successfully" : "Express Match Interest"}
                </button>
                <Link
                  to={`/chat/${listing._id}`}
                  className="btn w-full"
                  style={{
                    padding: "14px",
                    fontSize: "13.5px",
                    fontWeight: "700",
                    background: "white",
                    border: "1px solid var(--border)",
                    color: "var(--text-main)",
                    textAlign: "center",
                    boxShadow: "var(--shadow-sm)",
                    textDecoration: "none"
                  }}
                >
                  Message Landlord
                </Link>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11.5px", color: "var(--text-muted)", background: "#fbfbfa", padding: "10px", borderRadius: "8px", border: "1px solid var(--border)" }}>
                <Lock size={12} />
                <span>Encrypted contact protection in active use.</span>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* FULLSCREEN IMAGE MODAL OVERLAY */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fullscreen-overlay"
            onClick={() => setIsFullscreen(false)}
          >
            <div className="fullscreen-img-wrapper" onClick={(e) => e.stopPropagation()}>
              <button className="fullscreen-close" onClick={() => setIsFullscreen(false)}>&times;</button>
              
              <img 
                src={photos[photoIndex]} 
                alt={listing.title} 
                className="fullscreen-img" 
              />

              {photos.length > 1 && (
                <>
                  <button className="fullscreen-btn fullscreen-btn-left" onClick={prevFullscreenPhoto}>
                    <ChevronLeft size={24} />
                  </button>
                  <button className="fullscreen-btn fullscreen-btn-right" onClick={nextFullscreenPhoto}>
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
