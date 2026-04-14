"use client";
import { motion } from "motion/react";

const logos = [
  "The Ritz-Carlton",
  "Shangri-La",
  "Mulia Resort",
  "Ayana Bali",
  "Four Seasons",
  "Mandarin Oriental",
];

export function TrustBanner() {
  return (
    <section style={{ background: "#f8edd6", borderTop: "1px solid #f1e5ed", borderBottom: "1px solid #f1e5ed" }}>
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-14">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-wrap items-center gap-x-14 gap-y-6"
        >
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 400,
              fontSize: "12px",
              color: "#3c58a7",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              flexShrink: 0,
            }}
          >
            Trusted by
          </span>
          {logos.map((name) => (
            <span
              key={name}
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                fontSize: "14px",
                color: "#867bba",
                letterSpacing: "0.02em",
              }}
            >
              {name}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
