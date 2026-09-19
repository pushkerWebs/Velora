import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useSelector, useDispatch } from 'react-redux'
import { useCart } from '../hook/useCart.js'
import { useAuth } from '../../auth/hook/useAuth.js'
import { useProduct } from '../../products/hook/useProduct.js'
import RecommendedCarousel from '../../products/components/RecommendedCarousel.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import { useRazorpay } from 'react-razorpay'
import Footer from '../../products/components/Footer.jsx'
import { updateProfileApi } from '../../auth/services/auth.api.js'
import { setUser } from '../../auth/state/auth.slice.js'


// Helper function to format prices cleanly
const formatPrice = (priceVal, currencyVal = 'INR') => {
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

// Payment Badge Component
const PaymentBadge = ({ label }) => (
    <div className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md bg-[#F4F3F3] border border-[#E5E5E5] text-[9px] sm:text-[10px] font-bold text-[#444] uppercase tracking-wider shrink-0">
        {label}
    </div>
)

// Confirm Address Modal Component
const ConfirmAddressModal = ({ user, onClose, onConfirm }) => {
    const dispatch = useDispatch()
    const [fullname, setFullname] = useState(user?.fullname || '')
    const [contact, setContact] = useState(user?.contact || '')
    const [address, setAddress] = useState(user?.address || '')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!fullname.trim() || !contact.trim() || !address.trim()) {
            setError('All fields are required to deliver your order.')
            return
        }
        setError('')
        setLoading(true)
        try {
            const data = await updateProfileApi({ fullname, contact, address })
            if (data.success && data.user) {
                dispatch(setUser(data.user))
                onConfirm()
            } else {
                setError(data.message || 'Failed to update delivery details.')
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
                className="bg-white border border-[#E5E5E5] rounded-2xl pt-4 pb-7 px-5 sm:pt-5 sm:pb-8 sm:px-6 max-w-md w-full shadow-2xl relative max-h-[92vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#F4F3F3] hover:bg-[#111] hover:text-white flex items-center justify-center transition-all cursor-pointer text-sm font-bold border border-black/5"
                >
                    ✕
                </button>

                <h3 style={{ fontFamily: "'Montserrat', sans-serif" }} className="text-[14px] sm:text-[16px] font-black uppercase tracking-wider text-[#111] border-b border-[#F3F4F6] pb-3 mb-3">
                    CONFIRM DELIVERY ADDRESS
                </h3>

                {error && (
                    <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#B91C1C] text-xs font-semibold p-3 rounded-lg mb-4 text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-[11px] sm:text-xs text-left">
                    <div>
                        <label className="block text-[9px] uppercase font-bold tracking-[0.14em] text-[#666] mb-1.5">Recipient Name</label>
                        <input
                            type="text"
                            required
                            value={fullname}
                            onChange={(e) => setFullname(e.target.value)}
                            className="w-full border border-[#D1D5DB] rounded-lg px-3 py-2 text-[#111] focus:outline-none focus:border-black transition-all bg-white font-semibold"
                            placeholder="Enter recipient full name"
                        />
                    </div>

                    <div>
                        <label className="block text-[9px] uppercase font-bold tracking-[0.14em] text-[#666] mb-1.5">Contact Number</label>
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
                        <label className="block text-[9px] uppercase font-bold tracking-[0.14em] text-[#666] mb-1.5">Shipping Address</label>
                        <textarea
                            required
                            rows="4"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="w-full border border-[#D1D5DB] rounded-lg px-3 py-2 text-[#111] focus:outline-none focus:border-black transition-all resize-none leading-relaxed bg-white font-semibold"
                            placeholder="Enter complete shipping address"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#111] hover:bg-black text-white text-[10px] font-black uppercase tracking-[0.16em] py-3 rounded-xl transition-all cursor-pointer disabled:opacity-50 mt-2"
                    >
                        {loading ? 'SAVING...' : 'CONFIRM & PROCEED TO PAYMENT →'}
                    </button>
                </form>
            </motion.div>
        </div>
    )
}

const Cart = () => {
    const navigate = useNavigate()
    const {
        handleGetCart,
        handleAddItem,
        handleDecrementItem,
        handleCreateCartOrder,
        handleVerifyCartOrder,
        totalPrice: backendTotalPrice,
        totalSavings: backendTotalSavings,
        currency: backendCurrency,
        loading
    } = useCart()

    const { error, isLoading, Razorpay } = useRazorpay()

    const { handleLogout } = useAuth()
    const { handleGetAllProducts } = useProduct()

    const user = useSelector((state) => state.auth.user)
    const cartItems = useSelector((state) => state.cart.items) || []
    const recommendedProducts = useSelector((state) => state.product?.products) || []

    const dispatch = useDispatch()
    const [pageLoading, setPageLoading] = useState(true)
    const [wishlistItems, setWishlistItems] = useState({})
    const [orderSuccess, setOrderSuccess] = useState(false)
    const [paymentLoading, setPaymentLoading] = useState(false)

    // Address and Coupon states
    const [showAddressModal, setShowAddressModal] = useState(false)
    const [appliedCoupon, setAppliedCoupon] = useState(null)
    const [couponCode, setCouponCode] = useState('')
    const [couponError, setCouponError] = useState('')

    const handleSignOut = async () => {
        await handleLogout()
        navigate('/')
    }

    const handleCheckout = () => {
        setShowAddressModal(true)
    }

    const handleConfirmAddressAndPay = async () => {
        setShowAddressModal(false)
        await proceedToPayment()
    }

    async function proceedToPayment() {
        try {
            setPaymentLoading(true)
            const orderData = await handleCreateCartOrder({ couponCode: appliedCoupon || undefined })
            console.log(orderData)

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TRe1PXXpVVhsI8",
                amount: orderData.order.amount,
                currency: orderData.order.currency,
                name: "Velora",
                description: "Test Transaction",
                order_id: orderData.order.id,
                handler: async (response) => {
                    const isValid = await handleVerifyCartOrder(response)
                    if (isValid) {
                        setOrderSuccess(true)
                        setAppliedCoupon(null)
                    }
                    setPaymentLoading(false)
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
                    ondismiss: () => setPaymentLoading(false)
                }
            }

            const razorpayInstance = new Razorpay(options)
            razorpayInstance.open()
        } catch (err) {
            console.error('Checkout failed:', err)
            setPaymentLoading(false)
        }
    }


    const toggleWishlist = (productId) => {
        setWishlistItems(prev => ({
            ...prev,
            [productId]: !prev[productId]
        }))
    }

    useEffect(() => {
        const initCartPage = async () => {
            try {
                setPageLoading(true)
                await Promise.all([
                    handleGetCart(),
                    handleGetAllProducts()
                ])
            } catch (err) {
                console.error('Error initializing cart page:', err)
            } finally {
                setPageLoading(false)
            }
        }
        initCartPage()
    }, [])

    // Aggregated calculations from backend pipeline
    const totalSavingsFromPriceDrops = backendTotalSavings || 0
    const subtotal = backendTotalPrice || 0
    const currency = backendCurrency || 'INR'

    // Auto-remove VELORASTYLE if subtotal drops below 2999
    useEffect(() => {
        if (appliedCoupon === 'VELORASTYLE' && subtotal < 2999) {
            setAppliedCoupon(null)
            setCouponError('VELORASTYLE coupon removed: Order must be above ₹2,999')
        }
    }, [subtotal, appliedCoupon])

    let couponDiscount = 0
    if (appliedCoupon === 'VELORA10') {
        couponDiscount = Math.round(subtotal * 0.1)
    } else if (appliedCoupon === 'VELORASTYLE' && subtotal >= 2999) {
        couponDiscount = Math.round(subtotal * 0.15)
    }

    const FREE_SHIPPING_THRESHOLD = 999
    const amountAwayFromFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
    const freeShippingProgress = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100))

    const formattedSubtotal = formatPrice(subtotal, currency)
    const shippingFee = subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD ? 99 : 0
    const formattedShipping = shippingFee === 0 ? 'FREE' : formatPrice(shippingFee, currency)
    const formattedTotal = formatPrice(Math.max(0, subtotal + shippingFee - couponDiscount), currency)

    return (
        <div
            className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#111111] antialiased overflow-x-hidden"
            style={{ fontFamily: "'Inter', sans-serif" }}
        >
            {/* ── Order Success Modal ── */}
            <AnimatePresence>
                {orderSuccess && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
                        onClick={(e) => { if (e.target === e.currentTarget) setOrderSuccess(false) }}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.85, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
                            className="relative bg-white rounded-[28px] shadow-2xl flex flex-col items-center gap-5 px-10 py-10 max-w-sm w-full text-center"
                        >
                            {/* Close Button */}
                            <button
                                onClick={() => setOrderSuccess(false)}
                                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-[#F4F3F3] hover:bg-[#E5E5E5] transition-colors cursor-pointer"
                                aria-label="Close"
                            >
                                <svg className="w-4 h-4 text-[#555]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* Animated Checkmark Circle */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.15 }}
                                className="w-20 h-20 rounded-full bg-[#065F46] flex items-center justify-center shadow-lg"
                            >
                                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <motion.path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M5 13l4 4L19 7"
                                        initial={{ pathLength: 0 }}
                                        animate={{ pathLength: 1 }}
                                        transition={{ duration: 0.5, delay: 0.3 }}
                                    />
                                </svg>
                            </motion.div>

                            {/* Text */}
                            <div className="flex flex-col gap-1.5">
                                <h2
                                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                                    className="text-[22px] font-black uppercase tracking-tight text-[#111111]"
                                >
                                    Order Completed!
                                </h2>
                                <p className="text-[13px] text-[#747878] leading-relaxed">
                                    Your payment was successful. We'll start processing your order right away.
                                </p>
                            </div>

                            {/* CTA */}
                            <button
                                onClick={() => { setOrderSuccess(false); navigate('/') }}
                                className="w-full bg-[#111111] text-[#FAF9F6] text-[11px] font-extrabold uppercase tracking-[0.18em] py-3.5 rounded-full hover:bg-black transition-all cursor-pointer"
                            >
                                Continue Shopping
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* ── Page Header ── */}
            <div className="max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-12 pt-20 sm:pt-24 pb-3">

                <div className="flex items-baseline justify-between border-b border-[#E5E5E5] pb-3 sm:pb-4">
                    <h1
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                        className="text-[22px] sm:text-[36px] font-black uppercase tracking-tight text-[#111111]"
                    >
                        SHOPPING BAG
                    </h1>
                    {!pageLoading && (
                        <span className="text-[11px] sm:text-[12px] font-semibold tracking-wider uppercase text-[#747878]">
                            {cartItems.length} {cartItems.length === 1 ? 'ITEM' : 'ITEMS'}
                        </span>
                    )}
                </div>
            </div>

            {/* ── Main Content Container ── */}
            <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 lg:px-12 py-4 sm:py-6 pb-28 lg:pb-20">
                {pageLoading ? (
                    /* Loading Skeleton */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                        <div className="lg:col-span-8 flex flex-col gap-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white rounded-[16px] border border-[#E5E5E5] p-4 flex gap-4 animate-pulse">
                                    <div className="w-[110px] h-[140px] bg-gray-100 rounded-xl shrink-0" />
                                    <div className="flex-1 flex flex-col gap-3 pt-1">
                                        <div className="h-4 bg-gray-100 rounded w-1/4" />
                                        <div className="h-5 bg-gray-100 rounded w-1/2" />
                                        <div className="h-4 bg-gray-100 rounded w-1/3" />
                                        <div className="h-8 bg-gray-100 rounded-full w-28 mt-auto" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="lg:col-span-4">
                            <div className="bg-white rounded-[20px] border border-[#E5E5E5] p-6 h-[340px] animate-pulse" />
                        </div>
                    </div>
                ) : cartItems.length === 0 ? (
                    /* ── Empty State ── */
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-16 sm:py-20 text-center gap-5 max-w-md mx-auto px-4"
                    >
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#F4F3F3] flex items-center justify-center border border-[#E5E5E5]">
                            <svg className="w-8 h-8 sm:w-9 sm:h-9 text-[#888]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>

                        <div>
                            <h2
                                style={{ fontFamily: "'Montserrat', sans-serif" }}
                                className="text-[20px] sm:text-[22px] font-black uppercase text-[#111111] tracking-tight mb-2"
                            >
                                Your Bag is Empty
                            </h2>
                            <p className="text-[12px] sm:text-[13px] text-[#747878] leading-relaxed">
                                Discover our latest luxury editorial releases, curated essentials, and modern fits.
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                            <Link
                                to="/"
                                className="w-full sm:w-auto bg-[#111111] text-[#FAF9F6] text-[10px] font-extrabold uppercase tracking-[0.18em] px-7 py-3 rounded-full hover:bg-black transition-all text-center"
                            >
                                Continue Shopping
                            </Link>
                            <Link
                                to="/"
                                className="w-full sm:w-auto border border-[#111111] text-[#111111] text-[10px] font-extrabold uppercase tracking-[0.18em] px-7 py-3 rounded-full hover:bg-[#111111] hover:text-white transition-all text-center"
                            >
                                New Arrivals
                            </Link>
                        </div>
                    </motion.div>
                ) : (
                    /* ── Active Cart View (Desktop 70/30 Grid / Mobile Stacked) ── */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-start">
                        {/* ── Left Column: Cart Items (70% Desktop / lg:col-span-8) ── */}
                        <div className="lg:col-span-8 flex flex-col gap-4 sm:gap-6">

                            {/* Compact Cart Item Cards (Scrollable with Lenis nested scroll override when > 3 items) */}
                            <div
                                {...(cartItems.length >= 4 ? { 'data-lenis-prevent': 'true' } : {})}
                                className={`flex flex-col gap-3.5 sm:gap-4 ${cartItems.length >= 4 ? 'max-h-[520px] sm:max-h-[580px] overflow-y-auto pr-1.5 sm:pr-2.5 custom-scrollbar' : ''}`}
                            >
                                <AnimatePresence mode="popLayout">
                                    {cartItems.map((item, index) => {
                                        const product = item.product
                                        const primaryImage = product?.images?.[0]?.url
                                        const secondaryImage = product?.images?.[1]?.url || primaryImage
                                        const title = product?.title || 'Product'
                                        const category = product?.category || 'Apparel'

                                        const currentUnitPrice = product?.price?.amount ?? item.price?.amount ?? 0
                                        const originalUnitPrice = item.price?.amount
                                        const itemCurrency = product?.price?.currency || item.price?.currency || 'INR'

                                        const hasPriceDrop = item.savings > 0
                                        const totalItemSavings = item.savings || 0
                                        const currentLinePrice = item.subtotal || 0
                                        const originalLinePrice = originalUnitPrice != null ? originalUnitPrice * item.quantity : currentLinePrice

                                        const isWishlisted = !!wishlistItems[product?._id]

                                        // Helper to extract color dynamically
                                        const detectedColor = (() => {
                                            if (item.color) return item.color
                                            if (product?.color) return product.color
                                            const knownColors = ['Black', 'Grey', 'Gray', 'Blue', 'White', 'Onyx', 'Anthracite', 'Navy', 'Dark Blue', 'Light Blue', 'Beige', 'Charcoal', 'Olive', 'Green', 'Brown']
                                            const titleLower = (title || '').toLowerCase()
                                            for (const c of knownColors) {
                                                if (titleLower.includes(c.toLowerCase())) return c
                                            }
                                            return null
                                        })()

                                        const itemSize = item.size || product?.selectedSize || (category === 'Jeans' ? '32' : 'M')

                                        return (
                                            <motion.div
                                                key={item._id || product?._id || index}
                                                layout
                                                initial={{ opacity: 0, y: 16 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -50, height: 0 }}
                                                transition={{ duration: 0.3, delay: index * 0.03 }}
                                                className="bg-white rounded-[16px] border border-[#E5E5E5] shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:border-black/20 transition-all duration-300 p-3.5 sm:p-5 flex flex-row gap-3.5 sm:gap-5 group"
                                            >
                                                {/* Left: Product Image (Fixed 110px wide on mobile / 120px on desktop) */}
                                                <Link
                                                    to={`/product/${product?._id}`}
                                                    className="shrink-0 w-[110px] md:w-[120px] h-[140px] md:h-[150px] aspect-[4/5] rounded-xl overflow-hidden relative bg-[#F4F3F3] border border-black/5 block group/img"
                                                >
                                                    {primaryImage ? (
                                                        <>
                                                            <img
                                                                src={primaryImage}
                                                                alt={product?.images?.[0]?.alt || title}
                                                                className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700 ease-out"
                                                                onError={(e) => {
                                                                    e.target.src = 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=300&q=80'
                                                                }}
                                                            />
                                                            {secondaryImage && secondaryImage !== primaryImage && (
                                                                <img
                                                                    src={secondaryImage}
                                                                    alt={title}
                                                                    className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover/img:opacity-100 transition-opacity duration-500 ease-out"
                                                                />
                                                            )}
                                                        </>
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-[#888]">
                                                            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                </Link>

                                                {/* Center & Right: Product Info & Pricing */}
                                                <div className="flex-1 flex flex-col justify-between gap-2 min-w-0">
                                                    <div className="flex flex-col gap-1">
                                                        {/* Brand & Stock status */}
                                                        <div className="flex items-center justify-between gap-2">
                                                            <span className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#999]">VELORA</span>
                                                            <span className="text-[8px] sm:text-[9px] font-bold text-[#065F46] bg-[#065F46]/10 px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                                                                In Stock
                                                            </span>
                                                        </div>

                                                        {/* Product Title */}
                                                        <Link
                                                            to={`/product/${product?._id}`}
                                                            style={{ fontFamily: "'Montserrat', sans-serif" }}
                                                            className="text-[13px] sm:text-base font-bold text-[#111111] tracking-tight leading-snug hover:opacity-70 transition-opacity line-clamp-1"
                                                        >
                                                            {title}
                                                        </Link>

                                                        {/* Variants & Badges */}
                                                        <div className="flex items-center gap-1.5 flex-wrap text-[9px] sm:text-[10px] font-semibold text-[#555]">
                                                            <span className="bg-[#F4F3F3] px-2 py-0.5 rounded font-bold text-black">Size: {itemSize}</span>
                                                            {detectedColor && (
                                                                <span className="bg-[#F4F3F3] px-2 py-0.5 rounded font-bold text-black">Color: {detectedColor}</span>
                                                            )}
                                                            <span className="hidden sm:inline bg-[#F4F3F3] px-2 py-0.5 rounded text-[8px]">Free Exchange</span>
                                                            <span className="hidden sm:inline bg-[#F4F3F3] px-2 py-0.5 rounded text-[8px]">Premium Fabric</span>
                                                        </div>

                                                        {/* Price on Mobile / Tablet */}
                                                        <div className="flex items-center justify-between mt-1 md:hidden">
                                                            <div className="flex items-baseline gap-1.5">
                                                                <span className="text-[14px] font-black text-[#111111]">
                                                                    {formatPrice(currentLinePrice, itemCurrency)}
                                                                </span>
                                                                {item.quantity > 1 && (
                                                                    <span className="text-[10px] text-[#747878] font-medium">
                                                                        ({formatPrice(currentUnitPrice, itemCurrency)} each)
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Price Drop Alert */}
                                                        {hasPriceDrop && (
                                                            <div className="mt-0.5">
                                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] sm:text-[9px] font-extrabold bg-[#065F46]/10 text-[#065F46] border border-[#065F46]/20">
                                                                    Save {formatPrice(totalItemSavings, itemCurrency)}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Quantity Selector & Action Links */}
                                                    <div className="flex items-center justify-between pt-1.5 border-t border-[#E5E5E5]/60 mt-auto">
                                                        {/* Touch-Friendly Pill Quantity Selector */}
                                                        <div className="flex items-center bg-[#F4F3F3] border border-[#E5E5E5] rounded-full p-0.5">
                                                            <button
                                                                onClick={() => handleDecrementItem({ productId: product?._id })}
                                                                disabled={loading}
                                                                className="w-6 h-6 rounded-full bg-white text-[#111111] hover:bg-black hover:text-white font-bold flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 text-xs shadow-xs"
                                                            >
                                                                −
                                                            </button>

                                                            <div className="w-6 sm:w-7 text-center font-extrabold text-[11px] sm:text-[12px] text-[#111111] select-none">
                                                                <AnimatePresence mode="wait">
                                                                    <motion.span
                                                                        key={item.quantity}
                                                                        initial={{ opacity: 0, y: 3 }}
                                                                        animate={{ opacity: 1, y: 0 }}
                                                                        exit={{ opacity: 0, y: -3 }}
                                                                        transition={{ duration: 0.12 }}
                                                                        className="block"
                                                                    >
                                                                        {item.quantity}
                                                                    </motion.span>
                                                                </AnimatePresence>
                                                            </div>

                                                            <button
                                                                onClick={() => handleAddItem({ productId: product?._id, quantity: 1, productTitle: title })}
                                                                disabled={loading}
                                                                className="w-6 h-6 rounded-full bg-white text-[#111111] hover:bg-black hover:text-white font-bold flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 text-xs shadow-xs"
                                                            >
                                                                +
                                                            </button>
                                                        </div>

                                                        {/* Text Action Links */}
                                                        <div className="flex items-center gap-2.5 sm:gap-3">
                                                            <button
                                                                onClick={() => toggleWishlist(product?._id)}
                                                                className={`text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.08em] cursor-pointer transition-colors ${isWishlisted ? 'text-red-600 font-bold' : 'text-[#747878] hover:text-black'}`}
                                                            >
                                                                {isWishlisted ? 'Saved' : 'Wishlist'}
                                                            </button>
                                                            <span className="text-[#E5E5E5] text-[10px]">•</span>
                                                            <button
                                                                onClick={() => handleDecrementItem({ productId: product?._id })}
                                                                disabled={loading}
                                                                className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.08em] text-[#747878] hover:text-red-600 transition-colors cursor-pointer disabled:opacity-40"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Desktop Only Right Column: Vertically Aligned Price & Subtotal */}
                                                <div className="hidden md:flex flex-col items-end justify-between shrink-0 pl-4 border-l border-[#E5E5E5]/60 min-w-[120px]">
                                                    <div className="text-right">
                                                        <span className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#999] block mb-0.5">SUBTOTAL</span>
                                                        <span className="text-base font-black text-[#111111] block leading-none">
                                                            {formatPrice(currentLinePrice, itemCurrency)}
                                                        </span>
                                                        {hasPriceDrop && (
                                                            <span className="text-[10px] font-semibold text-gray-400 line-through mt-1 block">
                                                                {formatPrice(originalLinePrice, itemCurrency)}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <Link
                                                        to={`/product/${product?._id}`}
                                                        className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#111111] hover:opacity-60 transition-opacity mt-auto"
                                                    >
                                                        View Product →
                                                    </Link>
                                                </div>
                                            </motion.div>
                                        )
                                    })}
                                </AnimatePresence>
                            </div>
                        </div>

                        {/* ── Right Column: Order Summary (30% Desktop / Full Width Below Items on Mobile) ── */}
                        <div className="lg:col-span-4 mt-2 lg:mt-0">
                            <div className="bg-white rounded-[20px] border border-[#E5E5E5] shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-5 sm:p-6 sticky top-24 flex flex-col gap-4 sm:gap-5">
                                <div className="border-b border-[#E5E5E5] pb-3">
                                    <h2
                                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                                        className="text-[15px] sm:text-[16px] font-black uppercase tracking-wide text-[#111111]"
                                    >
                                        ORDER SUMMARY
                                    </h2>
                                </div>

                                <div className="flex flex-col gap-2.5 sm:gap-3 text-[12px]">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[#555] font-semibold">Subtotal</span>
                                        <span className="font-bold text-[#111111]">{formattedSubtotal}</span>
                                    </div>

                                    {totalSavingsFromPriceDrops > 0 && (
                                        <div className="flex items-center justify-between text-[#065F46] bg-[#065F46]/10 px-3 py-2 rounded-lg border border-[#065F46]/20">
                                            <span className="font-extrabold text-[11px] flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                                                </svg>
                                                Price Drop Savings
                                            </span>
                                            <span className="font-black text-[12px]">− {formatPrice(totalSavingsFromPriceDrops, currency)}</span>
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between">
                                        <span className="text-[#555] font-semibold">Shipping</span>
                                        <span className={`font-black ${shippingFee === 0 ? 'text-[#065F46]' : 'text-[#111111]'}`}>
                                            {formattedShipping}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-[#555] font-semibold">Estimated GST Tax</span>
                                        <span className="font-bold text-[#111111]">Included</span>
                                    </div>

                                    {appliedCoupon && (
                                        <div className="flex items-center justify-between text-[#065F46] bg-[#065F46]/5 px-3 py-2 rounded-lg border border-[#065F46]/20">
                                            <span className="font-extrabold text-[11px]">
                                                Coupon Applied ({appliedCoupon})
                                            </span>
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-black text-[12px]">− {formatPrice(couponDiscount, currency)}</span>
                                                <button
                                                    onClick={() => setAppliedCoupon(null)}
                                                    className="text-xs text-red-600 hover:text-red-800 font-bold ml-1 cursor-pointer font-sans"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Promo / Coupon Section */}
                                    <div className="border-t border-b border-[#E5E5E5]/60 py-3.5 flex flex-col gap-2.5">
                                        <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#999] block text-left">PROMO CODE / COUPON</span>

                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={couponCode}
                                                onChange={(e) => {
                                                    setCouponCode(e.target.value.toUpperCase())
                                                    setCouponError('')
                                                }}
                                                placeholder="ENTER CODE"
                                                className="flex-1 border border-[#D1D5DB] rounded-lg px-3 py-2 text-[11px] text-[#111] focus:outline-none focus:border-black uppercase font-mono tracking-wider bg-white h-9"
                                            />
                                            <button
                                                onClick={() => {
                                                    const trimmed = couponCode.trim().toUpperCase()
                                                    if (trimmed === 'VELORA10') {
                                                        setAppliedCoupon('VELORA10')
                                                        setCouponCode('')
                                                        setCouponError('')
                                                    } else if (trimmed === 'VELORASTYLE') {
                                                        if (subtotal < 2999) {
                                                            setCouponError('VELORASTYLE requires minimum order value of ₹2,999')
                                                        } else {
                                                            setAppliedCoupon('VELORASTYLE')
                                                            setCouponCode('')
                                                            setCouponError('')
                                                        }
                                                    } else if (!trimmed) {
                                                        setCouponError('Please enter a coupon code')
                                                    } else {
                                                        setCouponError('Invalid coupon code')
                                                    }
                                                }}
                                                className="bg-[#111111] hover:bg-black text-white text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-all cursor-pointer h-9 shrink-0"
                                            >
                                                APPLY
                                            </button>
                                        </div>

                                        {couponError && (
                                            <span className="text-[10px] text-red-600 font-semibold text-left block">{couponError}</span>
                                        )}

                                        {/* Quick Click Available Coupons */}
                                        <div className="flex flex-col gap-1.5 mt-1 border-t border-[#F3F4F6] pt-2 text-left">
                                            <span className="text-[8px] font-bold uppercase tracking-[0.1em] text-[#777]">TAP TO APPLY AVAILABLE COUPONS</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                <button
                                                    onClick={() => {
                                                        setAppliedCoupon('VELORA10')
                                                        setCouponError('')
                                                    }}
                                                    className={`text-[9px] font-bold tracking-wider px-2.5 py-1 rounded-md border transition-all cursor-pointer ${appliedCoupon === 'VELORA10'
                                                            ? 'bg-[#065F46] text-white border-[#065F46]'
                                                            : 'bg-[#FAF9F6] border-[#E5E5E5] text-[#111] hover:border-black'
                                                        }`}
                                                >
                                                    VELORA10 (10% OFF)
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (subtotal < 2999) {
                                                            setCouponError('VELORASTYLE requires minimum order value of ₹2,999')
                                                        } else {
                                                            setAppliedCoupon('VELORASTYLE')
                                                            setCouponError('')
                                                        }
                                                    }}
                                                    className={`text-[9px] font-bold tracking-wider px-2.5 py-1 rounded-md border transition-all cursor-pointer ${appliedCoupon === 'VELORASTYLE'
                                                            ? 'bg-[#065F46] text-white border-[#065F46]'
                                                            : 'bg-[#FAF9F6] border-[#E5E5E5] text-[#111] hover:border-black'
                                                        }`}
                                                >
                                                    VELORASTYLE (15% OFF)
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-[#E5E5E5] my-0.5 pt-3 flex items-center justify-between">
                                        <span className="text-[13px] font-black uppercase tracking-wide text-[#111111]">Final Total</span>
                                        <span className="text-[18px] sm:text-[20px] font-black text-[#111111]">{formattedTotal}</span>
                                    </div>
                                </div>

                                {/* Desktop / Tablet Checkout CTA Button */}
                                <motion.button
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full bg-[#111111] hover:bg-black text-[#FAF9F6] text-[11px] font-extrabold uppercase tracking-[0.18em] py-3.5 rounded-full shadow-md transition-all cursor-pointer"
                                    onClick={handleCheckout}
                                >
                                    PROCEED TO CHECKOUT
                                </motion.button>

                                {/* Payment Methods Badges */}
                                <div className="flex flex-col gap-2 border-t border-[#E5E5E5] pt-3.5">
                                    <span className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[#999]">ACCEPTED PAYMENTS & COD</span>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <PaymentBadge label="UPI" />
                                        <PaymentBadge label="VISA" />
                                        <PaymentBadge label="MASTERCARD" />
                                        <PaymentBadge label="RUPAY" />
                                        <PaymentBadge label="COD AVAILABLE" />
                                    </div>
                                </div>

                                {/* Trust Indicators */}
                                <div className="flex flex-col gap-2 text-[10px] text-[#747878] border-t border-[#E5E5E5] pt-3">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-3.5 h-3.5 text-[#111111] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                                        </svg>
                                        <span className="font-semibold">Secure 256-Bit Encrypted Checkout</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-3.5 h-3.5 text-[#111111] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                        </svg>
                                        <span className="font-semibold">14-Day Easy Returns & Exchanges</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Shared Recommended Carousel Component */}
                <RecommendedCarousel
                    title="YOU MAY ALSO LIKE"
                    subtitle="CURATED SELECTION"
                    excludeIds={cartItems.map(i => i.product?._id)}
                    limit={4}
                />
            </main>

            <Footer />

            {/* ── Touch-Friendly Mobile Sticky Bottom Checkout Bar ── */}
            {cartItems.length > 0 && (
                <div className="block lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E5E5E5] px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
                    <div className="max-w-[1400px] mx-auto flex items-center justify-between gap-3">
                        <div>
                            <span className="text-[8px] font-bold uppercase tracking-widest text-[#747878] block">Total Amount</span>
                            <span className="text-[16px] font-black text-[#111111]">{formattedTotal}</span>
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={handleCheckout}
                            disabled={paymentLoading}
                            className="bg-[#111111] text-[#FAF9F6] text-[10px] font-black uppercase tracking-[0.16em] px-6 py-3 rounded-full shadow-md cursor-pointer flex-1 max-w-[200px] text-center disabled:opacity-60"
                        >
                            {paymentLoading ? 'PROCESSING...' : 'CHECKOUT →'}
                        </motion.button>
                    </div>
                </div>
            )}

            {showAddressModal && (
                <ConfirmAddressModal
                    user={user}
                    onClose={() => setShowAddressModal(false)}
                    onConfirm={handleConfirmAddressAndPay}
                />
            )}
        </div>
    )
}

export default Cart
