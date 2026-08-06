import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, useInView, useMotionValue, useSpring } from "framer-motion";

// ─── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
  .vb-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: 232px 232px;
    gap: 16px;
  }
  
  /* Desktop 3-Column Layout */
  .vb-p1-cell { grid-column: span 5; grid-row: span 2; }
  .vb-p2-cell { grid-column: span 4; grid-row: span 2; }
  .vb-stat-cell { grid-column: span 3; grid-row: span 1; }
  .vb-deliv-cell { grid-column: span 3; grid-row: span 1; }

  @media(max-width:1024px){
    .vb-grid {
      grid-template-columns: repeat(6, 1fr);
      grid-template-rows: 400px 400px 220px;
      gap: 14px;
    }
    .vb-p1-cell { grid-column: span 3 !important; grid-row: span 1 !important; }
    .vb-p2-cell { grid-column: span 3 !important; grid-row: span 1 !important; }
    .vb-stat-cell { grid-column: span 4 !important; grid-row: span 1 !important; }
    .vb-deliv-cell { grid-column: span 2 !important; grid-row: span 1 !important; }
  }

  @media(max-width:640px){
    .vb-grid {
      grid-template-columns: 1fr;
      grid-template-rows: auto;
      gap: 12px;
    }
    .vb-p1-cell, .vb-p2-cell {
      grid-column: span 1 !important;
      grid-row: span 1 !important;
      min-height: 420px !important;
    }
    .vb-stat-cell, .vb-deliv-cell {
      grid-column: span 1 !important;
      grid-row: span 1 !important;
      min-height: 200px !important;
    }
  }

  /* shared cell */
  .vb-cell {
    border-radius: 24px;
    overflow: hidden;
    position: relative;
    cursor: default;
    will-change: transform;
    transition: transform 0.4s cubic-bezier(0.16,1,0.3,1),
                box-shadow 0.4s cubic-bezier(0.16,1,0.3,1);
  }
  .vb-cell:hover { box-shadow: 0 24px 64px rgba(0,0,0,0.20); }

  /* tag blink */
  @keyframes vb-blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
