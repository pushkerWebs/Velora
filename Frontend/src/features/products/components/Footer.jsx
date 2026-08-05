import React, { useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";

const FOOTER_LINKS = [
  {
    heading: "Shop",
    links: [
      { name: "Full Sleeve", path: "/products?category=Full Sleeve" },
      { name: "Boxy Fit", path: "/products?category=Boxy Fit" },
      { name: "Linen Collection", path: "/products?category=Linen" },
      { name: "All Topwear", path: "/category/Shirts" },
      { name: "Denim & Bottoms", path: "/category/Jeans" },
    ],
  },
  {
    heading: "Support",
    links: [
      { name: "Track Your Order", path: "#" },
      { name: "Shipping & Delivery", path: "#" },
      { name: "7-Day Easy Exchange", path: "#" },
      { name: "Customer Support", path: "#" },
    ],
  },
  {
    heading: "Company",
    links: [
      { name: "About VELORA", path: "#" },
      { name: "The Manifesto", path: "#" },
      { name: "Careers", path: "#" },
      { name: "Privacy Policy", path: "#" },
      { name: "Terms of Service", path: "#" },
    ],
  },
];

const FAQS = [
  {
    q: "What makes VELORA streetwear different?",
    a: "VELORA creates 100% original, contemporary luxury streetwear designed in-house. We focus on premium heavyweight fabrics, precision boxy silhouettes, and structured fits with zero compromises.",
  },
  {
    q: "Is there a welcome discount for first-time buyers?",
    a: "Yes! Use coupon code VELORA10 at checkout to receive FLAT 10% OFF on your first order across all topwear, denim, and linen collections.",
  },
  {
    q: "How do express shipping and exchanges work?",
    a: "All orders are dispatched within 24 hours. We offer complimentary express delivery across India for orders over ₹1,999 alongside hassle-free 7-day returns & exchanges.",
  },
  {
    q: "Are VELORA garments unisex?",
    a: "Absolutely. All our oversized graphic tees, linen button-downs, boxy overshirts, and relaxed denim are engineered for gender-neutral, elevated everyday wear.",
  },
];

const SOCIALS = [
  { name: "Instagram", icon: "📸" },
  { name: "YouTube", icon: "▶" },
  { name: "Twitter", icon: "𝕏" },
  { name: "Pinterest", icon: "📌" },
];

export default function Footer() {
  const [openFaq, setOpenFaq] = useState(null);
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="relative w-full bg-white select-none overflow-hidden">

      {/* ─── 1. TOP SVG WAVE TRANSITION (Dynamic Moving Waves) ─── */}
      <div className="relative w-full overflow-hidden leading-none z-10 -mb-1 pointer-events-none">
        <svg
          className="relative block w-[110%] -ml-[5%] h-[50px] sm:h-[75px] lg:h-[100px]"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          {/* Layer 1: Back translucent wave (slow motion) */}
          <path
            className="animate-wave-back"
            d="M0,10 C180,85 380,-30 540,45 C700,130 920,5 1200,35 L1200,120 L0,120 Z"
            fill="#1f1f1f"
            opacity="0.5"
          />
          {/* Layer 2: Mid wave (medium motion) */}
          <path
            className="animate-wave-mid"
            d="M0,25 C140,95 340,5 580,65 C780,125 980,15 1200,45 L1200,120 L0,120 Z"
            fill="#141414"
            opacity="0.8"
          />
          {/* Layer 3: Front main wave (smooth main motion) */}
          <path
            className="animate-wave-front"
            d="M0,40 C210,105 460,20 710,80 C960,140 1110,30 1200,60 L1200,120 L0,120 Z"
            fill="#0d0d0d"
          />
        </svg>
      </div>

      {/* ─── 2. MAIN FOOTER BODY ─── */}
      <footer className="bg-[#0d0d0d] text-white pt-10 sm:pt-14">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-12">

          {/* ─── 4. BRAND MANIFESTO & ACCORDION FAQS (WTFlex Inspired) ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 border-b border-white/10 pb-14 mb-14">
            
            {/* Left Column: Brand Story Manifesto */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              <span
                className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                ABOUT THE BRAND
              </span>
              <h4
                className="text-[20px] sm:text-[24px] font-light text-white tracking-[-0.01em] leading-snug"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                What The VELORA Identity Represents
              </h4>
              <p className="text-[13px] text-white/55 font-light leading-relaxed">
                VELORA is designed for the modern fashion enthusiast who values structure, minimalist aesthetics, and effortless confidence. Every collection is crafted with intention—bringing luxury tailored cuts, boxy fits, and heavyweight fabrics directly to your wardrobe.
              </p>
              <div className="flex items-center gap-6 mt-3">
                <div className="flex flex-col">
                  <span className="text-[18px] font-bold text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>150K+</span>
                  <span className="text-[9px] text-white/40 uppercase tracking-[0.15em]">Global Community</span>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex flex-col">
                  <span className="text-[18px] font-bold text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>100%</span>
                  <span className="text-[9px] text-white/40 uppercase tracking-[0.15em]">Original Craft</span>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive FAQ Accordion */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <span
                className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/40 mb-1"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                FREQUENTLY ASKED QUESTIONS
              </span>

              <div className="flex flex-col gap-3">
                {FAQS.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={idx}
                      className="border border-white/10 rounded-[14px] bg-white/[0.03] overflow-hidden transition-colors"
                    >
                      <button
                        onClick={() => toggleFaq(idx)}
                        className="w-full flex items-center justify-between p-4 sm:p-5 text-left cursor-pointer hover:bg-white/[0.04] transition-colors"
                      >
                        <span
                          className="text-[13px] sm:text-[14px] font-semibold text-white/90 pr-4"
                          style={{ fontFamily: "'Montserrat', sans-serif" }}
                        >
                          {faq.q}
                        </span>
                        <span className="text-white/60 text-lg font-mono">
                          {isOpen ? "−" : "+"}
                        </span>
                      </button>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                          >
                            <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-[12px] sm:text-[13px] text-white/60 font-light leading-relaxed border-t border-white/5 pt-3">
                              {faq.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ─── 5. MAIN NAVIGATION LINKS & SOCIALS ─── */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-10 pb-14">

            {/* Brand Column */}
            <div className="col-span-2 lg:col-span-2 flex flex-col gap-5">
              <Link
                to="/"
                className="flex items-center select-none shrink-0 ml-1.5 sm:ml-3"
              >
                <img
                  src="/veloralogobgremoved.png"
                  alt="VELORA"
                  className="h-14 sm:h-16 lg:h-20 w-auto object-contain brightness-0 invert transition-transform duration-300 hover:scale-105"
                />
              </Link>
              <p className="text-[12px] text-white/45 font-light leading-relaxed max-w-[240px]">
                Premium contemporary fashion. Minimal by design. Elevated by intention.
              </p>

              {/* Social Media Links */}
              <div className="flex items-center gap-3 mt-2">
                {SOCIALS.map((s) => (
                  <a
                    key={s.name}
                    href="#"
                    title={s.name}
                    className="w-9 h-9 rounded-full bg-white/6 border border-white/12 flex items-center justify-center text-[12px] text-white/70 hover:text-white hover:bg-white/15 transition-all duration-200"
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Link Columns */}
            {FOOTER_LINKS.map((col) => (
              <div key={col.heading} className="flex flex-col gap-4">
                <span
                  className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {col.heading}
                </span>
                <ul className="flex flex-col gap-3">
                  {col.links.map((l) => (
                    <li key={l.name}>
                      <Link
                        to={l.path}
                        className="text-[12px] text-white/50 hover:text-white transition-colors font-light"
                      >
                        {l.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

          </div>

          {/* ─── 6. BOTTOM COPYRIGHT & LEGAL BAR ─── */}
          <div className="border-t border-white/8 py-7 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-[11px] text-white/30 font-light tracking-[0.05em]">
              © 2026 VELORA. All rights reserved. Built for Gen Z luxury streetwear.
            </span>

            <div className="flex items-center gap-6">
              <span className="text-[10px] text-white/20 font-bold tracking-[0.18em] uppercase" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                FASHION · LUXURY · MINIMALISM
              </span>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
