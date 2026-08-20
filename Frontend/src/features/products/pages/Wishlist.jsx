import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { useProduct } from '../hook/useProduct.js'
import { useCart } from '../../cart/hook/useCart.js'
import { useWishlist } from '../hook/useWishlist.js'
import RecommendedCarousel from '../components/RecommendedCarousel.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import Footer from '../components/Footer.jsx'

// Helper function to format price
const formatPrice = (priceVal, currencyVal = 'INR') => {
    if (priceVal == null) return ''
    const amount = typeof priceVal === 'object' ? priceVal.amount : priceVal
    const currency = typeof priceVal === 'object' ? (priceVal.currency || currencyVal) : currencyVal
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency || 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount || 0)
}

// ── Quick View Modal (Portalized & Scroll Locked) ────────────────────────────
function QuickViewModal({ product, onClose, onMoveToBag, currency, cartLoading }) {
    if (!product) return null

    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [])

    const primaryImage = typeof product?.images?.[0] === 'string'
        ? product.images[0]
        : product?.images?.[0]?.url || 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=80'

    const title = product?.title || 'Product'
    const priceAmount = typeof product?.price === 'object' ? product.price.amount : product?.price || 0
    const formattedVal = formatPrice(priceAmount, currency)
    const category = product?.category || 'Apparel'
    const sizes = category === 'Jeans' ? ['30', '32', '34', '36'] : ['S', 'M', 'L', 'XL']
    const [selectedSize, setSelectedSize] = useState(sizes[1] || sizes[0])

    return createPortal(
        <AnimatePresence>
            <div
                className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md select-none"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 12 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white border border-[#E5E5E5] rounded-2xl shadow-2xl max-w-[820px] w-full max-h-[90vh] overflow-y-auto flex flex-col md:flex-row relative scrollbar-none"
                >
                    <button
                        onClick={onClose}
                        aria-label="Close modal"
                        className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 border border-[#E5E5E5] text-black font-bold flex items-center justify-center hover:bg-black hover:text-white transition-all cursor-pointer shadow-md text-xs active:scale-95"
                    >
                        ✕
                    </button>

                    <div className="w-full md:w-1/2 aspect-[4/5] max-h-[38vh] md:max-h-none bg-[#F4F3F3] overflow-hidden relative shrink-0">
                        <img
                            src={primaryImage}
                            alt={title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=600&q=80'
                            }}
                        />
                        <span className="absolute top-3 left-3 text-[9px] font-bold uppercase tracking-[0.2em] bg-black/80 text-white px-2.5 py-1 rounded-sm">
                            {category}
                        </span>
                    </div>

                    <div className="w-full md:w-1/2 p-5 sm:p-8 flex flex-col justify-between">
                        <div className="flex flex-col gap-2.5 sm:gap-3">
                            <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#888]">
                                VELORA
                            </span>
                            <h2 style={{ fontFamily: "'Montserrat', sans-serif" }} className="text-base sm:text-xl font-bold uppercase text-[#111] leading-tight">
                                {title}
                            </h2>
                            <div className="flex items-center gap-3">
                                <span className="text-base sm:text-lg font-extrabold text-[#111]">{formattedVal}</span>
                                <span className="text-[9px] font-bold uppercase bg-[#065F46]/10 text-[#065F46] px-2 py-0.5 rounded">
                                    In Stock
                                </span>
                            </div>
                            <p className="text-xs text-[#666] leading-relaxed line-clamp-3 font-light">
                                {product.description || 'Crafted with premium materials, relaxed tailoring, and signature Velora minimal aesthetic.'}
                            </p>

                            {/* Size Selector */}
                            <div className="mt-2 sm:mt-3">
                                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#555] block mb-2">
                                    Size: <span className="text-black font-extrabold">{selectedSize}</span>
                                </span>
                                <div className="flex gap-2 flex-wrap">
                                    {sizes.map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setSelectedSize(s)}
                                            className={`w-9 h-9 rounded-lg text-[11px] font-bold uppercase transition-all cursor-pointer border ${selectedSize === s ? 'bg-[#111] text-white border-[#111]' : 'bg-[#F9F9F9] text-[#111] border-[#E5E5E5] hover:border-[#111]'}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-2.5 mt-5 sm:mt-6">
                            <button
                                onClick={() => {
                                    onMoveToBag(product)
                                    onClose()
                                }}
                                disabled={cartLoading}
                                className="w-full bg-[#111111] text-white text-[10px] font-bold uppercase tracking-[0.18em] py-3 sm:py-3.5 rounded-full hover:bg-black transition-all cursor-pointer shadow-sm disabled:opacity-50 active:scale-98"
                            >
                                Move to Bag ({selectedSize}) →
                            </button>
                            <Link
                                to={`/product/${product._id}`}
                                className="text-center text-[10px] font-bold uppercase tracking-[0.14em] text-[#666] hover:text-black transition-colors py-1"
                            >
                                View Full Product Details
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>,
        document.body
    )
}

// ── Main Wishlist Component ───────────────────────────────────────────────────
export default function Wishlist() {
    const navigate = useNavigate()
    const { handleGetAllProducts } = useProduct()
    const { handleAddItem, loading: cartLoading } = useCart()
    const { wishlistIds, toggleWishlist, clearWishlist } = useWishlist()

    const allProducts = useSelector((state) => state.product?.products) || []
    const [loading, setLoading] = useState(true)
    const [quickViewProduct, setQuickViewProduct] = useState(null)
    const [activeFilter, setActiveFilter] = useState('All')
    const [movingId, setMovingId] = useState(null)

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true)
                await handleGetAllProducts()
            } catch (err) {
                console.error('Error loading wishlist products:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchAll()
    }, [])

    const removeFromWishlist = (productId, e) => {
        toggleWishlist(productId, e)
    }

    const handleMoveToBag = async (product) => {
        if (!product?._id) return
        try {
            setMovingId(product._id)
            await handleAddItem({ productId: product._id, quantity: 1, productTitle: product.title })
            removeFromWishlist(product._id)
        } finally {
            setMovingId(null)
        }
    }

    const handleMoveAllToBag = async () => {
        const itemsToMove = wishlistProducts.filter(p => p._id)
        for (const p of itemsToMove) {
            await handleAddItem({ productId: p._id, quantity: 1, productTitle: p.title })
        }
        clearWishlist()
    }

    // Filter wishlist product objects
    const wishlistProducts = allProducts.filter(p => wishlistIds.includes(p._id))

    // Category tabs
    const availableCategories = ['All', ...new Set(wishlistProducts.map(p => p.category).filter(Boolean))]
    const filteredProducts = activeFilter === 'All'
        ? wishlistProducts
        : wishlistProducts.filter(p => p.category === activeFilter)

    const totalEstimatedValue = wishlistProducts.reduce((acc, p) => {
        const amt = typeof p.price === 'object' ? p.price.amount : p.price || 0
        return acc + amt
    }, 0)
    const currency = wishlistProducts[0]?.price?.currency || 'INR'

    return (
        <div
            className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#111111] antialiased overflow-x-hidden"
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            {/* ── Editorial Minimal Header ── */}
            <div className="max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-12 pt-[85px] sm:pt-[105px] lg:pt-[120px] pb-2">

                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E5E5E5] pb-4 sm:pb-5">
                    <div>
                        <h1
                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                            className="text-[24px] sm:text-[34px] font-bold uppercase tracking-[0.1em] text-[#111111]"
                        >
                            WISHLIST
                        </h1>
                        <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.18em] text-[#777] uppercase mt-1">
                            {wishlistProducts.length} {wishlistProducts.length === 1 ? 'ITEM SAVED' : 'ITEMS SAVED'}
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5 sm:gap-3">
                        {wishlistProducts.length > 0 && (
                            <button
                                onClick={clearWishlist}
                                className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.16em] text-[#666] hover:text-red-600 transition-colors px-3.5 sm:px-4 py-2 rounded-full border border-[#E5E5E5] bg-white cursor-pointer active:scale-95"
                            >
                                Clear All
                            </button>
                        )}
                        <Link
                            to="/products"
                            className="bg-[#111111] text-[#FAF9F6] hover:bg-black text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] px-4 sm:px-6 py-2.5 rounded-full transition-all cursor-pointer shrink-0 shadow-xs active:scale-95"
                        >
                            Explore Catalogue →
                        </Link>
                    </div>
                </div>

                {/* Category Filter Tabs */}
                {wishlistProducts.length > 0 && availableCategories.length > 2 && (
                    <div className="flex items-center gap-2 pt-3 sm:pt-4 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
                        {availableCategories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveFilter(cat)}
                                className={`px-3.5 sm:px-4 py-1.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.14em] transition-all cursor-pointer whitespace-nowrap border shrink-0 ${activeFilter === cat ? 'bg-[#111] text-white border-[#111]' : 'bg-white text-[#555] border-[#E5E5E5] hover:border-[#111]'}`}
                            >
                                {cat} {cat === 'All' ? `(${wishlistProducts.length})` : `(${wishlistProducts.filter(p => p.category === cat).length})`}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* ── Main Content Area ── */}
            <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 sm:px-6 lg:px-12 py-4 sm:py-6 pb-28 lg:pb-20">
                {loading ? (
                    /* Loading Skeleton */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="flex flex-col gap-3 animate-pulse">
                                    <div className="w-full aspect-[4/5] bg-gray-200 rounded-xl" />
                                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                                    <div className="h-4 bg-gray-200 rounded w-1/4" />
                                </div>
                            ))}
                        </div>
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-xl border border-[#E5E5E5] p-6 h-[280px] animate-pulse" />
                        </div>
                    </div>
                ) : wishlistProducts.length === 0 ? (
                    /* ── Minimal Luxury Empty State ── */
                    <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-16 sm:py-20 text-center gap-5 max-w-md mx-auto px-4"
                    >
                        <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center border border-[#E5E5E5] shadow-xs">
                            <svg className="w-7 h-7 text-red-500/80" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                            </svg>
                        </div>

                        <div>
                            <h2
                                style={{ fontFamily: "'Montserrat', sans-serif" }}
                                className="text-[18px] sm:text-[22px] font-bold uppercase text-[#111111] tracking-wider mb-1.5"
                            >
                                YOUR WISHLIST IS EMPTY
                            </h2>
                            <p className="text-[11px] sm:text-[12px] text-[#666] leading-relaxed font-light">
                                Save your favorite pieces and access them here anytime.
                            </p>
                        </div>

                        {/* Quick Category Discovery */}
                        <div className="flex flex-wrap justify-center gap-2 my-1">
                            <Link to="/jeans" className="bg-white border border-[#E5E5E5] text-[#111] text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.14em] px-3.5 sm:px-4 py-2 rounded-full hover:border-[#111] transition-all">
                                Jeans →
                            </Link>
                            <Link to="/shirts" className="bg-white border border-[#E5E5E5] text-[#111] text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.14em] px-3.5 sm:px-4 py-2 rounded-full hover:border-[#111] transition-all">
                                Shirts →
                            </Link>
                            <Link to="/t-shirts" className="bg-white border border-[#E5E5E5] text-[#111] text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.14em] px-3.5 sm:px-4 py-2 rounded-full hover:border-[#111] transition-all">
                                T-Shirts →
                            </Link>
                        </div>

                        <Link
                            to="/products"
                            className="bg-[#111111] text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em] px-7 sm:px-8 py-3 rounded-full hover:bg-black transition-all text-center shadow-xs mt-1"
                        >
                            Explore All Products
                        </Link>
                    </motion.div>
                ) : (
                    /* ── Active Wishlist View: 2-Column Mobile Grid / 3-Column Desktop Grid (75%) + Summary (25%) ── */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 lg:gap-10 items-start">

                        {/* ── Left Column: Clean Product Cards (lg:col-span-9) ── */}
                        <div className="lg:col-span-9">
                            <motion.div
                                layout
                                className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3.5 sm:gap-6 lg:gap-8"
                            >
                                <AnimatePresence mode="popLayout">
                                    {filteredProducts.map((product, index) => {
                                        const primaryImage = typeof product?.images?.[0] === 'string' ? product.images[0] : product?.images?.[0]?.url
                                        const secondaryImage = typeof product?.images?.[1] === 'string' ? product.images[1] : (product?.images?.[1]?.url || primaryImage)
                                        const title = product?.title || 'Product'
                                        const category = product?.category || 'Apparel'
                                        const price = typeof product?.price === 'object' ? product.price.amount : product?.price || 0
                                        const formattedVal = formatPrice(price, currency)
                                        const isMoving = movingId === product._id

                                        return (
                                            <motion.div
                                                key={product._id}
                                                layout
                                                initial={{ opacity: 0, y: 16 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.94, height: 0 }}
                                                transition={{ duration: 0.25, delay: index * 0.03 }}
                                                className="flex flex-col group relative"
                                            >
                                                {/* 4:5 Image Box (Clickable Link to Product Details Page) */}
                                                <Link
                                                    to={`/product/${product._id}`}
                                                    className="relative aspect-[4/5] rounded-xl overflow-hidden bg-[#F4F3F3] border border-black/5 block group/img mb-2.5 sm:mb-3 cursor-pointer"
                                                >
                                                    {primaryImage ? (
                                                        <>
                                                            <img
                                                                src={primaryImage}
                                                                alt={title}
                                                                className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700 ease-out"
                                                                onError={(e) => {
                                                                    e.target.src = 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=400&q=80'
                                                                }}
                                                            />
                                                            {secondaryImage && secondaryImage !== primaryImage && (
                                                                <img
                                                                    src={secondaryImage}
                                                                    alt={title}
                                                                    className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover/img:opacity-100 transition-opacity duration-500 ease-out hidden sm:block"
                                                                />
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Image</div>
                                                    )}

                                                    {/* Top Left Tag */}
                                                    <span className="absolute top-2 left-2 sm:top-3 sm:left-3 text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.16em] bg-black/75 text-white px-2 py-0.5 sm:px-2.5 rounded-sm backdrop-blur-xs">
                                                        {category}
                                                    </span>

                                                    {/* Top Right Floating Remove (Heart) Button */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault()
                                                            e.stopPropagation()
                                                            removeFromWishlist(product._id)
                                                        }}
                                                        aria-label="Remove from wishlist"
                                                        className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-red-500 shadow-md flex items-center justify-center transition-transform hover:scale-110 active:scale-95 cursor-pointer border border-red-100"
                                                        title="Remove from wishlist"
                                                    >
                                                        <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" viewBox="0 0 24 24">
                                                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                                        </svg>
                                                    </button>

                                                    {/* Quick View Overlay Button */}
                                                    <button
                                                        onClick={(e) => {
                                                            e.preventDefault()
                                                            e.stopPropagation()
                                                            setQuickViewProduct(product)
                                                        }}
                                                        className="absolute bottom-2 left-2 right-2 sm:bottom-3 sm:left-3 sm:right-3 bg-white/95 backdrop-blur-md text-[#111] text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.18em] py-1.5 sm:py-2 rounded-full opacity-100 sm:opacity-0 sm:group-hover/img:opacity-100 transition-all duration-300 hover:bg-black hover:text-white shadow-sm cursor-pointer text-center"
                                                    >
                                                        Quick View
                                                    </button>
                                                </Link>

                                                {/* Clean Typography Info */}
                                                <div className="flex flex-col gap-0.5 mb-2.5 sm:mb-3 px-0.5">
                                                    <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.2em] text-[#888]">VELORA</span>
                                                    <Link
                                                        to={`/product/${product._id}`}
                                                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                                                        className="text-[12px] sm:text-[13px] font-bold text-[#111111] tracking-tight line-clamp-1 hover:opacity-70 transition-opacity"
                                                    >
                                                        {title}
                                                    </Link>
                                                    <div className="flex items-center justify-between mt-0.5 sm:mt-1">
                                                        <span className="text-[13px] sm:text-[14px] font-extrabold text-[#111111]">{formattedVal}</span>
                                                        <span className="text-[8px] sm:text-[9px] font-bold uppercase text-[#065F46] bg-[#065F46]/10 px-1.5 py-0.5 rounded-sm">
                                                            In Stock
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Direct Add to Bag Action */}
                                                <button
                                                    onClick={() => handleMoveToBag(product)}
                                                    disabled={cartLoading || isMoving}
                                                    className="w-full bg-[#111111] hover:bg-black text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.16em] py-2.5 sm:py-3 rounded-full transition-all cursor-pointer shadow-xs disabled:opacity-50 active:scale-98"
                                                >
                                                    {isMoving ? 'Moving...' : 'Move to Bag →'}
                                                </button>

                                                {/* Remove from Wishlist button */}
                                                <button
                                                    onClick={() => removeFromWishlist(product._id)}
                                                    aria-label="Remove from wishlist"
                                                    className="w-full text-[8px] sm:text-[9px] font-bold uppercase tracking-[0.14em] text-[#999] hover:text-red-600 transition-colors py-1 cursor-pointer"
                                                >
                                                    Remove
                                                </button>
                                            </motion.div>
                                        )
                                    })}
                                </AnimatePresence>
                            </motion.div>
                        </div>

                        {/* ── Right Column: Clean Sticky Summary Sidebar (lg:col-span-3) ── */}
                        <div className="lg:col-span-3">
                            <div className="bg-white rounded-2xl border border-[#E5E5E5] p-4 sm:p-6 sticky top-24 flex flex-col gap-4 shadow-xs">
                                <div className="border-b border-[#E5E5E5] pb-3">
                                    <h2
                                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                                        className="text-[12px] sm:text-[13px] font-bold uppercase tracking-wider text-[#111111]"
                                    >
                                        WISHLIST SUMMARY
                                    </h2>
                                </div>

                                <div className="flex flex-col gap-2.5 text-[11px] sm:text-[12px]">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[#666] font-medium">Total Saved</span>
                                        <span className="font-bold text-[#111111]">{wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-[#666] font-medium">Availability</span>
                                        <span className="font-bold text-[#065F46]">In Stock</span>
                                    </div>

                                    <div className="border-t border-[#E5E5E5] pt-3 flex items-center justify-between">
                                        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#111111]">Estimated Total</span>
                                        <span className="text-[15px] sm:text-[17px] font-extrabold text-[#111111]">
                                            {formatPrice(totalEstimatedValue, currency)}
                                        </span>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleMoveAllToBag}
                                        disabled={cartLoading || wishlistProducts.length === 0}
                                        className="w-full bg-[#111111] hover:bg-black text-white text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] py-3 sm:py-3.5 rounded-full shadow-xs transition-all cursor-pointer disabled:opacity-50"
                                    >
                                        Move All To Bag
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Recommended Selection Component */}
                <div className="mt-12 sm:mt-20 lg:mt-24">
                    <RecommendedCarousel
                        title="YOU MIGHT ALSO LOVE"
                        subtitle="CURATED SELECTION"
                        excludeIds={wishlistIds}
                        limit={4}
                    />
                </div>
            </main>

            {/* ── Mobile Sticky Bottom Bar ── */}
            {wishlistProducts.length > 0 && (
                <div className="block lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E5E5] px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
                    <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-3">
                        <div>
                            <span className="text-[8px] font-bold uppercase tracking-widest text-[#777] block">Wishlist Total</span>
                            <span className="text-[14px] sm:text-[15px] font-extrabold text-[#111111]">
                                {formatPrice(totalEstimatedValue, currency)}
                            </span>
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={handleMoveAllToBag}
                            disabled={cartLoading}
                            className="bg-[#111111] text-[#FAF9F6] text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.16em] px-5 sm:px-6 py-2.5 sm:py-3 rounded-full shadow-xs cursor-pointer flex-1 max-w-[200px] text-center disabled:opacity-50"
                        >
                            MOVE ALL TO BAG
                        </motion.button>
                    </div>
                </div>
            )}

            {/* Quick View Modal */}
            {quickViewProduct && (
                <QuickViewModal
                    product={quickViewProduct}
                    onClose={() => setQuickViewProduct(null)}
                    onMoveToBag={handleMoveToBag}
                    currency={currency}
                    cartLoading={cartLoading}
                />
            )}

            <Footer />
        </div>
    )
}
