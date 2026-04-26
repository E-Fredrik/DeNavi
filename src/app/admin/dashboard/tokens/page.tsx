"use client";
import { useState } from "react";
import { useOrganizer } from "@/lib/useOrganizer";
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
  const [buying, setBuying] = useState(false);
  const total = buyAmount * PRICE_PER_TOKEN;

  const handleBuy = async () => {
    if (!organizer || buying) return;
    setBuying(true);
    try {
      const res = await fetch("/api/tokens", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: buyAmount }) });
      if (res.ok) { refresh(); setPurchased(true); setTimeout(() => setPurchased(false), 3000); }
    } finally { setBuying(false); }
  };

  if (!organizer) return null;

  return (
    <div className="max-w-4xl px-6 lg:px-10 py-8 lg:py-12">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px", letterSpacing: "0.06em", textTransform: "uppercase" }}>Tokens</p>
        <h1 className="mt-2 text-[#0c123b] dark:text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "28px", letterSpacing: "-0.03em" }}>Token Balance</h1>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
        className="mt-8 p-8 rounded-xl bg-[#fbeed4] dark:bg-[#111a34] border border-[#2d3895]">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px" }}>Available Tokens</span>
            <div className="mt-1 text-[#0c123b] dark:text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "48px", letterSpacing: "-0.04em", lineHeight: 1 }}>{organizer.tokenBalance}</div>
            <p className="mt-3 text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px" }}>1 token = up to 50 guests for 1 day · {formatIDR(PRICE_PER_TOKEN)} each</p>
          </div>
          <Coins className="w-8 h-8 text-[#2d3895]" strokeWidth={1} />
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
        className="mt-4 rounded-xl bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] dark:border-[#2a2660]">
        <div className="p-8 border-b border-[#f1e5ed] dark:border-[#2a2660]">
          <h2 className="text-[#0c123b] dark:text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "16px", marginBottom: "20px" }}>Buy Tokens</h2>
          <div className="flex items-center gap-4">
            <button onClick={() => setBuyAmount(Math.max(1, buyAmount - 1))} className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors hover:bg-[#f1e5ed] dark:hover:bg-[#18203c] bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] dark:border-[#2a2660]">
              <Minus className="w-4 h-4 text-[#3c58a7] dark:text-[#b3c2ff]" strokeWidth={1.5} />
            </button>
            <div className="flex-1 text-center">
              <span className="text-[#0c123b] dark:text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "40px", letterSpacing: "-0.04em" }}>{buyAmount}</span>
              <span className="block text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "14px" }}>token{buyAmount > 1 ? "s" : ""}</span>
            </div>
            <button onClick={() => setBuyAmount(Math.min(50, buyAmount + 1))} className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors hover:bg-[#f1e5ed] dark:hover:bg-[#18203c] bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] dark:border-[#2a2660]">
              <Plus className="w-4 h-4 text-[#3c58a7] dark:text-[#b3c2ff]" strokeWidth={1.5} />
            </button>
          </div>
          <div className="flex gap-2 mt-5 justify-center">
            {[1, 5, 10, 20].map((n) => (
              <button key={n} onClick={() => setBuyAmount(n)} className={`px-4 py-2 rounded-lg transition-colors ${buyAmount === n ? "bg-[#f1e5ed] dark:bg-[#18203c] border border-[#2d3895]" : "border border-[#867bba] dark:border-[#2a2660]"}`}
                style={{ fontFamily: "var(--font-body)", fontWeight: buyAmount === n ? 600 : 400, fontSize: "13px" }}>
                <span className={buyAmount === n ? "text-[#0c123b] dark:text-[#e8eeff]" : "text-[#3c58a7] dark:text-[#b3c2ff]"}>{n}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="p-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px" }}>{buyAmount} × {formatIDR(PRICE_PER_TOKEN)}</span>
            <span className="text-[#0c123b] dark:text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "24px", letterSpacing: "-0.03em" }}>{formatIDR(total)}</span>
          </div>
          <button onClick={handleBuy} disabled={buying} className="w-full mt-4 py-3.5 rounded-lg transition-colors duration-150 hover:bg-[#3c58a7] disabled:opacity-50" style={{ background: "#2d3895", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "14px", color: "#fbeed4" }}>
            {purchased ? "✓ Tokens Added!" : buying ? "Processing..." : "Purchase Tokens"}
          </button>
          <p className="mt-3 text-center text-[#867bba]" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "12px" }}>Tokens are added instantly. No expiry date.</p>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.15 }}
        className="mt-4 p-6 rounded-xl bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] dark:border-[#2a2660]">
        <h3 className="text-[#0c123b] dark:text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "14px", marginBottom: "12px" }}>How tokens work</h3>
        <div className="flex flex-col gap-3">
          {[
            { step: "01", text: "1 token covers up to 50 guests for 1 day of event check-in." },
            { step: "02", text: "Tokens are deducted when you create an event, based on expected guest count." },
            { step: "03", text: "Unused tokens never expire — use them for your next event." },
          ].map((item) => (
            <div key={item.step} className="flex items-start gap-3 pb-3 border-b border-[#f1e5ed] dark:border-[#2a2660]">
              <span className="text-[#867bba] flex-shrink-0" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "11px" }}>{item.step}</span>
              <span className="text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px", lineHeight: 1.6 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
