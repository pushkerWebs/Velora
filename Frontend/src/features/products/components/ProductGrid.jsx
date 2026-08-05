import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { useProduct } from "../hook/useProduct.js";
import { useWishlist } from "../hook/useWishlist.js";

import ProductCardImagePreview from "./ProductCardImagePreview.jsx";

// ── Price Formatter Helper ───────────────────────────────────────────────────
const formatPrice = (priceObj) => {
  if (!priceObj) return "—";
  if (typeof priceObj === "number") {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(priceObj);
  }
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: priceObj.currency || "INR",
    maximumFractionDigits: 0,
  }).format(priceObj.amount || 0);
};

// ── Motion Variants ─────────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

// ── Skeleton Loader Card ─────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="flex flex-col animate-pulse">
      <div className="w-full aspect-[3/4] bg-[#f0f0f0] rounded-[16px] mb-3" />
      <div className="h-4 bg-[#f0f0f0] rounded-full w-3/4 mb-2" />
      <div className="h-4 bg-[#f0f0f0] rounded-full w-1/3" />
    </div>
  );
}

// ── Product Card Component (Stitch Screen #1 Specification) ─────────────────
const ProductCard = React.memo(function ProductCard({ product, onClick }) {
  const { toggleWishlist, isWishlisted } = useWishlist();
  const isLiked = isWishlisted(product._id);

  return (
    <motion.div
      variants={cardVariants}
      onClick={onClick}
      className="group flex flex-col cursor-pointer select-none gpu-accelerated"
    >
      {/* ── Image Container (Aspect 3:4) ── */}
      <div className="relative w-full aspect-[3/4] bg-[#f3f3f3] rounded-[16px] overflow-hidden mb-3.5">
        
        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => toggleWishlist(product._id, e)}
          aria-label="Add to wishlist"
          className="absolute top-3.5 right-3.5 z-10 p-2.5 bg-white/80 backdrop-blur-md rounded-full text-[#111] shadow-sm transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
        >
          <svg
            className={`w-4 h-4 transition-colors duration-200 ${
              isLiked ? "fill-red-500 stroke-red-500" : "fill-none stroke-[#111]"
            }`}
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

        {/* Image / Hover Preview Component */}
        <ProductCardImagePreview
          images={product.images}
          alt={product.title}
          aspectRatioClass="aspect-[3/4]"
          className="rounded-[16px]"
        />

        {/* Subtle Hover Overlay CTA */}
        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out z-10 hidden sm:block">
          <span className="block text-center bg-[#111] text-white text-[10px] font-bold uppercase tracking-[0.2em] py-2.5 rounded-[10px] shadow-md" style={{ fontFamily: "'Montserrat', sans-serif" }}>
            VIEW DETAILS
          </span>
        </div>
      </div>

      {/* ── Title & Price ── */}
      <div className="flex flex-col gap-1 px-1">
        <h3
          className="text-[15px] font-semibold text-[#1a1c1c] truncate group-hover:opacity-70 transition-opacity"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {product.title}
        </h3>

        <p
          className="text-[12px] font-bold tracking-[0.1em] text-[#444748] uppercase"
          style={{ fontFamily: "'Montserrat', sans-serif" }}
        >
          {formatPrice(product.price)}
        </p>
      </div>
    </motion.div>
  );
});

