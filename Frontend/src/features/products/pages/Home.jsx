import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { LazyMotion, domAnimation } from "framer-motion";

// ── Section components ─────────────────────────────────────────────────────────
import Navbar from "../components/Navbar.jsx";
import HeroSection from "../components/HeroSection.jsx";
import BrandStory from "../components/BrandStory.jsx";
import EditorialBanner from "../components/EditorialBanner.jsx";
import FeaturedCollection from "../components/FeaturedCollection.jsx";
import BentoDNA from "../components/BentoDNA.jsx";
import Footer from "../components/Footer.jsx";

// ──────────────────────────────────────────────────────────────────────────────
// VELORA — Premium Luxury Fashion Landing Page
// ──────────────────────────────────────────────────────────────────────────────
const Home = () => {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();

  return (
    <LazyMotion features={domAnimation} strict>
      <div
        className="min-h-screen flex flex-col bg-white text-[#111] antialiased overflow-x-clip"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <Navbar user={user} />

        <main className="flex-1 flex flex-col">
          <HeroSection />
          <BrandStory />
          <EditorialBanner />
          <FeaturedCollection />
          <BentoDNA navigate={navigate} />
        </main>

        <Footer />
      </div>
    </LazyMotion>
  );
};

export default Home;
