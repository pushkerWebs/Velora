import React, { createContext, useContext, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router";
import Lenis from "lenis";
import Navbar from "../features/products/components/Navbar.jsx";

export const LenisContext = createContext(null);
export const useLenis = () => useContext(LenisContext);

export default function SmoothScroll() {
  const lenisRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    // Check user preference for reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Initialize modern Lenis with tuned momentum parameters
    const lenis = new Lenis({
      autoRaf: true,
      anchors: true,
      smoothWheel: !prefersReducedMotion,
      lerp: 0.085,             // Silky, responsive interpolation (no floaty delay)
      wheelMultiplier: 0.9,     // Controlled, elegant momentum
      touchMultiplier: 1.0,     // 1:1 touch ratio
      syncTouch: false,         // Never hijack native mobile/trackpad gestures
      autoResize: true,
      stopInertiaOnNavigate: true,
      respectReducedMotion: true,
    });

    lenisRef.current = lenis;
    window.__lenis = lenis;

    return () => {
      lenis.destroy();
      lenisRef.current = null;
      window.__lenis = null;
    };
  }, []);

  // Instant scroll-to-top on route navigation without animation drift
  useEffect(() => {
    if (lenisRef.current) {
      if (!location.hash) {
        lenisRef.current.scrollTo(0, { immediate: true });
      }
    }
  }, [location.pathname]);

  return (
    <LenisContext.Provider value={lenisRef}>
      <Navbar />
      <Outlet />
    </LenisContext.Provider>
  );
}
