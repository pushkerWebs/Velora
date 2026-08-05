import React, { useEffect } from 'react'
import { Link } from 'react-router'
import { useSelector } from 'react-redux'
import { useProduct } from '../hook/useProduct.js'
import { useCart } from '../../cart/hook/useCart.js'
import { useWishlist } from '../hook/useWishlist.js'
import { motion } from 'framer-motion'

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
            <div className="flex items-center justify-between mb-8 sm:mb-10">
                <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#999] block mb-1">
                        {subtitle}
                    </span>
                    <h2
                        style={{ fontFamily: "'Montserrat', sans-serif" }}
                        className="text-[20px] sm:text-[28px] font-black uppercase tracking-tight text-[#111111]"
                    >
                        {title}
                    </h2>
                </div>
                <Link
                    to="/"
                    className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#111111] hover:opacity-60 transition-opacity"
                >
                    View All Products →
                </Link>
            </div>

            {/* 2-Column Grid on Mobile / 4-Column on Desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 lg:gap-8">
                {recommended.map((product) => {
                    const imgUrl = product?.images?.[0]?.url
                    const secondaryImgUrl = product?.images?.[1]?.url || imgUrl
                    const isLiked = isWishlisted(product._id)

                    return (
                        <motion.div
                            key={product._id}
                            whileHover={{ y: -4 }}
                            transition={{ duration: 0.25 }}
                            className="bg-white rounded-[16px] sm:rounded-[20px] border border-[#E5E5E5] overflow-hidden group flex flex-col justify-between p-2.5 sm:p-4 lg:p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.07)] transition-all duration-300 relative"
                        >
                            {/* Heart Toggle Button */}
                            <button
                                onClick={(e) => toggleWishlist(product._id, e)}
                                aria-label="Save to wishlist"
                                className="absolute top-3.5 right-3.5 z-10 w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-xs border border-black/5 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-xs"
                            >
                                <svg
                                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLiked ? 'fill-red-600 text-red-600' : 'fill-none text-[#111]'}`}
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={1.8}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                                </svg>
                            </button>

                            {/* Product Image Wrapper */}
                            <Link to={`/product/${product._id}`} className="block relative aspect-[4/5] rounded-lg sm:rounded-xl overflow-hidden bg-[#F4F3F3] mb-2.5 sm:mb-4 border border-black/5 group/img">
                                {imgUrl ? (
                                    <>
                                        <img
                                            src={imgUrl}
                                            alt={product.title}
                                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700 ease-out"
                                            onError={(e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=400&q=80'
                                            }}
                                        />
                                        {secondaryImgUrl && secondaryImgUrl !== imgUrl && (
                                            <img
                                                src={secondaryImgUrl}
                                                alt={product.title}
                                                className="w-full h-full object-cover absolute inset-0 opacity-0 group-hover/img:opacity-100 transition-opacity duration-500 ease-out"
                                            />
                                        )}
                                    </>
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">No Image</div>
                                )}
                            </Link>

                            {/* Details */}
                            <div className="flex flex-col gap-1 mb-2.5 sm:mb-4">
                                <span className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-[0.16em] sm:tracking-[0.2em] text-[#888]">{product.category || 'Apparel'}</span>
                                <Link
                                    to={`/product/${product._id}`}
                                    style={{ fontFamily: "'Montserrat', sans-serif" }}
                                    className="text-[11px] sm:text-sm font-bold text-[#111111] uppercase tracking-tight line-clamp-1 hover:opacity-70 transition-opacity"
                                >
                                    {product.title}
                                </Link>
                                <span className="text-[12px] sm:text-base font-black text-[#111111] mt-0.5">
                                    {formatPrice(product.price)}
                                </span>
                            </div>

                            {/* Quick Add CTA */}
                            <button
                                onClick={() => handleAddItem({ productId: product._id, quantity: 1, productTitle: product.title })}
                                disabled={cartLoading}
                                className="w-full bg-[#111111] hover:bg-black text-[#FAF9F6] text-[8px] sm:text-[10px] font-extrabold uppercase tracking-[0.12em] sm:tracking-[0.16em] py-2.5 sm:py-3.5 rounded-full transition-all cursor-pointer shadow-xs disabled:opacity-50"
                            >
                                + Add to Bag
                            </button>
                        </motion.div>
                    )
                })}
            </div>
        </section>
    )
}
