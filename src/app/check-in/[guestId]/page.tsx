"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { CheckCircle2, User, Users, MapPin, Lock, Gift, Banknote, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
  const [angpaoAmount, setAngpaoAmount] = useState("");
  const [angpaoGift, setAngpaoGift] = useState("");

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
        setError("Guest not found or invalid QR code.");
      }
    } catch {
      setError("Failed to load guest data.");
    } finally {
      setLoading(false);
    }
  }, [guestId]);

  useEffect(() => {
    fetchGuest();
  }, [fetchGuest]);

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError("Staff password is required.");
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
          angpaoAmount: angpaoAmount ? parseInt(angpaoAmount.replace(/\\D/g, "")) : undefined,
          angpaoGift: angpaoGift || undefined
        })
      });

      if (res.ok) {
        setSuccessMsg("Check-in successful!");
        await fetchGuest(); // Refresh data to show success screen
      } else {
        const err = await res.json();
        setError(err.error || "Invalid password or failed to check in.");
      }
    } catch (err) {
      setError("Network error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (error && !guest) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-[2rem] p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Error</h2>
          <p className="text-zinc-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!guest) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-lg relative">
        {/* Glow Effect behind card */}
        <div className={`absolute -inset-1 rounded-[2.5rem] blur-xl opacity-20 transition-colors duration-1000 ${guest.hasCheckedIn ? "bg-emerald-500" : "bg-indigo-500"}`} />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative bg-zinc-900/80 backdrop-blur-3xl border border-zinc-800 rounded-[2rem] p-6 sm:p-10 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <h4 className="text-indigo-400 font-bold tracking-widest text-xs uppercase mb-3">{guest.eventName}</h4>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 text-white">{guest.name}</h1>
            <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 text-zinc-300 text-sm font-medium rounded-full">
                <Users className="w-4 h-4 text-zinc-400" /> Party of {guest.partySize}
              </span>
              {guest.tableNumber && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 text-zinc-300 text-sm font-medium rounded-full">
                  <MapPin className="w-4 h-4 text-zinc-400" /> {guest.tableNumber}
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
                <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-16 h-16 text-emerald-500" strokeWidth={2.5} />
                </div>
                <h2 className="text-2xl font-bold text-emerald-400 mb-2">Checked In</h2>
                <p className="text-zinc-400 text-sm max-w-[250px] mx-auto">
                  {guest.name} and {guest.actualAttendees - 1} guest(s) arrived securely.
                </p>
                {guest.checkInTime && (
                  <p className="text-zinc-500 text-xs mt-6 font-mono bg-zinc-950 px-3 py-2 rounded-lg border border-zinc-800">
                    {new Date(guest.checkInTime).toLocaleString()}
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.form 
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onSubmit={handleCheckIn}
                className="flex flex-col gap-6"
              >
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-300">{error}</p>
                  </div>
                )}
                {successMsg && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-emerald-300">{successMsg}</p>
                  </div>
                )}

                <div className="space-y-5">
                  {/* Password Input */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-400 mb-2 uppercase tracking-widest text-xs">
                      <Lock className="w-3.5 h-3.5" /> Staff Security Key
                    </label>
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter check-in password"
                      className="w-full px-4 py-3.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                      autoComplete="off"
                    />
                  </div>

                  {/* Actual Attendees */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-zinc-400 mb-2 uppercase tracking-widest text-xs">
                      <User className="w-3.5 h-3.5" /> Actual Attendees Arrived
                    </label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="range" 
                        min="1" 
                        max={guest.partySize} 
                        value={actualAttendees}
                        onChange={(e) => setActualAttendees(parseInt(e.target.value))}
                        className="flex-1 accent-indigo-500"
                      />
                      <div className="w-16 h-12 bg-zinc-950 border border-zinc-800 rounded-xl flex items-center justify-center font-bold text-lg text-indigo-400">
                        {actualAttendees}
                      </div>
                    </div>
                  </div>

                  {/* Angpao Tracker (if enabled) */}
                  {guest.hasAngpaoTracker && (
                    <div className="pt-4 mt-2 border-t border-zinc-800/50">
                      <div className="flex items-center gap-2 mb-4">
                        <Gift className="w-4 h-4 text-indigo-400" />
                        <h3 className="text-sm font-semibold text-white">Gift / Angpao Tracker</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-zinc-500 mb-1">Amount (IDR)</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">Rp</span>
                            <input 
                              type="text" 
                              value={angpaoAmount}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\\D/g, "");
                                setAngpaoAmount(val ? parseInt(val).toLocaleString("id-ID") : "");
                              }}
                              placeholder="0"
                              className="w-full pl-9 pr-3 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-indigo-500 transition-all text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-zinc-500 mb-1">Physical Gift</label>
                          <input 
                            type="text" 
                            value={angpaoGift}
                            onChange={(e) => setAngpaoGift(e.target.value)}
                            placeholder="e.g. Toaster"
                            className="w-full px-3 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-white outline-none focus:border-indigo-500 transition-all text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 mt-4 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:pointer-events-none shadow-lg shadow-indigo-600/25"
                >
                  {submitting ? <Loader2 className="w-5 h-5 mx-auto animate-spin" /> : "Confirm Check-in"}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
