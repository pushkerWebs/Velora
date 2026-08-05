import React from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";

const CATEGORIES = [
  {
    id: "men",
    label: "Men",
    tagline: "Structured silhouettes. Effortless edge.",
    img: "https://images.unsplash.com/photo-1617196034183-421b4917c92d?auto=format&fit=crop&w=800&q=80",
    fallback: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "women",
    label: "Women",
    tagline: "Minimal power. Maximum presence.",
    img: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80",
    fallback: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "kids",
    label: "Kids",
    tagline: "Playful. Comfortable. Effortlessly cool.",
    img: "https://images.unsplash.com/photo-1503944583220-79d4dd712bcd?auto=format&fit=crop&w=800&q=80",
    fallback: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "sneakers",
    label: "Sneakers",
    tagline: "Ground-level luxury. Every step.",
    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
    fallback: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=800&q=80",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
};

export default function CategorySection() {
  const navigate = useNavigate();

  return (
    <section id="categories" className="bg-white py-20 lg:py-28 select-none">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        {/* Cards grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5"
        >
          {CATEGORIES.map((cat) => (
            <motion.div
              key={cat.id}
              variants={cardVariants}
              onClick={() => navigate(`/products?category=${cat.label}`)}
              className="group relative overflow-hidden rounded-[20px] cursor-pointer bg-[#f5f5f5] gpu-accelerated"
              style={{ aspectRatio: "3 / 4" }}
            >
              {/* Image */}
              <img
                src={cat.img}
                alt={cat.label}
                loading="lazy"
                decoding="async"
                onError={(e) => { e.target.src = cat.fallback; }}
                className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.07] transform-gpu"
              />

              {/* Dark overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent opacity-70 transition-opacity duration-500 group-hover:opacity-90" />

              {/* Content */}
              <div className="absolute inset-0 flex flex-col justify-end p-5 lg:p-6">
                {/* Category label always visible */}
                <h3
                  className="text-white text-[18px] lg:text-[22px] font-black tracking-[-0.01em] mb-1"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {cat.label}
                </h3>

                {/* Tagline fades in */}
                <p className="text-white/70 text-[11px] font-medium leading-relaxed mb-4 opacity-0 translate-y-2 transition-all duration-500 group-hover:opacity-100 group-hover:translate-y-0">
                  {cat.tagline}
                </p>

                {/* Shop Now — slides up */}
                <div className="translate-y-4 opacity-0 transition-all duration-400 group-hover:translate-y-0 group-hover:opacity-100">
                  <button className="bg-white text-[#111] text-[10px] font-bold uppercase tracking-[0.18em] px-5 py-2.5 rounded-[12px] hover:bg-[#f0f0f0] transition-colors duration-200 active:scale-95 cursor-pointer">
                    Shop Now
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
