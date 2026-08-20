import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useProduct } from "../hook/useProduct.js";
import { useWishlist } from "../hook/useWishlist.js";
import Navbar from "../components/Navbar.jsx";
import MarqueeTicker from "../components/MarqueeTicker.jsx";
import Footer from "../components/Footer.jsx";
import ProductCardImagePreview from "../components/ProductCardImagePreview.jsx";

// ── Animation variants ──────────────────────────────────────────────────────
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.09 } } };
const cardVariant = {
  hidden: { opacity: 0, y: 36 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
};

// ── Price formatter ──────────────────────────────────────────────────────────
const fmt = (val) => {
  const amount = typeof val === "object" ? val?.amount : val;
  const currency = (typeof val === "object" ? val?.currency : null) || "INR";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount || 0);
};

// ── Category config ──────────────────────────────────────────────────────────
const CONFIG = {
  Jeans: {
    label: "DENIM ARCHIVE 2026",
    heading: "CRAFTED IN DENIM",
    tagline: "Premium Japanese denim. Tailored for the modern silhouette.",
    heroBg: null,
    chips: ["All", "Loose Fit", "Relaxed Fit", "Wide Leg", "Baggy"],
    marquee: "PREMIUM DENIM • VELORA ARCHIVE 2026 • CRAFTED WITH PRECISION • WEAR THE DIFFERENCE • ",
  },
  "T-Shirts": {
    label: "ESSENTIALS EDIT 2026",
    heading: "WEAR THE BASICS",
    tagline: "Elevated basics. Premium cotton. Zero compromise.",
    heroBg: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1600&auto=format&fit=crop&q=80",
    chips: ["All", "Boxy Fit", "Full Sleeve", "Heavyweight"],
    promoBannerTitle: "THE VELORA BASICS EDIT",
    promoBannerSub: "Effortless essentials elevated to an art form.",
    marquee: "PREMIUM COTTON • VELORA ESSENTIALS 2026 • BASICS REIMAGINED • EFFORTLESS QUALITY • ",
    editorLabel: "ESSENTIALS CURATOR",
  },
  Shirts: {
    label: "LUXURY TAILORING 2026",
    heading: "THE ART OF THE SHIRT",
    tagline: "Impeccable cuts. Premium linen & Egyptian cotton. Crafted for elegance.",
    heroBg: "/shirt-page-banner.png",
    chips: ["All", "Linen", "Stripped", "Half-Sleeve", "Full Sleeve"],
    promoBannerTitle: "THE VELORA SHIRT EDIT",
    promoBannerSub: "The shirt, perfected for the modern professional.",
    marquee: "PREMIUM SHIRTS • VELORA FORMAL 2026 • TAILORED PRECISION • DRESSED WITH INTENT • ",
    editorLabel: "STYLE CURATOR",
  },
};

