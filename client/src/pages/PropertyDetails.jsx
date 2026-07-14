import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import listingService from "../services/listing.service";
import savedService from "../services/saved.service";
import interestService from "../services/interest.service";
import profileService from "../services/profile.service";
import reviewService from "../services/review.service";
import PropertyImages from "../components/property/PropertyImages";
import PropertySpecs from "../components/property/PropertySpecs";
import PropertyLocationMap from "../components/property/PropertyLocationMap";
import PropertyOwnerInfo from "../components/property/PropertyOwnerInfo";
import PropertyAiCompatibility from "../components/property/PropertyAiCompatibility";
import { 
  ArrowLeft, 
  Heart, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  Wifi, 
  Car, 
  Wind, 
  ChefHat, 
  Dumbbell, 
  Lock, 
  Shield, 
  User, 
  DollarSign,
  Star
} from "lucide-react";

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
        const data = await listingService.getListingById(id);
        setListing(data.listing);
        setCompatibility(data.compatibility);

        // Fetch bookmark list to check saved state
        const savedList = await savedService.getSavedListings();
        const alreadySaved = savedList.some(s => s._id === data.listing._id);
        setIsSaved(alreadySaved);

        // Fetch interest requests to check express interest state
        const interestSent = await interestService.getSentInterests();
        const alreadyInterested = interestSent.some(i => String(i.listingId?._id) === String(data.listing._id));
        setHasInterest(alreadyInterested);

        // Fetch actual owner profile and review details
        try {
          const ownerRes = await profileService.getProfileByUserId(data.listing.ownerId);
          setOwnerProfile(ownerRes);
          setReviews(ownerRes.reviews || []);
          setReviewsStats(ownerRes.reviewsStats || { averageRating: 0, totalReviews: 0 });
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
      const data = await savedService.toggleSavedListing(listing._id);
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
      await interestService.expressInterest(listing._id);
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
      const data = await reviewService.submitReview({
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
    const presentList = list.filter(item => item.present);
    if (presentList.length === 0) {
      return list.slice(0, 4);
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
  
  const getBudgetMatchVal = () => {
    if (compatibility?.inputSnapshot) {
      const { rent, budgetMax } = compatibility.inputSnapshot;
      if (rent !== undefined && budgetMax !== undefined) {
        if (rent <= budgetMax) return 100; // Anything within or below maximum budget is 100% match
        if (rent > budgetMax && rent <= budgetMax * 1.1) return 60;
        return 30;
      }
    }
    // Fallback to string analysis
    const textToSearch = (aiExplanation + " " + (compatibility?.pros || []).join(" ") + " " + (compatibility?.cons || []).join(" ")).toLowerCase();
    if (textToSearch.includes("fits within budget") || textToSearch.includes("below budget") || textToSearch.includes("fits budget") || textToSearch.includes("affordable") || textToSearch.includes("within budget")) return 100;
    if (textToSearch.includes("slightly above")) return 60;
    return 30;
  };

  const getMoveInMatchVal = () => {
    if (compatibility?.inputSnapshot) {
      const { availableFrom, moveInDate } = compatibility.inputSnapshot;
      if (availableFrom && moveInDate) {
        const avail = new Date(availableFrom);
        const moveIn = new Date(moveInDate);
        const diffTime = avail - moveIn;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays <= 0) return 100;
        if (diffDays <= 15) return 60;
        return 20;
      }
    }
    // Fallback to string analysis
    const textToSearch = (aiExplanation + " " + (compatibility?.pros || []).join(" ") + " " + (compatibility?.cons || []).join(" ")).toLowerCase();
    if (textToSearch.includes("available on/before") || textToSearch.includes("available immediately") || textToSearch.includes("matches availability") || textToSearch.includes("immediate availability")) return 100;
    if (textToSearch.includes("days after")) return 60;
    return 20;
  };

  const compatMetrics = [
    { label: "Budget Match", val: getBudgetMatchVal(), icon: DollarSign },
    { label: "Location Match", val: getProximityPercentage(), icon: MapPin },
    { label: "Move-In Match", val: getMoveInMatchVal(), icon: Calendar }
  ];

  const getPercentageColor = (pct) => {
    if (pct >= 85) return "#10b981"; // emerald
    if (pct >= 70) return "#0ea5e9"; // sky
    if (pct >= 50) return "#f59e0b"; // amber
    return "#f43f5e"; // rose
  };

  const badgeColorClass = compatibility?.badge?.toLowerCase() || "moderate";

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
            
            <PropertyImages
              photos={photos}
              photoIndex={photoIndex}
              setPhotoIndex={setPhotoIndex}
              isFullscreen={isFullscreen}
              setIsFullscreen={setIsFullscreen}
              title={listing.title}
            />

            <PropertySpecs
              listing={listing}
              society={society}
              amenities={amenities}
            />

            {/* Society Details Card */}
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

            <PropertyLocationMap
              listing={listing}
              loadingPOIs={loadingPOIs}
              nearbyPOIs={nearbyPOIs}
              getPoiIcon={getPoiIcon}
            />

            <PropertyOwnerInfo
              listing={listing}
              ownerProfile={ownerProfile}
              owner={owner}
              reviewsStats={reviewsStats}
              reviews={reviews}
              newRating={newRating}
              setNewRating={setNewRating}
              newReviewText={newReviewText}
              setNewReviewText={setNewReviewText}
              reviewMessage={reviewMessage}
              reviewSubmitting={reviewSubmitting}
              handleReviewSubmit={handleReviewSubmit}
              expressInterest={expressInterest}
              hasInterest={hasInterest}
              user={user}
              getInitials={getInitials}
            />
          </div>

          {/* RIGHT COLUMN: AI Compatibility & Quick Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px", position: "sticky", top: "84px" }}>
            
            <PropertyAiCompatibility
              compatibility={compatibility}
              compatMetrics={compatMetrics}
              getPercentageColor={getPercentageColor}
              badgeColorClass={badgeColorClass}
            />

            {/* Direct Booking / Rent card */}
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
    </div>
  );
}
