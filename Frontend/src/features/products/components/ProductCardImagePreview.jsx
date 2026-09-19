import React, { useState, useEffect, useRef } from "react";
import { optimizeProductImage } from "../../../utils/imagekitUrl.js";

const DEFAULT_FALLBACK =
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=80";

function ProductCardImagePreview({
  images = [],
  alt = "Product Image",
  className = "",
  aspectRatioClass = "aspect-[3/4]",
}) {
  // Extract clean array of image URLs (up to 4 images), apply ImageKit optimization
  const imageList = React.useMemo(() => {
    if (!images || !Array.isArray(images) || images.length === 0) {
      return [DEFAULT_FALLBACK];
    }
    const extracted = images
      .slice(0, 4)
      .map((img) => (typeof img === "string" ? img : img?.url))
      .filter(Boolean)
      .map((url) => optimizeProductImage(url));

    return extracted.length > 0 ? extracted : [DEFAULT_FALLBACK];
  }, [images]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  // Once true, hover images stay mounted forever (no re-download on subsequent hovers)
  const [hoverImagesLoaded, setHoverImagesLoaded] = useState(false);
  const intervalRef = useRef(null);
  const canHoverRef = useRef(null);

  const totalImages = imageList.length;
  const hasMultipleImages = totalImages > 1;

  // Cache hover capability detection once
  if (canHoverRef.current === null && typeof window !== "undefined") {
    canHoverRef.current =
      window.matchMedia && window.matchMedia("(hover: hover)").matches;
  }
  const canHover = canHoverRef.current;

  useEffect(() => {
    if (isHovered && canHover && hasMultipleImages) {
      // First hover: mount preview images permanently
      if (!hoverImagesLoaded) {
        setHoverImagesLoaded(true);
      }
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % totalImages);
      }, 800); // Switch image every 800ms
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // Reset back to image 0 on mouse leave
      setCurrentIndex(0);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isHovered, totalImages, canHover, hasMultipleImages, hoverImagesLoaded]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full ${aspectRatioClass} bg-[#f5f5f5] overflow-hidden ${className}`}
    >
      {/* Image 0: always rendered */}
      <img
        key={imageList[0] + 0}
        src={imageList[0]}
        alt={`${alt} - view 1`}
        loading="eager"
        decoding="async"
        onError={(e) => {
          e.target.src = DEFAULT_FALLBACK;
        }}
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
        style={{
          opacity: currentIndex === 0 ? 1 : 0,
          transform: isHovered ? "scale(1.03) translateZ(0)" : "scale(1) translateZ(0)",
          transition:
            "opacity 400ms cubic-bezier(0, 0, 0.2, 1), transform 500ms cubic-bezier(0, 0, 0.2, 1)",
          willChange: "opacity, transform",
        }}
      />

      {/* Images 1–3: only mounted after first hover on devices that support hover */}
      {hoverImagesLoaded &&
        imageList.slice(1).map((url, idx) => {
          const realIndex = idx + 1;
          const isVisible = currentIndex === realIndex;
          return (
            <img
              key={url + realIndex}
              src={url}
              alt={`${alt} - view ${realIndex + 1}`}
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.target.src = DEFAULT_FALLBACK;
              }}
              className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none select-none"
              style={{
                opacity: isVisible ? 1 : 0,
                transform: isHovered ? "scale(1.03) translateZ(0)" : "scale(1) translateZ(0)",
                transition:
                  "opacity 400ms cubic-bezier(0, 0, 0.2, 1), transform 500ms cubic-bezier(0, 0, 0.2, 1)",
                willChange: "opacity, transform",
              }}
            />
          );
        })}
    </div>
  );
}

export default React.memo(ProductCardImagePreview);