// ── Icons ────────────────────────────────────────────────────────────────────
const HeartIcon = ({ liked }) => (
  <svg className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors duration-200 ${liked ? "fill-red-500 stroke-red-500" : "fill-none stroke-[#111]"}`} strokeWidth={1.8} viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

// ── Product card ─────────────────────────────────────────────────────────────
function ProductCard({ product, liked, onWishlist, onClick }) {
  const origPrice = product.originalPrice || (product.price?.amount ? Math.round(product.price.amount * 1.28) : null);
  return (
    <motion.div variants={cardVariant} onClick={onClick} className="group flex flex-col bg-white rounded-[14px] sm:rounded-[16px] overflow-hidden cursor-pointer hover:-translate-y-[3px] hover:shadow-xl transition-all duration-300 ease-out">
      <div className="relative w-full aspect-[3/4] bg-[#f5f5f5] overflow-hidden rounded-[14px] sm:rounded-[16px] mb-2.5 sm:mb-3">
        <ProductCardImagePreview images={product.images} alt={product.title} aspectRatioClass="aspect-[3/4]" className="rounded-[14px] sm:rounded-[16px]" />
        <button onClick={(e) => { e.stopPropagation(); onWishlist(product._id); }} aria-label="Wishlist" className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 p-1.5 sm:p-2 bg-white/90 backdrop-blur rounded-full shadow-sm opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-300 hover:scale-110 cursor-pointer">
          <HeartIcon liked={liked} />
        </button>
      </div>
      <div className="px-1 pb-2 flex flex-col gap-0.5 sm:gap-1">
        <h3 className="text-[12px] sm:text-[13px] font-semibold text-[#111] line-clamp-1 tracking-[0.01em]">{product.title}</h3>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-[12px] sm:text-[13px] font-bold text-[#111]">{fmt(product.price)}</span>
          {origPrice && <span className="text-[10px] sm:text-[11px] text-[#aaa] line-through">{fmt(origPrice)}</span>}
        </div>
      </div>
    </motion.div>
  );
}

// ── Main export ──────────────────────────────────────────────────────────────
export default function CategoryPage({ category }) {
  const navigate = useNavigate();
  const { handleGetAllProducts } = useProduct();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const allProducts = useSelector((state) => state.product?.products || []);
  const user = useSelector((state) => state.auth.user);

  const [loading, setLoading] = useState(true);
  const [activeChip, setActiveChip] = useState("All");

  const cfg = CONFIG[category] || CONFIG["Jeans"];

  useEffect(() => {
    window.scrollTo(0, 0);
    setActiveChip("All");
  }, [category]);

  useEffect(() => {
    const controller = new AbortController();
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);
        const params = { category };
        if (activeChip !== "All") {
          params.search = activeChip;
        }
        await handleGetAllProducts(params, { signal: controller.signal });
      } catch (e) {
        if (e.name !== 'CanceledError' && e.code !== 'ERR_CANCELED') {
          console.error("Failed to load category products:", e);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };
    fetchCategoryProducts();

    return () => {
      controller.abort();
    };
  }, [category, activeChip]);

  const categoryProducts = allProducts;
  const goTo = (id) => navigate(`/product/${id}`);

  const editorPicks = categoryProducts.slice(0, 3);
  const filteredProducts = categoryProducts;

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111] antialiased overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
        <Navbar user={user} />

        <main className="flex-1 flex flex-col pt-[60px]">
          <MarqueeTicker />

          {/* ── HERO ────────────────────────────────────────────────────── */}
          <section className="relative w-full h-[500px] xs:h-[540px] sm:h-[72vh] lg:h-[90vh] min-h-[440px] sm:min-h-[500px] flex items-end overflow-hidden">
            <img
              src={
                category === "Jeans"
                  ? "/newjeanspagebanner.png"
                  : category === "T-Shirts"
                  ? "/tshirt-bannner.png"
                  : "/shirt-page-banner.png"
              }
              alt={cfg.heading}
              className={`absolute inset-0 w-full h-full object-cover ${
                category === "Jeans"
                  ? "object-[22%_top] sm:object-top"
                  : category === "T-Shirts"
                  ? "object-[60%_top] sm:object-top"
                  : "object-[18%_top] sm:object-top"
              }`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/45 to-black/15 sm:from-black/80 sm:via-black/30 sm:to-black/10" />
            <div className="relative z-10 max-w-[1440px] mx-auto px-4 xs:px-6 sm:px-12 lg:px-16 pb-6 xs:pb-8 sm:pb-16 lg:pb-20 w-full">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
                className={`flex flex-col gap-2 xs:gap-2.5 sm:gap-4 ${(category === "Shirts" || category === "Jeans") ? "sm:ml-auto sm:items-end sm:text-right items-start text-left" : "items-start text-left"}`}
              >
                <span className="text-[9px] xs:text-[10px] sm:text-[11px] font-semibold tracking-[0.25em] sm:tracking-[0.35em] text-white/75 uppercase" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {cfg.label}
                </span>
                <h1 className="text-[26px] xs:text-[32px] sm:text-[56px] md:text-[72px] lg:text-[84px] font-light text-white leading-[1.05] sm:leading-[1.0] tracking-[-0.01em] max-w-full sm:max-w-[700px]">
                  {cfg.heading}
                </h1>
                <p className="text-[12px] xs:text-[13px] sm:text-[16px] font-light text-white/80 max-w-[300px] xs:max-w-[360px] sm:max-w-[420px] leading-relaxed">
                  {cfg.tagline}
                </p>
                <div className={`flex items-center gap-3 sm:gap-4 mt-1 sm:mt-2 ${(category === "Shirts" || category === "Jeans") ? "sm:justify-end" : ""}`}>
                  <button onClick={() => document.getElementById("cat-grid")?.scrollIntoView({ behavior: "smooth" })} className="inline-flex items-center gap-2 bg-white text-black px-5 xs:px-6 py-2.5 xs:py-3.5 rounded-full text-[10px] sm:text-[11px] font-bold tracking-[0.18em] sm:tracking-[0.2em] uppercase hover:scale-[1.03] transition-transform duration-300 cursor-pointer shadow-md" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    SHOP COLLECTION
                  </button>
                  <span className="text-white/70 text-[11px] sm:text-[12px] font-medium">
                    {loading ? "Loading..." : `${categoryProducts.length} pieces`}
                  </span>
                </div>
              </motion.div>
            </div>
          </section>

          {/* ── CATEGORY CHIPS ──────────────────────────────────────────── */}
          <section className="max-w-[1440px] mx-auto px-4 xs:px-6 sm:px-12 lg:px-16 py-4 sm:py-7 w-full overflow-hidden">
            <div className="flex gap-2 sm:gap-2.5 overflow-x-auto scrollbar-none flex-nowrap pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
              {cfg.chips.map((chip) => (
                <button key={chip} onClick={() => setActiveChip(chip)} className={`flex-shrink-0 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.12em] sm:tracking-[0.15em] border transition-all duration-200 cursor-pointer whitespace-nowrap ${activeChip === chip ? "bg-[#111] text-white border-[#111]" : "bg-white text-[#111] border-[#111] hover:bg-[#111] hover:text-white"}`} style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  {chip}
                </button>
              ))}
            </div>
          </section>

          {/* ── PRODUCT GRID ────────────────────────────────────────────── */}
          <section id="cat-grid" className="max-w-[1440px] mx-auto px-4 xs:px-6 sm:px-12 lg:px-16 pb-14 sm:pb-20 w-full">
            <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="flex items-end justify-between mb-5 sm:mb-8">
              <div>
                <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.25em] sm:tracking-[0.3em] text-[#999] uppercase mb-1" style={{ fontFamily: "'Montserrat', sans-serif" }}>COLLECTION</p>
                <h2 className="text-[20px] xs:text-[24px] sm:text-[30px] font-light text-[#111] tracking-[-0.02em]">{category} Collection</h2>
              </div>
              {!loading && <span className="text-[11px] sm:text-[12px] text-[#888] font-light">{filteredProducts.length} items</span>}
            </motion.div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 sm:py-28 gap-4">
                <div className="w-7 h-7 border-2 border-[#111] border-t-transparent rounded-full animate-spin" />
                <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.14em] text-[#aaa]" style={{ fontFamily: "'Montserrat', sans-serif" }}>Loading Collection...</span>
              </div>
            ) : categoryProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 sm:py-28 gap-4 sm:gap-5 text-center px-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 border border-[#e5e5e5] rounded-full flex items-center justify-center text-xl sm:text-2xl">📦</div>
                <p className="text-[15px] sm:text-[16px] font-semibold text-[#111]">No {category} added yet</p>
                <p className="text-[12px] sm:text-[13px] text-[#777] max-w-xs leading-relaxed">
                  Products tagged as <strong>{category}</strong> will appear here once added from the seller dashboard.
                </p>
                <button onClick={() => navigate("/products")} className="mt-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-[#111] text-white rounded-full text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-[#333] transition-colors cursor-pointer" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  Browse All Products
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 sm:py-28 gap-4 sm:gap-5 text-center px-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 border border-[#e5e5e5] rounded-full flex items-center justify-center text-xl sm:text-2xl">🔍</div>
                <p className="text-[15px] sm:text-[16px] font-semibold text-[#111]">No {activeChip} products found</p>
                <p className="text-[12px] sm:text-[13px] text-[#777] max-w-xs leading-relaxed">
                  No products tagged as <strong>{activeChip}</strong> yet. Try a different category or filter.
                </p>
                <button onClick={() => setActiveChip("All")} className="mt-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-[#111] text-white rounded-full text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase hover:bg-[#333] transition-colors cursor-pointer" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                  View All
                </button>
              </div>
            ) : (
              <motion.div
                key={activeChip}
                variants={stagger}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-7"
              >
                {filteredProducts.map((p) => (
                  <ProductCard key={p._id} product={p} liked={isWishlisted(p._id)} onWishlist={toggleWishlist} onClick={() => goTo(p._id)} />
                ))}
              </motion.div>
            )}
          </section>

          {/* ── EDITOR'S PICKS ──────────────────────────────────────────── */}
          {!loading && editorPicks.length > 0 && (
            <section className="w-full bg-[#f9f8f6] py-14 sm:py-20 lg:py-24">
              <div className="max-w-[1440px] mx-auto px-4 xs:px-6 sm:px-12 lg:px-16">
                <motion.div initial={{ opacity: 0, y: 28 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }} className="flex items-end justify-between mb-8 sm:mb-12">
                  <div>
                    <p className="text-[9px] sm:text-[10px] font-bold tracking-[0.3em] sm:tracking-[0.4em] text-[#aaa] uppercase mb-1 sm:mb-2" style={{ fontFamily: "'Montserrat', sans-serif" }}>HAND-PICKED</p>
                    <h2 className="text-[24px] xs:text-[30px] sm:text-[42px] font-black text-[#111] tracking-[-0.02em] uppercase" style={{ fontFamily: "'Montserrat', sans-serif" }}>Editor's Picks</h2>
                  </div>
                  <span className="text-[11px] sm:text-[12px] text-[#aaa] font-light hidden sm:block">{editorPicks.length} selected pieces</span>
                </motion.div>
                <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-5">
                  {editorPicks.map((p, i) => (
                    <motion.div key={p._id} variants={cardVariant} onClick={() => goTo(p._id)} className="group relative cursor-pointer overflow-hidden rounded-[16px] sm:rounded-[20px] bg-white shadow-sm hover:shadow-xl transition-shadow duration-500">
                      <div className="overflow-hidden aspect-[3/4]">
                        <ProductCardImagePreview images={p.images} alt={p.title} aspectRatioClass="aspect-[3/4]" className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out" />
                      </div>
                      {/* Badge */}
                      <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                        <span className="bg-black text-white text-[8px] sm:text-[9px] font-extrabold tracking-[0.16em] sm:tracking-[0.2em] uppercase px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                          {["EDITOR'S CHOICE", "BESTSELLER", "NEW ARRIVAL"][i] || "FEATURED"}
                        </span>
                      </div>
                      {/* Info below image */}
                      <div className="p-3.5 sm:p-5 border-t border-[#f0f0f0]">
                        <h3 className="text-[13px] sm:text-[14px] font-bold text-[#111] line-clamp-1 mb-0.5 sm:mb-1 tracking-[0.01em]" style={{ fontFamily: "'Inter', sans-serif" }}>{p.title}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-[13px] sm:text-[14px] font-black text-[#111]">{fmt(p.price)}</span>
                          <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.15em] text-[#888] uppercase" style={{ fontFamily: "'Montserrat', sans-serif" }}>View →</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </section>
          )}

        </main>
        <Footer />
      </div>
  );
}

