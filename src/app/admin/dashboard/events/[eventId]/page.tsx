"use client";

import { useMemo, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, QrCode, UserPlus, Search, Check, X, Download } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db } from "../../../../../lib/db";

type Mode = "scan" | "search";

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  // We handle event ID safely in client side
  const [mode, setMode] = useState<Mode>("search");
  const [query, setQuery] = useState("");
  const [qrInput, setQrInput] = useState("");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [newGuestName, setNewGuestName] = useState("");
  const [tick, setTick] = useState(0); // force re-render
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const event = useMemo(() => {
    if (!mounted || !eventId) return null;
    return db.getEvent(eventId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, tick, mounted]);

  const filtered = useMemo(() => {
    if (!event) return [];
    if (!query.trim()) return event.guests;
    return event.guests.filter((g) =>
      g.name.toLowerCase().includes(query.toLowerCase())
    );
  }, [event, query, tick]);

  if (!mounted) return null;

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2500);
  };

  const handleCheckIn = (guestId: string) => {
    const result = db.checkInGuest(guestId);
    if (result) {
      showToast(`${result.name} checked in`, true);
      setTick((t) => t + 1);
    } else {
      showToast("Already checked in or not found", false);
    }
  };

  const handleQrScan = () => {
    if (!qrInput.trim()) return;
    const guest = db.getGuestByQR(qrInput.trim().toUpperCase());
    if (!guest) {
      showToast("QR code not found", false);
    } else if (guest.hasCheckedIn) {
      showToast(`${guest.name} already checked in`, false);
    } else {
      const result = db.checkInGuest(guest.id);
      if (result) showToast(`${result.name} checked in via QR`, true);
      setTick((t) => t + 1);
    }
    setQrInput("");
  };

  const handleAddGuest = () => {
    if (!eventId || !newGuestName.trim()) return;
    const guest = db.addGuest({ eventId: eventId as string, name: newGuestName.trim(), isPlusOne: true });
    showToast(`${guest.name} added as plus-one`, true);
    setNewGuestName("");
    setShowAddGuest(false);
    setTick((t) => t + 1);
  };

  if (!event) {
    return (
      <div className="max-w-5xl px-6 lg:px-10 py-12">
        <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#3c58a7" }}>Event not found.</p>
      </div>
    );
  }

  const checkedIn = event.guests.filter((g) => g.hasCheckedIn).length;
  const total = event.guests.length;
  const plusOnes = event.guests.filter((g) => g.isPlusOne).length;

  return (
    <div className="max-w-5xl px-6 lg:px-10 py-8 lg:py-12 relative">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg"
            style={{
              background: "#fbeed4",
              border: `1px solid ${toast.ok ? "rgba(60,88,167,0.2)" : "#2d3895"}`,
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: "13px",
              color: "#3c58a7",
            }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Link href="/admin/dashboard/events" className="inline-flex items-center gap-2 mb-6 hover:opacity-70 transition-opacity">
          <ArrowLeft className="w-4 h-4" style={{ color: "#3c58a7" }} strokeWidth={1.5} />
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px", color: "#3c58a7" }}>Back to events</span>
        </Link>

        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "24px", letterSpacing: "-0.02em", color: "#0c123b" }}>
              {event.name}
            </h1>
            <p className="mt-1" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px", color: "#3c58a7" }}>
              {new Date(event.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddGuest(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors hover:bg-[#f1e5ed]"
              style={{ background: "#fbeed4", border: "1px solid #867bba", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", color: "#3c58a7" }}
            >
              <UserPlus className="w-3.5 h-3.5" strokeWidth={1.5} />
              Add Plus-One
            </button>
            <button
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors hover:bg-[#f1e5ed]"
              style={{ background: "#fbeed4", border: "1px solid #867bba", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", color: "#3c58a7" }}
              onClick={() => showToast("Report exported (demo)", true)}
            >
              <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
              Export
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        {[
          { label: "Total Guests", value: total },
          { label: "Checked In", value: `${checkedIn} / ${total}` },
          { label: "Plus-Ones", value: plusOnes },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-xl" style={{ background: "#fbeed4", border: "1px solid #867bba" }}>
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "11px", color: "#3c58a7", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              {s.label}
            </span>
            <div className="mt-1" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "22px", color: "#0c123b", letterSpacing: "-0.02em" }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="mt-4 h-1 rounded-full overflow-hidden" style={{ background: "#f1e5ed" }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${total > 0 ? (checkedIn / total) * 100 : 0}%`, background: "#2d3895" }}
        />
      </div>

      {/* Mode toggle + Check-in area */}
      <div className="mt-8">
        <div className="flex items-center gap-1 p-1 rounded-lg w-fit" style={{ background: "#fbeed4", border: "1px solid #867bba" }}>
          {(["search", "scan"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="flex items-center gap-2 px-4 py-2 rounded-md transition-colors"
              style={{
                background: mode === m ? "#f1e5ed" : "transparent",
                border: mode === m ? "1px solid #867bba" : "1px solid transparent",
                fontFamily: "var(--font-body)",
                fontWeight: mode === m ? 500 : 400,
                fontSize: "12px",
                color: mode === m ? "#0c123b" : "#3c58a7",
              }}
            >
              {m === "search" ? <Search className="w-3.5 h-3.5" strokeWidth={1.5} /> : <QrCode className="w-3.5 h-3.5" strokeWidth={1.5} />}
              {m === "search" ? "Staff Search" : "QR Scan"}
            </button>
          ))}
        </div>

        {/* QR mode */}
        {mode === "scan" && (
          <div className="mt-4">
            <div className="flex gap-2">
              <input
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleQrScan()}
                placeholder="Enter or scan QR ticket code (e.g. QR-BH001AAA)"
                className="flex-1 px-4 py-3 rounded-lg outline-none focus:border-[#2d3895] transition-colors"
                style={{ background: "#fbeed4", border: "1px solid #867bba", fontFamily: "var(--font-body)", fontSize: "14px", color: "#0c123b", letterSpacing: "0.03em" }}
              />
              <button
                onClick={handleQrScan}
                className="px-5 py-3 rounded-lg hover:bg-[#3c58a7] transition-colors"
                style={{ background: "#2d3895", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px", color: "#fbeed4" }}
              >
                Verify
              </button>
            </div>
          </div>
        )}

        {/* Search mode */}
        {mode === "search" && (
          <div className="mt-4">
            <div className="flex items-center gap-2 px-4 py-3 rounded-lg" style={{ background: "#fbeed4", border: "1px solid #867bba" }}>
              <Search className="w-4 h-4 flex-shrink-0" style={{ color: "#867bba" }} strokeWidth={1.5} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search guest by name..."
                className="flex-1 bg-transparent outline-none"
                style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#0c123b" }}
              />
              {query && (
                <button onClick={() => setQuery("")}>
                  <X className="w-3.5 h-3.5" style={{ color: "#3c58a7" }} strokeWidth={1.5} />
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Guest list */}
      <div className="mt-4 rounded-xl overflow-hidden" style={{ border: "1px solid #867bba" }}>
        <div className="max-h-[420px] overflow-y-auto">
          {filtered.map((guest, idx) => (
            <div
              key={guest.id}
              className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-[#fbeed4]"
              style={{
                background: "#fbeed4",
                borderBottom: idx < filtered.length - 1 ? "1px solid #f1e5ed" : "none",
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "#f1e5ed", border: "1px solid #867bba" }}
                >
                  <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "11px", color: "#3c58a7" }}>
                    {guest.name.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="truncate"
                      style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px", color: guest.hasCheckedIn ? "#3c58a7" : "#0c123b" }}
                    >
                      {guest.name}
                    </span>
                    {guest.isPlusOne && (
                      <span
                        className="px-1.5 py-0.5 rounded flex-shrink-0"
                        style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "9px", color: "#3c58a7", background: "#f1e5ed", border: "1px solid #867bba" }}
                      >
                        +1
                      </span>
                    )}
                  </div>
                  <span style={{ fontFamily: "monospace", fontWeight: 400, fontSize: "10px", color: "#867bba" }}>
                    {guest.qrTicket}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {guest.hasCheckedIn ? (
                  <div className="flex items-center gap-2">
                    <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "11px", color: "#3c58a7" }}>
                      {guest.checkInTime ? new Date(guest.checkInTime).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) : "—"}
                    </span>
                    <div className="flex items-center gap-1 px-2 py-1 rounded" style={{ background: "rgba(60,88,167,0.12)", border: "1px solid rgba(60,88,167,0.18)" }}>
                      <Check className="w-3 h-3" style={{ color: "#3c58a7" }} strokeWidth={2} />
                      <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "10px", color: "#3c58a7" }}>IN</span>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleCheckIn(guest.id)}
                    className="px-3.5 py-1.5 rounded-lg hover:bg-[#3c58a7] transition-colors"
                    style={{ background: "#2d3895", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", color: "#fbeed4" }}
                  >
                    Check In
                  </button>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-5 py-8 text-center" style={{ background: "#fbeed4" }}>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "14px", color: "#3c58a7" }}>
                No guests found.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Add guest modal */}
      {showAddGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(12,18,59,0.45)" }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-xl p-6"
            style={{ background: "#fbeed4", border: "1px solid #867bba" }}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "15px", color: "#0c123b" }}>Add Plus-One</h3>
              <button onClick={() => setShowAddGuest(false)} className="p-1 hover:opacity-70">
                <X className="w-4 h-4" style={{ color: "#3c58a7" }} strokeWidth={1.5} />
              </button>
            </div>
            <label htmlFor="plus-one-name" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", color: "#3c58a7", letterSpacing: "0.04em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
              Guest Name
            </label>
            <input
              id="plus-one-name"
              value={newGuestName}
              onChange={(e) => setNewGuestName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddGuest()}
              placeholder="Full name"
              className="w-full px-3.5 py-2.5 rounded-lg outline-none focus:border-[#2d3895] transition-colors"
              style={{ background: "#f1e5ed", border: "1px solid #867bba", fontFamily: "var(--font-body)", fontSize: "14px", color: "#0c123b" }}
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
            />
            <button
              onClick={handleAddGuest}
              disabled={!newGuestName.trim()}
              className="w-full mt-4 py-2.5 rounded-lg hover:bg-[#3c58a7] transition-colors disabled:opacity-30"
              style={{ background: "#2d3895", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px", color: "#fbeed4" }}
            >
              Add Guest
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
