"use client";
import { useState, useEffect } from "react";
import { useOrganizer } from "@/lib/useOrganizer";
import { Coins, Plus, Minus, CreditCard, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Script from "next/script";

const PRICE_PER_TOKEN = 10000;
function formatIDR(val: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(val);
}

export default function TokensPage() {
  const { organizer, refresh } = useOrganizer();
  const [buyAmount, setBuyAmount] = useState(5);
  const [buying, setBuying] = useState(false);
  const total = buyAmount * PRICE_PER_TOKEN;

  // Make sure Midtrans is defined
  useEffect(() => {
    // cleanup or handle Midtrans snap popup if needed
  }, []);

  const handleBuy = async () => {
    if (!organizer || buying) return;
    setBuying(true);
    try {
      const res = await fetch("/api/payments/midtrans", { 
        method: "POST", 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify({ amount: buyAmount }) 
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Failed to initiate payment");

      if (data.token && typeof window !== "undefined" && (window as any).snap) {
        (window as any).snap.pay(data.token, {
          onSuccess: async function() {
            // Verify payment and give tokens since webhook cannot reach localhost
            await fetch("/api/payments/midtrans/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: data.transactionId })
            });
            refresh();
            setBuying(false);
          },
          onPending: async function() {
            await fetch("/api/payments/midtrans/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: data.transactionId })
            });
            refresh();
            setBuying(false);
          },
          onError: function() {
            setBuying(false);
          },
          onClose: function() {
            refresh();
            setBuying(false);
          }
        });
      }
    } catch (error) {
      console.error(error);
    } finally { 
      setBuying(false); 
    }
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
          <p className="text-zinc-500 dark:text-zinc-400 font-medium tracking-widest text-xs uppercase mb-2">Billing & Top-Up</p>
          <h1 className="text-zinc-900 dark:text-white font-semibold text-4xl tracking-tight">Navi Tokens</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-3 text-lg max-w-xl">
            Tokens are the currency of Navi. Use them to create events, send custom invitations, and unlock premium features.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.05 }}
          className="mt-10 relative overflow-hidden rounded-3xl bg-white/40 dark:bg-zinc-900/40 backdrop-blur-2xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl shadow-zinc-200/20 dark:shadow-black/40">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 dark:from-indigo-500/10 dark:to-purple-500/10 pointer-events-none" />
          <div className="p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between relative z-10 gap-6">
            <div>
              <span className="text-zinc-500 dark:text-zinc-400 font-medium text-sm flex items-center gap-2">
                <Coins className="w-4 h-4" /> Current Balance
              </span>
              <div className="mt-2 text-zinc-900 dark:text-white font-bold text-6xl sm:text-7xl tracking-tighter flex items-baseline gap-3">
                {organizer.tokenBalance}
                <span className="text-2xl text-zinc-400 dark:text-zinc-500 font-medium tracking-normal">tokens</span>
              </div>
            </div>
            <div className="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-4 py-2 rounded-full text-sm font-medium border border-indigo-100 dark:border-indigo-500/20 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Available for next event
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}
          className="mt-6 rounded-3xl bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl shadow-zinc-200/20 dark:shadow-black/40 overflow-hidden">
          <div className="p-8 sm:p-10 border-b border-zinc-200/50 dark:border-zinc-800/50">
            <h2 className="text-zinc-900 dark:text-white font-semibold text-xl mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-zinc-400" /> Top Up Balance
            </h2>
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="flex items-center gap-4 bg-zinc-100/50 dark:bg-zinc-950/50 p-2 rounded-2xl border border-zinc-200/50 dark:border-zinc-800/50 w-full sm:w-auto">
                <button onClick={() => setBuyAmount(Math.max(1, buyAmount - 1))} className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:bg-white dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:shadow-sm">
                  <Minus className="w-5 h-5" strokeWidth={2} />
                </button>
                <div className="w-20 text-center">
                  <span className="text-zinc-900 dark:text-white font-bold text-3xl tracking-tight">{buyAmount}</span>
                </div>
                <button onClick={() => setBuyAmount(Math.min(50, buyAmount + 1))} className="w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:bg-white dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:shadow-sm">
                  <Plus className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {[5, 10, 20, 50].map((n) => (
                  <button key={n} onClick={() => setBuyAmount(n)} className={`px-5 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${buyAmount === n ? "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-md" : "bg-zinc-100/50 dark:bg-zinc-950/50 text-zinc-600 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-800/50 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"}`}>
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="p-8 sm:p-10 bg-zinc-50/30 dark:bg-zinc-950/30">
            <div className="flex items-center justify-between mb-6">
              <span className="text-zinc-500 dark:text-zinc-400 font-medium text-base">Total amount ({buyAmount} × {formatIDR(PRICE_PER_TOKEN)})</span>
              <span className="text-zinc-900 dark:text-white font-bold text-3xl tracking-tight">{formatIDR(total)}</span>
            </div>
            <button onClick={handleBuy} disabled={buying} className="w-full py-4 rounded-2xl transition-all duration-300 font-medium text-base flex items-center justify-center gap-2 disabled:opacity-70 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 relative overflow-hidden group" style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 flex items-center gap-2">
                {buying ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>Proceed to Payment</>
                )}
              </span>
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
