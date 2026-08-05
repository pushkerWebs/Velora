import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { LazyMotion, domAnimation } from "framer-motion";
import { useSearchParams } from "react-router";
import Navbar from "../components/Navbar.jsx";
import MarqueeTicker from "../components/MarqueeTicker.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import Footer from "../components/Footer.jsx";

const Products = () => {
  const user = useSelector((state) => state.auth.user);
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get("category") || "All";

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <LazyMotion features={domAnimation} strict>
      <div
        className="min-h-screen flex flex-col bg-white text-[#111] antialiased overflow-x-clip"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        <Navbar user={user} />

        <main className="flex-1 flex flex-col pt-[60px]">
          <MarqueeTicker />
          <ProductGrid initialCategory={initialCategory} />
        </main>

        <Footer />
      </div>
    </LazyMotion>
  );
};

export default Products;
