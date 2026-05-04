"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, QrCode, UserPlus, Search, Check, X, Download, Users, LayoutTemplate, Send, Lock, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const QrScanner = dynamic(() => import("@/components/QrScanner"), { ssr: false });

type Mode = "scan" | "search";

interface Guest {
  id: string;
  eventId: string;
  name: string;
  qrTicket: string;
  partySize: number;
  actualAttendees: number | null;
  tableNumber: string | null;
  hasCheckedIn: boolean;
  isPlusOne: boolean;
  checkInTime: string | null;
}

interface EventData {
  id: string;
  name: string;
  date: string;
  checkInPassword?: string | null;
  guests: Guest[];
  eventAddons?: any[];
}

export default function EventDetailPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const router = useRouter();
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
  const [editHasCheckedIn, setEditHasCheckedIn] = useState(false);
  const [editActualAttendees, setEditActualAttendees] = useState(1);
  
  const [checkingInGuest, setCheckingInGuest] = useState<Guest | null>(null);
  const [checkInAttendees, setCheckInAttendees] = useState(1);
  const [angpaoAmount, setAngpaoAmount] = useState<number | "">("");
  const [angpaoGiftText, setAngpaoGiftText] = useState("");

  const [inviteModal, setInviteModal] = useState<{ guest: Guest, email?: string } | null>(null);
  const [showExport, setShowExport] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

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

  const confirmCheckIn = async (guestId: string, actualAttendees: number) => {
    const bodyObj: any = { actualAttendees };
    
    // Only send angpao details if the user entered any.
    if (angpaoAmount !== "" && angpaoAmount > 0) bodyObj.angpaoAmount = angpaoAmount;
    if (angpaoGiftText.trim()) bodyObj.angpaoGift = angpaoGiftText.trim();

    const res = await fetch(`/api/events/${eventId}/guests/${guestId}/check-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyObj),
    });
    if (res.ok) {
      const g = await res.json();
      showToast(`${g.name} checked in with ${g.actualAttendees} people`, true);
      setCheckingInGuest(null);
      await fetchEvent();
    } else {
      const e = await res.json();
      showToast(e.error || "Failed", false);
    }
  };

  const hasAngpao = event?.eventAddons?.some((ea: any) => ea.addon.id === "angpao_tracking");
  const hasEmailBuilder = event?.eventAddons?.some((ea: any) => ea.addon.id === "custom_email");

  const handleCheckIn = (guest: Guest) => {
    if (guest.partySize > 1 || hasAngpao) {
      setCheckingInGuest(guest);
      setCheckInAttendees(guest.partySize);
      setAngpaoAmount("");
      setAngpaoGiftText("");
    } else {
      confirmCheckIn(guest.id, 1);
    }
  };

  const handleQrScan = async () => {
    if (!qrInput.trim() || !event) return;
    const code = qrInput.trim();
    const guest = event.guests.find((g) => g.qrTicket === code.toUpperCase() || code.includes(`/check-in/${g.id}`));
    if (!guest) showToast("QR code not found", false);
    else if (guest.hasCheckedIn) showToast(`${guest.name} already checked in`, false);
    else handleCheckIn(guest);
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
      body: JSON.stringify({ 
        guestId: editingGuest.id, 
        tableNumber: editTable, 
        partySize: editPartySize,
        hasCheckedIn: editHasCheckedIn,
        actualAttendees: editHasCheckedIn ? editActualAttendees : 0
      }),
    });
    if (res.ok) { showToast("Guest updated", true); setEditingGuest(null); await fetchEvent(); }
  };

  const handleDeleteGuest = async (guestId: string) => {
    if (!confirm("Are you sure you want to remove this guest?")) return;
    const res = await fetch(`/api/events/${eventId}/guests?guestId=${guestId}`, {
      method: "DELETE",
    });
    if (res.ok) { showToast("Guest removed", true); setEditingGuest(null); await fetchEvent(); }
    else { showToast("Failed to remove guest", false); }
  };

  const handleAddPlusOne = async (guest: Guest) => {
    const res = await fetch(`/api/events/${eventId}/guests`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestId: guest.id, partySize: guest.partySize + 1 }),
    });
    if (res.ok) { showToast(`+1 added to ${guest.name}'s invitation (now ${guest.partySize + 1} people)`, true); await fetchEvent(); }
  };

  const handleExport = (format: "csv" | "json") => {
    if (!event) return;
    const data = event.guests.map(g => ({
      "Guest ID": g.id,
      "Name": g.name,
      "QR Ticket": g.qrTicket,
      "Party Size": g.partySize,
      "Actual Attendees": g.actualAttendees ?? 0,
      "Table Number": g.tableNumber ?? "",
      "Checked In": g.hasCheckedIn ? "Yes" : "No",
      "Check-in Time": g.checkInTime ? new Date(g.checkInTime).toLocaleString() : "",
      "Gifts": (g as any).angpaos ? (g as any).angpaos.map((a: any) => `${a.amount ? `Rp${a.amount}` : ""} ${a.gift ? `(${a.gift})` : ""}`).join("; ") : ""
    }));

    let blob, url, fileExt;

    if (format === "json") {
      blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      fileExt = "json";
    } else {
      const header = Object.keys(data[0]).join(",");
      const rows = data.map(obj => Object.values(obj).map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
      const csv = `${header}\n${rows}`;
      blob = new Blob([csv], { type: "text/csv" });
      fileExt = "csv";
    }

    url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${event.name.replace(/\s+/g, '_')}_guests.${fileExt}`;
    a.click();
    URL.revokeObjectURL(url);
    
    setShowExport(false);
    showToast(`Exported as ${format.toUpperCase()}`, true);
  };

  const handleUpdatePassword = async () => {
    if (!eventId || savingPassword) return;
    setSavingPassword(true);
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkInPassword: newPassword.trim() || null }),
      });
      if (res.ok) {
        showToast("Check-in password updated", true);
        setShowSecurity(false);
        await fetchEvent();
      } else {
        showToast("Failed to update password", false);
      }
    } catch {
      showToast("An error occurred", false);
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) return <div className="max-w-5xl px-6 lg:px-10 py-12"><p className="text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontSize: "14px" }}>Loading...</p></div>;
  if (!event) return <div className="max-w-5xl px-6 lg:px-10 py-12"><p className="text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontSize: "14px" }}>Event not found.</p></div>;

  const checkedIn = event.guests.filter((g) => g.hasCheckedIn).length;
  const total = event.guests.length;
  const totalPeople = event.guests.reduce((s, g) => s + g.partySize, 0);
  const filtered = query.trim() ? event.guests.filter((g) => g.name.toLowerCase().includes(query.toLowerCase())) : event.guests;
  
  const totalAngpaoAmount = (event as any).guests.reduce((sum: number, g: any) => sum + (g.angpaos?.reduce((s: number, a: any) => s + (a.amount || 0), 0) || 0), 0);
  const totalGifts = (event as any).guests.reduce((sum: number, g: any) => sum + (g.angpaos?.filter((a: any) => a.gift).length || 0), 0);

  const stats = [
    { label: "Invitations", value: total },
    { label: "Total People", value: totalPeople },
    { label: "Checked In", value: `${checkedIn} / ${total}` },
    { label: "Avg Party", value: total > 0 ? (totalPeople / total).toFixed(1) : "0" },
  ];

  if (hasAngpao) {
    stats.push({ label: "Total Angpao", value: `Rp ${totalAngpaoAmount.toLocaleString("id-ID")}` });
    stats.push({ label: "Gifts Received", value: totalGifts.toString() });
  }

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
            
            <button 
              onClick={() => {
                if (hasEmailBuilder) {
                  router.push(`/admin/dashboard/events/${eventId}/email`);
                } else {
                  showToast("Locked: Need Custom Email Template Addon", false);
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors border ${hasEmailBuilder ? "bg-[#fbeed4] dark:bg-[#111a34] border-[#867bba] dark:border-[#2a2660] text-[#3c58a7] dark:text-[#b3c2ff] hover:bg-[#f1e5ed] dark:hover:bg-[#18203c]" : "bg-gray-200/50 dark:bg-[#111a34]/50 border-gray-300 dark:border-[#2a2660]/50 text-gray-500 cursor-not-allowed opacity-80"}`}
              style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px" }}>
              <LayoutTemplate className="w-3.5 h-3.5" strokeWidth={1.5} /> 
              Email Builder
              {!hasEmailBuilder && <Lock className="w-3 h-3 ml-1 text-gray-400" strokeWidth={1.5} />}
            </button>
            <button onClick={() => { setShowSecurity(true); setNewPassword(event.checkInPassword || ""); }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors hover:bg-[#f1e5ed] dark:hover:bg-[#18203c] bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] dark:border-[#2a2660] text-[#3c58a7] dark:text-[#b3c2ff]"
              style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px" }}>
              <Lock className="w-3.5 h-3.5" strokeWidth={1.5} /> Security
            </button>
            <button onClick={() => setShowExport(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors hover:bg-[#f1e5ed] dark:hover:bg-[#18203c] bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] dark:border-[#2a2660] text-[#3c58a7] dark:text-[#b3c2ff]"
              style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px" }}>
              <Download className="w-3.5 h-3.5" strokeWidth={1.5} /> Export
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-6">
        {stats.map((s) => (
          <div key={s.label} className="p-4 rounded-xl bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] dark:border-[#2a2660]">
            <span className="text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "11px", letterSpacing: "0.04em", textTransform: "uppercase" }}>{s.label}</span>
            <div className="mt-1 text-[#0c123b] dark:text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "20px", letterSpacing: "-0.02em" }}>{s.value}</div>
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
              const guest = event.guests.find((g) => g.qrTicket === code.toUpperCase() || code.includes(`/check-in/${g.id}`));
              if (!guest) showToast(`QR not found: ${code}`, false);
              else if (guest.hasCheckedIn) showToast(`${guest.name} already checked in`, false);
              else handleCheckIn(guest);
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
                <button onClick={() => setInviteModal({ guest })}
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg transition-colors bg-[#f1e5ed] dark:bg-[#18203c] hover:bg-[#867bba] hover:text-white text-[#3c58a7] dark:text-[#b3c2ff]"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "11px" }}>
                  <Send className="w-3 h-3" strokeWidth={1.5} /> <span className="hidden sm:inline">Invite</span>
                </button>
                <button onClick={() => handleAddPlusOne(guest)}
                  className="px-2 py-1 rounded text-[#3c58a7] dark:text-[#b3c2ff] hover:bg-[#f1e5ed] dark:hover:bg-[#18203c] transition-colors border border-[#867bba] dark:border-[#2a2660]"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "10px" }}>+1</button>
                <button onClick={() => { setEditingGuest(guest); setEditTable(guest.tableNumber ?? ""); setEditPartySize(guest.partySize); setEditHasCheckedIn(guest.hasCheckedIn); setEditActualAttendees(guest.actualAttendees ?? guest.partySize); }}
                  className="px-2 py-1 rounded text-[#3c58a7] dark:text-[#b3c2ff] hover:bg-[#f1e5ed] dark:hover:bg-[#18203c] transition-colors"
                  style={{ fontFamily: "var(--font-body)", fontSize: "10px" }}>Edit</button>
                {guest.hasCheckedIn ? (
                  <button onClick={() => { setEditingGuest(guest); setEditTable(guest.tableNumber ?? ""); setEditPartySize(guest.partySize); setEditHasCheckedIn(guest.hasCheckedIn); setEditActualAttendees(guest.actualAttendees ?? guest.partySize); }} className="flex items-center gap-1 px-2 py-1 rounded bg-[rgba(60,88,167,0.12)] border border-[rgba(60,88,167,0.18)] hover:bg-[rgba(60,88,167,0.2)] transition-colors">
                    <Check className="w-3 h-3 text-[#3c58a7] dark:text-[#b3c2ff]" strokeWidth={2} />
                    <span className="text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "10px" }}>IN ({guest.actualAttendees || guest.partySize})</span>
                  </button>
                ) : (
                  <button onClick={() => handleCheckIn(guest)}
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

      {/* Export Modal */}
      {showExport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(12,18,59,0.45)" }}>
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-xl p-6 bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] dark:border-[#2a2660]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[#0c123b] dark:text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "15px" }}>Export Guests</h3>
              <button onClick={() => setShowExport(false)} className="p-1 hover:opacity-70"><X className="w-4 h-4 text-[#3c58a7] dark:text-[#b3c2ff]" strokeWidth={1.5} /></button>
            </div>
            <p className="text-[#3c58a7] dark:text-[#b3c2ff] -mt-3 mb-5" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "12px" }}>Select a format to download the guest list.</p>
            
            <div className="flex flex-col gap-3">
              <button onClick={() => handleExport("csv")}
                className="w-full py-2.5 rounded-lg transition-colors border bg-[#f1e5ed] dark:bg-[#18203c] border-[#867bba] dark:border-[#2a2660] text-[#0c123b] dark:text-[#e8eeff] hover:bg-[#3c58a7] hover:text-[#fbeed4]"
                style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px" }}>
                Export as CSV
              </button>
              <button onClick={() => handleExport("json")}
                className="w-full py-2.5 rounded-lg transition-colors border bg-[#f1e5ed] dark:bg-[#18203c] border-[#867bba] dark:border-[#2a2660] text-[#0c123b] dark:text-[#e8eeff] hover:bg-[#3c58a7] hover:text-[#fbeed4]"
                style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px" }}>
                Export as JSON
              </button>
            </div>
          </motion.div>
        </div>
      )}

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
              <div className="grid grid-cols-2 gap-3 mt-1">
                <label className="flex items-center gap-2 text-[#3c58a7] dark:text-[#b3c2ff] cursor-pointer" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px" }}>
                  <input type="checkbox" checked={editHasCheckedIn} onChange={(e) => setEditHasCheckedIn(e.target.checked)} className="w-4 h-4 rounded border-[#867bba]" />
                  Checked In
                </label>
                {editHasCheckedIn && (
                  <div>
                    <label className="block mb-1.5 text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Attended</label>
                    <input type="number" value={editActualAttendees} onChange={(e) => setEditActualAttendees(Math.max(1, Number(e.target.value)))} min={1} max={editPartySize}
                      className="w-full px-3.5 py-2.5 rounded-lg outline-none bg-[#f1e5ed] dark:bg-[#18203c] border border-[#867bba] dark:border-[#2a2660] text-[#0c123b] dark:text-[#e8eeff]"
                      style={{ fontFamily: "var(--font-body)", fontSize: "14px" }} />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button onClick={() => handleDeleteGuest(editingGuest.id)}
                  className="px-4 py-2.5 rounded-lg hover:bg-red-500/20 text-red-500 transition-colors"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px" }}>Remove</button>
                <button onClick={handleUpdateGuest}
                  className="flex-1 py-2.5 rounded-lg hover:bg-[#3c58a7] transition-colors"
                  style={{ background: "#2d3895", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px", color: "#fbeed4" }}>Save Changes</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Check-in attendees modal */}
      {checkingInGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(12,18,59,0.45)" }}>
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-xl p-6 bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] dark:border-[#2a2660]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[#0c123b] dark:text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "15px" }}>
                Check in: {checkingInGuest.name}
              </h3>
              <button onClick={() => setCheckingInGuest(null)} className="p-1 hover:opacity-70"><X className="w-4 h-4 text-[#3c58a7] dark:text-[#b3c2ff]" strokeWidth={1.5} /></button>
            </div>
            
            {checkingInGuest.partySize > 1 && (
            <p className="text-[#3c58a7] dark:text-[#b3c2ff] mb-5" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px" }}>
              This invitation is valid for up to <strong>{checkingInGuest.partySize} people</strong>. How many are checking in right now?
            </p>
            )}

            <div className="flex flex-col gap-4">
              
              {checkingInGuest.partySize > 1 && (
              <div>
                <label className="block mb-1.5 text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Actual Attendees</label>
                <input type="number" value={checkInAttendees} onChange={(e) => setCheckInAttendees(Math.max(1, Math.min(checkingInGuest.partySize, Number(e.target.value))))} min={1} max={checkingInGuest.partySize}
                  className="w-full px-3.5 py-2.5 rounded-lg outline-none bg-[#f1e5ed] dark:bg-[#18203c] border border-[#867bba] dark:border-[#2a2660] text-[#0c123b] dark:text-[#e8eeff]"
                  style={{ fontFamily: "var(--font-body)", fontSize: "14px" }} />
              </div>
              )}

              {hasAngpao && (
              <div className="flex flex-col gap-3 p-3 rounded-lg bg-[rgba(60,88,167,0.06)] border border-[rgba(60,88,167,0.1)]">
                <span className="text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "12px" }}>Receive Angpao / Gift</span>
                <div>
                  <label className="block mb-1.5 text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "11px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Amount (Rp)</label>
                  <input type="number" value={angpaoAmount} onChange={(e) => setAngpaoAmount(e.target.value === "" ? "" : Number(e.target.value))} min={0} placeholder="e.g. 500000"
                    className="w-full px-3.5 py-2 rounded-lg outline-none bg-[#f1e5ed] dark:bg-[#18203c] border border-[#867bba] dark:border-[#2a2660] text-[#0c123b] dark:text-[#e8eeff]"
                    style={{ fontFamily: "var(--font-body)", fontSize: "13px" }} />
                </div>
                <div>
                  <label className="block mb-1.5 text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "11px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Gift Description</label>
                  <input value={angpaoGiftText} onChange={(e) => setAngpaoGiftText(e.target.value)} placeholder="e.g. Microwave"
                    className="w-full px-3.5 py-2 rounded-lg outline-none bg-[#f1e5ed] dark:bg-[#18203c] border border-[#867bba] dark:border-[#2a2660] text-[#0c123b] dark:text-[#e8eeff]"
                    style={{ fontFamily: "var(--font-body)", fontSize: "13px" }} />
                </div>
              </div>
              )}

              <button onClick={() => confirmCheckIn(checkingInGuest.id, checkingInGuest.partySize > 1 ? checkInAttendees : 1)}
                className="w-full py-2.5 rounded-lg hover:bg-[#3c58a7] transition-colors mt-2"
                style={{ background: "#2d3895", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px", color: "#fbeed4" }}>
                Confirm Check In
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Invite Guest Modal */}
      {inviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(12,18,59,0.45)" }}>
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-xl p-6 bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] dark:border-[#2a2660]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[#0c123b] dark:text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "15px" }}>
                Invite: {inviteModal.guest.name}
              </h3>
              <button onClick={() => setInviteModal(null)} className="p-1 hover:opacity-70"><X className="w-4 h-4 text-[#3c58a7] dark:text-[#b3c2ff]" strokeWidth={1.5} /></button>
            </div>
            <p className="text-[#3c58a7] dark:text-[#b3c2ff] mb-5" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px" }}>
              Enter the guest's email address to send their invitation.
            </p>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block mb-1.5 text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Email Address</label>
                <input type="email" value={inviteModal.email || ""} onChange={(e) => setInviteModal({ ...inviteModal, email: e.target.value })}
                  placeholder="guest@example.com"
                  className="w-full px-3.5 py-2.5 rounded-lg outline-none bg-[#f1e5ed] dark:bg-[#18203c] border border-[#867bba] dark:border-[#2a2660] text-[#0c123b] dark:text-[#e8eeff]"
                  style={{ fontFamily: "var(--font-body)", fontSize: "14px" }} />
              </div>
              <button onClick={async () => {
                const email = inviteModal.email;
                if (!email) return;
                setInviteModal(null);
                const res = await fetch(`/api/events/${eventId}/guests/${inviteModal.guest.id}/invite`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email })
                });
                if (res.ok) { showToast("Invitation sent!", true); }
                else { showToast("Failed to send invitation.", false); }
              }}
                disabled={!inviteModal.email?.trim() || !inviteModal.email?.includes("@")}
                className="w-full py-2.5 rounded-lg hover:bg-[#3c58a7] transition-colors mt-2 disabled:opacity-50"
                style={{ background: "#2d3895", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px", color: "#fbeed4" }}>
                Send Invitation
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {/* Security Modal */}
      {showSecurity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(12,18,59,0.45)" }}>
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-xl p-6 bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] dark:border-[#2a2660]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[#0c123b] dark:text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "15px" }}>Staff Security</h3>
              <button onClick={() => setShowSecurity(false)} className="p-1 hover:opacity-70"><X className="w-4 h-4 text-[#3c58a7] dark:text-[#b3c2ff]" strokeWidth={1.5} /></button>
            </div>
            <p className="text-[#3c58a7] dark:text-[#b3c2ff] -mt-3 mb-5" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "12px" }}>Set a password for staff members to access the check-in desk for this event.</p>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="block mb-1.5 text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Check-in Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} 
                    placeholder="e.g. secret123"
                    className="w-full px-3.5 py-2.5 rounded-lg outline-none transition-colors bg-[#f1e5ed] dark:bg-[#18203c] border border-[#867bba] dark:border-[#2a2660] text-[#0c123b] dark:text-[#e8eeff]"
                    style={{ fontFamily: "var(--font-body)", fontSize: "14px" }} />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#867bba] hover:text-[#3c58a7] transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="mt-2 text-[#867bba]" style={{ fontFamily: "var(--font-body)", fontSize: "10px" }}>Leave blank to disable password protection for this event.</p>
              </div>
              <button onClick={handleUpdatePassword} disabled={savingPassword}
                className="w-full py-2.5 rounded-lg hover:bg-[#3c58a7] transition-colors disabled:opacity-50"
                style={{ background: "#2d3895", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px", color: "#fbeed4" }}>
                {savingPassword ? "Saving..." : "Save Password"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
