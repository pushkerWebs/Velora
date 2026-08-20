import React, { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router";
import Lenis from "lenis";
import Navbar from "../features/products/components/Navbar.jsx";

export default function SmoothScroll() {
  const lenisRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    // Initialize Lenis smooth scroll with enhanced gliding latency (silky luxury style)
    const lenis = new Lenis({
      duration: 1.6, // Longer duration for a more noticeable smooth glide
      easing: (t) => 1 - Math.pow(1 - t, 5), // Quintic ease-out for ultra smooth deceleration
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.3, // Stronger scroll wheel glide
      touchMultiplier: 1.5, // Silkier trackpad/touch momentum
      infinite: false,
    });

    lenisRef.current = lenis;
    window.__lenis = lenis;

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Delegate smooth scrolling for all anchor links (#shop, #details, etc.)
    const handleAnchorClick = (e) => {
      const anchor = e.target.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (href && href.startsWith("#") && href.length > 1) {
        const targetElement = document.querySelector(href);
        if (targetElement) {
          e.preventDefault();
          lenis.scrollTo(targetElement, { offset: 0, duration: 1.2 });
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener("click", handleAnchorClick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Scroll to top and recalculate dimensions on page route navigation
  useEffect(() => {
    if (lenisRef.current) {
      if (!location.hash) {
        lenisRef.current.scrollTo(0, { immediate: true });
      }
      // Re-sync Lenis scroll height tracking as content renders
      lenisRef.current.resize();
      const timer = setTimeout(() => {
        lenisRef.current?.resize();
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [location.pathname]);

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}
