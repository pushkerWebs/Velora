import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../hook/useAuth.js";
import { motion } from "framer-motion";
import { API_URL } from "../../../config/api.config.js";

export default function Login() {
  const { handleLogin, loading, error } = useAuth();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [validationError, setValidationError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setValidationError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError("");

    if (!formData.email || !formData.password) {
      setValidationError("Please fill in all fields.");
      return;
    }

    const result = await handleLogin({
      email: formData.email,
      password: formData.password,
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

      {/* ─── LEFT: Form Panel ─── */}
      <div className="reg-right">
        {/* Mobile logo */}
        <div className="reg-mobile-logo">
          <span className="reg-logo-text">VELORA</span>
        </div>

        <motion.div
          className="reg-form-wrap"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          {/* Heading */}
          <div className="reg-heading">
            <h2 className="reg-title">Welcome back</h2>
            <p className="reg-sub">Sign in to your VELORA account</p>
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

            {/* Email Address */}
            <div className="reg-field">
              <label htmlFor="login-email" className="reg-label">Email Address</label>
              <input
                id="login-email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                value={formData.email}
                onChange={handleChange}
                className="velora-input reg-input"
                style={{ flex: 1 }}
              />
            </div>

            {/* Password */}
            <div className="reg-field">
              <label htmlFor="login-password" className="reg-label">Password</label>
              <div className="reg-pw-row">
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="velora-input reg-input"
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="reg-toggle"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>



            {/* Forgot password */}
            <div style={{ textAlign: "right", marginTop: "-8px" }}>
              <a href="#" className="reg-link" style={{ fontSize: "12px" }}>
                Forgot password?
              </a>
            </div>

            {/* Sign In */}
            <motion.button
              id="login-btn"
              type="submit"
              disabled={loading}
              className="reg-btn-primary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {loading ? "Signing in..." : "Sign In →"}
            </motion.button>

            {/* Google */}
            <button
              type="button"
              className="reg-btn-outline"
              onClick={() => window.location.href = `${API_URL}/api/auth/google?role=buyer`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

          </form>

          {/* Footer */}
          <p className="reg-footer-text">
            Don't have an account?{" "}
            <Link to="/register" className="reg-link">Sign Up</Link>
          </p>
          <p className="reg-copy">© 2025 VELORA. All rights reserved.</p>
        </motion.div>
      </div>

      {/* ─── RIGHT: Fashion Image ─── */}
      <div className="reg-left">
        <motion.img
          src="/model-img-login.jpg"
          alt="VELORA Fashion"
          className="reg-img"
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
          <p className="reg-subtitle">Welcome Back</p>
          <h1 className="reg-headline">Style<br />Is A<br />Language.</h1>
        </motion.div>
      </div>

    </div>
  );
}
