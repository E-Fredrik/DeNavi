"use client"
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";

export function Footer() {
  const columns = [
    { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap", "Status"] },
    { title: "Company", links: ["About", "Blog", "Careers", "Contact"] },
    { title: "Resources", links: ["Documentation", "API Reference", "Help Center"] },
    { title: "Legal", links: ["Privacy", "Terms", "Security"] },
  ];

   // 1. Add state to check if the component has mounted
  const [mounted, setMounted] = useState(false);
  // 2. Extract the current theme
  const { resolvedTheme } = useTheme();

  // 3. Set mounted to true after the first render
  useEffect(() => {
    setMounted(true);
  }, []);

  // 4. Determine the border color based on the theme
  // Default to the light mode color before mounting to prevent hydration errors
  const currentBorderColor = mounted && resolvedTheme === "dark" ? "#0c123b" : "#fbeed4";

  // Extract theme state
  const isDark = mounted && resolvedTheme === "dark";

  // Dynamic palette for the browser mockup
  const mockupColors = {
    appBg: isDark ? "#0c123b" : "#fbeed4",        // Main background of the dashboard
    uiBg: isDark ? "#171e45" : "#f1e5ed",         // Sidebars, browser chrome, and cards
    border: isDark ? "#2d3895" : "#867bba",       // Borders and dividers
    textMain: isDark ? "#fbeed4" : "#0c123b",     // Primary text (Headers, Values)
    textSub: isDark ? "#867bba" : "#3c58a7",      // Secondary text (Labels, Time)
    accent: isDark ? "#6279d6" : "#2d3895",       // Accent items (Names, active states)
    accentText: isDark ? "#0c123b" : "#fbeed4",   // Text sitting on top of accent colors
  };

  return (
    <footer style={{ background: mockupColors.appBg, borderTop: `1px solid ${mockupColors.border}` }}>
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: "17px",
                color: mockupColors.textMain,
                letterSpacing: "-0.02em",
                display: "block",
                marginBottom: "12px",
              }}
            >
              Navi
            </span>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 400,
                fontSize: "13px",
                lineHeight: 1.6,
                color: mockupColors.textSub,
                maxWidth: "200px",
              }}
            >
              Pro check-ins, effortless
              for event organizers.
            </p>
          </div>

          {/* {columns.map((col) => (
            <div key={col.title}>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                  fontSize: "12px",
                  color: mockupColors.textSub,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  display: "block",
                  marginBottom: "16px",
                }}
              >
                {col.title}
              </span>
              <div className="flex flex-col gap-3">
                {col.links.map((link) => (
                  <a
                    key={link}
                    href="#"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 400,
                      fontSize: "13px",
                      color: "#3c58a7",
                      textDecoration: "none",
                    }}
                    className="hover:text-[#3c58a7] transition-colors duration-200"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))} */}
        </div>

        <div
          className="mt-16 pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          style={{ borderTop: "1px solid #f1e5ed" }}
        >
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 400,
              fontSize: "12px",
              color: mockupColors.textSub,
            }}
          >
            © 2026 Navi. All rights reserved.
          </span>
          <div className="flex items-center gap-6">
            {["Instagram"].map((s) => (
              <a
                key={s}
                href="#"
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                  fontSize: "12px",
                  color: "#867bba",
                  textDecoration: "none",
                }}
                className="hover:text-[#3c58a7] transition-colors duration-200"
              >
                {s}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
