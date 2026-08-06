import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toggleWishlistApi } from "../../auth/services/auth.api";
import { setUser } from "../../auth/state/auth.slice";

export function useWishlist() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth?.user);

  const [wishlistIds, setWishlistIds] = useState(() => {
    try {
      if (user && Array.isArray(user.wishlist)) {
        const ids = user.wishlist.map((id) => (typeof id === "object" ? id._id || id.id : id));
        localStorage.setItem("velora_wishlist_ids", JSON.stringify(ids));
        return ids;
      }
      const saved = localStorage.getItem("velora_wishlist_ids");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Sync wishlistIds whenever Redux user updates
  useEffect(() => {
    if (user && Array.isArray(user.wishlist)) {
      const ids = user.wishlist.map((id) => (typeof id === "object" ? id._id || id.id : id));
      setWishlistIds(ids);
      localStorage.setItem("velora_wishlist_ids", JSON.stringify(ids));
    }
  }, [user]);

  // Sync state across window tabs / components
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const saved = localStorage.getItem("velora_wishlist_ids");
        setWishlistIds(saved ? JSON.parse(saved) : []);
      } catch (e) {
        console.error(e);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("wishlist-updated", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("wishlist-updated", handleStorageChange);
    };
  }, []);

  const toggleWishlist = async (productId, e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!productId) return;

    if (user) {
      try {
        const res = await toggleWishlistApi(productId);
        if (res.success && Array.isArray(res.wishlist)) {
          const updated = res.wishlist.map((id) => (typeof id === "object" ? id._id || id.id : id));
          localStorage.setItem("velora_wishlist_ids", JSON.stringify(updated));
          setWishlistIds(updated);
          // Keep Redux auth.user in sync so useEffect doesn't overwrite with stale user state!
          dispatch(setUser({ ...user, wishlist: res.wishlist }));
          window.dispatchEvent(new Event("wishlist-updated"));
          return;
        }
      } catch (err) {
        console.error("Wishlist backend sync error:", err);
      }
    }

    // Fallback / guest mode
    try {
      const current = JSON.parse(localStorage.getItem("velora_wishlist_ids") || "[]");
      const exists = current.includes(productId);
      const updated = exists
        ? current.filter((id) => id !== productId)
        : [...current, productId];

      localStorage.setItem("velora_wishlist_ids", JSON.stringify(updated));
      setWishlistIds(updated);
      window.dispatchEvent(new Event("wishlist-updated"));
    } catch (err) {
      console.error("Wishlist toggle error:", err);
    }
  };

  const isWishlisted = (productId) => wishlistIds.includes(productId);

  const clearWishlist = () => {
    try {
      localStorage.removeItem("velora_wishlist_ids");
      setWishlistIds([]);
      if (user) {
        dispatch(setUser({ ...user, wishlist: [] }));
      }
      window.dispatchEvent(new Event("wishlist-updated"));
    } catch (e) {
      console.error(e);
    }
  };

  return { wishlistIds, toggleWishlist, isWishlisted, clearWishlist, setWishlistIds };
}
