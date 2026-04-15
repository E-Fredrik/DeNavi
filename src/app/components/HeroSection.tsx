"use client";
import { motion } from "motion/react";
import DotGrid from "@/components/DotGrid";
import ShapeGrid from "@/components/ShapeGrid";

export function HeroSection() {
  return (
    <section
      className="relative min-h-screen flex items-end lg:items-center overflow-hidden"
    >
      {/* Background DotGrid */}
      <div className="absolute inset-0 z-0">
        {/* <DotGrid
          dotSize={10}
          gap={15}
          baseColor="#fbeed4"
          activeColor="#3C58a7"
          proximity={120}
          shockRadius={250}
          shockStrength={5}
          resistance={750}
          returnDuration={1.5}
        /> */}

  
          <ShapeGrid 
          speed={0.5}
          squareSize={40}
          direction='diagonal' // up, down, left, right, diagonal
          borderColor='#fbeed4'
          hoverFillColor='#3C58a7'
          shape='square' // square, hexagon, circle, triangle
          hoverTrailAmount={0} // number of trailing hovered shapes (0 = no trail)
          />
      </div>

      <div className="w-full max-w-[1280px] mx-auto px-6 lg:px-10 pt-28 pb-20 lg:py-0 relative z-10 pointer-events-none">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-0 items-end lg:items-center pointer-events-auto">
          {/* Left — Copy */}
          <div className="lg:col-span-6 xl:col-span-5 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                  fontSize: "13px",
                  color: "#2d3895",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "24px",
                }}
              >
                Digital Guestbook & Check-in
              </p>
              <h1
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: "clamp(38px, 5.5vw, 64px)",
                  lineHeight: 1.05,
                  letterSpacing: "-0.035em",
                  color: "#0c123b",
                }}
              >
                Pro check-ins,
                <br />
                effortless
                <br />
                for EOs.
              </h1>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                  fontSize: "16px",
                  lineHeight: 1.7,
                  color: "#3c58a7",
                  marginTop: "24px",
                  maxWidth: "420px",
                }}
              >
                The all-in-one check-in system that gives event organizers
                complete control — with token-based pricing that scales to
                your event. No subscriptions.
              </p>
              <div className="flex items-center gap-4 mt-10">
                <a
                  href="#pricing"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 500,
                    fontSize: "14px",
                    color: "#fbeed4",
                    background: "#2d3895",
                    padding: "12px 28px",
                    borderRadius: "6px",
                    display: "inline-block",
                    textDecoration: "none",
                  }}
                  className="hover:bg-[#3c58a7] transition-colors duration-200"
                >
                  Calculate Your Event
                </a>
                <a
                  href="#features"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 400,
                    fontSize: "14px",
                    color: "#3c58a7",
                    textDecoration: "none",
                  }}
                  className="hover:text-[#2d3895] transition-colors duration-200"
                >
                  See how it works →
                </a>
              </div>
            </motion.div>
          </div>

          {/* Right — iPad Mockup cropped to bleed */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
            className="lg:col-span-6 xl:col-span-7 relative lg:translate-x-10 xl:translate-x-16 z-10"
          >
            <div className="relative lg:mr-[-80px] xl:mr-[-120px]">
              {/* iPad frame */}
              <div
                style={{
                  background: "#f1e5ed",
                  borderRadius: "20px",
                  border: "1px solid #867bba",
                  padding: "12px",
                }}
              >
                <div
                  className="relative"
                  style={{
                    backgroundColor: "#fbeed4",
                    borderRadius: "12px",
                    overflow: "hidden",
                  }}
                >
                  {/* Browser chrome */}
                  <div
                    className="flex items-center px-4 gap-2 relative z-10"
                    style={{
                      height: "36px",
                      borderBottom: "1px solid #867bba",
                    }}
                  >
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[#867bba]" />
                      <div className="w-2 h-2 rounded-full bg-[#867bba]" />
                      <div className="w-2 h-2 rounded-full bg-[#867bba]" />
                    </div>
                    <div className="flex-1 flex justify-center">
                      <div
                        className="px-4 py-0.5 rounded"
                        style={{
                          background: "#f1e5ed",
                          fontFamily: "var(--font-body)",
                          fontSize: "10px",
                          color: "#3c58a7",
                        }}
                      >
                        app.navi.events
                      </div>
                    </div>
                  </div>

                  {/* Dashboard content */}
                  <div className="p-5 flex gap-4 relative z-10" style={{ aspectRatio: "16/10" }}>
                    {/* Sidebar */}
                    <div className="w-40 flex-shrink-0 flex flex-col gap-1">
                      <div className="flex items-center gap-2 mb-5">
                        <div
                          className="w-5 h-5 rounded flex items-center justify-center"
                          style={{ background: "#2d3895" }}
                        >
                          <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "9px", color: "#fbeed4" }}>N</span>
                        </div>
                        <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "11px", color: "#2d3895" }}>
                          Navi
                        </span>
                      </div>
                      {[
                        { label: "Dashboard", active: false },
                        { label: "Live Check-in", active: true },
                        { label: "Guest List", active: false },
                        { label: "Angpao", active: false },
                        { label: "Reports", active: false },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="px-2.5 py-1.5 rounded"
                          style={{
                            background: item.active ? "#f1e5ed" : "transparent",
                            border: item.active ? "1px solid #867bba" : "1px solid transparent",
                          }}
                        >
                          <span
                            style={{
                              fontFamily: "var(--font-body)",
                              fontWeight: item.active ? 500 : 400,
                              fontSize: "10px",
                              color: item.active ? "#0c123b" : "#3c58a7",
                            }}
                          >
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Main area */}
                    <div className="flex-1 flex flex-col gap-3 min-w-0">
                      <div className="flex items-center justify-between">
                        <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "13px", color: "#0c123b" }}>
                          Grand Ballroom A
                        </span>
                        <div
                          className="flex items-center gap-1.5 px-2 py-0.5 rounded"
                          style={{ background: "#fbeed4", border: "1px solid #867bba" }}
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-[#3c58a7]" />
                          <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "9px", color: "#3c58a7" }}>
                            LIVE
                          </span>
                        </div>
                      </div>

                      {/* Stat cards */}
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: "Checked In", value: "342", sub: "/ 500 guests" },
                          { label: "Plus Ones", value: "47", sub: "walk-ins added" },
                          { label: "Angpao", value: "28.5M", sub: "IDR collected" },
                        ].map((s) => (
                          <div
                            key={s.label}
                            style={{
                              background: "#f1e5ed",
                              border: "1px solid #867bba",
                              borderRadius: "8px",
                              padding: "10px",
                            }}
                          >
                            <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "9px", color: "#3c58a7" }}>
                              {s.label}
                            </span>
                            <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "20px", color: "#0c123b", letterSpacing: "-0.03em", marginTop: "2px" }}>
                              {s.value}
                            </div>
                            <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "8px", color: "#3c58a7" }}>
                              {s.sub}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Activity table */}
                      <div
                        className="flex-1 rounded-lg overflow-hidden"
                        style={{ background: "#f1e5ed", border: "1px solid #867bba" }}
                      >
                        <div
                          className="px-3 py-2"
                          style={{ borderBottom: "1px solid #867bba" }}
                        >
                          <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "10px", color: "#3c58a7" }}>
                            Recent Activity
                          </span>
                        </div>
                        <div className="px-3">
                          {[
                            { name: "Budi Hartono +2", method: "QR Scan", time: "Just now" },
                            { name: "Siti Nurhaliza", method: "Staff", time: "2m ago" },
                            { name: "Ahmad Dhani +1", method: "QR Scan", time: "3m ago" },
                            { name: "Raisa Andriana", method: "QR Scan", time: "5m ago" },
                          ].map((row, idx) => (
                            <div
                              key={row.name}
                              className="flex items-center justify-between py-2"
                              style={{ borderBottom: idx < 3 ? "1px solid #867bba" : "none" }}
                            >
                              <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "10px", color: "#2d3895" }}>
                                {row.name}
                              </span>
                              <div className="flex items-center gap-3">
                                <span
                                  style={{
                                    fontFamily: "var(--font-body)",
                                    fontWeight: 500,
                                    fontSize: "9px",
                                    color: row.method === "QR Scan" ? "#2d3895" : "#3c58a7",
                                  }}
                                >
                                  {row.method}
                                </span>
                                <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "9px", color: "#867bba" }}>
                                  {row.time}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
