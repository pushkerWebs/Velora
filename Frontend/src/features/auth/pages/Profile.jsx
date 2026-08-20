import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import { useAuth } from "../hook/useAuth.js";
import { useWishlist } from "../../products/hook/useWishlist.js";
import { useProduct } from "../../products/hook/useProduct.js";
import { useCart } from "../../cart/hook/useCart.js";
import { updateProfileApi } from "../services/auth.api.js";
import { getUserOrders } from "../../cart/service/cart.api.js";
import { setUser } from "../state/auth.slice.js";
import { motion, AnimatePresence } from "framer-motion";
import Footer from "../../products/components/Footer.jsx";

// Helper function to format price
const formatPrice = (priceVal, currencyVal = "INR") => {
  if (priceVal == null) return "";
  const amount = typeof priceVal === "object" ? priceVal.amount : priceVal;
  const currency = typeof priceVal === "object" ? (priceVal.currency || currencyVal) : currencyVal;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
};

// ── SVG Icon Primitives ──────────────────────────────────────────────────────────
const MapPinIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const BoxIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
  </svg>
);

const CouponIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a2.25 2.25 0 003.182 0l4.318-4.318a2.25 2.25 0 000-3.182L11.16 3.659A2.25 2.25 0 009.568 3z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 7.5h.008v.008H6V7.5z" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
  </svg>
);

const UserDetailsIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export default function Profile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, handleLogout } = useAuth();
  const { wishlistIds, toggleWishlist } = useWishlist();
  const { handleGetAllProducts } = useProduct();
  const { handleAddItem, loading: cartLoading } = useCart();
  const allProducts = useSelector((state) => state.product?.products) || [];

  // Form states
  const [fullname, setFullname] = useState(user?.fullname || "");
  const [contact, setContact] = useState(user?.contact || "");
  const [address, setAddress] = useState(user?.address || "");
  const [isEditing, setIsEditing] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");

  // Orders state
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Active section tab
  const [activeTab, setActiveTab] = useState("orders");

  // Copy code states
  const [copiedCode, setCopiedCode] = useState("");

  // Populate form states when user info changes
  useEffect(() => {
    if (user) {
      setFullname(user.fullname || "");
      setContact(user.contact || "");
      setAddress(user.address || "");
    }
  }, [user]);

  // Load orders and products on mount
  useEffect(() => {
    const initData = async () => {
      try {
        setOrdersLoading(true);
        const data = await getUserOrders();
        if (data.success && data.orders) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error("Error loading user orders:", err);
      } finally {
        setOrdersLoading(false);
      }

      try {
        await handleGetAllProducts();
      } catch (err) {
        console.error("Error loading catalogue products:", err);
      }
    };

    if (user) {
      initData();
    }
  }, [user]);

  // Filter wishlist products
  const wishlistProducts = allProducts.filter((p) => wishlistIds.includes(p._id));

  // Profile update submit handler
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormSuccess("");
    setFormError("");

    try {
      const response = await updateProfileApi({ fullname, contact, address });
      if (response.success && response.user) {
        dispatch(setUser(response.user));
        setFormSuccess("Profile updated successfully.");
        setIsEditing(false);
      } else {
        setFormError(response.message || "Failed to update profile.");
      }
    } catch (err) {
      console.error(err);
      setFormError(err?.response?.data?.message || "An error occurred while updating profile.");
    } finally {
      setFormLoading(false);
    }
  };

  // Copy code utility
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  // Coupons data
  const coupons = [
    { code: "VELORA10", discount: "10% OFF", desc: "For new customers on topwear, denim & linen", min: "No Minimum" },
    { code: "VELORASTYLE", discount: "15% OFF", desc: "On premium collections", min: "Orders above ₹2,999" },
  ];

  return (
    <div
      className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#111111] antialiased overflow-x-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="max-w-[1440px] mx-auto w-full pt-[85px] sm:pt-[105px] lg:pt-[120px] pb-20 px-4 sm:px-6 lg:px-12 flex-1">
        {/* Welcome Banner */}
        <div className="border-b border-[#E5E5E5] pb-6 mb-8 flex items-end justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-[0.25em] text-[#888]">
              WELCOME BACK,
            </span>
            <h1
              style={{ fontFamily: "'Montserrat', sans-serif" }}
              className="text-[26px] sm:text-[36px] font-bold uppercase tracking-[0.08em] text-[#111111] leading-none mt-1"
            >
              {user?.fullname}
            </h1>
          </div>
        </div>

        {/* Dashboard Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ────────────────────────────────────────────────────────
              LEFT COLUMN: Profile Card & Navigation Tabs (4 cols)
          ─────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Info Summary Panel */}
            <div className="bg-white rounded-2xl border border-[#E5E5E5] p-6 shadow-xs">
              <h2
                style={{ fontFamily: "'Montserrat', sans-serif" }}
                className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#111] border-b border-[#F3F4F6] pb-3 mb-4"
              >
                Account Details
              </h2>
              
              <div className="flex flex-col gap-4 text-xs">
                <div>
                  <span className="text-[#888] block text-[10px] uppercase font-bold tracking-[0.12em] mb-0.5">Email Address</span>
                  <span className="font-semibold text-[#111] break-all">{user?.email}</span>
                </div>
                <div>
                  <span className="text-[#888] block text-[10px] uppercase font-bold tracking-[0.12em] mb-0.5">Contact Number</span>
                  <span className="font-semibold text-[#111]">{user?.contact || "Not provided"}</span>
                </div>
                <div>
                  <span className="text-[#888] block text-[10px] uppercase font-bold tracking-[0.12em] mb-0.5">Shipping Address</span>
                  <p className="font-semibold text-[#111] leading-relaxed whitespace-pre-wrap">
                    {user?.address || "No shipping address added yet."}
                  </p>
                </div>
              </div>
            </div>

            {/* Sticky Navigation / Filter Tabs */}
            <div className="bg-white rounded-2xl border border-[#E5E5E5] p-2 flex flex-col gap-1 shadow-xs">
              <button
                onClick={() => setActiveTab("orders")}
                className={`flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-[0.15em] rounded-xl transition-all cursor-pointer ${
                  activeTab === "orders" ? "bg-[#111] text-white" : "text-[#555] hover:bg-[#F9F9F9] hover:text-black"
                }`}
              >
                <BoxIcon />
                <span>Orders History ({orders.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("address")}
                className={`flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-[0.15em] rounded-xl transition-all cursor-pointer ${
                  activeTab === "address" ? "bg-[#111] text-white" : "text-[#555] hover:bg-[#F9F9F9] hover:text-black"
                }`}
              >
                <MapPinIcon />
                <span>Edit Address & Details</span>
              </button>

              <button
                onClick={() => setActiveTab("wishlist")}
                className={`flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-[0.15em] rounded-xl transition-all cursor-pointer ${
                  activeTab === "wishlist" ? "bg-[#111] text-white" : "text-[#555] hover:bg-[#F9F9F9] hover:text-black"
                }`}
              >
                <HeartIcon />
                <span>My Wishlist ({wishlistIds.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("rewards")}
                className={`flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-[0.15em] rounded-xl transition-all cursor-pointer ${
                  activeTab === "rewards" ? "bg-[#111] text-white" : "text-[#555] hover:bg-[#F9F9F9] hover:text-black"
                }`}
              >
                <CouponIcon />
                <span>Coupons & Promos</span>
              </button>

              <button
                onClick={() => handleLogout()}
                className="flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-[0.15em] rounded-xl transition-all cursor-pointer text-red-600 hover:bg-red-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>

          {/* ────────────────────────────────────────────────────────
              RIGHT COLUMN: Tab Content Display (8 cols)
          ─────────────────────────────────────────────────────────── */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              
              {/* Tab 1: Orders History */}
              {activeTab === "orders" && (
                <motion.div
                  key="orders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-6"
                >
                  <h2 style={{ fontFamily: "'Montserrat', sans-serif" }} className="text-xl font-bold uppercase tracking-wider text-[#111]">
                    Orders History
                  </h2>

                  {ordersLoading ? (
                    <div className="flex flex-col gap-4 animate-pulse">
                      {[1, 2].map((i) => (
                        <div key={i} className="bg-white border border-[#E5E5E5] rounded-2xl h-[180px] w-full" />
                      ))}
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-[#E5E5E5] p-10 text-center flex flex-col items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#F5F5F5] flex items-center justify-center border border-[#E5E5E5]">
                        <BoxIcon />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-[#111] mb-1">No Orders Found</h3>
                        <p className="text-xs text-[#666] font-light max-w-sm">
                          You haven't placed any orders yet. Explore our luxury collection to place your first order.
                        </p>
                      </div>
                      <Link
                        to="/products"
                        className="bg-[#111] text-white text-[9px] font-bold uppercase tracking-[0.2em] px-6 py-2.5 rounded-full hover:bg-black transition-colors mt-2"
                      >
                        Start Shopping →
                      </Link>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-5">
                      {orders.map((order) => {
                        const orderDate = new Date(order.createdAt || Date.now());
                        // Delivery arrival is exactly 7 days after the product was ordered
                        const expectedArrival = new Date(orderDate.getTime() + 7 * 24 * 60 * 60 * 1000);
                        const formattedEta = expectedArrival.toLocaleDateString("en-IN", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        });

                        return (
                          <div key={order._id} className="bg-white border border-[#E5E5E5] rounded-2xl overflow-hidden shadow-xs hover:border-[#aaa] transition-all">
                            {/* Order Summary Head */}
                            <div className="bg-[#FAF9F6] border-b border-[#E5E5E5] px-5 py-4 flex flex-wrap items-center justify-between gap-4 text-xs">
                              <div className="flex gap-4 sm:gap-6 flex-wrap">
                                <div>
                                  <span className="text-[9px] uppercase font-bold tracking-[0.12em] text-[#888] block mb-0.5">Order Placed</span>
                                  <span className="font-semibold">{orderDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] uppercase font-bold tracking-[0.12em] text-[#888] block mb-0.5">Total Amount</span>
                                  <span className="font-extrabold">{formatPrice(order.price)}</span>
                                </div>
                                <div>
                                  <span className="text-[9px] uppercase font-bold tracking-[0.12em] text-[#888] block mb-0.5">Status</span>
                                  <span className="text-[#065F46] font-bold bg-[#065F46]/10 px-2 py-0.5 rounded-sm uppercase text-[9px] tracking-wider">
                                    {order.status}
                                  </span>
                                </div>
                              </div>
                              <div>
                                <span className="text-[9px] uppercase font-bold tracking-[0.12em] text-[#888] block mb-0.5">Order Reference</span>
                                <span className="font-mono text-[10px] font-bold uppercase">{order.razorpay?.paymentId || order._id.slice(-10)}</span>
                              </div>
                            </div>

                            {/* Expected Arrival Banner */}
                            <div className="bg-[#ECFDF5] border-b border-[#D1FAE5] px-5 py-2.5 flex items-center gap-2 text-xs text-[#065F46] font-semibold">
                              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>Expected Delivery Arrival: <strong className="text-black underline">{formattedEta}</strong> (7 Days from Order Date)</span>
                            </div>

                            {/* Order Items List */}
                            <div className="p-5 flex flex-col gap-4">
                              {order.orderItems?.map((item, idx) => {
                                const itemImg = typeof item.images?.[0] === "string" ? item.images[0] : item.images?.[0]?.url;
                                return (
                                  <Link
                                    key={idx}
                                    to={`/product/${item.productId}`}
                                    className="flex gap-4 items-start pb-4 border-b border-[#F3F4F6] last:border-0 last:pb-0 group/item hover:opacity-85 transition-opacity cursor-pointer"
                                  >
                                    <div className="w-16 h-20 bg-[#F4F3F3] rounded-lg overflow-hidden border border-black/5 shrink-0">
                                      <img
                                        src={itemImg || "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=200&q=80"}
                                        alt={item.title}
                                        className="w-full h-full object-cover group-hover/item:scale-102 transition-transform duration-300"
                                        onError={(e) => {
                                          e.target.src = "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=200&q=80";
                                        }}
                                      />
                                    </div>
                                    <div className="flex-1 flex flex-col gap-1 text-xs">
                                      <span className="text-[9px] uppercase font-bold tracking-[0.16em] text-[#888]">{item.category}</span>
                                      <h4 className="font-bold text-[#111] line-clamp-1 group-hover/item:underline">{item.title}</h4>
                                      <div className="flex items-center gap-4 text-xs text-[#666] mt-0.5">
                                        <span>Quantity: <strong className="text-black">{item.quantity}</strong></span>
                                        <span>Price: <strong className="text-black">{formatPrice(item.price)}</strong></span>
                                      </div>
                                    </div>
                                  </Link>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Tab 2: Edit Address & Details */}
              {activeTab === "address" && (
                <motion.div
                  key="address"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-2xl border border-[#E5E5E5] p-6 sm:p-8 shadow-xs"
                >
                  <div className="flex justify-between items-center border-b border-[#F3F4F6] pb-4 mb-6">
                    <h2 style={{ fontFamily: "'Montserrat', sans-serif" }} className="text-lg font-bold uppercase tracking-wider text-[#111]">
                      Profile Details & Address
                    </h2>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="text-[10px] font-extrabold uppercase tracking-[0.15em] border border-[#111] px-4 py-2 hover:bg-[#111] hover:text-white transition-all rounded-full cursor-pointer"
                      >
                        Edit Info
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5 text-xs">
                    {formSuccess && (
                      <div className="bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] p-3 rounded-lg font-semibold text-center">
                        {formSuccess}
                      </div>
                    )}
                    {formError && (
                      <div className="bg-[#FEF2F2] text-[#B91C1C] border border-[#FCA5A5] p-3 rounded-lg font-semibold text-center">
                        {formError}
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] uppercase font-bold tracking-[0.15em] text-[#666] mb-1.5">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={fullname}
                          disabled={!isEditing}
                          onChange={(e) => setFullname(e.target.value)}
                          className={`w-full border border-[#D1D5DB] rounded-lg px-3.5 py-2.5 text-[#111] focus:outline-none focus:border-black transition-all ${
                            !isEditing ? "bg-[#F3F4F6] text-[#777] cursor-not-allowed" : "bg-white"
                          }`}
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-bold tracking-[0.15em] text-[#666] mb-1.5">
                          Contact Number
                        </label>
                        <input
                          type="text"
                          required
                          value={contact}
                          disabled={!isEditing}
                          onChange={(e) => setContact(e.target.value)}
                          className={`w-full border border-[#D1D5DB] rounded-lg px-3.5 py-2.5 text-[#111] focus:outline-none focus:border-black transition-all ${
                            !isEditing ? "bg-[#F3F4F6] text-[#777] cursor-not-allowed" : "bg-white"
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase font-bold tracking-[0.15em] text-[#666] mb-1.5">
                        Email Address (Cannot be modified)
                      </label>
                      <input
                        type="email"
                        disabled
                        value={user?.email || ""}
                        className="w-full border border-[#D1D5DB] rounded-lg px-3.5 py-2.5 bg-[#F3F4F6] text-[#777] cursor-not-allowed focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase font-bold tracking-[0.15em] text-[#666] mb-1.5">
                        Shipping Address
                      </label>
                      <textarea
                        required
                        rows="4"
                        value={address}
                        disabled={!isEditing}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Enter your street address, city, state, postal code, and country"
                        className={`w-full border border-[#D1D5DB] rounded-lg px-3.5 py-2.5 text-[#111] focus:outline-none focus:border-black transition-all resize-none leading-relaxed ${
                          !isEditing ? "bg-[#F3F4F6] text-[#777] cursor-not-allowed" : "bg-white"
                        }`}
                      />
                    </div>

                    {isEditing && (
                      <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-[#F3F4F6]">
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setFullname(user?.fullname || "");
                            setContact(user?.contact || "");
                            setAddress(user?.address || "");
                            setFormError("");
                            setFormSuccess("");
                          }}
                          className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#666] hover:text-black px-5 py-2.5 transition-all rounded-full cursor-pointer border border-[#E5E5E5] bg-white active:scale-95"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={formLoading}
                          className="text-[10px] font-bold uppercase tracking-[0.15em] text-white bg-[#111] hover:bg-black px-6 py-2.5 transition-all rounded-full cursor-pointer disabled:opacity-50 active:scale-95"
                        >
                          {formLoading ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    )}
                  </form>
                </motion.div>
              )}

              {/* Tab 3: My Wishlist */}
              {activeTab === "wishlist" && (
                <motion.div
                  key="wishlist"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-6"
                >
                  <div className="flex justify-between items-end border-b border-[#E5E5E5] pb-4">
                    <h2 style={{ fontFamily: "'Montserrat', sans-serif" }} className="text-xl font-bold uppercase tracking-wider text-[#111]">
                      My Wishlist
                    </h2>
                    <Link
                      to="/wishlist"
                      className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-[#111] hover:underline"
                    >
                      Manage Wishlist Page →
                    </Link>
                  </div>

                  {wishlistProducts.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-[#E5E5E5] p-10 text-center flex flex-col items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-[#F5F5F5] flex items-center justify-center border border-[#E5E5E5] text-red-500/80">
                        <HeartIcon />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-wider text-[#111] mb-1">Your Wishlist is Empty</h3>
                        <p className="text-xs text-[#666] font-light max-w-sm">
                          Save items you love here to easily purchase them later.
                        </p>
                      </div>
                      <Link
                        to="/products"
                        className="bg-[#111] text-white text-[9px] font-bold uppercase tracking-[0.2em] px-6 py-2.5 rounded-full hover:bg-black transition-colors mt-2"
                      >
                        Explore Catalogue →
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {wishlistProducts.map((product) => {
                        const primaryImage = typeof product?.images?.[0] === "string" ? product.images[0] : product?.images?.[0]?.url;
                        const price = typeof product?.price === "object" ? product.price.amount : product?.price || 0;
                        const formattedPrice = formatPrice(price, product.price?.currency || "INR");

                        return (
                          <div key={product._id} className="bg-white border border-[#E5E5E5] rounded-xl overflow-hidden flex flex-col justify-between group relative p-3">
                            <div>
                              <Link
                                to={`/product/${product._id}`}
                                className="aspect-[4/5] bg-[#F4F3F3] rounded-lg overflow-hidden border border-black/5 block relative mb-3 cursor-pointer"
                              >
                                <img
                                  src={primaryImage || "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=400&q=80"}
                                  alt={product.title}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                  onError={(e) => {
                                    e.target.src = "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=400&q=80";
                                  }}
                                />
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    toggleWishlist(product._id);
                                  }}
                                  className="absolute top-2 right-2 w-7 h-7 bg-white text-red-500 rounded-full flex items-center justify-center shadow-md active:scale-90 cursor-pointer border border-red-500/10"
                                >
                                  ✕
                                </button>
                              </Link>
                              
                              <div className="flex flex-col gap-0.5 text-xs px-0.5">
                                <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#888]">VELORA</span>
                                <h4 className="font-bold text-[#111] line-clamp-1">{product.title}</h4>
                                <span className="font-extrabold text-[#111] mt-0.5">{formattedPrice}</span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleAddItem({ productId: product._id, quantity: 1, productTitle: product.title })}
                              disabled={cartLoading}
                              className="w-full bg-[#111] hover:bg-black text-white text-[9px] font-bold uppercase tracking-[0.16em] py-2.5 rounded-full transition-all cursor-pointer mt-3 disabled:opacity-50 active:scale-95"
                            >
                              Add to Bag →
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Tab 4: Rewards & Coupons */}
              {activeTab === "rewards" && (
                <motion.div
                  key="rewards"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-6"
                >
                  <div className="flex justify-between items-end border-b border-[#E5E5E5] pb-4">
                    <h2 style={{ fontFamily: "'Montserrat', sans-serif" }} className="text-xl font-bold uppercase tracking-wider text-[#111]">
                      Available Coupons & Promos
                    </h2>
                  </div>

                  {/* Active Coupons Grid */}
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {coupons.map((coupon) => (
                        <div key={coupon.code} className="bg-white border border-[#E5E5E5] rounded-xl p-5 flex flex-col justify-between hover:border-[#111] transition-all shadow-xs relative overflow-hidden">
                          <div className="absolute right-0 top-0 bg-[#f59e0b]/10 text-[#d97706] text-[8px] font-bold uppercase tracking-[0.16em] px-3 py-1 rounded-bl-lg">
                            ACTIVE
                          </div>
                          
                          <div>
                            <span className="text-lg font-extrabold text-[#111] block mb-1">{coupon.discount}</span>
                            <span className="font-bold text-xs uppercase tracking-wider text-black font-mono block mb-2">{coupon.code}</span>
                            <p className="text-xs text-[#666] leading-relaxed font-light mb-1">{coupon.desc}</p>
                            <span className="text-[10px] text-[#888] font-semibold block">{coupon.min}</span>
                          </div>

                          <div className="mt-4 pt-4 border-t border-[#F3F4F6]">
                            <button
                              onClick={() => handleCopyCode(coupon.code)}
                              className={`w-full py-2.5 rounded-lg text-[9px] font-bold uppercase tracking-[0.18em] transition-all cursor-pointer text-center ${
                                copiedCode === coupon.code
                                  ? "bg-[#065F46] text-white"
                                  : "bg-[#F3F4F6] text-[#111] hover:bg-[#111] hover:text-white"
                              }`}
                            >
                              {copiedCode === coupon.code ? "COPIED CODE!" : "COPY PROMO CODE"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
