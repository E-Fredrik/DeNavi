"use client";
import { useState, useMemo } from "react";
import { motion } from "motion/react";

const PRICE_PER_TOKEN = 50000; //Change this to update the price displayed taken from postgre

function formatIDR(val: number): string {
  const formattedNumber = new Intl.NumberFormat("id-ID", { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
  return `Rp${formattedNumber}`;
}

export function PricingSection() {
  const [guests, setGuests] = useState(300);
  const [days, setDays] = useState(1);

  const tokens = useMemo(() => {
    // 1 token per 50 guests, minimum 1, scaled by duration
    const base = Math.max(1, Math.ceil(guests / 50));
    return base * days;
  }, [guests, days]);

  const total = tokens * PRICE_PER_TOKEN;

  return (
    <section id="pricing" style={{ background: "#f8edd6" }} className="py-28 lg:py-36">
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8">
          {/* Left — Header + context */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start"
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
              Token Pricing
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
              Pay only for
              <br />
              what you use.
            </h2>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 400,
                fontSize: "15px",
                lineHeight: 1.7,
                color: "#3c58a7",
                marginTop: "16px",
                maxWidth: "340px",
              }}
            >
              No subscriptions. No monthly fees. Buy tokens that match the
              exact scale of your event, and use them when you're ready.
            </p>
            <div
              className="mt-8 flex items-center gap-3"
            >
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: "24px",
                  letterSpacing: "-0.02em",
                  color: "#0c123b",
                }}
              >
                {formatIDR(PRICE_PER_TOKEN)}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                  fontSize: "14px",
                  color: "#3c58a7",
                }}
              >
                per token
              </span>
            </div>
            <p
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 400,
                fontSize: "12px",
                color: "#3c58a7",
                marginTop: "8px",
              }}
            >
              1 token covers up to 50 guests for 1 day.
              <br />
              Unused tokens never expire.
            </p>
          </motion.div>

          {/* Right — Calculator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-8"
          >
            <div
              style={{
                background: "#fbeed4",
                border: "1px solid #867bba",
                borderRadius: "16px",
              }}
            >
              {/* Inputs */}
              <div style={{ padding: "40px", borderBottom: "1px solid #867bba" }}>
                <div className="flex flex-col gap-10">
                  {/* Guest Count */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          fontWeight: 500,
                          fontSize: "14px",
                          color: "#3c58a7",
                        }}
                      >
                        Guest Count
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          fontWeight: 600,
                          fontSize: "20px",
                          color: "#0c123b",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {guests.toLocaleString()}
                      </span>
                    </div>
                    {/* Custom slider track */}
                    <div className="relative w-full h-8 flex items-center">
                      <div className="absolute inset-y-0 left-0 right-0 flex items-center">
                        <div className="w-full h-[2px] bg-[#867bba] rounded-full relative">
                          <div
                            className="absolute top-0 left-0 h-full rounded-full"
                            style={{
                              width: `${((guests - 50) / (2000 - 50)) * 100}%`,
                              background: "#2d3895",
                            }}
                          />
                        </div>
                      </div>
                      <input
                        type="range"
                        min={50}
                        max={2000}
                        step={50}
                        value={guests}
                        onChange={(e) => setGuests(Number(e.target.value))}
                        className="absolute inset-0 w-full opacity-0 cursor-pointer"
                        style={{ height: "32px" }}
                      />
                      {/* Thumb indicator */}
                      <div
                        className="absolute w-3.5 h-3.5 rounded-full pointer-events-none"
                        style={{
                          background: "#0c123b",
                          border: "2px solid #2d3895",
                          left: `calc(${((guests - 50) / (2000 - 50)) * 100}% - 7px)`,
                          top: "50%",
                          transform: "translateY(-50%)",
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "11px", color: "#867bba" }}>50</span>
                      <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "11px", color: "#867bba" }}>2,000</span>
                    </div>
                  </div>

                  {/* Duration */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          fontWeight: 500,
                          fontSize: "14px",
                          color: "#3c58a7",
                        }}
                      >
                        Event Duration
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          fontWeight: 600,
                          fontSize: "20px",
                          color: "#0c123b",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {days} {days === 1 ? "day" : "days"}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3, 5, 7].map((d) => (
                        <button
                          key={d}
                          onClick={() => setDays(d)}
                          style={{
                            fontFamily: "var(--font-body)",
                            fontWeight: days === d ? 600 : 400,
                            fontSize: "13px",
                            color: days === d ? "#0c123b" : "#3c58a7",
                            background: days === d ? "#f1e5ed" : "transparent",
                            border: days === d ? "1px solid #2d3895" : "1px solid #867bba",
                            borderRadius: "8px",
                            padding: "10px 18px",
                          }}
                          className="transition-all duration-150 hover:border-[#867bba]"
                        >
                          {d}d
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Result */}
              <div style={{ padding: "40px" }}>
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
                  <div>
                    <div className="flex items-baseline gap-3 mb-1">
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          fontWeight: 400,
                          fontSize: "13px",
                          color: "#3c58a7",
                        }}
                      >
                        Tokens required
                      </span>
                      <motion.span
                        key={tokens}
                        initial={{ opacity: 0.4, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          fontFamily: "var(--font-body)",
                          fontWeight: 700,
                          fontSize: "16px",
                          color: "#0c123b",
                        }}
                      >
                        {tokens}
                      </motion.span>
                    </div>
                    <motion.div
                      key={total}
                      initial={{ opacity: 0.4 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.25 }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          fontWeight: 700,
                          fontSize: "clamp(36px, 5vw, 52px)",
                          letterSpacing: "-0.04em",
                          color: "#0c123b",
                          lineHeight: 1,
                        }}
                      >
                        {formatIDR(total)}
                      </span>
                    </motion.div>
                    <p
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 400,
                        fontSize: "12px",
                        color: "#3c58a7",
                        marginTop: "8px",
                      }}
                    >
                      {tokens} token{tokens > 1 ? "s" : ""} × {formatIDR(PRICE_PER_TOKEN)} = {formatIDR(total)}
                    </p>
                  </div>
                  <button
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 500,
                      fontSize: "14px",
                      color: "#fbeed4",
                      background: "#2d3895",
                      padding: "14px 32px",
                      borderRadius: "8px",
                      flexShrink: 0,
                    }}
                    className="hover:bg-[#3c58a7] transition-colors duration-200"
                  >
                    Buy Tokens for this Event
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
