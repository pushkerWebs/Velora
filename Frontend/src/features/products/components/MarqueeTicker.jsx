import React from "react";

export default function MarqueeTicker() {
  return (
    <div className="w-full bg-[#111] border-b border-white/10 py-3 sm:py-3.5 overflow-hidden select-none">
      <div className="animate-footer-marquee">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-6 sm:gap-10 px-4 whitespace-nowrap text-white/85 text-[10px] sm:text-[11px] font-bold tracking-[0.22em] uppercase"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            <span>OUR VELORA EDIT IS NOW 150K STRONG</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <span>FLAT 10% OFF FIRST ORDER • CODE: VELORA10</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <span>EXPRESS DISPATCH WITHIN 24 HOURS</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
            <span>GEN Z CONTEMPORARY LUXURY</span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
          </div>
        ))}
      </div>
    </div>
  );
}
