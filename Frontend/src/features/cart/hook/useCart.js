import {
  addItem as addItemApi,
  decrementItem as decrementItemApi,
  getCart,
    createCartOrder,
    verifyCartOrder,
    createDirectOrder
} from "../service/cart.api.js";
import { useDispatch, useSelector } from "react-redux";
import {
  setCart,
  setCartLoading,
  showToast,
  hideToast,
} from "../state/cart.slice.js";

export const useCart = () => {
  const dispatch = useDispatch();
  const { items, totalPrice, totalSavings, currency, toast, loading } =
    useSelector((state) => state.cart);

  async function handleAddItem({ productId, quantity = 1, productTitle }) {
    try {
      dispatch(setCartLoading(true));
      const data = await addItemApi({ productId, quantity });

      if (data.success) {
        await handleGetCart();
        dispatch(
          showToast({
            type: "success",
            message: productTitle
              ? `"${productTitle}" added to cart!`
              : data.message || "Item added to cart!",
          }),
        );
        setTimeout(() => dispatch(hideToast()), 3000);
      }
      return data;
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to add item to cart";
      dispatch(showToast({ type: "error", message }));
      setTimeout(() => dispatch(hideToast()), 3000);
      throw err;
    } finally {
      dispatch(setCartLoading(false));
    }
  }

  async function handleDecrementItem({ productId }) {
    try {
      dispatch(setCartLoading(true));
      const data = await decrementItemApi({ productId });
      if (data.success) {
        await handleGetCart();
      }
      return data;
    } catch (err) {
      const message = err?.response?.data?.message || "Failed to update cart";
      dispatch(showToast({ type: "error", message }));
      setTimeout(() => dispatch(hideToast()), 3000);
      throw err;
    } finally {
      dispatch(setCartLoading(false));
    }
  }

  async function handleGetCart() {
    try {
      const data = await getCart();
      if (data.success && data.cart) {
        dispatch(
          setCart({
            items: data.cart.items || [],
            totalPrice: data.cart.totalPrice ?? 0,
            totalSavings: data.cart.totalSavings ?? 0,
            currency: data.cart.currency || "INR",
          }),
        );
      }
      return data;
    } catch (err) {
      console.error("Failed to fetch cart:", err);
    }
  }

  async function handleCreateCartOrder({ couponCode } = {}) {
    const data = await createCartOrder({ couponCode });
    return data;
  }

  async function handleCreateDirectOrder({ productId, quantity = 1, couponCode }) {
    const data = await createDirectOrder({ productId, quantity, couponCode });
    return data;
  }

  async function handleVerifyCartOrder({razorpay_order_id, razorpay_payment_id, razorpay_signature}) {
    const data = await verifyCartOrder({razorpay_order_id, razorpay_payment_id, razorpay_signature});
    return data.success;
  }

  return {
    handleAddItem,
    handleDecrementItem,
    handleGetCart,
    items,
    totalPrice,
    totalSavings,
    currency,
    toast,
    loading,
    handleCreateCartOrder,
    handleCreateDirectOrder,
    handleVerifyCartOrder
  };
};
