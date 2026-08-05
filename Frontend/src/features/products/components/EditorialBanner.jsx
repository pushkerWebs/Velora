import React from "react";
import { motion } from "framer-motion";

export default function EditorialBanner() {
  return (
    <section className="w-full bg-[#f4f2ed] select-none overflow-hidden py-3 sm:py-6 lg:py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full relative overflow-hidden flex items-center justify-center gpu-accelerated"
      >
        <img
          src="/banner.png"
          alt="Editorial Campaign Banner"
          loading="lazy"
          decoding="async"
          className="w-full h-auto max-h-[90vh] object-contain md:object-cover object-center pointer-events-none"
        />
      </motion.div>
    </section>
  );
}
