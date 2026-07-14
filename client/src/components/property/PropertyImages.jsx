import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, ChevronLeft, ChevronRight } from "lucide-react";

export default function PropertyImages({
  photos,
  photoIndex,
  setPhotoIndex,
  isFullscreen,
  setIsFullscreen,
  title,
}) {
  const nextFullscreenPhoto = (e) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevFullscreenPhoto = (e) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <div className="details-main-card" style={{ padding: "20px" }}>
      <div className="gallery-main-container" onClick={() => setIsFullscreen(true)}>
        <img 
          src={photos[photoIndex]} 
          alt={title} 
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
                alt={title} 
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
