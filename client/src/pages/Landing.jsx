import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, 
  Search, 
  ShieldCheck, 
  ArrowRight, 
  Star, 
  Quote, 
  ChevronRight, 
  ChevronDown, 
  CheckCircle2, 
  Shield, 
  Zap, 
  Home, 
  Users, 
  Lock, 
  MessageSquare,
  Sparkle
} from "lucide-react";
import api from "../services/api";
import PropertyCard from "../components/PropertyCard";

export default function Landing() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFaqIdx, setOpenFaqIdx] = useState(null);
  const [savedStatus, setSavedStatus] = useState({});

  const suggestionChips = [
    "Baner",
    "Under ₹10K",
    "Furnished room in Hinjewadi",
    "1BHK in Wakad",
    "Koregaon Park"
  ];

  const faqItems = [
    {
      question: "How do lifestyle compatibility matches work?",
      answer: "We compare your specific habits, routines, social preferences, and commute distances with matching properties and prospective flatmates, delivering a unified score that represents real-world compatibility."
    },
    {
      question: "How is my personal data protected?",
      answer: "Your security is our priority. Contact details are hidden until you choose to connect. Only compatibility scores and non-sensitive lifestyle preferences are visible to potential matches."
    },
    {
      question: "Are listing reviews and landlords verified?",
      answer: "Yes, every listing undergoes ownership and identity checks, ensuring all listings are secure and verified before being published."
    },
    {
      question: "How do I secure a room and start chatting?",
      answer: "Simply click 'Express Interest' on a property card. Once the owner accepts your interest request, a secure chat thread is immediately opened so you can discuss details directly."
    }
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/tenant?search=${encodeURIComponent(query.trim())}`);
    } else {
      navigate("/tenant");
    }
  };

  const handleChipClick = (chip) => {
    navigate(`/tenant?search=${encodeURIComponent(chip)}`);
  };

  const handleToggleSave = (listingId) => {
    setSavedStatus((prev) => ({
      ...prev,
      [listingId]: !prev[listingId]
    }));
  };

  const handleExpressInterest = (listingId) => {
    navigate("/login");
  };

  useEffect(() => {
    // Load first 3 available listings for featured section
    api.get("/listings", { params: { limit: 3 } })
      .then(({ data }) => {
        const items = (data.listings || []).map(item => item.listing || item);
        setFeatured(items.slice(0, 3));
      })
      .catch(() => {
        // Fallback mock properties if database connection is unavailable
        setFeatured([
          { _id: "1", title: "Premium 1BHK in Ganga Acropolis", location: "Baner, Pune", rent: 16000, roomType: "1bhk", furnishing: "furnished", description: "Modern studio room in gated society with elevator access." },
          { _id: "2", title: "Luxurious Single Bed in Jewel Tower", location: "Koregaon Park, Pune", rent: 12000, roomType: "single", furnishing: "furnished", description: "Private room in premium lane with parking." },
          { _id: "3", title: "Affordable Single Bed in Signature Park", location: "Wakad, Pune", rent: 7000, roomType: "single", furnishing: "semi-furnished", description: "Near metro stop and Hinjewadi tech park." }
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-[#faf9f6] text-[#1f2937] min-h-screen transition-colors duration-300">
      
      {/* Centered Standardized Max-Width Container */}
      <div className="landing-container py-12">
        
        {/* 1. Hero Section */}
        <section className="landing-hero select-none">
          <div className="landing-hero-tag">
            <Sparkles className="h-4.5 w-4.5 text-[#10b981]" />
            <span>Lifestyle-First Compatibility Matching</span>
          </div>

          <h1 className="landing-hero-title">
            Find Your Perfect Home. <br />
            <span className="text-[#10b981]">Meet Your Perfect Flatmate.</span>
          </h1>

          <p className="landing-hero-subtitle">
            Skip the housing stress. Discover premium rental rooms inside Pune's best gated complexes and connect with verified flatmates matched directly to your budget, daily routines, and lifestyle habits.
          </p>

          {/* Core CTA Buttons */}
          <div className="hero-cta-buttons mt-2">
            <Link to="/tenant" className="btn px-8 py-3.5 font-bold text-sm shadow-md flex items-center gap-2">
              <span>Find a Room</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </Link>
            <Link to="/owner" className="btn px-8 py-3.5 font-bold text-sm bg-white border border-[#e5e7eb] hover:bg-[#fcfbfa] text-[#1f2937] shadow-sm">
              <span>List Your Property</span>
            </Link>
          </div>

          {/* Widescreen Hero Image & Floating Cards */}
          <div className="hero-image-wrapper">
            <div className="hero-img-container">
              <img 
                src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80" 
                alt="Modern premium interior home living room space" 
                className="hero-img"
              />
            </div>

            {/* Floating Badges overlay */}
            <div className="floating-cards-container">
              <div className="floating-card floating-card-1">
                <div className="w-10 h-10 rounded-full bg-[#ecfdf5] text-[#10b981] flex items-center justify-center shadow-sm">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <span className="text-[11px] font-bold text-[#6b7280] block">Properties</span>
                  <span className="text-sm font-extrabold text-[#111827]">100% Verified Listings</span>
                </div>
              </div>

              <div className="floating-card floating-card-2">
                <div className="w-10 h-10 rounded-full bg-[#e6f4fe] text-[#0ea5e9] flex items-center justify-center shadow-sm">
                  <Sparkle className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <span className="text-[11px] font-bold text-[#6b7280] block">Smart Ranking</span>
                  <span className="text-sm font-extrabold text-[#111827]">95% Compatibility Match</span>
                </div>
              </div>

              <div className="floating-card floating-card-3">
                <div className="w-10 h-10 rounded-full bg-[#fef3c7] text-[#d97706] flex items-center justify-center shadow-sm">
                  <Shield className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <span className="text-[11px] font-bold text-[#6b7280] block">Trust &amp; Safety</span>
                  <span className="text-sm font-extrabold text-[#111827]">Safe Guarded Community</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Large AI Search Bar */}
        <section className="landing-section">
          <div className="search-bar-container">
            <form onSubmit={handleSearchSubmit} className="flex-grow flex flex-col sm:flex-row items-center gap-3">
              <div className="search-input-wrapper">
                <Search className="h-6 w-6 text-[#9ca3af] shrink-0" />
                <input 
                  type="text"
                  placeholder="Describe your ideal home (e.g. flat in Baner with parking under 15k)..." 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <button type="submit">
                Search Spaces
              </button>
            </form>
          </div>

          {/* Chips */}
          <div className="chips-container select-none">
            <span className="text-[11px] uppercase font-bold tracking-wider text-[#9ca3af] mr-2">Localities:</span>
            {suggestionChips.map((chip, idx) => (
              <button 
                key={idx} 
                onClick={() => handleChipClick(chip)}
                className="chip-btn"
              >
                {chip}
              </button>
            ))}
          </div>
        </section>

        {/* 3. How It Works Section */}
        <section className="landing-section">
          <span className="landing-section-tag">Process</span>
          <h2 className="landing-section-title">How It Works</h2>
          <p className="landing-section-subtitle">Get matched and settled in your premium room in four easy steps</p>

          <div className="landing-grid-4 select-none">
            <div className="step-card">
              <span className="step-number">01</span>
              <div className="step-card-icon">
                <Users className="h-5 w-5" />
              </div>
              <h3>Create Profile</h3>
              <p>
                Define your budget bounds, preferred tech corridors, and lifestyle preferences (silent hours, space habits).
              </p>
            </div>

            <div className="step-card">
              <span className="step-number">02</span>
              <div className="step-card-icon">
                <Sparkle className="h-5 w-5" />
              </div>
              <h3>Discover Matches</h3>
              <p>
                Compare listing scores generated automatically based on compatibility, pros/cons, and proximity metrics.
              </p>
            </div>

            <div className="step-card">
              <span className="step-number">03</span>
              <div className="step-card-icon">
                <Lock className="h-5 w-5" />
              </div>
              <h3>Chat Securely</h3>
              <p>
                Express interest and open direct, secure chat threads with property owners to finalize arrangements.
              </p>
            </div>

            <div className="step-card">
              <span className="step-number">04</span>
              <div className="step-card-icon">
                <Home className="h-5 w-5" />
              </div>
              <h3>Move In</h3>
              <p>
                Coordinate moving dates, finalize agreements, and transition seamlessly into your premium gated society.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Why Choose Us Section */}
        <section className="landing-section">
          <span className="landing-section-tag">Why Choose Us</span>
          <h2 className="landing-section-title">Why Choose Our Flatmate Finder</h2>
          <p className="landing-section-subtitle">Built to offer you visual excellence, premium discoverability, and data security</p>

          <div className="landing-grid-4 select-none">
            <div className="why-card">
              <div className="why-card-icon">
                <Sparkles className="h-5 w-5" />
              </div>
              <h4>Smart Matching</h4>
              <p>
                Compare and rank rentals using detailed compatibility indicators that reflect daily routines and budget limits.
              </p>
            </div>

            <div className="why-card">
              <div className="why-card-icon">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h4>Verified Owners</h4>
              <p>
                Rent confidently from verified landlords in secure complexes with security desks and dedicated parking spaces.
              </p>
            </div>

            <div className="why-card">
              <div className="why-card-icon">
                <MessageSquare className="h-5 w-5" />
              </div>
              <h4>Secure Chat</h4>
              <p>
                Communicate directly via private, authenticated conversations without revealing sensitive phone numbers.
              </p>
            </div>

            <div className="why-card">
              <div className="why-card-icon">
                <Users className="h-5 w-5" />
              </div>
              <h4>Trusted Community</h4>
              <p>
                Join a premium community of tech and business professionals looking for high-quality shared spaces in Pune.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Featured Listings Section */}
        <section className="landing-section">
          <div className="featured-header">
            <div className="featured-header-title">
              <span className="landing-section-tag">Featured</span>
              <h2 className="landing-section-title" style={{ marginTop: 0 }}>Featured Verified Properties</h2>
              <p className="landing-section-subtitle">Ready rooms in prime gated societies in Pune</p>
            </div>
            <Link to="/tenant" className="featured-view-all">
              <span>View all listings</span>
              <ChevronRight className="h-4.5 w-4.5" />
            </Link>
          </div>

          {loading ? (
            <div className="landing-grid-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse bg-[#f3f4f6] h-80 rounded-2xl border border-[#e5e7eb]" />
              ))}
            </div>
          ) : (
            <div className="landing-grid-3">
              {featured.map((item) => (
                <div key={item._id} className="h-full">
                  <PropertyCard
                    listing={item}
                    compatibility={{
                      score: 92,
                      badge: "Excellent",
                      explanation: "This listing matches your budget, move-in availability, and commuting distance parameters."
                    }}
                    isSaved={!!savedStatus[item._id]}
                    onToggleSave={handleToggleSave}
                    onExpressInterest={handleExpressInterest}
                    hasExpressedInterest={false}
                  />
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 6. Testimonials */}
        <section className="landing-section">
          <span className="landing-section-tag">Testimonials</span>
          <h2 className="landing-section-title">What Our Community Says</h2>
          <p className="landing-section-subtitle">Hear from young professionals who found their homes and flatmates with us</p>

          <div className="landing-grid-3 select-none">
            <div className="testimonial-card">
              <div>
                <div className="stars-row">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <Quote className="h-7 w-7 text-[#10b981] opacity-20 mb-3" style={{ margin: "0 auto" }} />
                <p className="testimonial-quote">
                  "Finding rooms near my IT workplace in Hinjewadi used to be a long, manual process. This system matched me with compatibility ratings based on my daily routines, and I secured a room in a beautiful gated society within days."
                </p>
              </div>
              <div className="testimonial-user">
                <div className="user-avatar">VS</div>
                <span className="user-name">Vikram Singh</span>
                <span className="user-role">Lead Tech Specialist</span>
              </div>
            </div>

            <div className="testimonial-card">
              <div>
                <div className="stars-row">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <Quote className="h-7 w-7 text-[#10b981] opacity-20 mb-3" style={{ margin: "0 auto" }} />
                <p className="testimonial-quote">
                  "The gated society parameters and verified owner reviews made finding a home very secure. The secure chat let me communicate with flatmates easily and coordinate our move-in schedule perfectly."
                </p>
              </div>
              <div className="testimonial-user">
                <div className="user-avatar">AP</div>
                <span className="user-name">Ananya Patel</span>
                <span className="user-role">HR Associate</span>
              </div>
            </div>

            <div className="testimonial-card">
              <div>
                <div className="stars-row">
                  {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
                </div>
                <Quote className="h-7 w-7 text-[#10b981] opacity-20 mb-3" style={{ margin: "0 auto" }} />
                <p className="testimonial-quote">
                  "As a property owner, I really appreciated that I could filter requests based on compatibility. I easily found tenants who shared the same habits, which kept our society peaceful."
                </p>
              </div>
              <div className="testimonial-user">
                <div className="user-avatar">RM</div>
                <span className="user-name">Rajesh Mehta</span>
                <span className="user-role">Apartment Owner</span>
              </div>
            </div>
          </div>
        </section>

        {/* 6. FAQ Section */}
        <section className="landing-section">
          <span className="landing-section-tag">FAQ</span>
          <h2 className="landing-section-title">Frequently Asked Questions</h2>
          <p className="landing-section-subtitle">Find quick answers to common queries about our system</p>

          <div className="faq-list select-none">
            {faqItems.map((item, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div key={idx} className="faq-card">
                  <button
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="faq-button"
                  >
                    <span>{item.question}</span>
                    <ChevronDown className={`h-4.5 w-4.5 text-[#9ca3af] transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="faq-answer border-t border-[#f3f4f6] pt-4">
                          {item.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* 7. Professional Footer */}
        <footer className="landing-footer">
          <div className="footer-top-grid">
            <div className="footer-brand">
              <span className="footer-logo">
                <span className="text-[#10b981]"><Home className="h-5 w-5" /></span> NestAI
              </span>
              <p className="footer-desc">
                Lifestyle-first room and flatmate matching inside premium gated societies in Pune's tech hubs.
              </p>
            </div>
            
            <div className="footer-column">
              <h4>Localities</h4>
              <div className="footer-links">
                <button onClick={() => handleChipClick("Baner")}>Baner Locality</button>
                <button onClick={() => handleChipClick("Hinjewadi")}>Hinjewadi Tech Hub</button>
                <button onClick={() => handleChipClick("Kharadi")}>Kharadi IT Corridor</button>
                <button onClick={() => handleChipClick("Wakad")}>Wakad Townships</button>
              </div>
            </div>
            
            <div className="footer-column">
              <h4>Services</h4>
              <div className="footer-links">
                <Link to="/tenant">Explore Rooms</Link>
                <Link to="/owner">List Rooms</Link>
                <Link to="/login">User Dashboard</Link>
              </div>
            </div>
            
            <div className="footer-column">
              <h4>Trust &amp; Safety</h4>
              <div className="footer-links">
                <span>Verification Guide</span>
                <span>Secure Communication</span>
                <span>Privacy Policy</span>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <span>&copy; {new Date().getFullYear()} NestAI. All rights reserved.</span>
            <div className="footer-bottom-links">
              <span>Privacy guidelines</span>
              <span>Terms of service</span>
            </div>
          </div>
        </footer>

      </div>

    </div>
  );
}
