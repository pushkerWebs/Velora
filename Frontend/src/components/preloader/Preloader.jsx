import React from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Preloader({ progress, phase, isRevealing, isComplete, shouldShow }) {
  if (!shouldShow || isComplete) return null;

  const formattedCounter = String(progress).padStart(3, "0");

  let phaseText = "INITIALIZING ARCHIVE";
  if (progress > 30 && progress <= 65) {
    phaseText = "CURATING EDITORIAL LOOKS";
  } else if (progress > 65 && progress < 100) {
    phaseText = "PRELOADING ESSENTIALS";
  } else if (progress >= 100) {
    phaseText = "WELCOME TO VELORA";
  }

  const isPausedOrRevealing = phase === "paused" || phase === "revealing" || phase === "complete";
  const isCurtainOpen = phase === "revealing" || phase === "complete";

  return (
    <div
      key="velora-cinematic-curtain-preloader"
      className="fixed inset-0 z-[99999] select-none overflow-hidden pointer-events-none"
      style={{ fontFamily: "'Montserrat', sans-serif" }}
    >
      {/* Subtle Noise Texture Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] bg-repeat z-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* ────────────────────────────────────────────────────────
          TOP CURTAIN PANEL (Slides UPWARD from horizontal split)
      ─────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ y: "0%", filter: "blur(0px)" }}
        animate={{
          y: isCurtainOpen ? "-100%" : "0%",
          filter: isCurtainOpen ? "blur(8px)" : "blur(0px)",
        }}
        transition={{
          y: { duration: 0.8, ease: [0.65, 0, 0.35, 1] },
          filter: { duration: 0.8, ease: [0.65, 0, 0.35, 1] },
        }}
        className="absolute top-0 left-0 right-0 h-[50vh] bg-[#0A0A0A] z-20 flex flex-col justify-between p-6 sm:p-10 lg:p-14 border-b border-white/10 overflow-hidden pointer-events-auto"
        style={{ willChange: "transform, filter" }}
      >
        {/* Top Grid Metadata */}
        <div className="w-full flex items-center justify-between z-10 text-[9px] sm:text-[10.5px] font-extrabold uppercase tracking-[0.32em] text-white/50 border-b border-white/10 pb-4 sm:pb-6">
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            VELORA / 2026 ARCHIVE
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="flex items-center gap-2 text-white/70"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white/90 animate-pulse" />
            <span>COLLECTION 04</span>
          </motion.div>
        </div>

        {/* VELORA Brand Title (subtly scales down at 100% pause) */}
        <div className="absolute inset-0 flex flex-col items-center justify-center sm:justify-end pb-0 sm:pb-1 pointer-events-none px-2 sm:px-6">
          <motion.h1
            initial={{ opacity: 0, y: 15, scale: 1 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: isPausedOrRevealing ? 0.90 : 1.0,
            }}
            transition={{
              scale: { duration: 0.35, ease: "easeInOut" },
              opacity: { duration: 0.7 },
              y: { duration: 0.7 },
            }}
            className="text-[40px] xs:text-[56px] sm:text-[110px] md:text-[145px] lg:text-[170px] font-black uppercase tracking-[0.14em] sm:tracking-[0.22em] pl-[0.14em] sm:pl-[0.22em] leading-none text-white select-none text-center whitespace-nowrap"
            style={{ fontFamily: "'Montserrat', sans-serif", willChange: "transform" }}
          >
            VELORA
          </motion.h1>
        </div>
      </motion.div>

      {/* ────────────────────────────────────────────────────────
          BOTTOM CURTAIN PANEL (Slides DOWNWARD from horizontal split)
      ─────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ y: "0%", filter: "blur(0px)" }}
        animate={{
          y: isCurtainOpen ? "100%" : "0%",
          filter: isCurtainOpen ? "blur(8px)" : "blur(0px)",
        }}
        transition={{
          y: { duration: 0.8, ease: [0.65, 0, 0.35, 1] },
          filter: { duration: 0.8, ease: [0.65, 0, 0.35, 1] },
        }}
        className="absolute bottom-0 left-0 right-0 h-[50vh] bg-[#0A0A0A] z-20 flex flex-col justify-between p-6 sm:p-10 lg:p-14 border-t border-white/10 overflow-hidden pointer-events-auto"
        style={{ willChange: "transform, filter" }}
      >
        {/* Stage Ticker */}
        <div className="pt-2 sm:pt-4 flex flex-col items-center z-10">
          <div className="h-8 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.p
                key={phaseText}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="text-[10px] xs:text-[12px] sm:text-[14px] font-extrabold uppercase tracking-[0.38em] text-white/60 text-center"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                {phaseText}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom Metadata & Oversized Counter */}
        <div className="w-full flex items-end justify-between z-10 border-t border-white/10 pt-4 sm:pt-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-[9px] sm:text-[10.5px] font-extrabold uppercase tracking-[0.32em] text-white/50 pb-2"
          >
            PARIS • MILAN • TOKYO
          </motion.div>

          {/* Oversized Counter (000 -> 100) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7 }}
            className="text-white font-black tracking-tighter text-[42px] sm:text-[72px] lg:text-[90px] leading-none select-none"
            style={{ fontVariantNumeric: "tabular-nums", fontFamily: "'Montserrat', sans-serif" }}
          >
            {formattedCounter}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
