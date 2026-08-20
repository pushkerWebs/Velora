import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useSearchParams, useLocation } from "react-router";
import { useSelector } from "react-redux";
import { useAuth } from "../../auth/hook/useAuth.js";
import { useWishlist } from "../hook/useWishlist.js";

// ── Icon primitives ────────────────────────────────────────────────────────────
const SearchIcon = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);
const HeartIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
  </svg>
);
const UserIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const CartIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);
const MenuIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" viewBox="0 0 24 24">
    <line x1="3" y1="7" x2="21" y2="7" />
    <line x1="3" y1="12" x2="21" y2="12" />
    <line x1="3" y1="17" x2="21" y2="17" />
  </svg>
);
const CloseIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" viewBox="0 0 24 24">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

// ── Nav link with underline slide animation ───────────────────────────────────
const NavLink = ({ to, children, scrolled }) => (
  <Link
    to={to}
    className={`relative text-[10px] font-semibold uppercase tracking-[0.2em] transition-colors duration-300 group
      ${scrolled ? "text-[#111]" : "text-white/90"}`}
  >
    {children}
    <span className="absolute -bottom-[2px] left-0 w-0 h-[0.5px] bg-current transition-all duration-500 ease-out group-hover:w-full" />
  </Link>
);

// ── Navbar Component ───────────────────────────────────────────────────────────
export default function Navbar({ user: userProp }) {
  const userFromRedux = useSelector((state) => state.auth.user);
  const cartItems = useSelector((state) => state.cart?.items || []);
  const user = userProp || userFromRedux;

  const [visible, setVisible] = useState(true);
  const [scrolledPastHero, setScrolledPastHero] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const searchInputRef = useRef(null);
  const drawerSearchRef = useRef(null);
  const location = useLocation();

  const { handleLogout } = useAuth();
  const { wishlistIds } = useWishlist();
  const navigate = useNavigate();

  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  // Sync searchQuery state with URL param
  useEffect(() => {
    const query = searchParams.get("search") || "";
    setSearchQuery(query);
    if (query) {
      setSearchOpen(true);
    }
  }, [searchParams]);

  // Focus desktop search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  // Focus mobile search input when morphed
  const mobileSearchRef = useRef(null);
  useEffect(() => {
    if (searchOpen && mobileSearchRef.current) {
      mobileSearchRef.current.focus();
    }
  }, [searchOpen]);

  // Reset navbar visible on route navigation
  useEffect(() => {
    setVisible(true);
    lastScrollY.current = window.scrollY;
  }, [location.pathname]);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const updateScroll = () => {
      const currentScrollY = window.scrollY;
      const prevScrollY = lastScrollY.current;
      const scrollDiff = currentScrollY - prevScrollY;

      // Always visible near top of page
      if (currentScrollY <= 15) {
        setVisible(true);
        setScrolledPastHero(false);
      } else {
        if (currentScrollY > 70) {
          setScrolledPastHero(true);
        } else {
          setScrolledPastHero(false);
        }

        // 10px scroll direction threshold to prevent jittering
        if (scrollDiff > 10) {
          setVisible(false);
        } else if (scrollDiff < -10) {
          setVisible(true);
        }
      }

      lastScrollY.current = currentScrollY;
      ticking.current = false;
    };

    const onScroll = () => {
      if (!ticking.current) {
        window.requestAnimationFrame(updateScroll);
        ticking.current = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleSignOut = async () => {
    await handleLogout();
    setMobileOpen(false);
    navigate("/");
  };

  const handleSearchChange = (val) => {
    setSearchQuery(val);
    const cat = searchParams.get("category");
    let target = "/products";
    const params = new URLSearchParams();
    if (val.trim()) params.set("search", val.trim());
    if (cat) params.set("category", cat);

    const queryString = params.toString();
    navigate(queryString ? `${target}?${queryString}` : target);
  };

  const leftLinks = [
    { label: "Jeans", to: "/jeans" },
    { label: "T-Shirts", to: "/t-shirts" },
    { label: "Shirts", to: "/shirts" },
  ];

  const isHomePage = location.pathname === "/";
  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const showBorder = isHomePage ? scrolledPastHero : true;

  if (isAuthPage) {
    return null;
  }

  return (
    <>
      <header
        style={{
          transform: visible || mobileOpen ? "translateY(0)" : "translateY(-100%)",
          transition:
            "transform 280ms cubic-bezier(0, 0, 0.2, 1), background-color 280ms ease, box-shadow 280ms ease, border-color 280ms ease",
          willChange: "transform",
        }}
        className={`fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md transition-all duration-300 ${showBorder ? "border-b border-[#e5e7eb] shadow-[0_1px_3px_rgba(0,0,0,0.04)]" : "border-b border-transparent shadow-none"
          }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between h-[60px] relative">

          {/* ────────────────────────────────────────────────────────
              MOBILE: Navbar morphs into search bar when searchOpen
          ─────────────────────────────────────────────────────────── */}
          {searchOpen && (
            <div className="lg:hidden absolute inset-0 flex items-center px-3 bg-white/95 backdrop-blur-md z-10"
              style={{ animation: 'fadeIn 0.15s ease-out' }}
            >
              <div className="flex-1 flex items-center gap-2 bg-[#f5f5f5] border border-[#e0e0e0] rounded-full px-4 h-10">
                <div className="text-[#999] shrink-0"><SearchIcon /></div>
                <input
                  ref={mobileSearchRef}
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="flex-1 bg-transparent text-[13px] text-[#111] placeholder-[#999] focus:outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => handleSearchChange('')}
                    className="text-[#aaa] hover:text-[#111] text-xs cursor-pointer transition-colors shrink-0"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                onClick={() => { handleSearchChange(''); setSearchOpen(false); }}
                className="ml-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[#555] hover:text-[#111] cursor-pointer whitespace-nowrap transition-colors shrink-0"
              >
                Cancel
              </button>
            </div>
          )}

          {/* ── Left Nav (desktop only) ── */}
          <nav className="hidden lg:flex items-center gap-8">
            {leftLinks.map((l) => (
              <NavLink key={l.label} to={l.to} scrolled={true}>
                {l.label}
              </NavLink>
            ))}
          </nav>

          {/* ── Center Logo ── */}
          <Link
            to="/"
            className={`static lg:absolute lg:left-1/2 lg:-translate-x-1/2 flex items-center select-none shrink-0 group transition-opacity duration-200 ${searchOpen ? 'opacity-0 pointer-events-none lg:opacity-100 lg:pointer-events-auto' : 'opacity-100'}`}
          >
            <img
              src="/veloralogobgremoved.png"
              alt="VELORA Logo"
              className="h-8 sm:h-10 lg:h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
            />
          </Link>

          {/* ── Right Icons (desktop) ── */}
          <div className="hidden lg:flex items-center gap-4 ml-auto">

            {/* Small Compact Search Input */}
            {searchOpen ? (
              <div className="relative flex items-center bg-[#f5f5f5] border border-[#e0e0e0] rounded-full px-3 py-1.5 w-[180px] xl:w-[220px] transition-all duration-300">
                <div className="text-[#888] shrink-0">
                  <SearchIcon />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full bg-transparent text-[12px] text-[#111] placeholder-[#888] focus:outline-none pl-2 pr-1"
                  autoFocus
                />
                <button
                  onClick={() => {
                    handleSearchChange("");
                    setSearchOpen(false);
                  }}
                  className="text-[#888] hover:text-[#111] text-xs font-semibold px-1 cursor-pointer transition-colors"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                aria-label="Search"
                onClick={() => setSearchOpen(true)}
                className="text-[#111] transition-colors duration-300 hover:opacity-60 cursor-pointer p-1"
              >
                <SearchIcon />
              </button>
            )}

            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="text-[#111] transition-colors duration-300 hover:opacity-60 cursor-pointer p-1 relative"
            >
              <HeartIcon />
              {wishlistIds.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center pointer-events-none shadow-xs">
                  {wishlistIds.length > 9 ? "9+" : wishlistIds.length}
                </span>
              )}
            </Link>

            {user ? (
              <Link
                to="/profile"
                aria-label="Account"
                className="flex items-center gap-2 text-[#111] transition-colors duration-300 hover:opacity-75 cursor-pointer p-1"
              >
                <UserIcon />
              </Link>
            ) : (
              <Link
                to="/login"
                className="text-[10px] font-semibold uppercase tracking-[0.2em] border border-[#111] text-[#111] hover:bg-[#111] hover:text-white px-5 py-2 transition-all duration-300"
              >
                Login
              </Link>
            )}

            <Link
              to="/cart"
              aria-label="Cart"
              className="text-[#111] transition-colors duration-300 hover:opacity-60 cursor-pointer p-1"
            >
              <CartIcon />
            </Link>
          </div>

          {/* ── Mobile Right Action Icons ── */}
          <div className={`lg:hidden ml-auto flex items-center gap-0.5 transition-opacity duration-200 ${searchOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            <button
              aria-label="Search"
              onClick={() => setSearchOpen(true)}
              className="w-9 h-9 text-[#111] transition-colors duration-300 cursor-pointer flex items-center justify-center"
            >
              <SearchIcon />
            </button>
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="w-9 h-9 text-[#111] transition-colors duration-300 cursor-pointer flex items-center justify-center relative"
            >
              <HeartIcon />
              {wishlistIds.length > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-600 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center pointer-events-none shadow-xs">
                  {wishlistIds.length > 9 ? "9+" : wishlistIds.length}
                </span>
              )}
            </Link>
            <Link
              to="/cart"
              aria-label="Cart"
              className="w-9 h-9 text-[#111] transition-colors duration-300 cursor-pointer flex items-center justify-center relative"
            >
              <CartIcon />
              {cartItems.length > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-[#f59e0b] text-black text-[9px] font-extrabold rounded-full flex items-center justify-center pointer-events-none">
                  {cartItems.length > 9 ? "9+" : cartItems.length}
                </span>
              )}
            </Link>
            <button
              onClick={() => setMobileOpen(true)}
              className="w-9 h-9 text-[#111] transition-colors duration-300 cursor-pointer flex items-center justify-center"
              aria-label="Open menu"
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>


      {/* ── Mobile Drawer ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] flex">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* Panel */}
          <div className="relative ml-auto w-[280px] h-full bg-white flex flex-col p-8 shadow-2xl">
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-5 right-5 text-[#111]"
            >
              <CloseIcon />
            </button>

            <Link
              to="/"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
              className="text-[20px] font-black tracking-[0.22em] text-[#111] mb-6"
              onClick={() => setMobileOpen(false)}
            >
              VELORA
            </Link>

            {/* Mobile Search Input */}
            <div className="relative flex items-center gap-2 bg-[#f5f5f5] border border-[#e0e0e0] rounded-full px-4 py-2.5 mb-6">
              <div className="text-[#888] shrink-0"><SearchIcon /></div>
              <input
                ref={drawerSearchRef}
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="flex-1 bg-transparent text-[12px] text-[#111] placeholder-[#888] focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="text-[#888] hover:text-[#111] text-xs cursor-pointer transition-colors"
                >
                  ✕
                </button>
              )}
            </div>

            <nav className="flex flex-col gap-6 mb-10">
              {leftLinks.map((l) => (
                <Link
                  key={l.label}
                  to={l.to}
                  onClick={() => setMobileOpen(false)}
                  className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#111] hover:opacity-50 transition-opacity"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                to="/wishlist"
                onClick={() => setMobileOpen(false)}
                className="text-[13px] font-semibold uppercase tracking-[0.16em] text-[#111] hover:opacity-50 transition-opacity flex items-center justify-between"
              >
                <span>Wishlist</span>
                {wishlistIds.length > 0 && (
                  <span className="text-[10px] font-extrabold bg-red-600 text-white px-2 py-0.5 rounded-full">
                    {wishlistIds.length}
                  </span>
                )}
              </Link>
            </nav>

            <div className="flex flex-col gap-3 mt-auto">
              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="text-center border border-[#111] text-[#111] text-[11px] font-bold uppercase tracking-[0.12em] py-3 hover:bg-[#111] hover:text-white transition-all"
                  >
                    Profile
                  </Link>
                  <Link
                    to="/cart"
                    onClick={() => setMobileOpen(false)}
                    className="text-center border border-[#111] text-[#111] text-[11px] font-bold uppercase tracking-[0.12em] py-3 hover:bg-[#111] hover:text-white transition-all"
                  >
                    Cart
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="text-center bg-[#111] text-white text-[11px] font-bold uppercase tracking-[0.12em] py-3 hover:bg-[#333] transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="text-center border border-[#111] text-[#111] text-[11px] font-bold uppercase tracking-[0.12em] py-3 hover:bg-[#111] hover:text-white transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="text-center bg-[#111] text-white text-[11px] font-bold uppercase tracking-[0.12em] py-3 hover:bg-[#333] transition-colors"
                  >
                    Join
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
