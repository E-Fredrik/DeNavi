"use client";

import { useState } from "react";
import { Banknote, Gift, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// ─── Types ────────────────────────────────────────────────────────────────────

type AngpaoMode = "input" | "no_gift" | null;

interface AngpaoInputProps {
  onSubmit: (data: { amount: number | null; gift: string | null; mode: "gift" | "no_gift" }) => void;
  disabled?: boolean;
  compact?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatIDR(val: number): string {
  return new Intl.NumberFormat("id-ID").format(val);
}

function parseIDR(raw: string): number {
  return parseInt(raw.replace(/\D/g, ""), 10) || 0;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AngpaoInput({ onSubmit, disabled = false, compact = false }: AngpaoInputProps) {
  const [mode, setMode] = useState<AngpaoMode>(null);
  const [amountRaw, setAmountRaw] = useState("");
  const [giftText, setGiftText] = useState("");

  const amount = parseIDR(amountRaw);
  const hasValue = amount > 0 || giftText.trim().length > 0;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setAmountRaw(raw ? formatIDR(parseInt(raw, 10)) : "");
  };

  const handleSubmitGift = () => {
    if (!hasValue) return;
    onSubmit({
      amount: amount > 0 ? amount : null,
      gift: giftText.trim() || null,
      mode: "gift",
    });
    setAmountRaw("");
    setGiftText("");
    setMode(null);
  };

  const handleNoGift = () => {
    onSubmit({ amount: null, gift: null, mode: "no_gift" });
    setMode(null);
  };

  // Initial choice buttons
  if (mode === null) {
    return (
      <div className={`flex ${compact ? "flex-row gap-2" : "flex-col gap-3"}`}>
        <button
          onClick={() => setMode("input")}
          disabled={disabled}
          className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all hover:opacity-90 disabled:opacity-40 flex-1"
          style={{
            background: "#1A1A1A",
            border: "1px solid #333333",
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            fontSize: "13px",
            color: "#e8eeff",
          }}
        >
          <Banknote className="w-4 h-4 text-[#6B0F1A]" strokeWidth={1.5} />
          Catat Angpao / Hadiah
        </button>

        <button
          onClick={handleNoGift}
          disabled={disabled}
          className="flex items-center gap-2 px-4 py-3 rounded-lg transition-all hover:opacity-90 disabled:opacity-40 flex-1"
          style={{
            background: "#111111",
            border: "1px solid #333333",
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            fontSize: "13px",
            color: "#867bba",
          }}
        >
          <XCircle className="w-4 h-4" strokeWidth={1.5} />
          Lewati / Tidak ada Gift
        </button>
      </div>
    );
  }

  // Input form
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        className="rounded-lg p-4 flex flex-col gap-3"
        style={{ background: "#111111", border: "1px solid #333333" }}
      >
        <div className="flex items-center justify-between">
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "12px", color: "#e8eeff" }}>
            Catat Angpao / Hadiah
          </span>
          <button
            onClick={() => setMode(null)}
            className="text-xs hover:opacity-70 transition-opacity"
            style={{ fontFamily: "var(--font-body)", color: "#867bba" }}
          >
            Batal
          </button>
        </div>

        {/* Amount input */}
        <div>
          <label style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "#867bba", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Jumlah Uang (Opsional)
          </label>
          <div className="relative mt-1">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#867bba" }}
            >
              Rp
            </span>
            <input
              type="text"
              value={amountRaw}
              onChange={handleAmountChange}
              placeholder="contoh: 500.000"
              className="w-full pl-10 pr-3 py-2.5 rounded-lg outline-none transition-colors focus:border-[#6B0F1A]"
              style={{
                background: "#1A1A1A",
                border: "1px solid #333333",
                color: "#e8eeff",
                fontFamily: "var(--font-body)",
                fontSize: "14px",
              }}
            />
          </div>
        </div>

        {/* Gift description */}
        <div>
          <label style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "#867bba", textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Deskripsi Hadiah Fisik (Opsional)
          </label>
          <input
            type="text"
            value={giftText}
            onChange={(e) => setGiftText(e.target.value)}
            placeholder="contoh: Microwave, Set Piring, dll."
            className="w-full mt-1 px-3 py-2.5 rounded-lg outline-none transition-colors focus:border-[#6B0F1A]"
            style={{
              background: "#1A1A1A",
              border: "1px solid #333333",
              color: "#e8eeff",
              fontFamily: "var(--font-body)",
              fontSize: "13px",
            }}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-1">
          <button
            onClick={handleNoGift}
            disabled={disabled}
            className="px-3 py-2 rounded-lg transition-colors hover:opacity-80"
            style={{
              background: "transparent",
              border: "1px solid #333333",
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: "12px",
              color: "#867bba",
            }}
          >
            Lewati
          </button>
          <button
            onClick={handleSubmitGift}
            disabled={disabled || !hasValue}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors hover:opacity-90 disabled:opacity-40"
            style={{
              background: "#6B0F1A",
              border: "1px solid #8B1F2A",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: "12px",
              color: "#fff",
            }}
          >
            <Gift className="w-3.5 h-3.5" strokeWidth={1.5} />
            Simpan
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
