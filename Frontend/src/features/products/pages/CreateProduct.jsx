import { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { useProduct } from "../hook/useProduct.js";

export default function CreateProduct() {
  const navigate = useNavigate();
  const { handleCreateProduct } = useProduct();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({ title: "", description: "", price: "", currency: "INR", category: "Shirts" });
  const [images, setImages] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleFiles = (files) => {
    const accepted = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, 7 - images.length);
    const previews = accepted.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setImages((p) => [...p, ...previews].slice(0, 7));
  };

  const removeImage = (i) => {
    setImages((p) => {
      URL.revokeObjectURL(p[i].preview);
      return p.filter((_, idx) => idx !== i);
    });
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("description", formData.description);
      fd.append("price", formData.price);
      fd.append("currency", formData.currency);
      fd.append("category", formData.category);
      images.forEach((img) => fd.append("images", img.file));
      await handleCreateProduct(fd);
      setShowSuccessPopup(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to create product. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#e4e6eb]" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Nav ── */}
      <header className="shrink-0 bg-[#e4e6eb] border-b border-[#c4c7c7]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-16 flex items-center justify-between h-[64px]">
          <a href="/" style={{ fontFamily: "'Montserrat', sans-serif" }}
            className="text-[20px] font-black tracking-[-0.04em] text-black">
            VELORA
          </a>
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
              <button key={i} className="text-black hover:opacity-60 transition-opacity">
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">{p}</svg>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ── Main — fills remaining height, scrolls if needed ── */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-6 lg:px-16 py-4 lg:py-6 flex flex-col">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-2 shrink-0">
          <a href="#" className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#747878] hover:text-black transition-colors">PRODUCTS</a>
          <span className="text-[10px] text-[#c4c7c7] font-semibold">/</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-black">NEW PRODUCT</span>
        </nav>

        {/* Header */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h1 style={{ fontFamily: "'Montserrat', sans-serif" }} className="text-[24px] lg:text-[28px] font-semibold leading-tight tracking-[-0.01em] text-black">
            Create Product
          </h1>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-[#ffdad6] border border-[#ba1a1a] rounded text-[#93000a] text-xs font-medium shrink-0">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">

            {/* ── LEFT col (8) ── */}
            <div className="lg:col-span-8 flex flex-col gap-4">

              {/* TITLE */}
              <div className="flex flex-col gap-2 shrink-0">
                <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#747878]">PRODUCT TITLE</label>
                <input
                  name="title"
                  value={formData.title} onChange={handleChange}
                  placeholder="Product name"
                  className="w-full border border-[#e4e4e7] rounded-[4px] bg-transparent px-4 py-3 text-[14px] text-[#1a1c1c] placeholder:text-[#b0b3b3] outline-none focus:border-[#1a1a1a] transition-colors"
                />
              </div>

              {/* DESCRIPTION */}
              <div className="flex flex-col gap-2 flex-1 min-h-[90px]">
                <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#747878]">DESCRIPTION</label>
                <textarea
                  name="description"
                  value={formData.description} onChange={handleChange}
                  placeholder="Describe the product..."
                  className="w-full flex-1 min-h-[60px] border border-[#e4e4e7] rounded-[4px] bg-transparent px-4 py-3 text-[14px] text-[#1a1c1c] placeholder:text-[#b0b3b3] resize-none outline-none focus:border-[#1a1a1a] transition-colors"
                />
              </div>

              {/* AMOUNT + CURRENCY + CATEGORY */}
              <div className="grid grid-cols-3 gap-4 shrink-0">
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#747878]">AMOUNT</label>
                  <input
                    name="price" type="number" step="0.01" min="0"
                    value={formData.price} onChange={handleChange}
                    onWheel={(e) => e.target.blur()}
                    placeholder="0.00"
                    className="w-full border border-[#e4e4e7] rounded-[4px] bg-transparent px-4 py-3 text-[14px] text-[#1a1c1c] placeholder:text-[#b0b3b3] outline-none focus:border-[#1a1a1a] transition-colors"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#747878]">CURRENCY</label>
                  <select
                    name="currency" value={formData.currency} onChange={handleChange}
                    className="w-full border border-[#e4e4e7] rounded-[4px] bg-white px-4 py-3 text-[14px] text-[#1a1c1c] appearance-none outline-none focus:border-[#1a1a1a] transition-colors cursor-pointer"
                  >
                    <option value="INR">INR — Indian Rupee</option>
                    <option value="USD">USD — US Dollar</option>
                    <option value="EUR">EUR — Euro</option>
                    <option value="GBP">GBP — British Pound</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#747878]">CATEGORY</label>
                  <select
                    name="category" value={formData.category} onChange={handleChange}
                    className="w-full border border-[#e4e4e7] rounded-[4px] bg-white px-4 py-3 text-[14px] text-[#1a1c1c] appearance-none outline-none focus:border-[#1a1a1a] transition-colors cursor-pointer"
                  >
                    <option value="Shirts">Shirts</option>
                    <option value="T-Shirts">T-Shirts</option>
                    <option value="Jeans">Jeans</option>
                  </select>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex gap-3 shrink-0">
                <button
                  id="publish-btn" type="submit" disabled={loading}
                  className="flex-1 bg-black text-white text-[12px] font-semibold uppercase tracking-[0.1em] py-4 rounded-[4px] hover:bg-[#222] disabled:opacity-50 transition-colors"
                >
                  {loading ? "Publishing..." : "Publish Product"}
                </button>
                <button
                  type="button" disabled={loading}
                  className="flex-1 border border-black text-black bg-transparent text-[12px] font-semibold uppercase tracking-[0.1em] py-4 rounded-[4px] hover:bg-[#f3f3f4] disabled:opacity-50 transition-colors"
                >
                  Save as Draft
                </button>
              </div>
            </div>

            {/* ── RIGHT col (4) ── */}
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="shrink-0">
                <h2 className="text-[10px] font-semibold uppercase tracking-[0.14em] text-black mb-1">PRODUCT IMAGES</h2>
                <p className="text-[12px] text-[#747878]">Upload up to 7 images</p>
              </div>

              {/* Drop zone */}
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={onDrop}
                className={`flex-1 min-h-[110px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${dragging ? "border-black bg-[#f3f3f4]" : "border-[#c4c7c7] bg-white hover:border-black"
                  }`}
              >
                <svg className="w-8 h-8 text-[#747878] mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <p className="text-[13px] font-medium text-[#1a1c1c]">Drag & drop or click to upload</p>
                <p className="text-[11px] text-[#747878] mt-1">PNG, JPG, WEBP · max 10MB</p>
                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                  onChange={(e) => handleFiles(e.target.files)} />
              </div>

              {/* Thumbnails */}
              <div className="shrink-0 grid grid-cols-4 gap-2">
                {images.map((img, i) => (
                  <div key={i} className="relative aspect-square rounded border border-[#e4e4e7] overflow-hidden group">
                    <img src={img.preview} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xl font-bold">×</button>
                  </div>
                ))}
                {images.length < 7 && (
                  <button type="button" onClick={() => fileInputRef.current?.click()}
                    className="aspect-square border border-[#c4c7c7] rounded flex items-center justify-center hover:border-black transition-colors text-[#747878] hover:text-black">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                      <path d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                )}
                {Array.from({ length: Math.max(0, 6 - images.length) }).map((_, i) => (
                  <div key={`e${i}`} className="aspect-square border border-dashed border-[#e4e4e7] rounded bg-[#f3f3f4]" />
                ))}
              </div>

              {images.length > 0 && (
                <p className="shrink-0 text-[11px] text-[#747878] text-center tracking-wide">{images.length}/7 images added</p>
              )}
            </div>

          </div>
        </form>
      </main>

      {/* ── Success Modal Overlay ── */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-[#e4e6eb] border border-[#c4c7c7] w-[90%] max-w-[420px] p-8 text-center flex flex-col items-center gap-6 rounded-[8px]">
            {/* Visual Icon */}
            <div className="w-16 h-16 rounded-full bg-[#e8e8e8] flex items-center justify-center text-black border border-[#c4c7c7]">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>

            {/* Message */}
            <div className="flex flex-col gap-2">
              <h2 style={{ fontFamily: "'Montserrat', sans-serif" }} className="text-xl font-bold tracking-tight text-black">
                CONGRATULATIONS
              </h2>
              <p className="text-sm text-[#747878] leading-relaxed">
                Your product has been created successfully.
              </p>
            </div>

            {/* Action */}
            <button
              onClick={() => {
                setShowSuccessPopup(false);
                navigate("/");
              }}
              className="w-full bg-black text-white text-[12px] font-semibold uppercase tracking-[0.1em] py-[14px] rounded-[4px] hover:bg-[#222] transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
