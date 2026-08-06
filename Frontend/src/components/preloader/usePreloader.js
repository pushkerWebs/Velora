import { useState, useEffect, useRef } from "react";

const MIN_DURATION = 3500; // 3.5s minimum campaign opening duration
const SESSION_KEY = "velora_preloader_seen";

export const CAMPAIGN_IMAGES = [
  "/finallandingpageimg.png",
  "/model-images/model1.jpg",
  "/model-images/model2.webp",
  "/model-images/model3.webp",
];

export const EDITORIAL_TAGLINES = [
  "NEW COLLECTION 2026",
  "EDITORIAL LOOKS",
  "CURATED FOR MODERN LIVING",
];

export function usePreloader(onAuthCompletePromise) {
  const [shouldShow] = useState(() => {
    try {
      const hasSeen = sessionStorage.getItem(SESSION_KEY);
      return !hasSeen;
    } catch (e) {
      return false;
    }
  });

  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(shouldShow ? "loading" : "complete");
  const [isComplete, setIsComplete] = useState(!shouldShow);

  const isResourcesReadyRef = useRef(false);
  const startTimeRef = useRef(null);
  const rafIdRef = useRef(null);

  useEffect(() => {
    if (!shouldShow) {
      setIsComplete(true);
      setPhase("complete");
      return;
    }

    // Lock body scroll while preloader is active
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let fontLoaded = false;
    let imagesLoaded = false;
    let apiLoaded = false;

    const checkAllResources = () => {
      if ((fontLoaded || document.readyState === "complete") && imagesLoaded && apiLoaded) {
        isResourcesReadyRef.current = true;
      }
    };

    // 1. Google Fonts check
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready
        .then(() => {
          fontLoaded = true;
          checkAllResources();
        })
        .catch(() => {
          fontLoaded = true;
          checkAllResources();
        });
    } else {
      fontLoaded = true;
    }

    // 2. Preload ALL Campaign Images
    let loadedCount = 0;
    CAMPAIGN_IMAGES.forEach((src) => {
      const img = new Image();
      img.onload = img.onerror = () => {
        loadedCount++;
        if (loadedCount >= CAMPAIGN_IMAGES.length) {
          imagesLoaded = true;
          checkAllResources();
        }
      };
      img.src = src;
    });

    // 3. API / Auth check
    if (onAuthCompletePromise) {
      Promise.resolve(onAuthCompletePromise).finally(() => {
        apiLoaded = true;
        checkAllResources();
      });
    } else {
      apiLoaded = true;
    }

    // Fallback: Ensure resources ready after 3.8s max
    const maxFallbackTimer = setTimeout(() => {
      isResourcesReadyRef.current = true;
    }, 3800);

    // Hybrid Progress RAF loop (60fps)
    let currentProgress = 0;
    startTimeRef.current = performance.now();
    let pauseTimer = null;
    let revealTimer = null;

    const updateProgress = (now) => {
      if (prefersReducedMotion) {
        setProgress(100);
        finishLoading();
        return;
      }

      const elapsed = now - startTimeRef.current;
      const isMinTimePassed = elapsed >= MIN_DURATION;
      const isResourceReady = isResourcesReadyRef.current;

      let targetCap = 94; // Pause / crawl naturally around 92-94% if assets still pending
      if (isMinTimePassed && isResourceReady) {
        targetCap = 100;
      }

      // Smooth progression curve:
      let increment = 0.5;
      if (currentProgress < 60) {
        increment = 0.76;
      } else if (currentProgress < 85) {
        increment = 0.36;
      } else if (currentProgress < 94) {
        increment = 0.08;
      } else if (targetCap === 100) {
        increment = 0.65;
      } else {
        increment = 0.01;
      }

      currentProgress = Math.min(targetCap, currentProgress + increment);
      setProgress(Math.floor(currentProgress));

      if (currentProgress >= 100) {
        finishLoading();
      } else {
        rafIdRef.current = requestAnimationFrame(updateProgress);
      }
    };

    const finishLoading = () => {
      try {
        sessionStorage.setItem(SESSION_KEY, "true");
      } catch (e) {}

      // Step 1: Pause at 100% for ~350ms (during which logo subtly scales down)
      setPhase("paused");

      pauseTimer = setTimeout(() => {
        // Step 2: Trigger horizontal curtain reveal animation (800ms easeInOut)
        setPhase("revealing");

        revealTimer = setTimeout(() => {
          // Step 3: Remove loader from DOM, restore scrolling & interactions
          setPhase("complete");
          setIsComplete(true);
          document.body.style.overflow = originalOverflow || "unset";
        }, 800); // 800ms curtain reveal duration (700–900ms range)
      }, 350); // 350ms pause at 100%
    };

    rafIdRef.current = requestAnimationFrame(updateProgress);

    return () => {
      clearTimeout(maxFallbackTimer);
      if (pauseTimer) clearTimeout(pauseTimer);
      if (revealTimer) clearTimeout(revealTimer);
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      document.body.style.overflow = originalOverflow || "unset";
    };
  }, [shouldShow]);

  return { shouldShow, progress, phase, isRevealing: phase === "revealing" || phase === "complete", isComplete };
}
