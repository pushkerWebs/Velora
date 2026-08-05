import React, { useEffect, useState } from "react";
import { useProduct } from "../hook/useProduct.js";
import { useAuth } from "../../auth/hook/useAuth.js";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router";

const DEFAULT_SIZES = ["XS", "S", "M", "L", "XL"];
const JEANS_SIZES = ["28", "30", "32", "34"];


// ── Inline Edit Modal ──────────────────────────────────────────────────────────
function EditProductModal({ product, onClose, onSave }) {
  const [form, setForm] = useState({
    title: product.title,
    description: product.description,
    price: product.price?.amount ?? "",
    currency: product.price?.currency ?? "INR",
    category: product.category ?? "T-Shirts",
  });

  const [sizes, setSizes] = useState(() => {
    const map = {};
    (product.sizes || []).forEach((s) => (map[s.label] = s.available));
    const labels = product.category === "Jeans" ? JEANS_SIZES : DEFAULT_SIZES;
    return labels.map((label) => ({
      label,
      available: map[label] !== undefined ? map[label] : true,
    }));
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => {
      const updated = { ...p, [name]: value };
      if (name === "category") {
        const labels = value === "Jeans" ? JEANS_SIZES : DEFAULT_SIZES;
        const map = {};
        sizes.forEach((s) => (map[s.label] = s.available));
        setSizes(labels.map((label) => ({
          label,
          available: map[label] !== undefined ? map[label] : true,
        })));
      }
      return updated;
    });
  };

  const toggleSize = (label) => {
    setSizes((prev) =>
      prev.map((s) => (s.label === label ? { ...s, available: !s.available } : s))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError("Title is required.");
    if (!form.description.trim()) return setError("Description is required.");
    if (!form.price || isNaN(form.price)) return setError("Enter a valid price.");
    setError(null);
    setSaving(true);
    try {
      await onSave(product._id, {
        title: form.title.trim(),
        description: form.description.trim(),
        price: form.price,
        currency: form.currency,
        category: form.category,
        sizes,
      });
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm p-4 sm:p-6 flex items-center justify-center min-h-screen py-8">
      <div
        className="bg-[#e4e6eb] border border-[#c4c7c7] w-full max-w-[520px] rounded-[8px] flex flex-col my-auto shadow-2xl overflow-hidden max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e4e4e7] shrink-0">
          <h2
            style={{ fontFamily: "'Montserrat', sans-serif" }}
            className="text-[16px] font-bold tracking-tight text-black"
          >
            Edit Product
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f3f3f4] text-[#747878] hover:text-black transition-colors text-lg font-bold"
          >
            ×
          </button>
        </div>

        {/* Body — scrollable */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4 max-h-[calc(85vh-130px)]"
        >
          {error && (
            <div className="px-4 py-3 bg-[#ffdad6] border border-[#ba1a1a] rounded text-[#93000a] text-xs font-medium">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#747878]">
              Title
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              className="w-full border border-[#e4e4e7] rounded-[4px] bg-white px-4 py-2.5 text-[14px] text-[#1a1c1c] outline-none focus:border-[#1a1a1a] transition-colors"
            />
          </div>

          {/* Category */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#747878]">
              Category
            </label>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              className="w-full border border-[#e4e4e7] rounded-[4px] bg-white px-4 py-2.5 text-[14px] text-[#1a1c1c] appearance-none outline-none focus:border-[#1a1a1a] transition-colors cursor-pointer"
            >
              <option value="T-Shirts">T-Shirts</option>
              <option value="Jeans">Jeans</option>
              <option value="Shirts">Shirts</option>
            </select>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#747878]">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={3}
              className="w-full border border-[#e4e4e7] rounded-[4px] bg-white px-4 py-2.5 text-[14px] text-[#1a1c1c] resize-none outline-none focus:border-[#1a1a1a] transition-colors"
            />
          </div>

          {/* Price + Currency */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#747878]">
                Price
              </label>
              <input
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={form.price}
                onChange={handleChange}
                onWheel={(e) => e.target.blur()}
                className="w-full border border-[#e4e4e7] rounded-[4px] bg-white px-4 py-2.5 text-[14px] text-[#1a1c1c] outline-none focus:border-[#1a1a1a] transition-colors"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#747878]">
                Currency
              </label>
              <select
                name="currency"
                value={form.currency}
                onChange={handleChange}
                className="w-full border border-[#e4e4e7] rounded-[4px] bg-white px-4 py-2.5 text-[14px] text-[#1a1c1c] appearance-none outline-none focus:border-[#1a1a1a] transition-colors cursor-pointer"
              >
                <option value="INR">INR — Indian Rupee</option>
                <option value="USD">USD — US Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
              </select>
            </div>
          </div>

          {/* Sizes */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#747878]">
              Available Sizes
            </label>
            <div className="flex gap-2 flex-wrap">
              {sizes.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => toggleSize(s.label)}
                  className={`w-12 h-10 rounded-[4px] text-[12px] font-semibold uppercase tracking-wide border transition-all duration-150 ${s.available
                    ? "bg-black text-white border-black"
                    : "bg-white text-[#b0b3b3] border-[#e4e4e7] line-through"
                    }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-[#747878]">
              Click a size to toggle availability. Crossed out = unavailable to buyers.
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-[#e4e4e7] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 border border-black text-black text-[12px] font-semibold uppercase tracking-[0.1em] py-3 rounded-[4px] hover:bg-[#f3f3f4] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 bg-black text-white text-[12px] font-semibold uppercase tracking-[0.1em] py-3 rounded-[4px] hover:bg-[#222] disabled:opacity-50 transition-colors"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────────────────────────
function Dashboard() {
  const { handleGetSellerProduct, handleUpdateProduct } = useProduct();
  const { handleLogout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await handleLogout();
    navigate("/");
  };

  const products = useSelector((state) => state.product.sellerProducts) || [];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null); // product being edited

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        await handleGetSellerProduct();
      } catch (err) {
        setError(err?.response?.data?.message || "Failed to load seller products.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const formatPrice = (priceObj) => {
    if (!priceObj) return "";
    const { amount, currency } = priceObj;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleSaveProduct = async (productId, fields) => {
    await handleUpdateProduct(productId, fields);
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#e4e6eb]" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Nav ── */}
      <header className="shrink-0 bg-[#e4e6eb] border-b border-[#c4c7c7]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16 flex items-center justify-between h-[64px]">
          <Link to="/" style={{ fontFamily: "'Montserrat', sans-serif" }}
            className="text-[20px] font-black tracking-[-0.04em] text-black">
            VELORA
          </Link>
          <nav className="hidden md:flex gap-6 lg:gap-10">
            {["SHOP", "NEW ARRIVALS", "COLLECTIONS", "COMMUNITY"].map((l) => (
              <a key={l} href="#"
                className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#444748] hover:opacity-60 transition-opacity">
                {l}
              </a>
            ))}
          </nav>
          <div className="flex gap-4">
            {[
              <path key="s" d="M21 21l-4.35-4.35M17 11A6 6 0 111 11a6 6 0 0116 0z" />,
              <><path key="b1" d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" /><line key="b2" x1="3" y1="6" x2="21" y2="6" /><path key="b3" d="M16 10a4 4 0 01-8 0" /></>,
              <><path key="p1" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle key="p2" cx="12" cy="7" r="4" /></>,
            ].map((p, i) => (
              <button key={i} className="text-[#1a1a1a] hover:opacity-60 transition-opacity">
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">{p}</svg>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Main content area ── */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 lg:px-16 py-6 lg:py-8 flex flex-col">

        {/* Header Section */}
        <div className="flex items-center justify-between mb-8 shrink-0">
          <div>
            <nav className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#747878]">SELLER</span>
              <span className="text-[10px] text-[#c4c7c7] font-semibold">/</span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-black">DASHBOARD</span>
            </nav>
            <h1 style={{ fontFamily: "'Montserrat', sans-serif" }}
              className="text-[24px] lg:text-[28px] font-semibold leading-tight tracking-[-0.01em] text-black">
              Your Products
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/seller/create-product"
              className="bg-black text-white text-[11px] font-semibold uppercase tracking-[0.12em] px-6 py-3 rounded-[4px] hover:bg-[#222] transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Add Product
            </Link>
            <button
              onClick={handleSignOut}
              className="border border-black text-black bg-transparent text-[11px] font-semibold uppercase tracking-[0.12em] px-5 py-3 rounded-[4px] hover:bg-black hover:text-white transition-all cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 shrink-0 px-4 py-3 bg-[#ffdad6] border border-[#ba1a1a] rounded text-[#93000a] text-xs font-medium">
            {error}
          </div>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#747878]">Loading collection...</span>
          </div>
        ) : products.length === 0 ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto py-12">
            <div className="w-16 h-16 rounded-full bg-[#f3f3f4] flex items-center justify-center mb-6">
              <svg className="w-6 h-6 text-[#747878]" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 style={{ fontFamily: "'Montserrat', sans-serif" }} className="text-[16px] font-semibold text-black mb-2">No Products Yet</h3>
            <p className="text-[13px] text-[#747878] leading-relaxed mb-6">
              You haven't listed any items in your store. Start showcasing your fashion products to the community.
            </p>
            <Link
              to="/seller/create-product"
              className="bg-black text-white text-[11px] font-semibold uppercase tracking-[0.12em] px-8 py-3.5 rounded-[4px] hover:bg-[#222] transition-colors"
            >
              List your first product
            </Link>
          </div>
        ) : (
          /* Product Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {products.map((product) => (
              <div key={product._id} className="group flex flex-col">
                {/* Image Wrap */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#f3f3f4] mb-3 rounded-[4px]">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0].url}
                      alt={product.images[0].alt || product.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#747878] text-[10px] font-semibold uppercase tracking-[0.1em]">
                      No Image
                    </div>
                  )}

                  {/* Edit button overlay — only visible on hover */}
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zM16.862 4.487L19.5 7.125" />
                    </svg>
                    Edit Product
                  </button>
                </div>

                {/* Details */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[13px] font-medium text-[#1a1c1c] tracking-[0.01em] line-clamp-1">
                      {product.title}
                    </h3>
                    <span className="text-[13px] font-semibold text-black shrink-0">
                      {formatPrice(product.price)}
                    </span>
                  </div>

                  {/* Size chips */}
                  {product.sizes && product.sizes.length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-1">
                      {product.sizes.map((s) => (
                        <span
                          key={s.label}
                          className={`text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-[2px] border ${s.available
                            ? "border-[#c4c7c7] text-[#1a1c1c] bg-white"
                            : "border-[#e4e4e7] text-[#b0b3b3] bg-[#f3f3f4] line-through"
                            }`}
                        >
                          {s.label}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Edit link below */}
                  <button
                    onClick={() => setEditingProduct(product)}
                    className="mt-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-[#747878] hover:text-black transition-colors text-left flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                    </svg>
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ── Edit Modal ── */}
      {editingProduct && (
        <EditProductModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
}

export default Dashboard;