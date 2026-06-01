"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, QrCode, UserPlus, Search, Check, X, Download, Users, LayoutTemplate, Send, Lock, Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import VenueVisualizer from "@/components/VenueVisualizer";

const QrScanner = dynamic(() => import("@/components/QrScanner"), { ssr: false });

type Mode = "scan" | "search";

interface Guest {
  id: string;
  eventId: string;
  firstName: string;
  lastName: string | null;
  qrTicket: string;
  partySize: number;
  actualAttendees: number | null;
  tableNumber: string | null;
  seatNumber: string | null;
  phone: string | null;
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
  venueLayoutConfig?: any;
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
  const [newGuestFirstName, setNewGuestFirstName] = useState("");
  const [newGuestLastName, setNewGuestLastName] = useState("");
  const [newPartySize, setNewPartySize] = useState<number | string>(1);
  type SeatingOption = "anywhere" | "specific_table" | "preset";
  const [newSeatingOption, setNewSeatingOption] = useState<SeatingOption>("anywhere");
  const [newTable, setNewTable] = useState("");
  const [newSeat, setNewSeat] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [editSeatingOption, setEditSeatingOption] = useState<SeatingOption>("anywhere");
  const [editTable, setEditTable] = useState("");
  const [editSeat, setEditSeat] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editPartySize, setEditPartySize] = useState<number | string>(1);
  const [editHasCheckedIn, setEditHasCheckedIn] = useState(false);
  const [editActualAttendees, setEditActualAttendees] = useState<number | string>(1);
  
  const [checkingInGuest, setCheckingInGuest] = useState<Guest | null>(null);
  const [checkInAttendees, setCheckInAttendees] = useState<number | string>(1);
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

  const getFullName = (g: Guest) => `${g.firstName} ${g.lastName || ""}`.trim();

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
      showToast(`${g.firstName} berhasil check-in (${g.actualAttendees} tamu)`, true);
      setCheckingInGuest(null);
      await fetchEvent();
    } else {
      const e = await res.json();
      showToast(e.error || "Gagal", false);
    }
  };

  const hasAngpao = event?.eventAddons?.some((ea: any) => ea.addon.id === "angpao_tracking" || ea.addon.name.toLowerCase().includes("angpao") || ea.addon.name.toLowerCase().includes("gift"));
  const hasEmailBuilder = event?.eventAddons?.some((ea: any) => ea.addon.id === "custom_email" || ea.addon.name.toLowerCase().includes("email builder"));

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
    if (!guest) showToast("Kode QR tidak ditemukan", false);
    else if (guest.hasCheckedIn) showToast(`${getFullName(guest)} sudah check-in`, false);
    else handleCheckIn(guest);
    setQrInput("");
  };

  const handleAddGuest = async () => {
    if (!eventId || !newGuestFirstName.trim()) return;

    let finalTable = "";
    let finalSeat = "";
    if (newSeatingOption === "specific_table") {
      finalTable = newTable;
    } else if (newSeatingOption === "preset") {
      finalTable = newTable;
      finalSeat = newSeat;
    }

    const res = await fetch(`/api/events/${eventId}/guests`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ firstName: newGuestFirstName.trim(), lastName: newGuestLastName.trim() || undefined, isPlusOne: false, partySize: newPartySize, tableNumber: finalTable, seatNumber: finalSeat, phone: newPhone }),
    });
    if (res.ok) {
      const g = await res.json();
      showToast(`${g.firstName} berhasil ditambahkan`, true);
      setNewGuestFirstName(""); setNewGuestLastName(""); setNewPartySize(1); setNewTable(""); setNewSeat(""); setNewSeatingOption("anywhere"); setNewPhone(""); setShowAddGuest(false);
      await fetchEvent();
    }
  };

  const handleUpdateGuest = async () => {
    if (!editingGuest) return;

    let finalTable = "";
    let finalSeat = "";
    if (editSeatingOption === "specific_table") {
      finalTable = editTable;
    } else if (editSeatingOption === "preset") {
      finalTable = editTable;
      finalSeat = editSeat;
    }

    const res = await fetch(`/api/events/${eventId}/guests`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        guestId: editingGuest.id, 
        tableNumber: finalTable, 
        seatNumber: finalSeat,
        phone: editPhone,
        partySize: editPartySize,
        hasCheckedIn: editHasCheckedIn,
        actualAttendees: editHasCheckedIn ? editActualAttendees : 0
      }),
    });
    if (res.ok) { showToast("Tamu diperbarui", true); setEditingGuest(null); await fetchEvent(); }
  };

  const handleDeleteGuest = async (guestId: string) => {
    if (!confirm("Anda yakin ingin menghapus tamu ini?")) return;
    const res = await fetch(`/api/events/${eventId}/guests?guestId=${guestId}`, {
      method: "DELETE",
    });
    if (res.ok) { showToast("Tamu dihapus", true); setEditingGuest(null); await fetchEvent(); }
    else { showToast("Gagal menghapus tamu", false); }
  };

  const handleEditGuest = (guest: Guest) => {
    setEditingGuest(guest);
    setEditTable(guest.tableNumber ?? "");
    setEditSeat(guest.seatNumber ?? "");
    setEditPhone(guest.phone ?? "");
    setEditPartySize(guest.partySize);
    setEditHasCheckedIn(guest.hasCheckedIn);
    setEditActualAttendees(guest.actualAttendees ?? guest.partySize);
    
    if (guest.tableNumber && guest.seatNumber) setEditSeatingOption("preset");
    else if (guest.tableNumber && !guest.seatNumber) setEditSeatingOption("specific_table");
    else setEditSeatingOption("anywhere");
  };

  const handleAddPlusOne = async (guest: Guest) => {
    const res = await fetch(`/api/events/${eventId}/guests`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestId: guest.id, partySize: guest.partySize + 1 }),
    });
    if (res.ok) { showToast(`+1 ditambahkan ke undangan ${guest.firstName} (total ${guest.partySize + 1} orang)`, true); await fetchEvent(); }
  };

  const handleExport = (format: "csv" | "json") => {
    if (!event) return;
    const data = event.guests.map(g => ({
      "ID Tamu": g.id,
      "Nama Depan": g.firstName,
      "Nama Belakang": g.lastName || "",
      "Tiket QR": g.qrTicket,
      "Jumlah Undangan": g.partySize,
      "Tamu Hadir": g.actualAttendees ?? 0,
      "Meja": g.tableNumber ?? "",
      "Kursi": g.seatNumber ?? "",
      "Status Check-In": g.hasCheckedIn ? "Ya" : "Tidak",
      "Waktu Check-In": g.checkInTime ? new Date(g.checkInTime).toLocaleString("id-ID") : "",
      "Angpao": (g as any).angpaos ? (g as any).angpaos.map((a: any) => `${a.amount ? `Rp${a.amount}` : ""} ${a.gift ? `(${a.gift})` : ""}`).join("; ") : ""
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
    a.download = `${event.name.replace(/\s+/g, '_')}_daftar_tamu.${fileExt}`;
    a.click();
    URL.revokeObjectURL(url);
    
    setShowExport(false);
    showToast(`Berhasil di-export sebagai ${format.toUpperCase()}`, true);
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
        showToast("Kata sandi check-in diperbarui", true);
        setShowSecurity(false);
        await fetchEvent();
      } else {
        showToast("Gagal memperbarui kata sandi", false);
      }
    } catch {
      showToast("Terjadi kesalahan", false);
    } finally {
      setSavingPassword(false);
    }
  };

  if (loading) return <div className="max-w-5xl px-6 lg:px-10 py-12"><p className="text-[#867bba]" style={{ fontFamily: "var(--font-body)", fontSize: "14px" }}>Memuat...</p></div>;
  if (!event) return <div className="max-w-5xl px-6 lg:px-10 py-12"><p className="text-[#867bba]" style={{ fontFamily: "var(--font-body)", fontSize: "14px" }}>Acara tidak ditemukan.</p></div>;

  const checkedIn = event.guests.filter((g) => g.hasCheckedIn).length;
  const total = event.guests.length;
  const totalPeople = event.guests.reduce((s, g) => s + g.partySize, 0);
  const filtered = query.trim() ? event.guests.filter((g) => getFullName(g).toLowerCase().includes(query.toLowerCase())) : event.guests;
  
  const totalAngpaoAmount = (event as any).guests.reduce((sum: number, g: any) => sum + (g.angpaos?.reduce((s: number, a: any) => s + (a.amount || 0), 0) || 0), 0);
  const totalGifts = (event as any).guests.reduce((sum: number, g: any) => sum + (g.angpaos?.filter((a: any) => a.gift).length || 0), 0);

  const stats = [
    { label: "Undangan", value: total },
    { label: "Total Tamu", value: totalPeople },
    { label: "Sudah Check-In", value: `${checkedIn} / ${total}` },
    { label: "Rata-rata Rombongan", value: total > 0 ? (totalPeople / total).toFixed(1) : "0" },
  ];

  if (hasAngpao) {
    stats.push({ label: "Total Angpao", value: `Rp ${totalAngpaoAmount.toLocaleString("id-ID")}` });
    stats.push({ label: "Hadiah Fisik", value: totalGifts.toString() });
  }

  return (
    <div className="max-w-5xl px-6 lg:px-10 py-8 lg:py-12 relative">
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg bg-[#111111] border border-[#333333]"
            style={{ color: toast.ok ? "#e8eeff" : "#ff6b7a", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px" }}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Link href="/admin/dashboard/events" className="inline-flex items-center gap-2 mb-6 hover:opacity-70 transition-opacity">
          <ArrowLeft className="w-4 h-4 text-[#867bba]" strokeWidth={1.5} />
          <span className="text-[#867bba]" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px" }}>Kembali ke daftar acara</span>
        </Link>
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <h1 className="text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "24px", letterSpacing: "-0.02em" }}>{event.name}</h1>
            <p className="mt-1 text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px" }}>
              {new Date(event.date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => setShowAddGuest(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors hover:bg-[#1A1A1A] bg-[#111111] border border-[#333333] text-[#e8eeff]"
              style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px" }}>
              <UserPlus className="w-3.5 h-3.5" strokeWidth={1.5} /> Tambah Tamu
            </button>
            <button onClick={() => router.push(`/admin/dashboard/events/${eventId}/seating`)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors hover:bg-[#1A1A1A] bg-[#111111] border border-[#333333] text-[#e8eeff]"
              style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px" }}>
              <LayoutTemplate className="w-3.5 h-3.5" strokeWidth={1.5} /> Denah Tempat Duduk
            </button>
            <button onClick={() => router.push(`/admin/dashboard/events/${eventId}/venue-builder`)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors hover:bg-[#1A1A1A] bg-[#111111] border border-[#333333] text-[#e8eeff]"
              style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px" }}>
              <LayoutTemplate className="w-3.5 h-3.5" strokeWidth={1.5} /> Venue Builder
            </button>
            
            <button 
              onClick={() => {
                if (hasEmailBuilder) {
                  router.push(`/admin/dashboard/events/${eventId}/email`);
                } else {
                  showToast("Terkunci: Butuh Addon Templat Email Kustom", false);
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors border ${hasEmailBuilder ? "bg-[#111111] border-[#333333] text-[#e8eeff] hover:bg-[#1A1A1A]" : "bg-[#111111]/50 border-[#333333]/50 text-gray-500 cursor-not-allowed opacity-80"}`}
              style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px" }}>
              <LayoutTemplate className="w-3.5 h-3.5" strokeWidth={1.5} /> 
              Pembuat Email
              {!hasEmailBuilder && <Lock className="w-3 h-3 ml-1 text-gray-400" strokeWidth={1.5} />}
            </button>
            <button onClick={() => { setShowSecurity(true); setNewPassword(event.checkInPassword || ""); }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors hover:bg-[#1A1A1A] bg-[#111111] border border-[#333333] text-[#e8eeff]"
              style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px" }}>
              <Lock className="w-3.5 h-3.5" strokeWidth={1.5} /> Keamanan
            </button>
            <button onClick={() => setShowExport(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-lg transition-colors hover:bg-[#1A1A1A] bg-[#111111] border border-[#333333] text-[#e8eeff]"
              style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px" }}>
              <Download className="w-3.5 h-3.5" strokeWidth={1.5} /> Ekspor
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 mt-6">
        {stats.map((s) => (
          <div key={s.label} className="p-4 rounded-xl bg-[#111111] border border-[#333333]">
            <span className="text-[#867bba]" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "11px", letterSpacing: "0.04em", textTransform: "uppercase" }}>{s.label}</span>
            <div className="mt-1 text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "20px", letterSpacing: "-0.02em" }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Progress */}
      <div className="mt-4 h-1 rounded-full overflow-hidden bg-[#1A1A1A]">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${total > 0 ? (checkedIn / total) * 100 : 0}%`, background: "#6B0F1A" }} />
      </div>

      {/* Mode toggle */}
      <div className="mt-8">
        <div className="flex items-center gap-1 p-1 rounded-lg w-fit bg-[#111111] border border-[#333333]">
          {(["search", "scan"] as Mode[]).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${mode === m ? "bg-[#1A1A1A] border border-[#333333]" : "border border-transparent"}`}
              style={{ fontFamily: "var(--font-body)", fontWeight: mode === m ? 500 : 400, fontSize: "12px" }}>
              {m === "search" ? <Search className={`w-3.5 h-3.5 ${mode === m ? "text-[#e8eeff]" : "text-[#867bba]"}`} strokeWidth={1.5} /> : <QrCode className={`w-3.5 h-3.5 ${mode === m ? "text-[#e8eeff]" : "text-[#867bba]"}`} strokeWidth={1.5} />}
              <span className={mode === m ? "text-[#e8eeff]" : "text-[#867bba]"}>{m === "search" ? "Pencarian" : "Pindai QR"}</span>
            </button>
          ))}
        </div>

        {mode === "scan" && (
          <div className="mt-4 flex flex-col gap-4">
            {/* Camera scanner */}
            <QrScanner onScan={(code) => {
              if (!event) return;
              const guest = event.guests.find((g) => g.qrTicket === code.toUpperCase() || code.includes(`/check-in/${g.id}`));
              if (!guest) showToast(`QR tidak ditemukan: ${code}`, false);
              else if (guest.hasCheckedIn) showToast(`${getFullName(guest)} sudah check-in`, false);
              else handleCheckIn(guest);
            }} />

            {/* Manual input fallback */}
            <div>
              <p className="text-[#867bba] mb-2" style={{ fontFamily: "var(--font-body)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Atau masukkan kode secara manual</p>
              <div className="flex gap-2">
                <input value={qrInput} onChange={(e) => setQrInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleQrScan()}
                  placeholder="Masukkan kode tiket QR"
                  className="flex-1 px-4 py-3 rounded-lg outline-none transition-colors bg-[#111111] border border-[#333333] text-[#e8eeff]"
                  style={{ fontFamily: "var(--font-body)", fontSize: "14px" }} />
                <button onClick={handleQrScan} className="px-5 py-3 rounded-lg hover:opacity-90 transition-opacity" style={{ background: "#6B0F1A", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px", color: "#fff" }}>Verifikasi</button>
              </div>
            </div>
          </div>
        )}
        {mode === "search" && (
          <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-lg bg-[#111111] border border-[#333333]">
            <Search className="w-4 h-4 flex-shrink-0 text-[#867bba]" strokeWidth={1.5} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama tamu..."
              className="flex-1 bg-transparent outline-none text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontSize: "14px" }} />
            {query && <button onClick={() => setQuery("")}><X className="w-3.5 h-3.5 text-[#867bba]" strokeWidth={1.5} /></button>}
          </div>
        )}
      </div>

      {/* Guest list */}
      <div className="mt-4 rounded-xl overflow-hidden border border-[#333333]">
        <div className="max-h-[480px] overflow-y-auto">
          {filtered.map((guest, idx) => (
            <div key={guest.id}
              className="flex items-center justify-between px-4 sm:px-5 py-3.5 transition-colors hover:bg-[#1A1A1A] bg-[#111111]"
              style={{ borderBottomWidth: idx < filtered.length - 1 ? "1px" : "0", borderBottomStyle: "solid", borderBottomColor: "#333333" }}>
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-[#1A1A1A] border border-[#333333]">
                  <span className="text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "11px" }}>{guest.firstName.charAt(0)}</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`truncate ${guest.hasCheckedIn ? "text-[#867bba]" : "text-[#e8eeff]"}`} style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px" }}>{getFullName(guest)}</span>
                    {guest.partySize > 1 && (
                      <span className="px-1.5 py-0.5 rounded flex-shrink-0 bg-[#1A1A1A] border border-[#333333] text-[#b3c2ff]"
                        style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "9px" }}>
                        <Users className="w-2.5 h-2.5 inline mr-0.5" strokeWidth={2} />{guest.partySize}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[#867bba]" style={{ fontFamily: "monospace", fontWeight: 400, fontSize: "10px" }}>{guest.qrTicket}</span>
                    {guest.tableNumber && (
                      <span className="text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "10px" }}>
                        · {guest.tableNumber} {guest.seatNumber && `/ Kursi ${guest.seatNumber}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                <button onClick={() => setInviteModal({ guest })}
                  className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg transition-colors bg-[#1A1A1A] hover:bg-[#333333] text-[#e8eeff]"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "11px" }}>
                  <Send className="w-3 h-3" strokeWidth={1.5} /> <span className="hidden sm:inline">Undang</span>
                </button>
                <button onClick={() => handleAddPlusOne(guest)}
                  className="px-2 py-1 rounded text-[#e8eeff] hover:bg-[#333333] transition-colors border border-[#333333]"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "10px" }}>+1</button>
                <button onClick={() => handleEditGuest(guest)}
                  className="px-2 py-1 rounded text-[#867bba] hover:bg-[#333333] transition-colors"
                  style={{ fontFamily: "var(--font-body)", fontSize: "10px" }}>Edit</button>
                {guest.hasCheckedIn ? (
                  <button onClick={() => handleEditGuest(guest)} className="flex items-center gap-1 px-2 py-1 rounded bg-[#1A1A1A] border border-[#333333] hover:bg-[#333333] transition-colors">
                    <Check className="w-3 h-3 text-[#b3c2ff]" strokeWidth={2} />
                    <span className="text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "10px" }}>HADIR ({guest.actualAttendees || guest.partySize})</span>
                  </button>
                ) : (
                  <button onClick={() => handleCheckIn(guest)}
                    className="px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                    style={{ background: "#6B0F1A", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", color: "#fff" }}>Check In</button>
                )}
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="px-5 py-8 text-center bg-[#111111]">
              <span className="text-[#867bba]" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "14px" }}>
                {event.guests.length === 0 ? "Belum ada tamu. Tambahkan tamu pertama Anda!" : "Tamu tidak ditemukan."}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Export Modal */}
      {showExport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-xl p-6 bg-[#111111] border border-[#333333]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "15px" }}>Ekspor Daftar Tamu</h3>
              <button onClick={() => setShowExport(false)} className="p-1 hover:opacity-70"><X className="w-4 h-4 text-[#867bba]" strokeWidth={1.5} /></button>
            </div>
            <p className="text-[#b3c2ff] -mt-3 mb-5" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "12px" }}>Pilih format untuk mengunduh daftar tamu.</p>
            
            <div className="flex flex-col gap-3">
              <button onClick={() => handleExport("csv")}
                className="w-full py-2.5 rounded-lg transition-colors border bg-[#1A1A1A] border-[#333333] text-[#e8eeff] hover:bg-[#6B0F1A] hover:border-[#8B1F2A]"
                style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px" }}>
                Ekspor sebagai CSV
              </button>
              <button onClick={() => handleExport("json")}
                className="w-full py-2.5 rounded-lg transition-colors border bg-[#1A1A1A] border-[#333333] text-[#e8eeff] hover:bg-[#6B0F1A] hover:border-[#8B1F2A]"
                style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px" }}>
                Ekspor sebagai JSON
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Add guest modal */}
      {showAddGuest && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 overflow-y-auto" style={{ background: "rgba(0,0,0,0.6)" }}>
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-xl p-6 bg-[#111111] border border-[#333333] my-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "15px" }}>Tambah Tamu</h3>
              <button onClick={() => setShowAddGuest(false)} className="p-1 hover:opacity-70"><X className="w-4 h-4 text-[#867bba]" strokeWidth={1.5} /></button>
            </div>
            <p className="text-[#b3c2ff] -mt-3 mb-2" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "12px" }}>Tambahkan undangan utama. Gunakan tombol <strong>+1</strong> untuk menambah pengikut.</p>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 text-[#867bba]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Nama Depan</label>
                  <input value={newGuestFirstName} onChange={(e) => setNewGuestFirstName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddGuest()} placeholder="Budi" autoFocus
                    className="w-full px-3.5 py-2.5 rounded-lg outline-none transition-colors bg-[#1A1A1A] border border-[#333333] text-[#e8eeff]"
                    style={{ fontFamily: "var(--font-body)", fontSize: "14px" }} />
                </div>
                <div>
                  <label className="block mb-1.5 text-[#867bba]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Nama Belakang</label>
                  <input value={newGuestLastName} onChange={(e) => setNewGuestLastName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAddGuest()} placeholder="Santoso"
                    className="w-full px-3.5 py-2.5 rounded-lg outline-none transition-colors bg-[#1A1A1A] border border-[#333333] text-[#e8eeff]"
                    style={{ fontFamily: "var(--font-body)", fontSize: "14px" }} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 text-[#867bba]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Jumlah Orang</label>
                  <input type="number" value={newPartySize} onChange={(e) => setNewPartySize(e.target.value === "" ? "" : Number(e.target.value))} onBlur={() => setNewPartySize(prev => { const n = Number(prev); return isNaN(n) || n < 1 ? 1 : n; })} min={1} max={20}
                    className="w-full px-3.5 py-2.5 rounded-lg outline-none transition-colors bg-[#1A1A1A] border border-[#333333] text-[#e8eeff]"
                    style={{ fontFamily: "var(--font-body)", fontSize: "14px" }} />
                </div>
                <div>
                  <label className="block mb-1.5 text-[#867bba]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Nomor WhatsApp</label>
                  <input value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="Contoh: +62812..."
                    className="w-full px-3.5 py-2.5 rounded-lg outline-none transition-colors bg-[#1A1A1A] border border-[#333333] text-[#e8eeff]"
                    style={{ fontFamily: "var(--font-body)", fontSize: "14px" }} />
                </div>
              </div>
              <div>
                <label className="block mb-1.5 text-[#867bba]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Opsi Tempat Duduk</label>
                <select value={newSeatingOption} onChange={(e) => setNewSeatingOption(e.target.value as SeatingOption)}
                  className="w-full px-3.5 py-2.5 mb-3 rounded-lg outline-none transition-colors bg-[#1A1A1A] border border-[#333333] text-[#e8eeff]"
                  style={{ fontFamily: "var(--font-body)", fontSize: "14px" }}>
                  <option value="anywhere">Bebas Pilih Tempat (Self-Select Anywhere)</option>
                  <option value="specific_table">Pilih Kursi di Meja Tertentu</option>
                  <option value="preset">Sudah Ditentukan (Preset Seating)</option>
                </select>
                {newSeatingOption !== "anywhere" && (
                  event.venueLayoutConfig ? (
                    <div className="mt-2 mb-4 bg-[#1A1A1A] rounded-xl border border-[#333333] p-4 overflow-auto relative max-h-[40vh]">
                      <p className="text-[#867bba] mb-4" style={{ fontFamily: "var(--font-body)", fontSize: "12px" }}>
                        {newSeatingOption === "preset" 
                          ? "Pilih meja dan kursi dari denah di bawah:" 
                          : "Pilih meja dari denah di bawah:"}
                      </p>
                      <VenueVisualizer
                        config={event.venueLayoutConfig}
                        occupiedSeats={event.guests.filter((g) => g.seatNumber && g.tableNumber).map((g) => ({ tableId: g.tableNumber!, seatNumber: parseInt(g.seatNumber!), guestName: `${g.firstName} ${g.lastName || ""}`.trim() })).filter((g) => !isNaN(g.seatNumber))}
                        mode={newSeatingOption === "preset" ? "select" : "selectTable"}
                        selectedSeat={newTable && newSeat ? { tableId: newTable, seatNumber: parseInt(newSeat) } : null}
                        onSelectSeat={(tableId, seatNumber) => { setNewTable(tableId); setNewSeat(seatNumber.toString()); }}
                        onSelectTable={(tableId) => { setNewTable(tableId); setNewSeat(""); }}
                      />
                      {(newTable || newSeat) && (
                        <div className="mt-4 p-3 bg-[#111111] rounded-lg border border-[#333333] flex justify-between items-center sticky bottom-0 z-10">
                          <span className="text-[#4ade80]" style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 500 }}>
                            Terpilih: {event.venueLayoutConfig.tables?.find((t: any) => t.id === newTable)?.label || newTable} {newSeat ? `/ Kursi ${newSeat}` : ""}
                          </span>
                          <button onClick={() => { setNewTable(""); setNewSeat(""); }} className="text-[#ff6b7a] text-xs hover:underline flex-shrink-0 ml-2">Reset</button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`grid gap-3 ${newSeatingOption === "preset" ? "grid-cols-2" : "grid-cols-1"}`}>
                      <div>
                        <label className="block mb-1.5 text-[#867bba]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Meja</label>
                        <input value={newTable} onChange={(e) => setNewTable(e.target.value)} placeholder="Contoh: Meja 5"
                          className="w-full px-3.5 py-2.5 rounded-lg outline-none transition-colors bg-[#1A1A1A] border border-[#333333] text-[#e8eeff]"
                          style={{ fontFamily: "var(--font-body)", fontSize: "14px" }} />
                      </div>
                      {newSeatingOption === "preset" && (
                        <div>
                          <label className="block mb-1.5 text-[#867bba]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Kursi</label>
                          <input value={newSeat} onChange={(e) => setNewSeat(e.target.value)} placeholder="Contoh: 5A"
                            className="w-full px-3.5 py-2.5 rounded-lg outline-none transition-colors bg-[#1A1A1A] border border-[#333333] text-[#e8eeff]"
                            style={{ fontFamily: "var(--font-body)", fontSize: "14px" }} />
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
              <button onClick={handleAddGuest} disabled={!newGuestFirstName.trim()}
                className="w-full py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-30"
                style={{ background: "#6B0F1A", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px", color: "#fff" }}>Simpan Tamu</button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Edit guest modal */}
      {editingGuest && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 overflow-y-auto" style={{ background: "rgba(0,0,0,0.6)" }}>
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-xl p-6 bg-[#111111] border border-[#333333] my-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "15px" }}>Edit: {getFullName(editingGuest)}</h3>
              <button onClick={() => setEditingGuest(null)} className="p-1 hover:opacity-70"><X className="w-4 h-4 text-[#867bba]" strokeWidth={1.5} /></button>
            </div>
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1.5 text-[#867bba]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Jumlah Orang</label>
                  <input type="number" value={editPartySize} onChange={(e) => setEditPartySize(e.target.value === "" ? "" : Number(e.target.value))} onBlur={() => setEditPartySize(prev => { const n = Number(prev); return isNaN(n) || n < 1 ? 1 : n; })} min={1}
                    className="w-full px-3.5 py-2.5 rounded-lg outline-none bg-[#1A1A1A] border border-[#333333] text-[#e8eeff]"
                    style={{ fontFamily: "var(--font-body)", fontSize: "14px" }} />
                </div>
                <div>
                  <label className="block mb-1.5 text-[#867bba]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Nomor WhatsApp</label>
                  <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} placeholder="Contoh: +62812..."
                    className="w-full px-3.5 py-2.5 rounded-lg outline-none bg-[#1A1A1A] border border-[#333333] text-[#e8eeff]"
                    style={{ fontFamily: "var(--font-body)", fontSize: "14px" }} />
                </div>
              </div>
              <div>
                <label className="block mb-1.5 text-[#867bba]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Opsi Tempat Duduk</label>
                <select value={editSeatingOption} onChange={(e) => setEditSeatingOption(e.target.value as SeatingOption)}
                  className="w-full px-3.5 py-2.5 mb-3 rounded-lg outline-none bg-[#1A1A1A] border border-[#333333] text-[#e8eeff]"
                  style={{ fontFamily: "var(--font-body)", fontSize: "14px" }}>
                  <option value="anywhere">Bebas Pilih Tempat (Self-Select Anywhere)</option>
                  <option value="specific_table">Pilih Kursi di Meja Tertentu</option>
                  <option value="preset">Sudah Ditentukan (Preset Seating)</option>
                </select>
                {editSeatingOption !== "anywhere" && (
                  event.venueLayoutConfig ? (
                    <div className="mt-2 mb-4 bg-[#1A1A1A] rounded-xl border border-[#333333] p-4 overflow-auto relative max-h-[40vh]">
                      <p className="text-[#867bba] mb-4" style={{ fontFamily: "var(--font-body)", fontSize: "12px" }}>
                        {editSeatingOption === "preset" 
                          ? "Pilih meja dan kursi dari denah di bawah:" 
                          : "Pilih meja dari denah di bawah:"}
                      </p>
                      <VenueVisualizer
                        config={event.venueLayoutConfig}
                        occupiedSeats={event.guests.filter((g) => g.seatNumber && g.tableNumber && g.id !== editingGuest.id).map((g) => ({ tableId: g.tableNumber!, seatNumber: parseInt(g.seatNumber!), guestName: `${g.firstName} ${g.lastName || ""}`.trim() })).filter((g) => !isNaN(g.seatNumber))}
                        mode={editSeatingOption === "preset" ? "select" : "selectTable"}
                        selectedSeat={editTable && editSeat ? { tableId: editTable, seatNumber: parseInt(editSeat) } : null}
                        onSelectSeat={(tableId, seatNumber) => { setEditTable(tableId); setEditSeat(seatNumber.toString()); }}
                        onSelectTable={(tableId) => { setEditTable(tableId); setEditSeat(""); }}
                      />
                      {(editTable || editSeat) && (
                        <div className="mt-4 p-3 bg-[#111111] rounded-lg border border-[#333333] flex justify-between items-center sticky bottom-0 z-10">
                          <span className="text-[#4ade80]" style={{ fontFamily: "var(--font-body)", fontSize: "13px", fontWeight: 500 }}>
                            Terpilih: {event.venueLayoutConfig.tables?.find((t: any) => t.id === editTable)?.label || editTable} {editSeat ? `/ Kursi ${editSeat}` : ""}
                          </span>
                          <button onClick={() => { setEditTable(""); setEditSeat(""); }} className="text-[#ff6b7a] text-xs hover:underline flex-shrink-0 ml-2">Reset</button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`grid gap-3 ${editSeatingOption === "preset" ? "grid-cols-2" : "grid-cols-1"}`}>
                      <div>
                        <label className="block mb-1.5 text-[#867bba]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Meja</label>
                        <input value={editTable} onChange={(e) => setEditTable(e.target.value)} placeholder="Contoh: Meja 5"
                          className="w-full px-3.5 py-2.5 rounded-lg outline-none bg-[#1A1A1A] border border-[#333333] text-[#e8eeff]"
                          style={{ fontFamily: "var(--font-body)", fontSize: "14px" }} />
                      </div>
                      {editSeatingOption === "preset" && (
                        <div>
                          <label className="block mb-1.5 text-[#867bba]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Kursi</label>
                          <input value={editSeat} onChange={(e) => setEditSeat(e.target.value)} placeholder="Contoh: 5A"
                            className="w-full px-3.5 py-2.5 rounded-lg outline-none bg-[#1A1A1A] border border-[#333333] text-[#e8eeff]"
                            style={{ fontFamily: "var(--font-body)", fontSize: "14px" }} />
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
              <div className="grid grid-cols-2 gap-3 mt-1">
                <label className="flex items-center gap-2 text-[#b3c2ff] cursor-pointer" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px" }}>
                  <input type="checkbox" checked={editHasCheckedIn} onChange={(e) => setEditHasCheckedIn(e.target.checked)} className="w-4 h-4 rounded border-[#333333]" />
                  Sudah Check-In
                </label>
                {editHasCheckedIn && (
                  <div>
                    <label className="block mb-1.5 text-[#867bba]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Jumlah Hadir</label>
                    <input type="number" value={editActualAttendees} onChange={(e) => setEditActualAttendees(e.target.value === "" ? "" : Number(e.target.value))} onBlur={() => setEditActualAttendees(prev => { const n = Number(prev); return isNaN(n) || n < 1 ? 1 : Math.min(n, Number(editPartySize) || 1); })} min={1} max={Number(editPartySize) || 1}
                      className="w-full px-3.5 py-2.5 rounded-lg outline-none bg-[#1A1A1A] border border-[#333333] text-[#e8eeff]"
                      style={{ fontFamily: "var(--font-body)", fontSize: "14px" }} />
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 mt-2">
                <button onClick={() => handleDeleteGuest(editingGuest.id)}
                  className="px-4 py-2.5 rounded-lg hover:bg-[#333333] text-[#ff6b7a] transition-colors"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px" }}>Hapus</button>
                <button onClick={handleUpdateGuest}
                  className="flex-1 py-2.5 rounded-lg hover:opacity-90 transition-opacity"
                  style={{ background: "#6B0F1A", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px", color: "#fff" }}>Simpan Perubahan</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Check-in attendees modal */}
      {checkingInGuest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-xl p-6 bg-[#111111] border border-[#333333]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "15px" }}>
                Check-in: {getFullName(checkingInGuest)}
              </h3>
              <button onClick={() => setCheckingInGuest(null)} className="p-1 hover:opacity-70"><X className="w-4 h-4 text-[#867bba]" strokeWidth={1.5} /></button>
            </div>
            
            {checkingInGuest.partySize > 1 && (
            <p className="text-[#b3c2ff] mb-5" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px" }}>
              Undangan ini berlaku untuk <strong>{checkingInGuest.partySize} orang</strong>. Berapa orang yang hadir saat ini?
            </p>
            )}

            <div className="flex flex-col gap-4">
              
              {checkingInGuest.partySize > 1 && (
              <div>
                <label className="block mb-1.5 text-[#867bba]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Tamu yang Hadir</label>
                <input type="number" value={checkInAttendees} onChange={(e) => setCheckInAttendees(e.target.value === "" ? "" : Number(e.target.value))} onBlur={() => setCheckInAttendees(prev => { const n = Number(prev); return isNaN(n) || n < 1 ? 1 : Math.min(n, checkingInGuest?.partySize || 1); })} min={1} max={checkingInGuest?.partySize || 1}
                  className="w-full px-3.5 py-2.5 rounded-lg outline-none bg-[#1A1A1A] border border-[#333333] text-[#e8eeff]"
                  style={{ fontFamily: "var(--font-body)", fontSize: "14px" }} />
              </div>
              )}

              {hasAngpao && (
              <div className="flex flex-col gap-3 p-3 rounded-lg bg-[#1A1A1A] border border-[#333333]">
                <span className="text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "12px" }}>Terima Angpao / Hadiah</span>
                <div>
                  <label className="block mb-1.5 text-[#867bba]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "11px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Nominal (Rp)</label>
                  <input type="number" value={angpaoAmount} onChange={(e) => setAngpaoAmount(e.target.value === "" ? "" : Number(e.target.value))} min={0} placeholder="Contoh: 500000"
                    className="w-full px-3.5 py-2 rounded-lg outline-none bg-[#111111] border border-[#333333] text-[#e8eeff]"
                    style={{ fontFamily: "var(--font-body)", fontSize: "13px" }} />
                </div>
                <div>
                  <label className="block mb-1.5 text-[#867bba]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "11px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Deskripsi Hadiah</label>
                  <input value={angpaoGiftText} onChange={(e) => setAngpaoGiftText(e.target.value)} placeholder="Contoh: Microwave"
                    className="w-full px-3.5 py-2 rounded-lg outline-none bg-[#111111] border border-[#333333] text-[#e8eeff]"
                    style={{ fontFamily: "var(--font-body)", fontSize: "13px" }} />
                </div>
              </div>
              )}

              <button onClick={() => confirmCheckIn(checkingInGuest.id, checkingInGuest.partySize > 1 ? Number(checkInAttendees) || 1 : 1)}
                className="w-full py-2.5 rounded-lg hover:opacity-90 transition-opacity mt-2"
                style={{ background: "#6B0F1A", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px", color: "#fff" }}>
                Konfirmasi Check-In
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Invite Guest Modal */}
      {inviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-xl p-6 bg-[#111111] border border-[#333333]">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "15px" }}>
                Undang: {getFullName(inviteModal.guest)}
              </h3>
              <button onClick={() => setInviteModal(null)} className="p-1 hover:opacity-70"><X className="w-4 h-4 text-[#867bba]" strokeWidth={1.5} /></button>
            </div>
            <p className="text-[#b3c2ff] mb-5" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px" }}>
              Masukkan alamat email tamu untuk mengirim undangan.
            </p>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block mb-1.5 text-[#867bba]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Alamat Email</label>
                <input type="email" value={inviteModal.email || ""} onChange={(e) => setInviteModal({ ...inviteModal, email: e.target.value })}
                  placeholder="tamu@example.com"
                  className="w-full px-3.5 py-2.5 rounded-lg outline-none bg-[#1A1A1A] border border-[#333333] text-[#e8eeff]"
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
                if (res.ok) { showToast("Undangan terkirim!", true); }
                else { showToast("Gagal mengirim undangan.", false); }
              }}
                disabled={!inviteModal.email?.trim() || !inviteModal.email?.includes("@")}
                className="w-full py-2.5 rounded-lg hover:opacity-90 transition-opacity mt-2 disabled:opacity-50"
                style={{ background: "#6B0F1A", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px", color: "#fff" }}>
                Kirim Undangan
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {/* Security Modal */}
      {showSecurity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.6)" }}>
          <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm rounded-xl p-6 bg-[#111111] border border-[#333333]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "15px" }}>Keamanan Staf</h3>
              <button onClick={() => setShowSecurity(false)} className="p-1 hover:opacity-70"><X className="w-4 h-4 text-[#867bba]" strokeWidth={1.5} /></button>
            </div>
            <p className="text-[#b3c2ff] -mt-3 mb-5" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "12px" }}>Atur kata sandi agar staf bisa mengakses halaman check-in untuk acara ini.</p>
            
            <div className="flex flex-col gap-4">
              <div>
                <label className="block mb-1.5 text-[#867bba]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Kata Sandi Check-in</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} 
                    placeholder="Contoh: rahasia123"
                    className="w-full px-3.5 py-2.5 rounded-lg outline-none transition-colors bg-[#1A1A1A] border border-[#333333] text-[#e8eeff]"
                    style={{ fontFamily: "var(--font-body)", fontSize: "14px" }} />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#867bba] hover:text-[#b3c2ff] transition-colors">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="mt-2 text-[#867bba]" style={{ fontFamily: "var(--font-body)", fontSize: "10px" }}>Kosongkan untuk menonaktifkan perlindungan kata sandi pada acara ini.</p>
              </div>
              <button onClick={handleUpdatePassword} disabled={savingPassword}
                className="w-full py-2.5 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ background: "#6B0F1A", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px", color: "#fff" }}>
                {savingPassword ? "Menyimpan..." : "Simpan Kata Sandi"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
