import React, { useRef, useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

// 7 Luxury Fashion Editorial Cards
const GALLERY_CARDS = [
  {
    id: 1,
    lookTag: "LOOK 01",
    category: "Design",
    title: "Urban Essentials",
    description: "Every collection begins with timeless silhouettes and premium materials.",
    image: "/model-images/model1.jpg",
    imageExtraClass: "scale-100 object-center",
  },
  {
    id: 2,
    lookTag: "LOOK 02",
    category: "Quality",
    title: "Built To Last",
    description: "Carefully selected natural fabrics designed for everyday luxury.",
    image: "/model-images/model2.webp",
    imageExtraClass: "scale-100 object-center",
  },
  {
    id: 3,
    lookTag: "LOOK 03",
    category: "Experience",
    title: "Luxury In Every Detail",
    description: "From bespoke packaging to hand-finished stitching, detail is paramount.",
    image: "/model-images/model3.webp",
    imageExtraClass: "scale-100 object-center",
  },
  {
    id: 4,
    lookTag: "LOOK 04",
    category: "Community",
    title: "Made For Modern Living",
    description: "Designed for confident individuals with an effortless sense of style.",
    image: "/model-images/model4.webp",
    imageExtraClass: "scale-100 object-center",
  },
  {
    id: 5,
    lookTag: "LOOK 05",
    category: "Essence",
    title: "Monochrome Elegance",
    description: "A minimalist study in tonal harmony and quiet sophistication.",
    image: "/model-images/model5.webp",
    imageExtraClass: "scale-100 object-center",
  },
  {
    id: 6,
    lookTag: "LOOK 06",
    category: "Editorial",
    title: "The Art of Silhouette",
    description: "Clean lines and architectural tailoring defined by fluid movement.",
    image: "/model-images/model6.webp",
    imageExtraClass: "scale-100 object-center",
  },
  {
    id: 7,
    lookTag: "LOOK 07",
    category: "Heritage",
    title: "Timeless Expression",
    description: "Uncompromising quality crafted to transcend seasonal trends.",
    image: "/model-images/model 7.jpg",
    imageExtraClass: "scale-100 object-center",
  },
];

function HorizontalCard({ card }) {
  return (
    <div className="group relative flex-shrink-0 w-[calc(100vw-3rem)] sm:w-[350px] lg:w-[400px] h-full bg-white border border-[#eaeaea] rounded-[22px] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-400 ease-out hover:-translate-y-2 flex flex-col transform-gpu">
      {/* 2:3 Portrait Image Container filling 100% of card height */}
      <div className="relative w-full h-full overflow-hidden bg-[#f4f4f4]">
        {/* Top Left Category Pill */}
        <div className="absolute top-4 left-4 z-20 pointer-events-none">
          <span className="inline-block px-3.5 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] sm:text-[11px] font-bold tracking-[0.18em] uppercase text-[#111] shadow-sm">
            {card.category}
          </span>
        </div>

        {/* Fashion Portrait Image */}
        <img
          src={card.image}
          alt={card.title}
          className={`w-full h-full object-cover transition-transform duration-400 ease-out group-hover:scale-[1.05] ${card.imageExtraClass}`}
          loading="lazy"
        />

        {/* Dark Gradient Overlay (Fades in on Hover) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400 ease-out z-10 pointer-events-none" />

        {/* Text Overlay (Bottom Left Inside Image) */}
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-7 z-20 pointer-events-none flex flex-col justify-end text-left">
          {/* Look Tag */}
          <p
            className="text-[10px] sm:text-[11px] font-bold tracking-[0.25em] text-white/80 uppercase mb-1 transform transition-all duration-350 ease-out translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {card.lookTag}
          </p>

          {/* Title */}
          <h3
            className="text-xl sm:text-2xl font-medium tracking-tight text-white mb-2 transform transition-all duration-350 ease-out translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {card.title}
          </h3>

          {/* Description */}
          <p
            className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-light mb-4 max-w-md transform transition-all duration-350 ease-out translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
            style={{ transitionDelay: "80ms" }}
          >
            {card.description}
          </p>

          {/* Explore Button */}
          <div
            className="inline-flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.22em] text-white transform transition-all duration-350 ease-out translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100"
            style={{ transitionDelay: "150ms" }}
          >
            <span>Explore Look</span>
            <svg
              className="w-4 h-4 text-white transform group-hover:translate-x-2 transition-transform duration-300"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function BrandStory() {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const [scrollDistance, setScrollDistance] = useState(0);

  // Keep the scroll range in sync with the rendered card track, including
  // mobile widths that are resolved after the first layout pass.
  useEffect(() => {
    const calculateDistance = () => {
      const track = trackRef.current;
      const viewport = track?.parentElement;
      if (!track || !viewport) return;

      setScrollDistance(Math.max(0, track.scrollWidth - viewport.clientWidth));
    };

    calculateDistance();
    const frame = requestAnimationFrame(calculateDistance);
    const observer = new ResizeObserver(calculateDistance);
    if (trackRef.current) observer.observe(trackRef.current);
    if (trackRef.current?.parentElement) observer.observe(trackRef.current.parentElement);
    window.addEventListener("resize", calculateDistance);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener("resize", calculateDistance);
    };
  }, []);
  // Bind vertical scroll progress to container ref
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Dynamically map scroll progress (0 -> 1) to exact pixel distance (0 -> -scrollDistance)
  const x = useTransform(scrollYProgress, [0, 1], [0, -scrollDistance]);

  return (
    <section ref={containerRef} className="relative h-[220vh] bg-white" style={{ height: scrollDistance ? `calc(100vh + ${scrollDistance}px)` : "220vh" }}>
      {/* Pinned Sticky Window (100vh height, flex layout maximizing card vertical height) */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex flex-col justify-between pt-[42px] sm:pt-[46px] pb-1.5 sm:pb-2 px-6 sm:px-12 bg-white select-none">

        {/* ── EDITORIAL HEADING ── */}
        <div className="max-w-4xl mx-auto text-center z-10 flex-shrink-0 pt-0">
          <p
            className="text-[9px] sm:text-[10px] font-bold tracking-[0.35em] text-[#888] uppercase mb-0"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            OUR PHILOSOPHY
          </p>

          <h2
            className="text-base sm:text-xl lg:text-[28px] leading-snug tracking-[-0.02em] font-light text-[#333]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            VELORA creates <span className="font-semibold text-[#111]">timeless fashion</span> for people who value quality, confidence, and effortless style.
          </h2>
        </div>

        {/* ── HORIZONTAL SCROLLING TRACK (Includes clean pr-12 lg:pr-16 right padding for Look 7) ── */}
        <div className="w-full flex-1 min-h-0 flex items-center overflow-hidden my-0.5 sm:my-1">
          <motion.div
            ref={trackRef}
            style={{ x }}
            className="h-full flex gap-8 pr-12 lg:pr-16 transform-gpu will-change-transform py-0.5"
          >
            {GALLERY_CARDS.map((card) => (
              <HorizontalCard key={card.id} card={card} />
            ))}
          </motion.div>
        </div>

        {/* Bottom indicator line */}
        <div className="max-w-[1400px] w-full mx-auto flex items-center justify-between text-[11px] font-semibold tracking-[0.2em] text-[#999] uppercase flex-shrink-0 pb-1">
          <span>01 / LOOKBOOK</span>
          <span>7 EDITORIAL LOOKS</span>
        </div>
      </div>
    </section>
  );
}
