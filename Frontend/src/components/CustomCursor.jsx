import React, { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

export default function CustomCursor() {
  const [cursorState, setCursorState] = useState("default"); // "default" | "hover" | "view" | "text"
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Motion values for smooth position updates (prevents component re-renders on mousemove)
  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  // Springs for luxury inertia lag
  const springConfig = { damping: 35, stiffness: 300, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Detect mobile / touch devices
    const checkTouch = () => {
      setIsTouchDevice(
        window.matchMedia("(pointer: coarse)").matches ||
        "ontouchstart" in window ||
        navigator.maxTouchPoints > 0
      );
    };
    checkTouch();

    if (isTouchDevice) return;

    // Track mouse move
    const handleMouseMove = (e) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      if (!isVisible) setIsVisible(true);
    };

    // Track mouse enter/leave window
    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    // Event delegation to detect hovered element types
    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target) return;

      // 1. Text Selection / Inputs
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable ||
        target.closest("input, textarea, select, [contenteditable], .flatpickr-calendar")
      ) {
        setCursorState("text");
        return;
      }

      // 2. Product / Editorial Image Hover (VIEW state)
      const isProductImg = target.closest(
        '[data-cursor="view"], .product-image-container, .product-card img, .recommended-product-img, .category-card img'
      );
      if (isProductImg) {
        setCursorState("view");
        return;
      }

      // 3. Interactive Elements (buttons, links, clickable tags)
      const isInteractive = target.closest(
        'a, button, [role="button"], input[type="submit"], input[type="button"], .interactive, .cursor-pointer'
      );
      if (isInteractive) {
        setCursorState("hover");
        return;
      }

      // 4. Default state
      setCursorState("default");
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);
    document.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
      document.removeEventListener("mouseover", handleMouseOver);
    };
  }, [isVisible, isTouchDevice, mouseX, mouseY]);

  // Dynamically toggle body class to hide standard desktop cursor
  useEffect(() => {
    if (isTouchDevice) return;
    
    if (isVisible && cursorState !== "text") {
      document.documentElement.classList.add("custom-cursor-active");
    } else {
      document.documentElement.classList.remove("custom-cursor-active");
    }

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
    };
  }, [isVisible, cursorState, isTouchDevice]);

  if (isTouchDevice || !isVisible) return null;

  // Outer ring animations based on state
  const outerVariants = {
    default: {
      width: 24,
      height: 24,
      backgroundColor: "rgba(255, 255, 255, 0)",
      borderColor: "rgba(255, 255, 255, 0.4)",
      borderWidth: 1,
    },
    hover: {
      width: 32,
      height: 32,
      backgroundColor: "rgba(255, 255, 255, 0.08)",
      borderColor: "rgba(255, 255, 255, 0.8)",
      borderWidth: 1.2,
    },
    view: {
      width: 72,
      height: 72,
      backgroundColor: "#ffffff",
      borderColor: "#ffffff",
      borderWidth: 0,
    },
    text: {
      width: 0,
      height: 0,
      opacity: 0,
    },
  };

  // Inner dot animations based on state
  const innerVariants = {
    default: {
      scale: 1,
      opacity: 1,
    },
    hover: {
      scale: 0.5,
      opacity: 0.8,
    },
    view: {
      scale: 0,
      opacity: 0,
    },
    text: {
      scale: 0,
      opacity: 0,
    },
  };

  return (
    <>
      {/* Outer Ring */}
      <motion.div
        className="fixed top-0 left-0 rounded-full pointer-events-none z-[999998] flex items-center justify-center border border-solid border-white mix-blend-difference"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        variants={outerVariants}
        animate={cursorState}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 30,
          mass: 0.2,
        }}
      >
        {/* VIEW text overlay inside outer ring */}
        <AnimatePresence>
          {cursorState === "view" && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="text-[9px] font-black tracking-[0.25em] text-black uppercase select-none font-sans pl-[0.25em]"
            >
              VIEW
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Inner Dot */}
      <motion.div
        className="fixed top-0 left-0 w-1.5 h-1.5 bg-white rounded-full pointer-events-none z-[999999] mix-blend-difference"
        style={{
          x: mouseX,
          y: mouseY,
          translateX: "-50%",
          translateY: "-50%",
        }}
        variants={innerVariants}
        animate={cursorState}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 28,
        }}
      />
    </>
  );
}
