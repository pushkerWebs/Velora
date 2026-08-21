import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Mock Reviews Data (5 Curated Realistic Reviews) ───────────────────────────
const MOCK_REVIEWS = [
  {
    id: "rev-1",
    name: "Aarav Sharma",
    rating: 5,
    date: "August 2, 2026",
    title: "Superior Material & Precision Fit",
    comment: "The fabric quality exceeded my expectations. Premium feel and perfect fit. The drape is effortless.",
    verified: true,
  },
  {
    id: "rev-2",
    name: "Priya Mehta",
    rating: 5,
    date: "July 28, 2026",
    title: "Minimalist Luxury At Its Best",
    comment: "Minimal design with excellent stitching. Will definitely buy again. Velora never disappoints with construction.",
    verified: true,
  },
  {
    id: "rev-3",
    name: "Rohan Kapoor",
    rating: 4,
    date: "July 20, 2026",
    title: "Accurate Representation & Speedy Delivery",
    comment: "Looks exactly like the photos. Delivery was quick. Packaging felt like opening a luxury campaign archive piece.",
    verified: true,
  },
  {
    id: "rev-4",
    name: "Vikram Malhotra",
    rating: 2,
    date: "July 15, 2026",
    title: "Disappointing Fit & Loose Stitching",
    comment: "The stitching started coming off after a single wash. Sizing is way off. Disappointing experience for a premium brand.",
    verified: true,
  },
];

// Rating Distribution Data
const RATING_DISTRIBUTION = [
  { stars: 5, percentage: 72 },
  { stars: 4, percentage: 18 },
  { stars: 3, percentage: 6 },
  { stars: 2, percentage: 2 },
  { stars: 1, percentage: 2 },
];

// Helper component for Star Rating
function StarRating({ rating, size = "sm" }) {
  const stars = [];
  const starSizeClass = size === "lg" ? "text-lg sm:text-xl" : "text-xs sm:text-sm";
  
  let activeStarColor = "text-[#111111]";
  if (rating >= 4) {
    activeStarColor = "text-emerald-600";
  } else if (rating === 3) {
    activeStarColor = "text-amber-500";
  } else if (rating <= 2) {
    activeStarColor = "text-rose-500";
  }

  for (let i = 1; i <= 5; i++) {
    stars.push(
      <span
        key={i}
        className={`${starSizeClass} ${
          i <= rating ? activeStarColor : "text-[#E5E5E5]"
        }`}
      >
        ★
      </span>
    );
  }
  return <div className="flex items-center gap-0.5 select-none">{stars}</div>;
}

