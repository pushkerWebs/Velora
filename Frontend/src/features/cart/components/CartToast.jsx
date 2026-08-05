import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { AnimatePresence, motion } from 'framer-motion'
import { hideToast } from '../state/cart.slice.js'

const CartToast = () => {
    const dispatch = useDispatch()
    const toast = useSelector((state) => state.cart.toast)
    const [progress, setProgress] = useState(100)

    useEffect(() => {
        if (!toast) {
            setProgress(100)
            return
        }

        setProgress(100)
        const duration = 3000
        const interval = 30
        const decrement = (interval / duration) * 100

        const timer = setInterval(() => {
            setProgress((prev) => {
                const next = prev - decrement
                if (next <= 0) {
                    clearInterval(timer)
                    return 0
                }
                return next
            })
        }, interval)

        return () => clearInterval(timer)
    }, [toast])

    return (
        <AnimatePresence>
            {toast && (
                <motion.div
                    key="cart-toast"
                    initial={{ opacity: 0, x: 60, scale: 0.92 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 60, scale: 0.92 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="fixed top-6 right-6 z-[9999] w-[320px] max-w-[calc(100vw-24px)]"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                >
                    <div className="bg-white border border-black/8 rounded-[10px] shadow-2xl overflow-hidden">
                        {/* Toast Body */}
                        <div className="flex items-start gap-3 px-4 py-4">
                            {/* Icon */}
                            {toast.type === 'success' ? (
                                <div className="shrink-0 w-8 h-8 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mt-0.5">
                                    <motion.svg
                                        initial={{ pathLength: 0, opacity: 0 }}
                                        animate={{ pathLength: 1, opacity: 1 }}
                                        transition={{ duration: 0.4, delay: 0.1 }}
                                        className="w-4 h-4 text-emerald-500"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                        strokeWidth={2.5}
                                    >
                                        <motion.path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M5 13l4 4L19 7"
                                        />
                                    </motion.svg>
                                </div>
                            ) : (
                                <div className="shrink-0 w-8 h-8 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mt-0.5">
                                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                            )}

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                                <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-black mb-0.5">
                                    {toast.type === 'success' ? 'Added to Cart!' : 'Could Not Add'}
                                </p>
                                <p className="text-[12px] text-[#747878] leading-snug truncate">
                                    {toast.message}
                                </p>
                            </div>

                            {/* Close button */}
                            <button
                                onClick={() => dispatch(hideToast())}
                                className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[#c4c7c7] hover:text-black hover:bg-gray-100 transition-all cursor-pointer"
                            >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Progress bar */}
                        <div className="h-[3px] bg-gray-100 w-full">
                            <motion.div
                                className={`h-full ${toast.type === 'success' ? 'bg-emerald-400' : 'bg-red-400'}`}
                                style={{ width: `${progress}%` }}
                                transition={{ ease: 'linear' }}
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}

export default CartToast
