import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useProduct } from "../hook/useProduct.js";
import { useWishlist } from "../hook/useWishlist.js";

import ProductCardImagePreview from "./ProductCardImagePreview.jsx";

// Marquee Text String
const MARQUEE_TEXT = "NEW ARRIVALS • PREMIUM ESSENTIALS • MODERN FITS • VELORA EDITION 2026 • DESIGNED FOR EVERYDAY CONFIDENCE • ";

// Format Price helper
const formatCurrency = (val) => {
  if (typeof val === "object" && val !== null) {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: val.currency || "INR",
      maximumFractionDigits: 0,
    }).format(val.amount);
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val || 0);
};

// Container stagger variants
const gridContainerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

// Product Card Variants (opacity: 0, y: 40 -> opacity: 1, y: 0)
const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export default function FeaturedCollection() {
  const navigate = useNavigate();
  const { handleGetAllProducts } = useProduct();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const storeProducts = useSelector((state) => state.product?.products) || [];

  const [loading, setLoading] = useState(true);

  // Auto-fetch products from backend DB on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        await handleGetAllProducts();
      } catch (err) {
        console.error("Failed to load products from API:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Use DB store products directly (limited to 8 products / 2 rows)
  const displayProducts = storeProducts.slice(0, 8);

  return (
    <section id="shop" className="w-full bg-white select-none overflow-hidden">

      {/* ── PART 1: INFINITE MARQUEE ── */}
      <div className="velora-marquee-container w-full bg-[#111111] h-[70px] flex items-center overflow-hidden select-none cursor-pointer">
        <style>{`
          @keyframes veloraMarqueeLoop {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .velora-marquee-track {
            display: flex;
            white-space: nowrap;
            width: max-content;
            animation: veloraMarqueeLoop 32s linear infinite;
          }
          .velora-marquee-container:hover .velora-marquee-track {
            animation-play-state: paused;
          }
        `}</style>

        <div className="velora-marquee-track">
          {[...Array(4)].map((_, i) => (
            <span
              key={i}
              className="text-white text-[13px] sm:text-[14px] font-bold tracking-[2px] uppercase px-4 flex items-center gap-3"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {MARQUEE_TEXT}
            </span>
          ))}
        </div>
      </div>

      {/* ── PART 2: FEATURED PRODUCTS ── */}
      <div className="max-w-[1440px] mx-auto px-6 sm:px-12 lg:px-16 pt-10 sm:pt-14 lg:pt-16 pb-2 sm:pb-4 lg:pb-4">

        {/* ── HEADING (Fade upward, animate once) ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col items-center text-center mb-8 sm:mb-10 lg:mb-12 gpu-accelerated"
        >
          {/* Top Heading */}
          <p
            className="text-[10px] sm:text-[11px] font-bold tracking-[0.35em] text-[#777] uppercase mb-2 sm:mb-3"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            VELORA EDITION 2026
          </p>

          {/* Large Title */}
          <h2
            className="text-[32px] sm:text-[44px] lg:text-[52px] font-light text-[#111] tracking-[-0.03em] leading-tight mb-2 sm:mb-3"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            The Modern Collection
          </h2>

          {/* Small Description */}
          <p
            className="text-[13px] sm:text-[15px] font-light text-[#666] max-w-[460px]"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Tailored silhouettes crafted with premium fabrics for everyday luxury.
          </p>
        </motion.div>

        {/* ── LOADING SPINNER OR PRODUCT GRID ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="w-7 h-7 border-2 border-[#111] border-t-transparent rounded-full animate-spin" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#aaa]">
              Loading Collection...
            </span>
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <p className="text-[15px] font-semibold text-[#111]" style={{ fontFamily: "'Inter', sans-serif" }}>
              No products available in collection yet
            </p>
            <p className="text-[13px] text-[#777]" style={{ fontFamily: "'Inter', sans-serif" }}>
              Check back soon for new arrivals.
            </p>
          </div>
        ) : (
          <>
            {/* Product Grid */}
            <motion.div
              variants={gridContainerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-40px" }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-10 lg:mb-12"
            >
              {displayProducts.map((product) => {
                const isLiked = isWishlisted(product._id);
                const origPrice = product.originalPrice || (product.price?.amount ? Math.round(product.price.amount * 1.25) : null);

                return (
                  <motion.div
                    key={product._id}
                    variants={cardVariants}
                    onClick={() => navigate(`/product/${product._id}`)}
                    className="group flex flex-col bg-white border-none rounded-[16px] overflow-hidden cursor-pointer shadow-none hover:shadow-xl hover:-translate-y-[2px] transition-all duration-300 ease-out h-full gpu-accelerated"
                  >
                    {/* Image Container */}
                    <div className="relative w-full aspect-[3/4] bg-[#f5f5f5] overflow-hidden rounded-[16px] mb-4">

                      {/* Product Hover Image Preview Component */}
                      <ProductCardImagePreview
                        images={product.images}
                        alt={product.title}
                        aspectRatioClass="aspect-[3/4]"
                        className="rounded-[16px]"
                      />

                      {/* Wishlist Icon Button (Top-Right) */}
                      <button
                        onClick={(e) => toggleWishlist(product._id, e)}
                        aria-label="Add to wishlist"
                        className="absolute top-3.5 right-3.5 z-10 p-2.5 bg-white/90 backdrop-blur-md rounded-full text-[#111] shadow-sm transition-transform duration-300 ease-out group-hover:rotate-12 hover:scale-110 cursor-pointer"
                      >
                        <svg
                          className={`w-4 h-4 transition-colors duration-200 ${isLiked ? "fill-red-500 stroke-red-500" : "fill-none stroke-[#111]"}`}
                          strokeWidth={1.8}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Details */}
                    <div className="flex flex-col flex-1 justify-between px-1 pb-1">
                      <div>
                        <h3
                          className="text-[14px] font-semibold text-[#111] tracking-[0.01em] line-clamp-1 mb-1.5 transition-colors duration-200 group-hover:text-[#555]"
                          style={{ fontFamily: "'Inter', sans-serif" }}
                        >
                          {product.title}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-bold text-[#111]">
                          {formatCurrency(product.price)}
                        </span>
                        {origPrice && (
                          <span className="text-[12px] text-[#aaa] line-through font-normal">
                            {formatCurrency(origPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* ── VIEW ALL BUTTON (Centered below 2 rows of products) ── */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              className="flex justify-center gpu-accelerated"
            >
              <button
                onClick={() => navigate("/products")}
                className="
                  inline-flex items-center justify-center
                  bg-[#111] text-white
                  border border-[#111]
                  rounded-full
                  px-9 py-4
                  text-[11px] font-bold tracking-[0.2em] uppercase
                  cursor-pointer select-none
                  transition-all duration-300 ease-out
                  hover:bg-white hover:text-[#111] hover:border-[#111]
                  hover:-translate-y-[3px] shadow-sm hover:shadow-md
                  active:scale-95
                "
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                VIEW ALL COLLECTION
              </button>
            </motion.div>
          </>
        )}

      </div>
    </section>
  );
}
