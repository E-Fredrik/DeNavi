"use client";
import { motion } from "motion/react";
import { QrCode, Search, ArrowRight } from "lucide-react";

export function DualModeSection() {
  return (
    <section id="features" className="py-28 lg:py-36 bg-[#f8edd6] dark:bg-[#0b1022]">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        {/* Section header — left aligned */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 max-w-lg"
        >
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 400,
              fontSize: "13px",
              color: "#2d3895",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: "16px",
            }}
          >
            Dual-Mode Check-in
          </p>
          <h2
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 700,
              fontSize: "clamp(28px, 4vw, 44px)",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              color: "#0c123b",
            }}
          >
            One system.
            <br />
            Every guest.
          </h2>
          <p
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 400,
              fontSize: "15px",
              lineHeight: 1.7,
              color: "#3c58a7",
              marginTop: "16px",
            }}
          >
            Whether your guest scans their own QR code or needs hands-on
            help from staff, Navi handles both without a hitch.
          </p>
        </motion.div>

        {/* Offset bento: large left card + smaller right card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Self-Scan — large vertical card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 lg:row-span-2 bg-[#fbeed4] dark:bg-[#111a34]"
            style={{
              border: "1px solid #867bba",
              borderRadius: "16px",
              padding: "40px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "520px",
            }}
          >
            <div>
              <div className="flex items-center gap-3 mb-8">
                <QrCode className="w-5 h-5" style={{ color: "#2d3895" }} strokeWidth={1.5} />
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 500,
                    fontSize: "12px",
                    color: "#2d3895",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  Mode 01
                </span>
              </div>
              <h3
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: "28px",
                  lineHeight: 1.15,
                  letterSpacing: "-0.025em",
                  color: "#0c123b",
                  marginBottom: "12px",
                }}
              >
                Self-Scan
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                  fontSize: "15px",
                  lineHeight: 1.7,
                  color: "#3c58a7",
                  maxWidth: "380px",
                }}
              >
                Tech-savvy guests scan their QR ticket at the entrance kiosk.
                Instant verification, zero queues, no staff needed.
              </p>
            </div>

            {/* Mockup phone */}
            <div className="mt-10 flex justify-center lg:justify-start">
              <div
                className="bg-[#f1e5ed] dark:bg-[#18203c]"
                style={{
                  width: "220px",
                  border: "1px solid #867bba",
                  borderRadius: "20px",
                  padding: "16px",
                }}
              >
                {/* Phone notch */}
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-1 rounded-full bg-[#867bba]" />
                </div>
                <div className="text-center mb-4">
                  <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", color: "#3c58a7" }}>
                    Scan to check in
                  </span>
                </div>
                {/* QR placeholder */}
                <div
                  className="aspect-square rounded-lg flex items-center justify-center mb-4 bg-[#fbeed4] dark:bg-[#111a34]"
            style={{ border: "1px solid #867bba" }}
                >
                  <div className="w-20 h-20 grid grid-cols-5 grid-rows-5 gap-[2px]">
                    {Array.from({ length: 25 }, (_, cellIndex) => cellIndex).map((cellIndex) => (
                      <div
                        key={`qr-cell-${cellIndex}`}
                        className={
                          [0, 1, 2, 3, 4, 5, 9, 10, 14, 15, 19, 20, 21, 22, 23, 24, 6, 12, 18].includes(cellIndex)
                            ? "bg-[#867bba] dark:bg-[#9fa8d8]"
                            : "bg-[#f1e5ed] dark:bg-[#18203c]"
                        }
                        style={{
                          borderRadius: "1px",
                        }}
                      />
                    ))}
                  </div>
                </div>
                {/* Success state */}
                <div
                  className="py-2.5 rounded-lg text-center bg-[#fbeed4] dark:bg-[#111a34]"
            style={{ border: "1px solid #867bba" }}
                >
                  <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "11px", color: "#3c58a7" }}>
                    ✓ Verified — Table 12
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Staff-Assist — smaller horizontal card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-5 bg-[#fbeed4] dark:bg-[#111a34]"
            style={{
              border: "1px solid #867bba",
              borderRadius: "16px",
              padding: "32px",
            }}
          >
            <div className="flex items-center gap-3 mb-6">
              <Search className="w-5 h-5" style={{ color: "#2d3895" }} strokeWidth={1.5} />
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                  fontSize: "12px",
                  color: "#2d3895",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                Mode 02
              </span>
            </div>
            <h3
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: "24px",
                lineHeight: 1.15,
                letterSpacing: "-0.02em",
                color: "#0c123b",
                marginBottom: "10px",
              }}
            >
              Staff-Assist
            </h3>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 400,
                fontSize: "14px",
                lineHeight: 1.7,
                color: "#3c58a7",
                marginBottom: "20px",
              }}
            >
              For older or less tech-savvy guests. Your staff taps a name,
              confirms identity, done. Zero training required.
            </p>
            {/* Mini search UI */}
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[#f1e5ed] dark:bg-[#18203c] border border-[#867bba] dark:border-[#9fa8d8]"
            >
              <Search className="w-3.5 h-3.5" style={{ color: "#3c58a7" }} strokeWidth={1.5} />
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "12px", color: "#3c58a7" }}>
                Search guest name...
              </span>
            </div>
          </motion.div>

          {/* Feature highlights card — bottom right */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5 bg-[#fbeed4] dark:bg-[#111a34]"
            style={{
              border: "1px solid #867bba",
              borderRadius: "16px",
              padding: "32px",
            }}
          >
            <div className="flex flex-col gap-5">
              {[
                { label: "Zero-Training Interface", desc: "Hand an iPad to any volunteer." },
                { label: "Instant Plus-One Handling", desc: "One tap to add walk-ins on the spot." },
                { label: "Digital Angpao Tracking", desc: "Gift envelopes recorded at check-in." },
                { label: "Post-Event Reports", desc: "PDF + spreadsheet in one click." },
              ].map((item, i) => (
                <div
                  key={item.label}
                  className="flex items-start gap-4"
                  style={{ paddingBottom: i < 3 ? "20px" : "0", borderBottom: i < 3 ? "1px solid #867bba" : "none" }}
                >
                  <span
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 400,
                      fontSize: "11px",
                      color: "#867bba",
                      flexShrink: 0,
                      width: "20px",
                      marginTop: "2px",
                    }}
                  >
                    0{i + 1}
                  </span>
                  <div>
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 600,
                        fontSize: "14px",
                        color: "#0c123b",
                        display: "block",
                        marginBottom: "2px",
                      }}
                    >
                      {item.label}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 400,
                        fontSize: "13px",
                        color: "#3c58a7",
                      }}
                    >
                      {item.desc}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 flex-shrink-0 mt-1" style={{ color: "#867bba" }} strokeWidth={1.5} />
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
