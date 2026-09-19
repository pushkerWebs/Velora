/**
 * Optimize ImageKit URLs with on-the-fly transformations.
 * Non-ImageKit URLs pass through untouched.
 *
 * @param {string} url - Original image URL
 * @param {number} [width=500] - Target width in pixels
 * @param {number} [quality=80] - JPEG/WebP quality 1-100
 * @returns {string} Optimized URL (or original if not ImageKit)
 */
export function optimizeImageUrl(url, width = 500, quality = 80) {
  if (!url || typeof url !== "string") return url;

  // Only transform ImageKit URLs
  if (!url.includes("ik.imagekit.io")) return url;

  // Don't double-transform
  if (url.includes("?tr=") || url.includes("&tr=")) return url;

  return `${url}?tr=w-${width},q-${quality},f-auto`;
}

/** Detect if the device is likely mobile based on viewport width (cached once). */
let _isMobile = null;
export function isMobileViewport() {
  if (_isMobile === null) {
    _isMobile =
      typeof window !== "undefined" && window.innerWidth < 640;
  }
  return _isMobile;
}

/**
 * Get optimized product card image URL.
 * Mobile: w-360, Desktop: w-500
 */
export function optimizeProductImage(url) {
  const w = isMobileViewport() ? 360 : 500;
  return optimizeImageUrl(url, w, 80);
}
