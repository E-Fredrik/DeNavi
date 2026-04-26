"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, QrCode, UserPlus, Search, Check, X, Download, Users } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const QrScanner = dynamic(() => import("@/components/QrScanner"), { ssr: false });

type Mode = "scan" | "search";

interface Guest {
  id: string;
  eventId: string;
  name: string;
  qrTicket: string;
  partySize: number;
  tableNumber: string | null;
  hasCheckedIn: boolean;
  isPlusOne: boolean;
  checkInTime: string | null;
}

interface EventData {
  id: string;
  name: string;
  date: string;
  guests: Guest[];
}

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>("search");
  const [query, setQuery] = useState("");
  const [qrInput, setQrInput] = useState("");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [showAddGuest, setShowAddGuest] = useState(false);
  const [newGuestName, setNewGuestName] = useState("");
  const [newPartySize, setNewPartySize] = useState(1);
  const [newTable, setNewTable] = useState("");
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [editTable, setEditTable] = useState("");
  const [editPartySize, setEditPartySize] = useState(1);

  const fetchEvent = useCallback(async () => {
    if (!eventId) return;
    try {
      const res = await fetch(`/api/events/${eventId}`);
      if (res.ok) setEvent(await res.json());
    } catch { /* */ } finally { setLoading(false); }
  }, [eventId]);

  useEffect(() => { fetchEvent(); }, [fetchEvent]);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 2500);
  };

  const handleCheckIn = async (guestId: string) => {
    const res = await fetch(`/api/events/${eventId}/guests/${guestId}/check-in`, { method: "POST" });
    if (res.ok) { const g = await res.json(); showToast(`${g.name} checked in`, true); await fetchEvent(); }
    else { const e = await res.json(); showToast(e.error || "Failed", false); }
  };

  const handleQrScan = async () => {
    if (!qrInput.trim() || !event) return;
    const code = qrInput.trim().toUpperCase();
    const guest = event.guests.find((g) => g.qrTicket === code);
    if (!guest) showToast("QR code not found", false);
    else if (guest.hasCheckedIn) showToast(`${guest.name} already checked in`, false);
    else await handleCheckIn(guest.id);
    setQrInput("");
  };

  const handleAddGuest = async () => {
    if (!eventId || !newGuestName.trim()) return;
    const res = await fetch(`/api/events/${eventId}/guests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newGuestName.trim(), isPlusOne: false, partySize: newPartySize, tableNumber: newTable }),
    });
    if (res.ok) {
      const g = await res.json();
      showToast(`${g.name} added`, true);
      setNewGuestName(""); setNewPartySize(1); setNewTable(""); setShowAddGuest(false);
      await fetchEvent();
    }
  };

  const handleUpdateGuest = async () => {
    if (!editingGuest) return;
    const res = await fetch(`/api/events/${eventId}/guests`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestId: editingGuest.id, tableNumber: editTable, partySize: editPartySize }),
    });
    if (res.ok) { showToast("Guest updated", true); setEditingGuest(null); await fetchEvent(); }
  };

  const handleAddPlusOne = async (guest: Guest) => {
    const res = await fetch(`/api/events/${eventId}/guests`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestId: guest.id, partySize: guest.partySize + 1 }),
    });
    if (res.ok) { showToast(`+1 added to ${guest.name}'s invitation (now ${guest.partySize + 1} people)`, true); await fetchEvent(); }
  };

  if (loading) return <div className="max-w-5xl px-6 lg:px-10 py-12"><p className="text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontSize: "14px" }}>Loading...</p></div>;
  if (!event) return <div className="max-w-5xl px-6 lg:px-10 py-12"><p className="text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontSize: "14px" }}>Event not found.</p></div>;

  const checkedIn = event.guests.filter((g) => g.hasCheckedIn).length;
  const total = event.guests.length;
  const totalPeople = event.guests.reduce((s, g) => s + g.partySize, 0);
  const filtered = query.trim() ? event.guests.filter((g) => g.name.toLowerCase().includes(query.toLowerCase())) : event.guests;

  return (
    <div className="max-w-5xl px-6 lg:px-10 py-8 lg:py-12 relative">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] dark:border-[#2a2660] text-[#3c58a7] dark:text-[#b3c2ff]"
            style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px" }}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Link href="/admin/dashboard/events" className="inline-flex items-center gap-2 mb-6 hover:opacity-70 transition-opacity">
          <ArrowLeft className="w-4 h-4 text-[#3c58a7] dark:text-[#b3c2ff]" strokeWidth={1.5} />
          <span className="text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px" }}>Back to events</span>
        </Link>
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-[#0c123b] dark:text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "24px", letterSpacing: "-0.02em" }}>{event.name}</h1>
            <p className="mt-1 text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px" }}>
              {new Date(event.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setShowAddGuest(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors hover:bg-[#f1e5ed] dark:hover:bg-[#18203c] bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] dark:border-[#2a2660] text-[#3c58a7] dark:text-[#b3c2ff]"
              style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px" }}>
              <UserPlus className="w-3.5 h-3.5" strokeWidth={1.5} /> Add Invited Guest
            </button>
            <button onClick={() => showToast("Report exported (demo)", true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors hover:bg-[#f1e5ed] dark:hover:bg-[#18203c] bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] dark:border-[#2a2660] text-[#3c58a7] dark:text-[#b3c2ff]"
              style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px" }}>
              <Download className="w-3.5 h-3.5" strokeWidth={1.5} /> Export
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
        {[
          { label: "Invitations", value: total },
          { label: "Total People", value: totalPeople },
          { label: "Checked In", value: `${checkedIn} / ${total}` },
          { label: "Avg Party", value: total > 0 ? (totalPeople / total).toFixed(1) : "0" },
        ].map((s) => (
          <div key={s.label} className="p-4 rounded-xl bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] dark:border-[#2a2660]">
            <span className="text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "11px", letterSpacing: "0.04em", textTransform: "uppercase" }}>{s.label}</span>
            <div className="mt-1 text-[#0c123b] dark:text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "22px", letterSpacing: "-0.02em" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="mt-4 h-1 rounded-full overflow-hidden bg-[#f1e5ed] dark:bg-[#18203c]">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${total > 0 ? (checkedIn / total) * 100 : 0}%`, background: "#2d3895" }} />
      </div>

      {/* Mode toggle */}
      <div className="mt-8">
        <div className="flex items-center gap-1 p-1 rounded-lg w-fit bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] dark:border-[#2a2660]">
          {(["search", "scan"] as Mode[]).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${mode === m ? "bg-[#f1e5ed] dark:bg-[#18203c] border border-[#867bba] dark:border-[#2a2660]" : "border border-transparent"}`}
              style={{ fontFamily: "var(--font-body)", fontWeight: mode === m ? 500 : 400, fontSize: "12px" }}>
              {m === "search" ? <Search className={`w-3.5 h-3.5 ${mode === m ? "text-[#0c123b] dark:text-[#e8eeff]" : "text-[#3c58a7] dark:text-[#b3c2ff]"}`} strokeWidth={1.5} /> : <QrCode className={`w-3.5 h-3.5 ${mode === m ? "text-[#0c123b] dark:text-[#e8eeff]" : "text-[#3c58a7] dark:text-[#b3c2ff]"}`} strokeWidth={1.5} />}
              <span className={mode === m ? "text-[#0c123b] dark:text-[#e8eeff]" : "text-[#3c58a7] dark:text-[#b3c2ff]"}>{m === "search" ? "Search" : "QR Scan"}</span>
            </button>
          ))}
        </div>

        {mode === "scan" && (
          <div className="mt-4 flex flex-col gap-4">
            {/* Camera scanner */}
            <QrScanner onScan={(code) => {
              if (!event) return;
              const guest = event.guests.find((g) => g.qrTicket === code.toUpperCase());
              if (!guest) showToast(`QR not found: ${code}`, false);
              else if (guest.hasCheckedIn) showToast(`${guest.name} already checked in`, false);
              else handleCheckIn(guest.id);
            }} />

            {/* Manual input fallback */}
            <div>
              <p className="text-[#867bba] mb-2" style={{ fontFamily: "var(--font-body)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Or enter code manually</p>
              <div className="flex gap-2">
                <input value={qrInput} onChange={(e) => setQrInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleQrScan()}
                  placeholder="Enter QR ticket code"
                  className="flex-1 px-4 py-3 rounded-lg outline-none transition-colors bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] dark:border-[#2a2660] text-[#0c123b] dark:text-[#e8eeff]"
                  style={{ fontFamily: "var(--font-body)", fontSize: "14px" }} />
                <button onClick={handleQrScan} className="px-5 py-3 rounded-lg hover:bg-[#3c58a7] transition-colors" style={{ background: "#2d3895", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px", color: "#fbeed4" }}>Verify</button>
              </div>
            </div>
          </div>
        )}
        {mode === "search" && (
          <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-lg bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] dark:border-[#2a2660]">
            <Search className="w-4 h-4 flex-shrink-0 text-[#867bba]" strokeWidth={1.5} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search guest by name..."
              className="flex-1 bg-transparent outline-none text-[#0c123b] dark:text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontSize: "14px" }} />
            {query && <button onClick={() => setQuery("")}><X className="w-3.5 h-3.5 text-[#3c58a7] dark:text-[#b3c2ff]" strokeWidth={1.5} /></button>}
          </div>
        )}
      </div>

      {/* Guest list */}
      <div className="mt-4 rounded-xl overflow-hidden border border-[#867bba] dark:border-[#2a2660]">
        <div className="max-h-[480px] overflow-y-auto">
          {filtered.map((guest, idx) => (
            <div key={guest.id}
              className="flex items-center justify-between px-4 sm:px-5 py-3.5 transition-colors hover:bg-[#f1e5ed] dark:hover:bg-[#18203c] bg-[#fbeed4] dark:bg-[#111a34]"
              style={{ borderBottomWidth: idx < filtered.length - 1 ? "1px" : "0", borderBottomStyle: "solid", borderBottomColor: "#f1e5ed" }}>
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-[#f1e5ed] dark:bg-[#18203c] border border-[#867bba] dark:border-[#2a2660]">
                  <span className="text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "11px" }}>{guest.name.charAt(0)}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`truncate ${guest.hasCheckedIn ? "text-[#3c58a7] dark:text-[#b3c2ff]" : "text-[#0c123b] dark:text-[#e8eeff]"}`} style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px" }}>{guest.name}</span>
                    {guest.partySize > 1 && (
                      <span className="px-1.5 py-0.5 rounded flex-shrink-0 bg-[#f1e5ed] dark:bg-[#18203c] border border-[#867bba] dark:border-[#2a2660] text-[#3c58a7] dark:text-[#b3c2ff]"
                        style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "9px" }}>
                        <Users className="w-2.5 h-2.5 inline mr-0.5" strokeWidth={2} />{guest.partySize}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[#867bba]" style={{ fontFamily: "monospace", fontWeight: 400, fontSize: "10px" }}>{guest.qrTicket}</span>
                    {guest.tableNumber && (
                      <span className="text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "10px" }}>· {guest.tableNumber}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <button onClick={() => handleAddPlusOne(guest)}
                  className="px-2 py-1 rounded text-[#3c58a7] dark:text-[#b3c2ff] hover:bg-[#f1e5ed] dark:hover:bg-[#18203c] transition-colors border border-[#867bba] dark:border-[#2a2660]"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "10px" }}>+1</button>
                <button onClick={() => { setEditingGuest(guest); setEditTable(guest.tableNumber ?? ""); setEditPartySize(guest.partySize); }}
                  className="px-2 py-1 rounded text-[#3c58a7] dark:text-[#b3c2ff] hover:bg-[#f1e5ed] dark:hover:bg-[#18203c] transition-colors"
                  style={{ fontFamily: "var(--font-body)", fontSize: "10px" }}>Edit</button>
                {guest.hasCheckedIn ? (
                  <div className="flex items-center gap-1 px-2 py-1 rounded bg-[rgba(60,88,167,0.12)] border border-[rgba(60,88,167,0.18)]">
                    <Check className="w-3 h-3 text-[#3c58a7] dark:text-[#b3c2ff]" strokeWidth={2} />
                    <span className="text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "10px" }}>IN</span>
                  </div>
                ) : (
                  <button onClick={() => handleCheckIn(guest.id)}
                    className="px-3 py-1.5 rounded-lg hover:bg-[#3c58a7] transition-colors"
                    style={{ background: "#2d3895", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", color: "#fbeed4" }}>Check In</button>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-5 py-8 text-center bg-[#fbeed4] dark:bg-[#111a34]">
              <span className="text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "14px" }}>
                {event.guests.length === 0 ? "No guests yet. Add your first guest!" : "No guests found."}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Add guest modal */}
      {showAddGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(12,18,59,0.45)" }}>
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-xl p-6 bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] dark:border-[#2a2660]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[#0c123b] dark:text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "15px" }}>Add Invited Guest</h3>
              <button onClick={() => setShowAddGuest(false)} className="p-1 hover:opacity-70"><X className="w-4 h-4 text-[#3c58a7] dark:text-[#b3c2ff]" strokeWidth={1.5} /></button>
            </div>
            <p className="text-[#3c58a7] dark:text-[#b3c2ff] -mt-3 mb-2" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "12px" }}>Add a primary invitee. Use the <strong>+1</strong> button on a guest row to add plus-ones.</p>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block mb-1.5 text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Guest Name</label>
                <input value={newGuestName} onChange={(e) => setNewGuestName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddGuest()} placeholder="Full name" autoFocus
                  className="w-full px-3.5 py-2.5 rounded-lg outline-none transition-colors bg-[#f1e5ed] dark:bg-[#18203c] border border-[#867bba] dark:border-[#2a2660] text-[#0c123b] dark:text-[#e8eeff]"
                  style={{ fontFamily: "var(--font-body)", fontSize: "14px" }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Party Size</label>
                  <input type="number" value={newPartySize} onChange={(e) => setNewPartySize(Math.max(1, Number(e.target.value)))} min={1} max={20}
                    className="w-full px-3.5 py-2.5 rounded-lg outline-none transition-colors bg-[#f1e5ed] dark:bg-[#18203c] border border-[#867bba] dark:border-[#2a2660] text-[#0c123b] dark:text-[#e8eeff]"
                    style={{ fontFamily: "var(--font-body)", fontSize: "14px" }} />
                </div>
                <div>
                  <label className="block mb-1.5 text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Table / Seat</label>
                  <input value={newTable} onChange={(e) => setNewTable(e.target.value)} placeholder="e.g. Table 5"
                    className="w-full px-3.5 py-2.5 rounded-lg outline-none transition-colors bg-[#f1e5ed] dark:bg-[#18203c] border border-[#867bba] dark:border-[#2a2660] text-[#0c123b] dark:text-[#e8eeff]"
                    style={{ fontFamily: "var(--font-body)", fontSize: "14px" }} />
                </div>
              </div>
              <button onClick={handleAddGuest} disabled={!newGuestName.trim()}
                className="w-full py-2.5 rounded-lg hover:bg-[#3c58a7] transition-colors disabled:opacity-30"
                style={{ background: "#2d3895", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px", color: "#fbeed4" }}>Add Guest</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit guest modal */}
      {editingGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(12,18,59,0.45)" }}>
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-xl p-6 bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] dark:border-[#2a2660]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[#0c123b] dark:text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "15px" }}>Edit: {editingGuest.name}</h3>
              <button onClick={() => setEditingGuest(null)} className="p-1 hover:opacity-70"><X className="w-4 h-4 text-[#3c58a7] dark:text-[#b3c2ff]" strokeWidth={1.5} /></button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Party Size</label>
                  <input type="number" value={editPartySize} onChange={(e) => setEditPartySize(Math.max(1, Number(e.target.value)))} min={1}
                    className="w-full px-3.5 py-2.5 rounded-lg outline-none bg-[#f1e5ed] dark:bg-[#18203c] border border-[#867bba] dark:border-[#2a2660] text-[#0c123b] dark:text-[#e8eeff]"
                    style={{ fontFamily: "var(--font-body)", fontSize: "14px" }} />
                </div>
                <div>
                  <label className="block mb-1.5 text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Table / Seat</label>
                  <input value={editTable} onChange={(e) => setEditTable(e.target.value)} placeholder="e.g. A-12"
                    className="w-full px-3.5 py-2.5 rounded-lg outline-none bg-[#f1e5ed] dark:bg-[#18203c] border border-[#867bba] dark:border-[#2a2660] text-[#0c123b] dark:text-[#e8eeff]"
                    style={{ fontFamily: "var(--font-body)", fontSize: "14px" }} />
                </div>
              </div>
              <button onClick={handleUpdateGuest}
                className="w-full py-2.5 rounded-lg hover:bg-[#3c58a7] transition-colors"
                style={{ background: "#2d3895", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px", color: "#fbeed4" }}>Save Changes</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
