import React, { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { useParams, Link, useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { useProduct } from "../hook/useProduct.js";
import { useCart } from "../../cart/hook/useCart.js";
import { useWishlist } from "../hook/useWishlist.js";
import RecommendedCarousel from "../components/RecommendedCarousel.jsx";
import ProductReviews from "../components/ProductReviews.jsx";
import { motion, AnimatePresence } from "framer-motion";
import { updateProfileApi } from "../../auth/services/auth.api.js";
import { setUser } from "../../auth/state/auth.slice.js";

// Helper for currency formatting in Direct Checkout
const formatPriceLocal = (priceVal, currencyVal = 'INR') => {
  if (priceVal == null) return ''
  const amount = typeof priceVal === 'object' ? priceVal.amount : priceVal
  const currency = typeof priceVal === 'object' ? (priceVal.currency || currencyVal) : currencyVal
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency || 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0)
}

const ProductDirectCheckoutModal = ({ product, quantity, user, onClose, onConfirm }) => {
  const dispatch = useDispatch()
  const [fullname, setFullname] = useState(user?.fullname || '')
  const [contact, setContact] = useState(user?.contact || '')
  const [address, setAddress] = useState(user?.address || '')
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [couponError, setCouponError] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const subtotal = (product?.price?.amount || 0) * quantity
  const currency = product?.price?.currency || 'INR'

  let couponDiscount = 0
  if (appliedCoupon === 'VELORA10') {
    couponDiscount = Math.round(subtotal * 0.1)
  } else if (appliedCoupon === 'VELORASTYLE' && subtotal >= 2999) {
    couponDiscount = Math.round(subtotal * 0.15)
  }

  const finalTotal = Math.max(0, subtotal - couponDiscount)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!fullname.trim() || !contact.trim() || !address.trim()) {
      setError('All fields are required.')
      return
    }
    setError('')
    setLoading(true)
    try {
      const data = await updateProfileApi({ fullname, contact, address })
      if (data.success && data.user) {
        dispatch(setUser(data.user))
        onConfirm(appliedCoupon)
      } else {
        setError(data.message || 'Failed to update details.')
      }
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save address details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white border border-[#E5E5E5] rounded-2xl pt-4 pb-7 px-5 sm:pt-5 sm:pb-8 sm:px-6 max-w-md w-full shadow-2xl relative max-h-[92vh] overflow-y-auto scrollbar-none"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F4F3F3] hover:bg-[#111] hover:text-white flex items-center justify-center transition-all cursor-pointer text-sm font-bold border border-black/5"
        >
          ✕
        </button>

        <h3 style={{ fontFamily: "'Montserrat', sans-serif" }} className="text-[14px] sm:text-[16px] font-black uppercase tracking-wider text-[#111] border-b border-[#F3F4F6] pb-2.5 mb-2.5 text-left">
          CONFIRM CHECKOUT DETAILS
        </h3>

        {error && (
          <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#B91C1C] text-xs font-semibold p-3 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-[11px] sm:text-xs text-left">
          <div>
            <label className="block text-[9px] uppercase font-bold tracking-[0.14em] text-[#666] mb-1.5 text-left">Recipient Name</label>
            <input
              type="text"
              required
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              className="w-full border border-[#D1D5DB] rounded-lg px-3 py-2 text-[#111] focus:outline-none focus:border-black transition-all bg-white font-semibold"
              placeholder="Enter recipient full name"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] uppercase font-bold tracking-[0.14em] text-[#666] mb-1.5 text-left">Contact Number</label>
              <input
                type="text"
                required
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full border border-[#D1D5DB] rounded-lg px-3 py-2 text-[#111] focus:outline-none focus:border-black transition-all bg-white font-semibold"
                placeholder="Enter contact number"
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase font-bold tracking-[0.14em] text-[#666] mb-1.5 text-left">Product Quantity</label>
              <div className="w-full border border-[#FAF9F6] bg-[#F4F3F3] rounded-lg px-3 py-2 text-[#111] font-semibold">
                {quantity} {quantity === 1 ? 'unit' : 'units'}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[9px] uppercase font-bold tracking-[0.14em] text-[#666] mb-1.5 text-left">Shipping Address</label>
            <textarea
              required
              rows="3"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full border border-[#D1D5DB] rounded-lg px-3 py-2 text-[#111] focus:outline-none focus:border-black transition-all resize-none leading-relaxed bg-white font-semibold"
              placeholder="Enter complete shipping address"
            />
          </div>

          <div className="border-t border-[#F3F4F6] pt-3 text-left">
            <label className="block text-[9px] uppercase font-bold tracking-[0.14em] text-[#999] mb-2 text-left">APPLY AVAILABLE COUPONS</label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  setAppliedCoupon(appliedCoupon === 'VELORA10' ? null : 'VELORA10')
                  setCouponError('')
                }}
                className={`text-[9px] font-bold tracking-wider px-3 py-1.5 rounded-md border transition-all cursor-pointer ${appliedCoupon === 'VELORA10'
                    ? 'bg-[#065F46] text-white border-[#065F46]'
                    : 'bg-[#FAF9F6] border-[#E5E5E5] text-[#111] hover:border-black'
                  }`}
              >
                VELORA10 (10% OFF)
              </button>
              <button
                type="button"
                onClick={() => {
                  if (subtotal < 2999) {
                    setCouponError('VELORASTYLE requires minimum order value of ₹2,999')
                  } else {
                    setAppliedCoupon(appliedCoupon === 'VELORASTYLE' ? null : 'VELORASTYLE')
                    setCouponError('')
                  }
                }}
                className={`text-[9px] font-bold tracking-wider px-3 py-1.5 rounded-md border transition-all cursor-pointer ${appliedCoupon === 'VELORASTYLE'
                    ? 'bg-[#065F46] text-white border-[#065F46]'
                    : 'bg-[#FAF9F6] border-[#E5E5E5] text-[#111] hover:border-black'
                  }`}
              >
                VELORASTYLE (15% OFF)
              </button>
            </div>
            {couponError && (
              <span className="text-[9px] text-red-600 font-semibold mt-1.5 block text-left">{couponError}</span>
            )}
          </div>

          <div className="border-t border-[#F3F4F6] pt-3 flex flex-col gap-1.5 text-xs text-[#555] font-semibold text-left">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="text-black font-bold">{formatPriceLocal(subtotal, currency)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-[#065F46]">
                <span>Discount ({appliedCoupon}):</span>
                <span className="font-bold">− {formatPriceLocal(couponDiscount, currency)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-[#F3F4F6] pt-2 text-black font-bold text-sm">
              <span>Total Price:</span>
              <span>{formatPriceLocal(finalTotal, currency)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#111] hover:bg-black text-white text-[10px] font-black uppercase tracking-[0.16em] py-3.5 rounded-xl transition-all cursor-pointer disabled:opacity-50 mt-2 shadow-md"
          >
            {loading ? 'SAVING...' : 'CONFIRM & PROCEED TO PAYMENT →'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

const ProductDetail = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { productId } = useParams();
  const { handleGetProductById } = useProduct();
  const { handleAddItem, handleCreateDirectOrder, handleVerifyCartOrder, loading: cartLoading } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();
  const user = useSelector((state) => state.auth.user);

  const [showDirectCheckoutModal, setShowDirectCheckoutModal] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [sizeError, setSizeError] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Mobile swipe tracking
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        const productData = await handleGetProductById(productId);
        setProduct(productData);
        setCurrentImageIndex(0);
      } catch (err) {
        console.error("Error fetching product details:", err);
        setError(err?.response?.data?.message || "Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProductDetail();
    }
  }, [productId]);

  const images = product?.images || [];
  const totalImages = images.length;

  const handlePrevImage = () => {
    if (totalImages <= 1) return;
    setCurrentImageIndex((prev) => (prev === 0 ? totalImages - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (totalImages <= 1) return;
    setCurrentImageIndex((prev) => (prev === totalImages - 1 ? 0 : prev + 1));
  };

  // Keyboard shortcuts for lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowLeft") handlePrevImage();
      if (e.key === "ArrowRight") handleNextImage();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, totalImages]);

  const handleTouchStart = (e) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current - touchEndX.current > 50) {
      handleNextImage();
    }
    if (touchEndX.current - touchStartX.current > 50) {
      handlePrevImage();
    }
  };

  const formatPrice = (priceObj) => {
    if (!priceObj) return "";
    const { amount, currency } = priceObj;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleAddToCart = async () => {
    if (!selectedSize && product?.sizes && product.sizes.length > 0) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    try {
      await handleAddItem({ productId, quantity, productTitle: product?.title });
    } catch (err) {
      console.error("Add to cart failed:", err);
    }
  };

  const handleBuyNow = () => {
    if (!selectedSize && product?.sizes && product.sizes.length > 0) {
      setSizeError(true);
      return;
    }
    setSizeError(false);
    setShowDirectCheckoutModal(true);
  };

  const handleConfirmDirectCheckout = async (couponCode) => {
    setShowDirectCheckoutModal(false);
    try {
      const orderData = await handleCreateDirectOrder({
        productId,
        quantity,
        couponCode: couponCode || undefined,
      });

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TRe1PXXpVVhsI8",
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: "Velora",
        description: "Direct Purchase",
        order_id: orderData.order.id,
        handler: async (response) => {
          const isValid = await handleVerifyCartOrder(response);
          if (isValid) {
            setOrderSuccess(true);
          }
        },
        prefill: {
          name: user?.fullname || user?.name,
          email: user?.email,
          contact: user?.contact,
        },
        theme: {
          color: "#111111",
        },
        modal: {
          ondismiss: () => { }
        }
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      console.error("Buy now payment failed:", err);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#1A1A1A] antialiased pt-[70px] overflow-x-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Main Content Container */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-12 py-4 sm:py-8 flex flex-col">


        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-24 gap-3">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#747878]">
              Loading product details...
            </span>
          </div>
        ) : error || !product ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-20 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4 text-red-500">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <h2 style={{ fontFamily: "'Montserrat', sans-serif" }} className="text-[20px] font-bold text-black mb-2">
              {error || "Product Not Found"}
            </h2>
            <p className="text-[13px] text-[#747878] mb-6">
              The product you are looking for might have been removed or is temporarily unavailable.
            </p>
            <Link
              to="/products"
              className="bg-black text-white text-[11px] font-bold uppercase tracking-[0.12em] px-8 py-3.5 rounded-[6px] hover:bg-[#222] transition-colors"
            >
              Back To Shop
            </Link>
          </div>
        ) : (
          /* Premium E-commerce Grid Layout: Mobile/Tablet Single Column, Desktop 45/55 */
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-start w-full">

            {/* ── LEFT COLUMN (Mobile & Tablet: 100%, Desktop: 45%) ── */}
            <div className="w-full lg:w-[45%] flex flex-col gap-4 shrink-0">

              {/* Mobile & Tablet View (< 1024px / lg): Swipeable Main Image Slider + Indicators */}
              <div className="lg:hidden flex flex-col gap-3">
                <div
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  onClick={() => setIsLightboxOpen(true)}
                  className="relative aspect-[4/5] w-full max-h-[50vh] bg-white rounded-[12px] border border-black/5 shadow-sm overflow-hidden flex items-center justify-center cursor-pointer group"
                >
                  {totalImages > 0 ? (
                    <img
                      src={images[currentImageIndex]?.url}
                      alt={product?.title || "Product image"}
                      loading="eager"
                      decoding="async"
                      className="max-h-[50vh] w-full h-full object-contain p-2 select-none gpu-accelerated"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80";
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#747878] text-[13px] font-semibold uppercase tracking-[0.1em] bg-[#f9f9f9]">
                      No Image Available
                    </div>
                  )}

                  {totalImages > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handlePrevImage(); }}
                        aria-label="Previous image"
                        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 text-black flex items-center justify-center shadow-md border border-black/10 cursor-pointer z-10 hover:bg-black hover:text-white transition-all active:scale-90"
                      >
                        <svg className="w-4 h-4 stroke-current" fill="none" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleNextImage(); }}
                        aria-label="Next image"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 text-black flex items-center justify-center shadow-md border border-black/10 cursor-pointer z-10 hover:bg-black hover:text-white transition-all active:scale-90"
                      >
                        <svg className="w-4 h-4 stroke-current" fill="none" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                      </button>
                    </>
                  )}

                  {totalImages > 0 && (
                    <div className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-sm text-white text-[11px] font-bold tracking-[0.12em] uppercase px-3 py-1 rounded-[6px] pointer-events-none">
                      {currentImageIndex + 1} / {totalImages}
                    </div>
                  )}
                </div>

                {/* Mobile Horizontal Thumbnail Strip */}
                {totalImages > 1 && (
                  <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`relative w-16 aspect-[4/5] shrink-0 rounded-[8px] overflow-hidden border-2 transition-all duration-200 cursor-pointer ${currentImageIndex === idx
                          ? "border-black shadow-md scale-105"
                          : "border-black/10 opacity-60 hover:opacity-100"
                          }`}
                      >
                        <img
                          src={img.url}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover gpu-accelerated"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=300&q=80";
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Desktop View (>= 1024px / lg): 2-Column Image Grid (Zara / COS style) */}
              <div className="hidden lg:block">
                {totalImages > 0 ? (
                  <div className={`grid ${totalImages === 1 ? 'grid-cols-1' : 'grid-cols-2'} gap-3 sm:gap-4`}>
                    {images.map((img, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          setCurrentImageIndex(idx);
                          setIsLightboxOpen(true);
                        }}
                        className="relative aspect-[3/4] w-full max-h-[70vh] bg-white rounded-[10px] border border-black/5 shadow-sm overflow-hidden flex items-center justify-center group cursor-pointer"
                        title="Click to enlarge"
                      >
                        <img
                          src={img.url}
                          alt={img.alt || `${product.title} ${idx + 1}`}
                          className="max-h-[70vh] w-full h-full object-contain p-1.5 transition-transform duration-500 ease-out group-hover:scale-[1.04] select-none"
                          onError={(e) => {
                            e.target.src =
                              "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=800&q=80";
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="aspect-[3/4] w-full max-h-[70vh] bg-white rounded-[10px] border border-black/5 shadow-sm flex items-center justify-center text-[#747878] text-[12px] font-semibold uppercase tracking-[0.1em]">
                    No Image Available
                  </div>
                )}
              </div>

            </div>

            {/* ── RIGHT COLUMN (Mobile/Tablet: 100%, Desktop: 55% - Sticky Purchase Panel) ── */}
            <div className="w-full lg:w-[55%] flex flex-col gap-6 lg:sticky lg:top-[100px] bg-white lg:bg-transparent p-5 sm:p-6 lg:p-0 rounded-xl border border-black/5 lg:border-none shadow-sm lg:shadow-none">

              {/* Category Tag & Availability */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-[11px] font-bold tracking-[0.2em] text-[#f59e0b] uppercase bg-[#f59e0b]/10 px-3 py-1.5 rounded-[6px]">
                  ORIGINAL ESSENTIAL
                </span>
                {product.sizes && product.sizes.some((s) => s.available) ? (
                  <span className="text-[12px] text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    IN STOCK
                  </span>
                ) : (
                  <span className="text-[12px] text-red-500 font-bold uppercase tracking-wider">
                    OUT OF STOCK
                  </span>
                )}
              </div>

              {/* Product Title & Price */}
              <div className="flex flex-col gap-2">
                <h1
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                  className="text-[28px] sm:text-[34px] font-black uppercase text-black leading-tight tracking-tight"
                >
                  {product.title}
                </h1>
                <div className="text-[26px] sm:text-[30px] font-black text-black">
                  {formatPrice(product.price)}
                </div>
              </div>

              {/* Verified Seller Info snippet */}
              {product.seller && (
                <div className="bg-white/80 backdrop-blur-sm border border-black/5 p-4 rounded-[10px] flex items-center justify-between shadow-xs">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold tracking-[0.14em] text-[#747878] uppercase">
                      VERIFIED SELLER
                    </span>
                    <span className="text-[14px] font-bold text-black">
                      {product.seller.fullname || product.seller.name || "Velora Official Store"}
                    </span>
                  </div>
                  {product.seller.email && (
                    <span className="text-[12px] text-[#747878] font-medium hidden sm:inline">
                      {product.seller.email}
                    </span>
                  )}
                </div>
              )}


              {/* Size Selector */}
              {(() => {
                const isJeans = product.category === "Jeans";
                const JEANS_WAIST_SIZES = ["28", "30", "32", "34"];
                const APPAREL_SIZES = ["XS", "S", "M", "L", "XL"];

                // For Jeans: use waist sizes; for others: use apparel sizes
                // Prefer product.sizes if labels match the expected set, otherwise use defaults
                const jeansSizeLabels = new Set(JEANS_WAIST_SIZES);
                const apparelSizeLabels = new Set(APPAREL_SIZES);

                let displaySizes;
                if (isJeans) {
                  // If product already has jeans sizes use them, else generate defaults
                  const hasWaistSizes = product.sizes && product.sizes.some(s => jeansSizeLabels.has(s.label));
                  displaySizes = hasWaistSizes
                    ? product.sizes.filter(s => jeansSizeLabels.has(s.label))
                    : JEANS_WAIST_SIZES.map(label => ({ label, available: true }));
                } else {
                  const hasApparelSizes = product.sizes && product.sizes.some(s => apparelSizeLabels.has(s.label));
                  displaySizes = hasApparelSizes
                    ? product.sizes.filter(s => apparelSizeLabels.has(s.label))
                    : (product.sizes || APPAREL_SIZES.map(label => ({ label, available: true })));
                }

                if (!displaySizes || displaySizes.length === 0) return null;

                return (
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <label className="text-[12px] font-bold tracking-[0.14em] text-[#747878] uppercase">
                        {isJeans ? "SELECT WAIST" : "SELECT SIZE"}
                      </label>
                      {sizeError && (
                        <span className="text-[12px] font-bold text-red-500 uppercase tracking-wide animate-pulse">
                          Please select a size
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3 flex-wrap">
                      {displaySizes.map((s) => (
                        <button
                          key={s.label}
                          type="button"
                          disabled={!s.available}
                          onClick={() => {
                            setSelectedSize(s.label);
                            setSizeError(false);
                          }}
                          className={`relative min-w-[48px] h-[48px] px-3.5 rounded-[8px] text-[15px] font-bold uppercase tracking-wide border-2 transition-all duration-200 ease-out cursor-pointer flex items-center justify-center ${!s.available
                            ? "border-[#e4e4e7] text-[#c4c7c7] bg-[#f9f9f9] cursor-not-allowed"
                            : selectedSize === s.label
                              ? "bg-black text-white border-black shadow-md scale-105"
                              : "border-[#c4c7c7] text-[#1a1c1c] bg-white hover:border-black hover:scale-105"
                            }`}
                        >
                          {s.label}
                          {!s.available && (
                            <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <svg viewBox="0 0 40 40" className="w-full h-full absolute inset-0 opacity-30">
                                <line x1="4" y1="36" x2="36" y2="4" stroke="#888" strokeWidth="1.5" strokeLinecap="round" />
                              </svg>
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                    {selectedSize && (
                      <p className="text-[12px] text-[#747878]">
                        {isJeans ? "Selected Waist: " : "Selected Size: "}
                        <span className="font-bold text-black">{selectedSize}</span>
                      </p>
                    )}
                  </div>
                );
              })()}


              {/* Quantity Selector */}
              <div className="flex flex-col gap-2">
                <label className="text-[12px] font-bold tracking-[0.14em] text-[#747878] uppercase">
                  QUANTITY
                </label>
                <div className="flex items-center w-40 h-[48px] border border-[#c4c7c7] rounded-[8px] bg-white overflow-hidden shadow-xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-12 h-full flex items-center justify-center text-black hover:bg-gray-100 text-xl font-bold transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center text-[15px] font-bold text-black select-none">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-12 h-full flex items-center justify-center text-black hover:bg-gray-100 text-xl font-bold transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Action Buttons: Full-width Premium BUY NOW & ADD TO CART (50px min height, 15-16px text) */}
              <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="btn-buy-fill flex-1 bg-[#f59e0b] text-black min-h-[44px] text-[13px] font-extrabold uppercase tracking-[0.18em] py-3 px-5 rounded-[8px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.99]"
                >
                  <span className="relative z-10">BUY NOW</span>
                </button>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={cartLoading}
                  className="btn-cart-fill flex-1 bg-black text-white min-h-[44px] text-[13px] font-extrabold uppercase tracking-[0.18em] py-3 px-5 rounded-[8px] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {cartLoading ? (
                    <>
                      <span className="relative z-10 w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="relative z-10">ADDING...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      <span className="relative z-10">ADD TO CART</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={(e) => toggleWishlist(product._id, e)}
                  aria-label="Save to wishlist"
                  className={`min-h-[44px] px-4 rounded-[8px] border text-[12px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${isWishlisted(product._id)
                    ? "bg-red-50 text-red-600 border-red-200"
                    : "bg-white text-black border-black/20 hover:border-black"
                    }`}
                >
                  <svg className={`w-5 h-5 ${isWishlisted(product._id) ? "fill-red-600 text-red-600" : "fill-none text-black"}`} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                  <span>{isWishlisted(product._id) ? "SAVED" : "WISHLIST"}</span>
                </button>
              </div>

              {/* Description & Details */}
              {product.description && (
                <div className="flex flex-col gap-2 pt-4 border-t border-black/10">
                  <h3 className="text-[11px] font-bold tracking-[0.14em] text-[#747878] uppercase">
                    DESCRIPTION & FIT
                  </h3>
                  <p className="text-[13px] sm:text-[14px] text-[#444748] leading-relaxed font-light whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Guarantees & Perks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-4 border-t border-black/10 text-[12px] text-[#444748]">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-black shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0C2.678 5.578 2.25 6.058 2.25 6.626v.958" />
                  </svg>
                  <span className="font-medium">Free Expedited Shipping</span>
                </div>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-black shrink-0" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  <span className="font-medium">14-Day Easy Returns</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Product Reviews Section */}
        <ProductReviews productId={productId} user={user} />

        {/* Recommended Carousel Component */}
        <RecommendedCarousel
          title="YOU MIGHT ALSO LOVE"
          subtitle="CURATED SELECTION"
          excludeIds={[product?._id]}
          limit={4}
        />
      </main>

      {/* ── FULLSCREEN LIGHTBOX MODAL FOR IMAGE ENLARGEMENT (PORTAL TO DOCUMENT.BODY) ── */}
      {isLightboxOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-8 transition-all duration-300 select-none"
            onClick={() => setIsLightboxOpen(false)}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              aria-label="Close enlarged view"
              className="absolute top-6 right-6 sm:top-8 sm:right-8 w-12 h-12 rounded-full bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all duration-300 cursor-pointer z-30 shadow-2xl border border-white/20 hover:border-white hover:scale-110 active:scale-95 group"
            >
              <svg className="w-5 h-5 stroke-current transition-transform duration-200 group-hover:rotate-90" fill="none" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Previous Image Arrow */}
            {totalImages > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                aria-label="Previous image"
                className="absolute left-4 sm:left-8 lg:left-12 top-1/2 -translate-y-1/2 w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all duration-300 cursor-pointer z-30 shadow-2xl border border-white/20 hover:border-white hover:scale-110 active:scale-95 group"
              >
                <svg
                  className="w-6 h-6 stroke-current transition-transform duration-200 group-hover:-translate-x-0.5"
                  fill="none"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
            )}

            {/* Enlarged Image Container (Crisp White Card Backdrop for High Contrast) */}
            <div
              className="relative max-w-[92vw] max-h-[85vh] bg-white rounded-2xl border border-white/20 p-2 sm:p-4 shadow-2xl flex items-center justify-center overflow-hidden z-20"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={images[currentImageIndex]?.url}
                alt={images[currentImageIndex]?.alt || product?.title}
                className="max-w-[85vw] max-h-[78vh] w-auto h-auto object-contain rounded-xl select-none"
                onError={(e) => {
                  e.target.src =
                    "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80";
                }}
              />
            </div>

            {/* Next Image Arrow */}
            {totalImages > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                aria-label="Next image"
                className="absolute right-4 sm:right-8 lg:right-12 top-1/2 -translate-y-1/2 w-12 sm:w-14 h-12 sm:h-14 rounded-full bg-white/10 hover:bg-white text-white hover:text-black flex items-center justify-center transition-all duration-300 cursor-pointer z-30 shadow-2xl border border-white/20 hover:border-white hover:scale-110 active:scale-95 group"
              >
                <svg
                  className="w-6 h-6 stroke-current transition-transform duration-200 group-hover:translate-x-0.5"
                  fill="none"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            )}

            {/* Image Counter Badge */}
            {totalImages > 0 && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-md border border-white/20 text-white/90 text-[11px] font-extrabold px-5 py-2 rounded-full tracking-[0.25em] uppercase shadow-xl z-30 select-none">
                {currentImageIndex + 1} / {totalImages}
              </div>
            )}
          </div>,
          document.body
        )}
      {/* Direct checkout modal */}
      {showDirectCheckoutModal && (
        <ProductDirectCheckoutModal
          product={product}
          quantity={quantity}
          user={user}
          onClose={() => setShowDirectCheckoutModal(false)}
          onConfirm={handleConfirmDirectCheckout}
        />
      )}

      {/* Direct checkout order success modal */}
      <AnimatePresence>
        {orderSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setOrderSuccess(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 28 }}
              className="relative bg-white rounded-[28px] shadow-2xl flex flex-col items-center gap-5 px-10 py-10 max-w-sm w-full text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setOrderSuccess(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#F4F3F3] hover:bg-[#E5E5E5] transition-colors cursor-pointer border border-black/5"
                aria-label="Close"
              >
                ✕
              </button>

              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.15 }}
                className="w-20 h-20 rounded-full bg-[#065F46] flex items-center justify-center shadow-lg"
              >
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </motion.div>

              <div className="flex flex-col gap-1.5 text-center">
                <h2 style={{ fontFamily: "'Montserrat', sans-serif" }} className="text-[22px] font-black uppercase tracking-tight text-[#111111]">
                  Order Completed!
                </h2>
                <p className="text-[13px] text-[#747878] leading-relaxed">
                  Your payment was successful. We'll start processing your order right away.
                </p>
              </div>

              <button
                onClick={() => {
                  setOrderSuccess(false);
                  navigate("/profile");
                }}
                className="w-full bg-[#111111] text-[#FAF9F6] text-[11px] font-extrabold uppercase tracking-[0.18em] py-3.5 rounded-full hover:bg-black transition-all cursor-pointer text-center"
              >
                Go to My Orders
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetail;
