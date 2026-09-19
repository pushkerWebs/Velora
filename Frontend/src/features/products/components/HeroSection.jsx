import React, { useEffect, useRef } from "react";
import { Link } from "react-router";
import { motion } from "framer-motion";

// Transparent background model photo located in public/finallandingpageimg.png
const HERO_IMG = "/finallandingpageimg.png";
const FALLBACK_IMG = "https://i.pinimg.com/originals/bd/f7/31/bdf73126df5cfcc5b5435cee9f85d40c.jpg";

export default function HeroSection() {
  const [activeCta, setActiveCta] = React.useState("shop"); // 'shop' | 'explore'
  const imageRef = useRef(null);
  const textRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    const handleScroll = (e) => {
      const scroll = typeof e?.scroll === "number" ? e.scroll : window.scrollY;
      const vh = window.innerHeight || 800;

      if (scroll > vh * 1.2) return;

      const imageOffset = scroll * 0.12; // 0.12x subtle image parallax
      const textOffset = scroll * 0.05;  // 0.05x subtle background text parallax
      const exitFade = Math.max(0, 1 - scroll / (vh * 0.85));

      if (imageRef.current) {
        imageRef.current.style.transform = `translate3d(0, ${imageOffset}px, 0)`;
      }
      if (textRef.current) {
        textRef.current.style.transform = `translate3d(0, ${textOffset}px, 0)`;
      }
      if (contentRef.current) {
        contentRef.current.style.opacity = `${exitFade}`;
      }
    };

    const lenis = window.__lenis;
    if (lenis && typeof lenis.on === "function") {
      lenis.on("scroll", handleScroll);
      return () => lenis.off("scroll", handleScroll);
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section ref={contentRef} className="relative w-full h-screen min-h-[600px] max-h-[1080px] overflow-hidden bg-white flex items-center justify-center select-none transition-opacity duration-150">

      {/* ── VELORA background editorial text (Behind image - z-0) ── */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.3, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        aria-hidden="true"
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden z-0 gpu-accelerated -translate-y-24 sm:translate-y-0"
      >
        <span
          ref={textRef}
          style={{
            fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
            fontSize: "clamp(80px, 18vw, 250px)",
            lineHeight: 1,
            fontWeight: 900,
            letterSpacing: "0.06em",
            color: "rgba(120, 120, 120, 0.45)",
            whiteSpace: "nowrap",
            willChange: "transform",
          }}
        >
          VELORA
        </span>
      </motion.div>

      {/* ── Hero image (Model — in front of background text - z-10) ── */}
      <motion.div
        initial={{ opacity: 0, scale: 1.03 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none z-10 gpu-accelerated"
      >
        <img
          ref={imageRef}
          src={HERO_IMG}
          alt="VELORA Editorial Collection"
          draggable={false}
          className="w-auto h-[88vh] max-h-[840px] object-contain object-bottom mx-auto pointer-events-none select-none -translate-y-16 sm:translate-y-8 will-change-transform"
          fetchPriority="high"
          loading="eager"
          decoding="async"
          onError={(e) => {
            e.target.src = FALLBACK_IMG;
          }}
        />

        {/* Soft subtle bottom overlay for clean button backdrop */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent pointer-events-none" />
      </motion.div>

      {/* ── Top-left editorial text ── */}
      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, delay: 0.65, ease: "easeOut" }}
        className="absolute top-[90px] sm:top-[105px] lg:top-[120px] left-6 sm:left-10 lg:left-16 z-10 gpu-accelerated"
      >
        <p
          style={{ fontFamily: "'Montserrat', sans-serif" }}
          className="text-[#111] text-[9px] lg:text-[10px] font-bold tracking-[0.42em] uppercase leading-[2.4]"
        >
          Fashion<br />
          That<br />
          Moves<br />
          With You
        </p>
      </motion.div>

      {/* ── Bottom-right collection badge with arrow ── */}
      <motion.div
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, delay: 0.85, ease: "easeOut" }}
        className="absolute bottom-16 xs:bottom-20 sm:bottom-[85px] lg:bottom-[105px] right-6 sm:right-10 lg:right-16 text-right z-10 gpu-accelerated"
      >
        <div
          style={{ fontFamily: "'Montserrat', sans-serif" }}
          className="text-[#111] text-[9px] lg:text-[10px] font-bold tracking-[0.42em] uppercase leading-[2.4] flex flex-col items-end"
        >
          <span>New</span>
          <span>Collection</span>
          <span className="inline-flex items-center gap-1.5">
            2026
            <svg className="w-3.5 h-3.5 text-[#111] translate-y-[-1px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </span>
        </div>
      </motion.div>

      {/* ── Bottom-left CTAs (Slow 0.8s black background shift) ── */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, delay: 0.95, ease: "easeOut" }}
        className="absolute bottom-16 xs:bottom-20 sm:bottom-10 lg:bottom-14 left-5 sm:left-8 lg:left-14 z-20 flex flex-col sm:flex-row gap-2.5 sm:gap-3 gpu-accelerated"
      >
        {/* Primary — Shop Now */}
        <Link
          to="/products"
          onMouseEnter={() => setActiveCta("shop")}
          className="
            relative inline-flex items-center justify-center
            text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em]
            px-6 sm:px-8 py-3 sm:py-[14px]
            border border-[#111] bg-white/80 backdrop-blur-sm
            w-fit shadow-md overflow-hidden select-none cursor-pointer
            transition-transform duration-200 active:scale-95
          "
        >
          {activeCta === "shop" && (
            <motion.div
              layoutId="blackHoverBg"
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute inset-0 bg-[#111] z-0"
            />
          )}
          <span
            className={`relative z-10 transition-colors duration-200 ease-out ${activeCta === "shop" ? "text-white" : "text-[#111]"
              }`}
          >
            Shop Now
          </span>
        </Link>

        {/* Secondary — Explore Collection */}
        <Link
          to="/products"
          onMouseEnter={() => setActiveCta("explore")}
          className="
            relative inline-flex items-center justify-center
            text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em]
            px-6 sm:px-8 py-3 sm:py-[14px]
            border border-[#111] bg-white/80 backdrop-blur-sm
            w-fit shadow-sm overflow-hidden select-none cursor-pointer
            transition-transform duration-200 active:scale-95
          "
        >
          {activeCta === "explore" && (
            <motion.div
              layoutId="blackHoverBg"
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute inset-0 bg-[#111] z-0"
            />
          )}
          <span
            className={`relative z-10 transition-colors duration-200 ease-out ${activeCta === "explore" ? "text-white" : "text-[#111]"
              }`}
          >
            Explore Collection
          </span>
        </Link>
      </motion.div>

    </section>
  );
}
