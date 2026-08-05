import React from "react";

const FEATURES = [
  {
    id: "delivery",
    title: "Fast Delivery",
    sub: "Quick & Safe Shipping",
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M1 3h15v13H1zM16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    id: "returns",
    title: "Easy Returns",
    sub: "7-Day Returns",
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
      </svg>
    ),
  },
  {
    id: "quality",
    title: "Premium Quality",
    sub: "Curated Fashion",
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
  },
  {
    id: "payments",
    title: "Secure Payments",
    sub: "100% Secure Checkout",
    icon: (
      <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

export default function FeatureStrip() {
  return (
    <section className="bg-white border-t border-b border-[#ebebeb] py-14 lg:py-16">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-[#ebebeb]">
          {FEATURES.map((f) => (
            <div
              key={f.id}
              className="bg-white flex flex-col items-center text-center gap-4 px-6 py-10 group"
            >
              <div className="text-[#111] opacity-70 group-hover:opacity-100 transition-opacity duration-300">
                {f.icon}
              </div>
              <div>
                <p
                  className="text-[13px] font-bold text-[#111] tracking-[0.04em] mb-1"
                  style={{ fontFamily: "'Montserrat', sans-serif" }}
                >
                  {f.title}
                </p>
                <p className="text-[11px] text-[#888] font-medium tracking-[0.02em]">
                  {f.sub}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