// ── Main ProductReviews Component ──────────────────────────────────────────────
export default function ProductReviews({ productId, user }) {
  // Local state initialized with mock reviews for future GET /api/reviews/:productId API binding
  const [reviews] = useState(MOCK_REVIEWS);
  const [noticeMessage, setNoticeMessage] = useState(null);

  // Handle Write a Review button click
  const handleWriteReviewClick = () => {
    if (!user) {
      setNoticeMessage("Please sign in to write a review.");
    } else {
      setNoticeMessage("Reviews are reserved for verified purchasers to ensure authentic feedback.");
    }
  };

  return (
    <section className="w-full pt-12 sm:pt-16 pb-8 border-t border-black/10 select-none">
      <div className="max-w-[1440px] mx-auto">
        
        {/* ── SECTION HEADER ── */}
        <div className="flex flex-col gap-2 mb-6">


          <div className="flex items-center gap-3">
            <StarRating rating={5} size="lg" />
            <span
              style={{ fontFamily: "'Montserrat', sans-serif" }}
              className="text-xl sm:text-2xl font-black text-[#111111] tracking-tight"
            >
              4.6
            </span>
          </div>
        </div>

        {/* Thin Divider */}
        <div className="w-full h-[1px] bg-black/10 mb-8 sm:mb-12" />

        {/* ── RATING SUMMARY & WRITE REVIEW BUTTON ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start mb-10 sm:mb-14">
          
          {/* Left Column: Rating Distribution Bars (7 Cols) */}
          <div className="lg:col-span-7 bg-white p-5 sm:p-7 rounded-2xl border border-black/5 shadow-xs flex flex-col gap-4">
            <h3
              style={{ fontFamily: "'Montserrat', sans-serif" }}
              className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#111111] border-b border-black/5 pb-3"
            >
              Rating Distribution
            </h3>

            <div className="flex flex-col gap-2.5">
              {RATING_DISTRIBUTION.map((item) => (
                <div key={item.stars} className="flex items-center gap-3 text-[11px] sm:text-[12px]">
                  <span className="w-6 font-bold text-[#111111] shrink-0">
                    {item.stars}★
                  </span>

                  {/* Progress Bar Track */}
                  <div className="flex-1 h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${item.percentage}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full ${
                        item.stars >= 4
                          ? "bg-emerald-600"
                          : item.stars === 3
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                    />
                  </div>

                  <span className="w-9 text-right font-semibold text-[#747878] shrink-0 text-[10px] sm:text-[11px]">
                    {item.percentage}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Write a Review Callout (5 Cols) */}
          <div className="lg:col-span-5 bg-white p-5 sm:p-7 rounded-2xl border border-black/5 shadow-xs flex flex-col justify-between h-full gap-5">
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#747878] block mb-1">
                VERIFIED FEEDBACK
              </span>
              <h3
                style={{ fontFamily: "'Montserrat', sans-serif" }}
                className="text-[15px] sm:text-[17px] font-bold uppercase tracking-tight text-[#111111] mb-2"
              >
                Share Your Experience
              </h3>
              <p className="text-[12px] text-[#666666] leading-relaxed font-light">
                Have you purchased this piece? Help our global community by sharing your feedback on fit, drape, and material quality.
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={handleWriteReviewClick}
                className="w-full sm:w-auto self-start bg-[#111111] hover:bg-black text-white text-[10px] font-bold uppercase tracking-[0.2em] px-8 py-3.5 rounded-full transition-all cursor-pointer shadow-xs active:scale-98"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Write a Review
              </button>

              {/* Inline Luxury Notice (No Alert, No Popup, No Toast) */}
              <AnimatePresence>
                {noticeMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 text-[11px] font-semibold text-red-600 leading-snug bg-red-50/80 border border-red-200/80 px-4 py-3 rounded-xl flex items-start gap-2.5"
                  >
                    <svg className="w-4 h-4 text-red-600 shrink-0 translate-y-[1px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
                    <span>{noticeMessage}</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* ── REVIEWS GRID CARDS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {reviews.map((rev, index) => (
            <motion.div
              key={rev.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: "easeOut" }}
              className={`bg-white p-5 sm:p-6 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-4 ${
                rev.rating >= 4
                  ? "border-emerald-600/10 hover:border-emerald-600/30 hover:shadow-md hover:shadow-emerald-600/5"
                  : rev.rating === 3
                  ? "border-amber-500/10 hover:border-amber-500/30 hover:shadow-md hover:shadow-amber-500/5"
                  : "border-rose-500/10 hover:border-rose-500/30 hover:shadow-md hover:shadow-rose-500/5"
              }`}
            >
              <div className="flex flex-col gap-2.5">
                {/* Card Top: Stars & Date */}
                <div className="flex items-center justify-between gap-2">
                  <StarRating rating={rev.rating} />
                  <span className="text-[10px] font-medium text-[#888888]">
                    {rev.date}
                  </span>
                </div>

                {/* Review Headline Title */}
                {rev.title && (
                  <h4
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                    className="text-[13px] sm:text-[14px] font-bold text-[#111111] uppercase tracking-tight"
                  >
                    "{rev.title}"
                  </h4>
                )}

                {/* Review Body Comment */}
                <p className="text-[12px] sm:text-[13px] text-[#444444] leading-relaxed font-light">
                  "{rev.comment}"
                </p>
              </div>

              {/* Card Footer: Reviewer Name & Verified Badge */}
              <div className="flex items-center justify-between pt-3 border-t border-black/5 mt-1">
                <span
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                  className="text-[11px] sm:text-[12px] font-extrabold uppercase tracking-wide text-[#111111]"
                >
                  {rev.name}
                </span>

                {rev.verified && (
                  <span className={`inline-flex items-center gap-1 text-white text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.16em] px-2.5 py-1 rounded-sm ${
                    rev.rating >= 4
                      ? "bg-emerald-700"
                      : rev.rating === 3
                      ? "bg-amber-600"
                      : "bg-rose-600"
                  }`}>
                    <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    Verified Buyer
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
