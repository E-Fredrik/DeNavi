"use client";
import { useState, useEffect } from "react";
import { useOrganizer } from "@/lib/useOrganizer";
import { Coins, Plus, Minus, CreditCard } from "lucide-react";
import { motion } from "motion/react";
import Script from "next/script";

const PRICE_PER_TOKEN = 10000;
function formatIDR(val: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
}

export default function TokensPage() {
  const { organizer, refresh } = useOrganizer();
  const [buyAmount, setBuyAmount] = useState<number | "">(5);
  const [buying, setBuying] = useState(false);
  const numAmount = typeof buyAmount === "number" ? buyAmount : 0;
  const total = numAmount * PRICE_PER_TOKEN;

  // Make sure Midtrans is defined
  useEffect(() => {
    // cleanup or handle Midtrans snap popup if needed
  }, []);

  const handleBuy = async () => {
    if (!organizer || buying || numAmount < 1) return;
    setBuying(true);
    try {
      const res = await fetch("/api/payments/midtrans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: numAmount }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Gagal memulai pembayaran");

      if (data.token && typeof window !== "undefined" && (window as any).snap) {
        (window as any).snap.pay(data.token, {
          onSuccess: async function () {
            await fetch("/api/payments/midtrans/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: data.transactionId }),
            });
            refresh();
            setBuying(false);
          },
          onPending: async function () {
            await fetch("/api/payments/midtrans/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: data.transactionId }),
            });
            refresh();
            setBuying(false);
          },
          onError: function () {
            setBuying(false);
          },
          onClose: function () {
            refresh();
            setBuying(false);
          },
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setBuying(false);
    }
  };

  const increment = (step: number) => {
    setBuyAmount((prev) => {
      const n = typeof prev === "number" ? prev : 0;
      return Math.min(9999, Math.max(1, n + step));
    });
  };

  if (!organizer) return null;

  return (
    <>
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="lazyOnload"
      />
      <div className="max-w-4xl px-6 lg:px-10 py-8 lg:py-12 min-h-[calc(100vh-64px)] flex flex-col">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <p
            className="text-[#3c58a7] dark:text-[#b3c2ff]"
            style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px", letterSpacing: "0.06em", textTransform: "uppercase" }}
          >
            Tagihan & Top-Up
          </p>
          <h1
            className="mt-2 text-[#0c123b] dark:text-[#e8eeff]"
            style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "28px", letterSpacing: "-0.03em", lineHeight: 1.15 }}
          >
            Token Navi
          </h1>
          <p
            className="mt-2 text-[#3c58a7] dark:text-[#b3c2ff] max-w-xl"
            style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "14px" }}
          >
            Token adalah mata uang di Navi. Gunakan untuk membuat acara, mengirim undangan, dan membuka fitur premium.
          </p>
        </motion.div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="mt-10 relative overflow-hidden rounded-xl"
          style={{ background: "#111111", border: "1px solid #333333" }}
        >
          <div className="p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <span className="flex items-center gap-2" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px", color: "#867bba" }}>
                <Coins className="w-4 h-4" /> Saldo Saat Ini
              </span>
              <div className="mt-2 flex items-baseline gap-3">
                <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "56px", letterSpacing: "-0.03em", color: "#e8eeff" }}>
                  {organizer.tokenBalance}
                </span>
                <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "20px", color: "#867bba" }}>token</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Top Up Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-6 rounded-xl overflow-hidden"
          style={{ background: "#111111", border: "1px solid #333333" }}
        >
          <div className="p-8 sm:p-10" style={{ borderBottom: "1px solid #333333" }}>
            <h2 className="flex items-center gap-2 mb-6" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "18px", color: "#e8eeff" }}>
              <CreditCard className="w-5 h-5" style={{ color: "#867bba" }} /> Isi Ulang Saldo
            </h2>

            {/* Stepper Input */}
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex items-center gap-2 p-2 rounded-xl" style={{ background: "#1A1A1A", border: "1px solid #333333" }}>
                {/* -10 */}
                <button
                  onClick={() => increment(-10)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
                  style={{ background: "#111111", border: "1px solid #333333", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "11px", color: "#867bba" }}
                >
                  -10
                </button>
                {/* -1 */}
                <button
                  onClick={() => increment(-1)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
                  style={{ background: "#111111", border: "1px solid #333333", color: "#867bba" }}
                >
                  <Minus className="w-4 h-4" strokeWidth={2} />
                </button>
                {/* Input */}
                <div className="w-24 text-center">
                  <input
                    type="number"
                    value={buyAmount}
                    onChange={(e) => setBuyAmount(e.target.value === "" ? "" : Math.max(1, Math.min(9999, Number(e.target.value))))}
                    onBlur={() => setBuyAmount((prev) => { const n = Number(prev); return isNaN(n) || n < 1 ? 1 : Math.min(n, 9999); })}
                    min={1}
                    max={9999}
                    className="w-full text-center bg-transparent outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "28px", color: "#e8eeff" }}
                  />
                </div>
                {/* +1 */}
                <button
                  onClick={() => increment(1)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
                  style={{ background: "#111111", border: "1px solid #333333", color: "#b3c2ff" }}
                >
                  <Plus className="w-4 h-4" strokeWidth={2} />
                </button>
                {/* +10 */}
                <button
                  onClick={() => increment(10)}
                  className="w-10 h-10 rounded-lg flex items-center justify-center transition-colors hover:opacity-80"
                  style={{ background: "#111111", border: "1px solid #333333", fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "11px", color: "#b3c2ff" }}
                >
                  +10
                </button>
              </div>

              {/* Quick-pick buttons */}
              <div className="flex flex-wrap gap-2 justify-center">
                {[5, 10, 25, 50, 100].map((n) => (
                  <button
                    key={n}
                    onClick={() => setBuyAmount(n)}
                    className="px-4 py-2.5 rounded-lg transition-all duration-200"
                    style={{
                      background: numAmount === n ? "#6B0F1A" : "#1A1A1A",
                      border: `1px solid ${numAmount === n ? "#8B1F2A" : "#333333"}`,
                      fontFamily: "var(--font-body)",
                      fontWeight: 500,
                      fontSize: "13px",
                      color: numAmount === n ? "#fff" : "#867bba",
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            {/* Info: how many guests this covers */}
            <div className="mt-4 px-1">
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "12px", color: "#867bba" }}>
                💡 {numAmount} token ≈ cukup untuk <strong style={{ color: "#e8eeff" }}>{numAmount * 50}</strong> tamu undangan (1 token = 50 tamu)
              </span>
            </div>
          </div>

          {/* Summary + Buy */}
          <div className="p-8 sm:p-10" style={{ background: "#0d0d0d" }}>
            <div className="flex items-center justify-between mb-4">
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "14px", color: "#867bba" }}>
                Total ({numAmount} × {formatIDR(PRICE_PER_TOKEN)})
              </span>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "26px", letterSpacing: "-0.02em", color: "#e8eeff" }}>
                {formatIDR(total)}
              </span>
            </div>

            <div className="flex items-center justify-between mb-6">
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "12px", color: "#867bba" }}>
                Harga per tamu
              </span>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px", color: "#b3c2ff" }}>
                {numAmount > 0 ? formatIDR(Math.round(total / (numAmount * 50))) : "Rp0"} / tamu
              </span>
            </div>

            <button
              onClick={handleBuy}
              disabled={buying || numAmount < 1}
              className="w-full py-4 rounded-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
              style={{
                background: "#6B0F1A",
                border: "1px solid #8B1F2A",
                fontFamily: "var(--font-body)",
                fontWeight: 600,
                fontSize: "15px",
                color: "#fff",
              }}
            >
              {buying ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Memproses...
                </>
              ) : (
                "Lanjut ke Pembayaran"
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
