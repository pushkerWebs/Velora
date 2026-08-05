import { useState } from "react";
import { useAuth } from "../hook/useAuth.js";
import { useNavigate, Link } from "react-router";
import { motion } from "framer-motion";

export default function Register() {
  const { handleRegister, loading, error } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    contactNumber: "",
    password: "",
    isSeller: false,
  });
  const [validationError, setValidationError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setValidationError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    if (formData.password.length < 6) {
      setValidationError("Password must be at least 6 characters.");
      return;
    }

    const result = await handleRegister({
      email: formData.email,
      contact: formData.contactNumber,
      password: formData.password,
      isSeller: formData.isSeller,
      fullname: formData.fullname,
    });
    if (result.success) {
      navigate(result.user?.role === "seller" ? "/seller/dashboard" : "/");
    }
  };

  const displayError = validationError || error;

  return (
    <div className="reg-root">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>

      {/* ─── LEFT: Fashion Image ─── */}
      <div className="reg-left">
        <motion.img
          src="/register-pageimg.jpg"
          alt="VELORA Fashion"
          className="reg-img"
          style={{ objectPosition: "50% 5%" }}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
        <div className="reg-overlay" />
        <motion.div
          className="reg-tagline"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        >
          <p className="reg-subtitle">New Collection · 2025</p>
          <h1 className="reg-headline">Wear<br />The<br />Culture.</h1>
        </motion.div>
      </div>

      {/* ─── RIGHT: Form Panel ─── */}
      <div className="reg-right">
        {/* Mobile logo */}
        <div className="reg-mobile-logo">
          <span className="reg-logo-text">VELORA</span>
        </div>

        <motion.div
          className="reg-form-wrap"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          {/* Heading */}
          <div className="reg-heading">
            <h2 className="reg-title">Create your account</h2>
            <p className="reg-sub">Join the VELORA community</p>
          </div>

          {/* Error banner */}
          {displayError && (
            <div
              className="reg-error"
              style={{ animation: "fadeIn 0.25s ease-out forwards" }}
            >
              {displayError}
            </div>
          )}

          {/* Form */}
          <form className="reg-form" onSubmit={handleSubmit}>

            {/* Full Name */}
            <div className="reg-field">
              <label htmlFor="fullname" className="reg-label">Full Name</label>
              <input
                id="fullname"
                name="fullname"
                type="text"
                placeholder="John Doe"
                required
                value={formData.fullname}
                onChange={handleChange}
                className="velora-input reg-input"
              />
            </div>

            {/* Email */}
            <div className="reg-field">
              <label htmlFor="email" className="reg-label">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                value={formData.email}
                onChange={handleChange}
                className="velora-input reg-input"
              />
            </div>

            {/* Phone */}
            <div className="reg-field">
              <label htmlFor="contactNumber" className="reg-label">Phone Number</label>
              <div className="reg-phone-row">
                <span className="reg-prefix">+91</span>
                <input
                  id="contactNumber"
                  name="contactNumber"
                  type="tel"
                  placeholder="98765 43210"
                  required
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className="velora-input reg-input"
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="reg-field">
              <label htmlFor="password" className="reg-label">Password</label>
              <div className="reg-pw-row">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="velora-input reg-input"
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={() => setShowPassword(p => !p)} className="reg-toggle">
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div className="reg-field">
              <label className="reg-label">Register As</label>
              <div className="flex gap-6 mt-2 pb-2" style={{ borderBottom: "1px solid #c4c7c7" }}>
                <label className="flex items-center gap-2 text-sm text-[#1a1a1a] cursor-pointer">
                  <input
                    type="radio"
                    name="isSeller"
                    checked={!formData.isSeller}
                    onChange={() => setFormData(p => ({ ...p, isSeller: false }))}
                    className="accent-[#f59e0b] w-4 h-4 cursor-pointer"
                  />
                  <span className="font-medium text-[13px] tracking-wide uppercase">Buyer</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-[#1a1a1a] cursor-pointer">
                  <input
                    type="radio"
                    name="isSeller"
                    checked={formData.isSeller}
                    onChange={() => setFormData(p => ({ ...p, isSeller: true }))}
                    className="accent-[#f59e0b] w-4 h-4 cursor-pointer"
                  />
                  <span className="font-medium text-[13px] tracking-wide uppercase">Seller</span>
                </label>
              </div>
            </div>

            {/* Sign Up */}
            <motion.button
              id="signup-btn"
              type="submit"
              disabled={loading}
              className="reg-btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {loading ? "Creating account..." : "Sign Up →"}
            </motion.button>

          </form>

          {/* Footer */}
          <p className="reg-footer-text">
            Already have an account?{" "}
            <Link to="/login" className="reg-link">Sign In</Link>
          </p>
          <p className="reg-copy">© 2025 VELORA. All rights reserved.</p>
        </motion.div>
      </div>
    </div>
  );
}
