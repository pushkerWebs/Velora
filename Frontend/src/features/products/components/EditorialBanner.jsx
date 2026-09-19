import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function EditorialBanner() {
  const sectionRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    let inView = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
      },
      { rootMargin: "100px" }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    const handleScroll = () => {
      if (!inView || !sectionRef.current || !imageRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const windowH = window.innerHeight || 800;
      // Center delta from -1 to 1
      const centerDelta = (rect.top + rect.height / 2 - windowH / 2) / (windowH / 2);
      const parallaxY = Math.max(-18, Math.min(18, centerDelta * 18));
      imageRef.current.style.transform = `translate3d(0, ${parallaxY}px, 0) scale(1.03)`;
    };

    const lenis = window.__lenis;
    if (lenis && typeof lenis.on === "function") {
      lenis.on("scroll", handleScroll);
      return () => {
        lenis.off("scroll", handleScroll);
        observer.disconnect();
      };
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <section ref={sectionRef} className="w-full bg-[#f4f2ed] select-none overflow-hidden py-3 sm:py-6 lg:py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full relative overflow-hidden flex items-center justify-center gpu-accelerated"
      >
        <img
          ref={imageRef}
          src="/banner.webp"
          alt="Editorial Campaign Banner"
          loading="lazy"
          decoding="async"
          className="w-full h-auto max-h-[90vh] object-contain md:object-cover object-center pointer-events-none will-change-transform"
        />
      </motion.div>
    </section>
  );
}