`;

// ─── Live counter hook ─────────────────────────────────────────────────────────
function useCounter(target, duration = 1800, start = false) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    let raf, startTime;
    const tick = (now) => {
      if (!startTime) startTime = now;
      const p = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [start, target, duration]);
  return val;
}

// ─── Magnetic tilt cell wrapper ────────────────────────────────────────────────
function MagCell({ children, style = {}, className = "", intensity = 8 }) {
  const ref = useRef(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 220, damping: 22 });
  const sry = useSpring(ry, { stiffness: 220, damping: 22 });

  const handleMove = useCallback((e) => {
    const rect = ref.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    rx.set(((e.clientY - cy) / (rect.height / 2)) * -intensity);
    ry.set(((e.clientX - cx) / (rect.width / 2)) * intensity);
  }, [intensity, rx, ry]);

  const handleLeave = useCallback(() => { rx.set(0); ry.set(0); }, [rx, ry]);

  return (
    <motion.div
      ref={ref}
      className={`vb-cell ${className}`}
      style={{ ...style, rotateX: srx, rotateY: sry, transformPerspective: 900 }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </motion.div>
  );
}

// ─── Stats Cell ────────────────────────────────────────────────────────────────
function StatCell({ inView }) {
  const c1 = useCounter(2026, 1400, inView);
  const c2 = useCounter(47, 1600, inView);
  const c3 = useCounter(99, 1800, inView);
  const c4 = useCounter(12, 1200, inView);
  const stats = [
    { val: c1, label: "EST.", suffix: "" },
    { val: c2, label: "LOOKS", suffix: "+" },
    { val: c3, label: "QUALITY", suffix: "%" },
    { val: c4, label: "CITIES", suffix: "K+" },
  ];
  return (
    <div style={{ height: "100%", background: "#111", padding: "22px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.28em", color: "rgba(255,255,255,0.4)", fontFamily: "'Montserrat',sans-serif" }}>
          THE VELORA CODE
        </span>
        <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: "0.15em", color: "rgba(255,255,255,0.25)", fontFamily: "'Montserrat',sans-serif" }}>
          2026
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px 12px" }}>
        {stats.map((s, i) => (
          <div key={i}>
            <div style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1, fontFamily: "'Montserrat',sans-serif" }}>
              {s.val.toLocaleString()}{s.suffix}
            </div>
            <div style={{ fontSize: 7.5, fontWeight: 700, color: "rgba(255,255,255,0.4)", letterSpacing: "0.18em", marginTop: 3, fontFamily: "'Montserrat',sans-serif" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Image Cell (with optional SHOP → navigation) ─────────────────────────────
function ImageCell({ src, tag, subTag, tagColor = "#fff", href, navigate, objectPosition = "center top", objectFit = "cover", bg = "transparent", imgScale = 1, imgPadding = 0 }) {
  const [hov, setHov] = useState(false);
  const isClickable = !!(href && navigate);

  return (
    <div
      style={{
        height: "100%",
        overflow: "hidden",
        position: "relative",
        cursor: isClickable ? "pointer" : "default",
        background: bg,
        padding: imgPadding,
        boxSizing: "border-box",
      }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={() => isClickable && navigate(href)}
    >
      <div style={{ width: "100%", height: "100%", overflow: "hidden", borderRadius: imgPadding ? 16 : 0, position: "relative" }}>
        <img
          src={src}
          alt="Editorial"
          style={{
            width: "100%", height: "100%",
            objectFit,
            objectPosition,
            transform: hov ? `scale(${imgScale * 1.05})` : `scale(${imgScale})`,
            transition: "transform 0.7s cubic-bezier(0.16,1,0.3,1)",
          }}
        />
        {/* gradient overlay — deepens on hover */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          background: hov
            ? "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.18) 55%, transparent 100%)"
            : "linear-gradient(to top, rgba(0,0,0,0.60) 0%, transparent 50%)",
          transition: "background 0.5s ease",
        }} />
      </div>

      {/* Top pill badge */}
      {subTag && (
        <div style={{ position: "absolute", top: 20, left: 20, pointerEvents: "none", zIndex: 10 }}>
          <span style={{
            fontSize: 9, fontWeight: 800, letterSpacing: "0.22em",
            color: "#111", background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(8px)",
            padding: "6px 14px", borderRadius: 100,
            fontFamily: "'Montserrat',sans-serif",
            textTransform: "uppercase",
            boxShadow: "0 2px 10px rgba(0,0,0,0.12)"
          }}>
            {subTag}
          </span>
        </div>
      )}

      {/* Bottom row: tag left, SHOP pill right */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        padding: "24px 24px 26px",
        display: "flex", alignItems: "flex-end", justifyContent: "space-between",
        zIndex: 10,
      }}>
        <div>
          {tag && (
            <span style={{
              fontSize: 12, fontWeight: 800, letterSpacing: "0.2em",
              color: tagColor, fontFamily: "'Montserrat',sans-serif",
              display: "block", textShadow: "0 2px 8px rgba(0,0,0,0.4)"
            }}>
              {tag}
            </span>
          )}
        </div>

        {isClickable && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.96)",
            color: "#111", borderRadius: 100,
            padding: "10px 20px",
            fontSize: 10, fontWeight: 800,
            letterSpacing: "0.22em",
            fontFamily: "'Montserrat',sans-serif",
            transform: hov ? "translateY(0) scale(1)" : "translateY(16px) scale(0.9)",
            opacity: hov ? 1 : 0,
            transition: "transform 0.4s cubic-bezier(0.16,1,0.3,1), opacity 0.32s ease",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            boxShadow: "0 4px 20px rgba(0,0,0,0.22)",
          }}>
            SHOP LOOK
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Delivery Cell ─────────────────────────────────────────────────────────────
function DeliveryCell() {
  const cities = ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Pune", "Kolkata"];
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % cities.length), 1800);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{ height: "100%", background: "#161616", padding: "22px 20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4ade80", animation: "vb-blink 1.5s ease-in-out infinite" }} />
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.28em", color: "rgba(255,255,255,0.5)", fontFamily: "'Montserrat',sans-serif" }}>
          LIVE DISPATCH
        </span>
      </div>
      <div>
        <motion.p
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{ fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", fontFamily: "'Montserrat',sans-serif", lineHeight: 1 }}
        >
          {cities[idx]}
        </motion.p>
        <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.4)", marginTop: 5, fontFamily: "'Inter',sans-serif", fontWeight: 300 }}>
          Express dispatch active
        </p>
      </div>
      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
        {cities.map((c, i) => (
          <div key={c} style={{
            width: 5, height: 5, borderRadius: "50%",
            background: i === idx ? "#fff" : "rgba(255,255,255,0.18)",
            transition: "background 0.3s",
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── Scroll reveal variants ────────────────────────────────────────────────────
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const cellVariants = {
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] } },
};

// ─── Main BentoDNA component ───────────────────────────────────────────────────
export default function BentoDNA({ navigate }) {
  const sectionRef = useRef(null);
  const inView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      style={{ background: "#fff", padding: "80px 0 96px", overflow: "hidden" }}
    >
      <style>{CSS}</style>

      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        style={{ textAlign: "center", marginBottom: 48, padding: "0 24px" }}
      >
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.35em", color: "#aaa", fontFamily: "'Montserrat',sans-serif", marginBottom: 10 }}>
          THE VELORA UNIVERSE
        </p>
        <h2 style={{ fontSize: "clamp(28px,4vw,48px)", fontWeight: 300, color: "#111", fontFamily: "'Inter',sans-serif", letterSpacing: "-0.03em", lineHeight: 1.15, margin: 0 }}>
          More than a brand.{" "}
          <span style={{ fontWeight: 700 }}>A living identity.</span>
        </h2>
      </motion.div>

      {/* Bento grid */}
      <div style={{ maxWidth: 1440, margin: "0 auto", padding: "0 24px" }}>
        <motion.div
          className="vb-grid"
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {/* 1. Portrait Product Card 1 (bentomodel1: Spans 5 cols, 480px height) */}
          <motion.div variants={cellVariants} className="vb-p1-cell">
            <MagCell style={{ height: "100%" }} intensity={4}>
              <ImageCell
                src="/model-images/bentomodel1.webp"
                subTag="LOOK 01 • STREETWEAR"
                tag="OVERSIZED GRAPHIC TEE"
                objectPosition="center 15%"
                href="/product/6a6765a1604929cd5133a9ac"
                navigate={navigate}
              />
            </MagCell>
          </motion.div>

          {/* 2. Portrait Product Card 2 (bentomodel2: Spans 4 cols, 480px height - FRAMED SCALED DOWN FIT) */}
          <motion.div variants={cellVariants} className="vb-p2-cell">
            <MagCell style={{ height: "100%" }} intensity={4}>
              <ImageCell
                src="/model-images/bentomodel2.webp"
                subTag="LOOK 02 • MODERN ESSENTIALS"
                tag="PASTEL OVERLAYER SHIRT"
                objectPosition="center center"
                objectFit="contain"
                bg="#181818"
                imgPadding="16px"
                href="/product/6a6767ec604929cd5133ad66"
                navigate={navigate}
              />
            </MagCell>
          </motion.div>

          {/* 3. Stacked Right Column: Stats (Top, 232px) */}
          <motion.div variants={cellVariants} className="vb-stat-cell">
            <MagCell style={{ height: "100%" }}>
              <StatCell inView={inView} />
            </MagCell>
          </motion.div>

          {/* 4. Stacked Right Column: Delivery Dispatch Ticker (Bottom, 232px) */}
          <motion.div variants={cellVariants} className="vb-deliv-cell">
            <MagCell style={{ height: "100%" }}>
              <DeliveryCell />
            </MagCell>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
