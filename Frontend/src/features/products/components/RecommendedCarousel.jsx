import React, { useEffect } from 'react'
import { Link } from 'react-router'
import { useSelector } from 'react-redux'
import { useProduct } from '../hook/useProduct.js'
import { useCart } from '../../cart/hook/useCart.js'
import { useWishlist } from '../hook/useWishlist.js'
import { motion, AnimatePresence } from 'framer-motion'

const formatPrice = (priceVal) => {
    if (priceVal == null) return ''
    const amount = typeof priceVal === 'object' ? priceVal.amount : priceVal
    const currency = typeof priceVal === 'object' ? (priceVal.currency || 'INR') : 'INR'
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currency || 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount || 0)
}

/* ── Individual Card ── */
function ProductCard({ product, index, handleAddItem, cartLoading, toggleWishlist, isWishlisted }) {
    const imgUrl = product?.images?.[0]?.url
    const secondaryImgUrl = product?.images?.[1]?.url || imgUrl
    const isLiked = isWishlisted(product._id)
    const origPrice = product.originalPrice || (product.price?.amount ? Math.round(product.price.amount * 1.28) : null)
    const hasDiscount = origPrice && origPrice > (product.price?.amount || 0)
    const discountPct = hasDiscount ? Math.round(((origPrice - product.price.amount) / origPrice) * 100) : 0

    return (
        <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-30px' }}
            transition={{ duration: 0.45, delay: index * 0.07, ease: [0.25, 0.1, 0.25, 1] }}
            className="group flex flex-col"
        >
            {/* ── Image Block ── */}
            <Link
                to={`/product/${product._id}`}
                className="relative block aspect-[3/4] overflow-hidden bg-[#F0EFEC] rounded-2xl sm:rounded-3xl mb-3 sm:mb-4"
            >
                {/* Primary image */}
                {imgUrl ? (
                    <>
                        <img
                            src={imgUrl}
                            alt={product.title}
                            className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105"
                            onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=400&q=80'
                            }}
                        />
                        {/* Secondary image on hover */}
                        {secondaryImgUrl && secondaryImgUrl !== imgUrl && (
                            <img
                                src={secondaryImgUrl}
                                alt={product.title}
                                className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out"
                            />
                        )}
                    </>
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-[#bbb]">
                        <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}


                {/* Wishlist button */}
                <button
                    onClick={(e) => { e.preventDefault(); toggleWishlist(product._id, e) }}
                    aria-label="Save to wishlist"
                    className="absolute top-3 right-3 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-sm border border-black/5 flex items-center justify-center transition-all hover:scale-110 hover:bg-white cursor-pointer shadow-sm opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 duration-300"
                >
                    <svg
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-colors duration-200 ${isLiked ? 'fill-red-500 text-red-500' : 'fill-none text-[#111]'}`}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.8}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                </button>

                {/* Quick-add overlay — slides up on hover */}
                <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out p-3">
                    <button
                        onClick={(e) => { e.preventDefault(); handleAddItem({ productId: product._id, quantity: 1, productTitle: product.title }) }}
                        disabled={cartLoading}
                        className="w-full bg-white/95 backdrop-blur-sm text-[#111111] text-[9px] sm:text-[10px] font-black uppercase tracking-[0.16em] py-2.5 sm:py-3 rounded-xl sm:rounded-2xl transition-all cursor-pointer disabled:opacity-50 hover:bg-white shadow-lg border border-black/5"
                    >
                        + Quick Add
                    </button>
                </div>
            </Link>

            {/* ── Info Row ── */}
            <div className="flex flex-col gap-0.5 px-0.5">
                {/* Category label */}
                <span className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#999]">
                    {product.category || 'Apparel'}
                </span>

                {/* Title */}
                <Link
                    to={`/product/${product._id}`}
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                    className="text-[12px] sm:text-[13px] font-bold text-[#111111] tracking-tight line-clamp-1 hover:opacity-60 transition-opacity"
                >
                    {product.title}
                </Link>

                {/* Price row */}
                <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-[13px] sm:text-[15px] font-black text-[#111111]">
                        {formatPrice(product.price)}
                    </span>
                    {hasDiscount && (
                        <span className="text-[11px] sm:text-[12px] font-medium text-[#aaa] line-through">
                            {formatPrice({ amount: origPrice, currency: product.price?.currency || 'INR' })}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

/* ── Main Section ── */
export default function RecommendedCarousel({
    title = "YOU MIGHT ALSO LOVE",
    subtitle = "CURATED SELECTION",
    excludeIds = [],
    limit = 4,
}) {
    const { handleGetAllProducts } = useProduct()
    const { handleAddItem, loading: cartLoading } = useCart()
    const { toggleWishlist, isWishlisted } = useWishlist()

    const allProducts = useSelector((state) => state.product?.products) || []

    useEffect(() => {
        if (!allProducts || allProducts.length === 0) {
            handleGetAllProducts()
        }
    }, [])

    const excludeSet = new Set(excludeIds.filter(Boolean))
    const recommended = allProducts
        .filter((p) => p._id && !excludeSet.has(p._id))
        .slice(0, limit)

    if (recommended.length === 0) return null

    return (
        <section className="w-full mt-16 sm:mt-20 border-t border-[#E5E5E5] pt-12 sm:pt-16">
            {/* ── Section Header ── */}
            <div className="flex flex-col items-center justify-center mb-8 sm:mb-10 text-center">
                <h2
                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                    className="text-[22px] sm:text-[30px] font-black uppercase tracking-tight text-[#111111] leading-none"
                >
                    {title}
                </h2>
            </div>

            {/* ── Cards Grid ── */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
                {recommended.map((product, index) => (
                    <ProductCard
                        key={product._id}
                        product={product}
                        index={index}
                        handleAddItem={handleAddItem}
                        cartLoading={cartLoading}
                        toggleWishlist={toggleWishlist}
                        isWishlisted={isWishlisted}
                    />
                ))}
            </div>

            {/* View All Products link */}
            <div className="mt-8 sm:mt-12 flex justify-center">
                <Link
                    to="/products"
                    className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#111111] border border-[#111111] px-7 py-3 rounded-full hover:bg-[#111111] hover:text-white transition-all"
                >
                    View All Products
                </Link>
            </div>
        </section>
    )
}
