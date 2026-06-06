"use client";
import { useState, useMemo } from "react";
import { motion } from "motion/react";
import Link from "next/link";

const PRICE_PER_TOKEN = 10000; //Change this to update the price displayed taken from postgre

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
    <section id="pricing" className="py-28 lg:py-36 bg-[#f8edd6] dark:bg-[#0b1022]">
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
                color: "var(--palette-secondary)",
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
                color: "var(--palette-ink)",
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
                color: "var(--palette-text-sub)",
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
                  color: "var(--palette-ink)",
                }}
              >
                {formatIDR(PRICE_PER_TOKEN)}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                  fontSize: "14px",
                  color: "var(--palette-text-sub)",
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
                color: "var(--palette-text-sub)",
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
              className="bg-[#fbeed4] dark:bg-[#111a34]"
              style={{
                border: "1px solid #867bba",
                borderRadius: "16px",
              }}
            >
              {/* Inputs */}
              <div style={{ padding: "40px", borderBottom: "1px solid #867bba" }}>
                <div className="flex flex-col gap-10">
                  {/* Guest Count — Number Input + Steppers */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          fontWeight: 500,
                          fontSize: "14px",
                          color: "var(--palette-text-sub)",
                        }}
                      >
                        Guest Count
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setGuests(prev => Math.max(50, prev - 50))}
                        className="w-12 h-12 rounded-lg flex items-center justify-center transition-all hover:bg-[#f1e5ed] dark:hover:bg-[#18203c]"
                        style={{ border: "1px solid #867bba" }}
                      >
                        <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "20px", color: "#3c58a7" }}>−</span>
                      </button>
                      <div className="flex-1 relative">
                        <input
                          type="number"
                          value={guests}
                          onChange={(e) => setGuests(e.target.value === "" ? "" as any : Number(e.target.value))}
                          onBlur={() => setGuests((prev: any) => { const n = Number(prev); return isNaN(n) || n < 50 ? 50 : Math.min(n, 10000); })}
                          min={50}
                          max={10000}
                          className="w-full text-center px-4 py-3 rounded-lg outline-none transition-colors bg-[#f1e5ed] dark:bg-[#18203c] border text-[#0c123b] dark:text-[#e8eeff] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          style={{
                            fontFamily: "var(--font-body)",
                            fontWeight: 600,
                            fontSize: "20px",
                            letterSpacing: "-0.02em",
                            borderColor: "#867bba",
                          }}
                        />
                      </div>
                      <button
                        onClick={() => setGuests(prev => Math.min(10000, prev + 50))}
                        className="w-12 h-12 rounded-lg flex items-center justify-center transition-all hover:bg-[#f1e5ed] dark:hover:bg-[#18203c]"
                        style={{ border: "1px solid #867bba" }}
                      >
                        <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "20px", color: "#3c58a7" }}>+</span>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {[100, 200, 500, 1000, 2000, 5000].map((n) => (
                        <button
                          key={n}
                          onClick={() => setGuests(n)}
                          style={{
                            fontFamily: "var(--font-body)",
                            fontWeight: guests === n ? 600 : 400,
                            fontSize: "12px",
                            color: guests === n ? "#0c123b" : "#3c58a7",
                            background: guests === n ? "#f1e5ed" : "transparent",
                            border: guests === n ? "1px solid #2d3895" : "1px solid #867bba",
                            borderRadius: "8px",
                            padding: "8px 14px",
                          }}
                          className="transition-all duration-150 hover:border-[#867bba]"
                        >
                          {n.toLocaleString()}
                        </button>
                      ))}
                    </div>
                    <div className="flex justify-between mt-2">
                      <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "11px", color: "#867bba" }}>Min: 50</span>
                      <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "11px", color: "#867bba" }}>Max: 10,000</span>
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
                          color: "var(--palette-text-sub)",
                        }}
                      >
                        Event Duration
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          fontWeight: 600,
                          fontSize: "20px",
                          color: "var(--palette-ink)",
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
                            color: days === d ? "var(--palette-ink)" : "var(--palette-text-sub)",
                            background: days === d ? "var(--palette-secondary)" : "transparent",
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
                        className="text-[#3c58a7] dark:text-[#b3c2ff]"
                        style={{
                          fontFamily: "var(--font-body)",
                          fontWeight: 400,
                          fontSize: "13px",
                        }}
                      >
                        Tokens required
                      </span>
                      <motion.span
                        key={tokens}
                        initial={{ opacity: 0.4, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-[#0c123b] dark:text-[#e8eeff]"
                        style={{
                          fontFamily: "var(--font-body)",
                          fontWeight: 700,
                          fontSize: "16px",
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
                        className="text-[#0c123b] dark:text-[#e8eeff]"
                        style={{
                          fontFamily: "var(--font-body)",
                          fontWeight: 700,
                          fontSize: "clamp(36px, 5vw, 52px)",
                          letterSpacing: "-0.04em",
                          lineHeight: 1,
                        }}
                      >
                        {formatIDR(total)}
                      </span>
                    </motion.div>
                    <p
                      className="text-[#3c58a7] dark:text-[#b3c2ff]"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 400,
                        fontSize: "12px",
                        marginTop: "8px",
                      }}
                    >
                      {tokens} token{tokens > 1 ? "s" : ""} × {formatIDR(PRICE_PER_TOKEN)} = {formatIDR(total)}
                    </p>
                  </div>
                  <Link
                  href="/login"
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
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