// ── Main ProductGrid Component (Stitch Screen #1 Implementation) ────────────
export default function ProductGrid() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const categoryFilter = searchParams.get("category") || "All";

  const { handleGetAllProducts } = useProduct();
  const products = useSelector((state) => state.product?.products) || [];

  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("default");
  const [gridCols, setGridCols] = useState(4);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        await handleGetAllProducts();
      } catch (err) {
        console.error("Failed to load products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // Filter Logic
  const filtered = useMemo(() => {
    return products.filter((p) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !query ||
        (p.title || "").toLowerCase().includes(query) ||
        (p.description || "").toLowerCase().includes(query) ||
        (p.category || "").toLowerCase().includes(query);

      if (!matchesSearch) return false;

      if (categoryFilter !== "All") {
        const catLower = (p.category || "").toLowerCase().trim();
        const titleLower = (p.title || "").toLowerCase();
        const descLower = (p.description || "").toLowerCase();
        const fullText = `${titleLower} ${descLower} ${catLower}`;

        if (categoryFilter === "Full Sleeve") {
          // Strictly match ONLY "full sleeve" or "full sleeves" or "full-sleeve"
          return fullText.includes("full sleeve") || fullText.includes("full sleeves") || fullText.includes("full-sleeve");
        }

        if (categoryFilter === "Boxy Fit") {
          // Strictly match ONLY "boxy"
          return fullText.includes("boxy");
        }

        if (categoryFilter === "Linen") {
          // Strictly match ONLY "linen"
          return fullText.includes("linen");
        }
      }

      return true;
    });
  }, [products, searchQuery, categoryFilter]);

  // Sort Logic
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aPrice = typeof a.price === "object" ? a.price?.amount || 0 : a.price || 0;
      const bPrice = typeof b.price === "object" ? b.price?.amount || 0 : b.price || 0;

      if (sortBy === "price-low") return aPrice - bPrice;
      if (sortBy === "price-high") return bPrice - aPrice;
      if (sortBy === "newest") return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortBy === "title-az") return (a.title || "").localeCompare(b.title || "");
      return 0;
    });
  }, [filtered, sortBy]);

  const handleCategoryChange = (cat) => {
    const newParams = new URLSearchParams(searchParams);
    if (cat === "All") {
      newParams.delete("category");
    } else {
      newParams.set("category", cat);
    }
    setSearchParams(newParams);
  };

  return (
    <section className="bg-[#f9f9f9] min-h-screen pb-24 select-none">
      
      {/* ── HERO SECTION (Large Screen Expanded Height) ── */}
      <section className="relative w-full h-[380px] xs:h-[440px] sm:h-[60vh] lg:h-[85vh] xl:h-[90vh] lg:max-h-[800px] flex items-center justify-center overflow-hidden mb-4">
        <div className="absolute inset-0 z-0 bg-[#0d0d0d]">
          <img
            src="/velora-catalogue-hero.png"
            alt="The Full Collection Hero - Grayscale Long Sleeve Model"
            className="w-full h-full object-cover object-center lg:object-[center_28%] opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#f9f9f9] via-transparent to-black/40 pointer-events-none" />
        </div>
        <div className="relative z-10 text-center px-4 flex flex-col items-center max-w-3xl mx-auto">
          {/* Small tracked uppercase text right after navbar */}
          <span
            className="text-[10px] xs:text-[11px] font-bold tracking-[0.3em] text-[#e2e2e2] uppercase mb-3 bg-black/50 px-3.5 py-1 rounded-full backdrop-blur-sm border border-white/10"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            COLLECTION 04 // VELORA ARCHIVE
          </span>

          <h1
            className="text-[28px] xs:text-[40px] md:text-[56px] lg:text-[68px] font-bold text-white uppercase tracking-tight mb-3 drop-shadow-md"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {searchQuery ? `"${searchQuery}"` : categoryFilter !== "All" ? categoryFilter : "THE FULL COLLECTION"}
          </h1>

          <p
            className="text-[11px] xs:text-[12px] font-bold text-white/90 uppercase tracking-[0.2em] bg-black/40 px-3.5 py-1 rounded-full backdrop-blur-sm"
            style={{ fontFamily: "'Montserrat', sans-serif" }}
          >
            {sorted.length} {sorted.length === 1 ? "ITEM" : "ITEMS"}
          </p>
        </div>
      </section>

      {/* ── STITCH FILTER & CATEGORY CHIPS BAR (Responsive Mobile Fit) ── */}
      <section className="bg-[#f9f9f9] border-b border-[#e2e2e2] py-4 px-3 sm:px-8 lg:px-12 mb-8">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          
          {/* Category Chips Bar */}
          <div className="w-full md:w-auto overflow-x-auto scrollbar-none -mx-3 px-3 sm:mx-0 sm:px-0">
            <div className="flex items-center gap-2 sm:gap-2.5 whitespace-nowrap pb-1 md:pb-0">
              {["All", "Full Sleeve", "Boxy Fit", "Linen"].map((cat) => {
                const isActive = categoryFilter === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`px-3.5 xs:px-4 sm:px-5 py-1.5 sm:py-2 rounded-full border text-[10px] sm:text-[11px] font-bold uppercase tracking-widest transition-colors cursor-pointer shrink-0 ${
                      isActive
                        ? "border-[#111111] bg-[#111111] text-white"
                        : "border-[#111111] bg-transparent text-[#111111] hover:bg-[#dfe0e0]"
                    }`}
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sort Dropdown & View Controls */}
          <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-4">
            
            {sortBy !== "default" && (
              <button
                onClick={() => setSortBy("default")}
                className="text-[10px] font-bold tracking-[0.14em] uppercase text-[#e11d48] hover:text-[#be123c] transition-colors cursor-pointer px-2 py-1"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                Reset Sort ✕
              </button>
            )}

            {/* Sort Selector */}
            <div className="relative group shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white text-[11px] font-bold tracking-[0.12em] uppercase text-[#111111] pl-4 pr-8 py-2 rounded-full border border-[#e2e2e2] focus:outline-none focus:ring-1 focus:ring-[#111111] cursor-pointer transition-all appearance-none shadow-sm"
                style={{ fontFamily: "'Montserrat', sans-serif" }}
              >
                <option value="default">SORT: RECOMMENDED</option>
                <option value="price-low">PRICE: LOW → HIGH</option>
                <option value="price-high">PRICE: HIGH → LOW</option>
                <option value="newest">NEWEST ARRIVALS</option>
                <option value="title-az">NAME: A → Z</option>
              </select>

              <svg
                className="w-3.5 h-3.5 text-[#5d5f5f] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </div>

            {/* Desktop View Switcher */}
            <div className="hidden lg:flex items-center bg-white border border-[#e2e2e2] rounded-full p-1 gap-1 shadow-sm">
              <button
                onClick={() => setGridCols(2)}
                title="Large Editorial View (2 Columns)"
                className={`p-2 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                  gridCols === 2
                    ? "bg-[#111111] text-white shadow-sm scale-105"
                    : "text-[#5d5f5f] hover:text-[#111111] hover:bg-[#f3f3f3]"
                }`}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="4" width="6.5" height="16" rx="1.5" />
                  <rect x="13.5" y="4" width="6.5" height="16" rx="1.5" />
                </svg>
              </button>

              <button
                onClick={() => setGridCols(4)}
                title="Compact Grid View (4 Columns)"
                className={`p-2 rounded-full transition-all cursor-pointer flex items-center justify-center ${
                  gridCols === 4
                    ? "bg-[#111111] text-white shadow-sm scale-105"
                    : "text-[#888] hover:text-[#111111] hover:bg-[#f3f3f3]"
                }`}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
                  <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
                  <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
                  <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
                  <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
                </svg>
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ── PRODUCT GRID CONTENT ── */}
      <div className="max-w-[1440px] mx-auto px-4 xs:px-6 sm:px-10 lg:px-12">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {[...Array(8)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24 px-4 bg-white rounded-[24px] border border-[#e2e2e2]">
            <div className="w-16 h-16 border border-[#e5e5e5] bg-[#f9f9f9] rounded-2xl flex items-center justify-center text-2xl mb-4 shadow-sm">
              📦
            </div>
            <h3
              className="text-[18px] sm:text-[20px] font-bold text-[#111111] tracking-tight mb-2"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              NO PIECES FOUND
            </h3>

            <p className="text-[13px] text-[#616363] max-w-sm leading-relaxed mb-6">
              No products found matching your filter selection.
            </p>

            <button
              onClick={() => {
                setSortBy("default");
                setSearchParams({});
              }}
              className="bg-[#111111] text-white text-[11px] font-bold tracking-[0.2em] uppercase px-7 py-3.5 rounded-full hover:bg-black transition-all shadow-lg cursor-pointer"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              RESET CATALOGUE
            </button>
          </div>
        ) : (
          <motion.div
            key={`${categoryFilter}-${sortBy}-${gridCols}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`grid grid-cols-2 ${
              gridCols === 2
                ? "lg:grid-cols-2 gap-5 lg:gap-8"
                : "sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8"
            } gpu-accelerated`}
          >
            {sorted.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onClick={() => navigate(`/product/${product._id}`)}
              />
            ))}
          </motion.div>
        )}
      </div>

    </section>
  );
}
