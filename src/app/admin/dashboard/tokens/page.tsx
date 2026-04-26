"use client";
import { useState } from "react";
import { useOrganizer } from "@/lib/useOrganizer";
import { db } from "@/lib/db";
import { Coins, Plus, Minus } from "lucide-react";
import { motion } from "motion/react";

const PRICE_PER_TOKEN = 50000;

function formatIDR(val: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
}

export default function TokensPage() {
  const { organizer, refresh } = useOrganizer();
  const [buyAmount, setBuyAmount] = useState(5);
  const [purchased, setPurchased] = useState(false);

  const total = buyAmount * PRICE_PER_TOKEN;

  const handleBuy = () => {
    if (!organizer) return;
    db.updateOrganizerTokens(organizer.id, buyAmount);
    refresh();
    setPurchased(true);
    setTimeout(() => setPurchased(false), 3000);
  };

  if (!organizer) return null;

  return (
    <div className="max-w-4xl px-6 lg:px-10 py-8 lg:py-12">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px", color: "#3c58a7", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Tokens
        </p>
        <h1 className="mt-2" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "28px", letterSpacing: "-0.03em", color: "#0c123b" }}>
          Token Balance
        </h1>
      </motion.div>

      {/* Balance card */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="mt-8 p-8 rounded-xl"
        style={{ background: "#fbeed4", border: "1px solid #2d3895" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px", color: "#3c58a7" }}>
              Available Tokens
            </span>
            <div className="mt-1" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "48px", letterSpacing: "-0.04em", color: "#0c123b", lineHeight: 1 }}>
              {organizer.tokenBalance}
            </div>
            <p className="mt-3" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px", color: "#3c58a7" }}>
              1 token = up to 50 guests for 1 day · {formatIDR(PRICE_PER_TOKEN)} each
            </p>
          </div>
          <Coins className="w-8 h-8" style={{ color: "#2d3895" }} strokeWidth={1} />
        </div>
      </motion.div>

      {/* Buy tokens */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-4 rounded-xl"
        style={{ background: "#fbeed4", border: "1px solid #867bba" }}
      >
        <div className="p-8" style={{ borderBottom: "1px solid #f1e5ed" }}>
          <h2 style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "16px", color: "#0c123b", marginBottom: "20px" }}>
            Buy Tokens
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setBuyAmount(Math.max(1, buyAmount - 1))}
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors hover:bg-[#f1e5ed]"
              style={{ background: "#fbeed4", border: "1px solid #867bba" }}
            >
              <Minus className="w-4 h-4" style={{ color: "#3c58a7" }} strokeWidth={1.5} />
            </button>
            <div className="flex-1 text-center">
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "40px", letterSpacing: "-0.04em", color: "#0c123b" }}>
                {buyAmount}
              </span>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "14px", color: "#3c58a7", display: "block" }}>
                token{buyAmount > 1 ? "s" : ""}
              </span>
            </div>
            <button
              onClick={() => setBuyAmount(Math.min(50, buyAmount + 1))}
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors hover:bg-[#f1e5ed]"
              style={{ background: "#fbeed4", border: "1px solid #867bba" }}
            >
              <Plus className="w-4 h-4" style={{ color: "#3c58a7" }} strokeWidth={1.5} />
            </button>
          </div>

          {/* Quick select */}
          <div className="flex gap-2 mt-5 justify-center">
            {[1, 5, 10, 20].map((n) => (
              <button
                key={n}
                onClick={() => setBuyAmount(n)}
                className="px-4 py-2 rounded-lg transition-colors"
                style={{
                  background: buyAmount === n ? "#f1e5ed" : "transparent",
                  border: buyAmount === n ? "1px solid #2d3895" : "1px solid #867bba",
                  fontFamily: "var(--font-body)",
                  fontWeight: buyAmount === n ? 600 : 400,
                  fontSize: "13px",
                  color: buyAmount === n ? "#0c123b" : "#3c58a7",
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="p-8">
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px", color: "#3c58a7" }}>
              {buyAmount} × {formatIDR(PRICE_PER_TOKEN)}
            </span>
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "24px", letterSpacing: "-0.03em", color: "#0c123b" }}>
              {formatIDR(total)}
            </span>
          </div>

          <button
            onClick={handleBuy}
            className="w-full mt-4 py-3.5 rounded-lg transition-colors duration-150 hover:bg-[#3c58a7]"
            style={{ background: "#2d3895", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "14px", color: "#fbeed4" }}
          >
            {purchased ? "✓ Tokens Added!" : "Purchase Tokens"}
          </button>

          <p className="mt-3 text-center" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "12px", color: "#867bba" }}>
            Tokens are added instantly. No expiry date.
          </p>
        </div>
      </motion.div>

      {/* Usage guide */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="mt-4 p-6 rounded-xl"
        style={{ background: "#fbeed4", border: "1px solid #867bba" }}
      >
        <h3 style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "14px", color: "#0c123b", marginBottom: "12px" }}>
          How tokens work
        </h3>
        <div className="flex flex-col gap-3">
          {[
            { step: "01", text: "1 token covers up to 50 guests for 1 day of event check-in." },
            { step: "02", text: "Tokens are deducted when you create an event, based on expected guest count." },
            { step: "03", text: "Unused tokens never expire — use them for your next event." },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3" style={{ paddingBottom: "12px", borderBottom: "1px solid #f1e5ed" }}>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "11px", color: "#867bba", flexShrink: 0 }}>
                {item.step}
              </span>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px", color: "#3c58a7", lineHeight: 1.6 }}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
