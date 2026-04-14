"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        scrolled ? "bg-[#f8edd6] border-b border-[#867bba]" : "bg-transparent"
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 h-14 flex items-center justify-between">
        <span
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 600,
            fontSize: "17px",
            color: "#0c123b",
            letterSpacing: "-0.02em",
          }}
        >
          Navi
        </span>
        <div className="hidden md:flex items-center gap-10">
          {["Features", "Pricing", "Docs"].map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase()}`}
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 400,
                fontSize: "13px",
                color: "#3c58a7",
                letterSpacing: "0",
              }}
              className="hover:text-[#2d3895] transition-colors duration-200"
            >
              {item}
            </a>
          ))}
        </div>
        {/* <Link
          href="/login"
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            fontSize: "13px",
            color: "#fbeed4",
            background: "#2d3895",
            padding: "7px 20px",
            borderRadius: "6px",
            textDecoration: "none",
          }}
          className="hover:bg-[#3c58a7] transition-colors duration-200"
        >
          Get Started
        </Link> */}
        <Link href = "/login" className="text-sm font-medium text-[#fbeed4] bg-[#2d3895] px-4 py-2 rounded-md hover:bg-[#3c58a7] transition-colors duration-200">
          Get Started
        </Link>
      </div>
    </nav>
  );
}