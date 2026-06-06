"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, User, Users, MapPin, Lock, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import AngpaoInput from "@/components/AngpaoInput";

export default function GuestCheckInPage() {
  const { guestId } = useParams<{ guestId: string }>();
  const [guest, setGuest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form State
  const [password, setPassword] = useState("");
  const [actualAttendees, setActualAttendees] = useState(1);

  const fetchGuest = useCallback(async () => {
    try {
      const res = await fetch(`/api/check-in/${guestId}`);
      if (res.ok) {
        const data = await res.json();
        setGuest(data);
        if (!data.hasCheckedIn) {
          setActualAttendees(data.partySize);
        }
      } else {
        setError("Tamu tidak ditemukan atau QR code tidak valid.");
      }
    } catch {
      setError("Gagal memuat data tamu.");
    } finally {
      setLoading(false);
    }
  }, [guestId]);

  useEffect(() => {
    fetchGuest();
  }, [fetchGuest]);

  const handleCheckInWithAngpao = async (angpaoData: { amount: number | null; gift: string | null; mode: "gift" | "no_gift" }) => {
    if (!password) {
      setError("Kata sandi staf wajib diisi.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/events/${guest.eventId}/guests/${guestId}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          actualAttendees,
          angpaoAmount: angpaoData.amount,
          angpaoGift: angpaoData.gift,
          angpaoMode: angpaoData.mode,
        })
      });

      if (res.ok) {
        setSuccessMsg("Check-in berhasil!");
        await fetchGuest(); // Refresh data to show success screen
      } else {
        const err = await res.json();
        setError(err.error || "Kata sandi salah atau gagal melakukan check-in.");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSimpleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Kata sandi staf wajib diisi.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/events/${guest.eventId}/guests/${guestId}/check-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          password,
          actualAttendees,
        })
      });

      if (res.ok) {
        setSuccessMsg("Check-in berhasil!");
        await fetchGuest(); // Refresh data to show success screen
      } else {
        const err = await res.json();
        setError(err.error || "Kata sandi salah atau gagal melakukan check-in.");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1022] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#b3c2ff] animate-spin" />
      </div>
    );
  }

  if (error && !guest) {
    return (
      <div className="min-h-screen bg-[#0b1022] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#111111] border border-[#333333] rounded-[2rem] p-8 text-center shadow-xl">
          <AlertCircle className="w-12 h-12 text-[#ff6b7a] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#e8eeff] mb-2" style={{ fontFamily: "var(--font-body)" }}>Kesalahan</h2>
          <p className="text-[#867bba]" style={{ fontFamily: "var(--font-body)" }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!guest) return null;

  const displayName = `${guest.firstName} ${guest.lastName || ""}`.trim();

  return (
    <div className="min-h-screen bg-[#0b1022] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-lg relative">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative bg-[#111111] border border-[#333333] rounded-[2rem] p-6 sm:p-10 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <h4 className="text-[#867bba] font-bold tracking-widest text-xs uppercase mb-3" style={{ fontFamily: "var(--font-body)" }}>
              {guest.eventName}
            </h4>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 text-[#e8eeff]" style={{ fontFamily: "var(--font-body)" }}>
              {displayName}
            </h1>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A] border border-[#333333] text-[#b3c2ff] text-sm font-medium rounded-full" style={{ fontFamily: "var(--font-body)" }}>
                <Users className="w-4 h-4" /> Rombongan {guest.partySize} orang
              </span>
              {guest.tableNumber && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1A1A] border border-[#333333] text-[#b3c2ff] text-sm font-medium rounded-full" style={{ fontFamily: "var(--font-body)" }}>
                  <MapPin className="w-4 h-4" /> Meja {guest.tableNumber}
                </span>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {guest.hasCheckedIn ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center text-center py-8"
              >
                <div className="w-24 h-24 bg-[#6B0F1A]/10 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-16 h-16 text-[#ffb3b8]" strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl font-bold text-[#e8eeff] mb-2" style={{ fontFamily: "var(--font-body)" }}>Berhasil Check-In</h2>
                <p className="text-[#867bba] text-sm max-w-[250px] mx-auto" style={{ fontFamily: "var(--font-body)" }}>
                  {displayName} dan {guest.actualAttendees - 1} tamu undangan telah hadir.
                </p>
                {guest.checkInTime && (
                  <p className="text-[#867bba] text-xs mt-6 font-mono bg-[#1A1A1A] px-3 py-2 rounded-lg border border-[#333333]">
                    {new Date(guest.checkInTime).toLocaleString("id-ID")}
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-6"
              >
                {error && (
                  <div className="p-4 bg-[#6B0F1A]/10 border border-[#8B1F2A] rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-[#ff6b7a] flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-[#ffb3b8]" style={{ fontFamily: "var(--font-body)" }}>{error}</p>
                  </div>
                )}
                {successMsg && (
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-green-300" style={{ fontFamily: "var(--font-body)" }}>{successMsg}</p>
                  </div>
                )}

                <div className="space-y-5">
                  {/* Password Input */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-[#867bba] mb-2 uppercase tracking-widest text-xs" style={{ fontFamily: "var(--font-body)" }}>
                      <Lock className="w-3.5 h-3.5" /> Kunci Keamanan Staf
                    </label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukkan kata sandi staf"
                      className="w-full px-4 py-3.5 bg-[#1A1A1A] border border-[#333333] rounded-xl text-[#e8eeff] outline-none focus:border-[#6B0F1A] transition-all font-mono"
                      autoComplete="off"
                    />
                  </div>

                  {/* Actual Attendees */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-[#867bba] mb-2 uppercase tracking-widest text-xs" style={{ fontFamily: "var(--font-body)" }}>
                      <User className="w-3.5 h-3.5" /> Jumlah Tamu yang Hadir
                    </label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="range" 
                        min="1" 
                        max={guest.partySize} 
                        value={actualAttendees}
                        onChange={(e) => setActualAttendees(parseInt(e.target.value))}
                        className="flex-1 accent-[#6B0F1A]"
                      />
                      <div className="w-16 h-12 bg-[#1A1A1A] border border-[#333333] rounded-xl flex items-center justify-center font-bold text-lg text-[#b3c2ff]">
                        {actualAttendees}
                      </div>
                    </div>
                  </div>

                  {/* Angpao Tracker (if enabled) */}
                  {guest.hasAngpaoTracker ? (
                    <div className="pt-4 mt-2 border-t border-[#333333]">
                      <AngpaoInput onSubmit={handleCheckInWithAngpao} disabled={submitting} />
                    </div>
                  ) : (
                    <button 
                      onClick={handleSimpleCheckIn}
                      disabled={submitting}
                      className="w-full py-4 mt-4 hover:opacity-90 active:scale-[0.98] text-[#fff] font-bold rounded-xl transition-all disabled:opacity-50 disabled:pointer-events-none"
                      style={{ background: "#6B0F1A", border: "1px solid #8B1F2A", fontFamily: "var(--font-body)", fontSize: "14px" }}
                    >
                      {submitting ? <Loader2 className="w-5 h-5 mx-auto animate-spin" /> : "Konfirmasi Check-In"}
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
