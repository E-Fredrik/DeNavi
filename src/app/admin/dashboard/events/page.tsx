"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useOrganizer } from "@/lib/useOrganizer";
import { Plus, CalendarDays, Users, ArrowRight, X, Sparkles, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Guest {
  id: string;
  name: string;
  hasCheckedIn: boolean;
  isPlusOne: boolean;
  partySize: number;
}

interface EventAddon {
  id: string;
  addon: Addon;
}

interface EventWithGuests {
  id: string;
  name: string;
  date: string;
  tokenCost: number;
  guests: Guest[];
  eventAddons: EventAddon[];
}

interface Addon {
  id: string;
  name: string;
  description: string;
  tokenCost: number;
}

export default function EventsPage() {
  const { organizer, refresh } = useOrganizer();
  const [events, setEvents] = useState<EventWithGuests[]>([]);
  const [addonsCatalog, setAddonsCatalog] = useState<Addon[]>([]);
  
  const [showCreate, setShowCreate] = useState(false);
  const [step, setStep] = useState(1);
  const [newName, setNewName] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newGuests, setNewGuests] = useState(100);
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events");
      if (res.ok) setEvents(await res.json());
    } catch { /* ignore */ }
  }, []);

  const fetchAddons = useCallback(async () => {
    try {
      const res = await fetch("/api/addons");
      if (res.ok) setAddonsCatalog(await res.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (organizer) {
      fetchEvents();
      fetchAddons();
    }
  }, [organizer, fetchEvents, fetchAddons]);

  const baseTokenCost = Math.max(1, Math.ceil(newGuests / 50));
  const addonsCost = selectedAddonIds.reduce((total, id) => {
    const addon = addonsCatalog.find(a => a.id === id);
    return total + (addon?.tokenCost || 0);
  }, 0);
  const totalTokenCost = baseTokenCost + addonsCost;

  const handleCreate = async () => {
    if (!organizer || !newName || !newDate || creating) return;
    if (organizer.tokenBalance < totalTokenCost) return;
    setCreating(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, date: newDate, expectedGuests: newGuests, addonIds: selectedAddonIds }),
      });
      if (res.ok) {
        refresh();
        await fetchEvents();
        setNewName("");
        setNewDate("");
        setNewGuests(100);
        setSelectedAddonIds([]);
        setStep(1);
        setShowCreate(false);
      }
    } finally {
      setCreating(false);
    }
  };

  const toggleAddon = (id: string) => {
    setSelectedAddonIds(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  };

  if (!organizer) return null;

  return (
    <div className="max-w-6xl px-6 lg:px-10 py-8 lg:py-12 min-h-[calc(100vh-64px)]">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium tracking-widest text-xs uppercase mb-2">Workspace</p>
            <h1 className="text-zinc-900 dark:text-white font-semibold text-3xl sm:text-4xl tracking-tight">
              Manage Events
            </h1>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-full transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 text-white font-medium text-sm"
            style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}
          >
            <Plus className="w-4 h-4" strokeWidth={2} />
            Create Event
          </button>
        </div>
      </motion.div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-zinc-900/40 dark:bg-black/60 backdrop-blur-sm"
              onClick={() => setShowCreate(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
              className="w-full max-w-lg rounded-[2rem] p-8 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-zinc-900 dark:text-white font-semibold text-2xl tracking-tight">New Event</h3>
                  <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-1">Step {step} of 2</p>
                </div>
                <button onClick={() => setShowCreate(false)} className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center transition-colors hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400">
                  <X className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>

              {step === 1 ? (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col gap-6">
                  <div>
                    <label htmlFor="new-event-name" className="block mb-2 text-zinc-700 dark:text-zinc-300 font-medium text-sm">Event Name</label>
                    <input id="new-event-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Navian Annual Gala"
                      className="w-full px-4 py-3.5 rounded-2xl outline-none transition-all bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 text-zinc-900 dark:text-white font-medium placeholder:text-zinc-400" />
                  </div>
                  <div>
                    <label htmlFor="new-event-date" className="block mb-2 text-zinc-700 dark:text-zinc-300 font-medium text-sm">Date</label>
                    <input id="new-event-date" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl outline-none transition-all bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 text-zinc-900 dark:text-white font-medium" />
                  </div>
                  <div>
                    <label htmlFor="new-event-guests" className="block mb-2 text-zinc-700 dark:text-zinc-300 font-medium text-sm">Expected Guests <span className="text-zinc-400 font-normal ml-1">({baseTokenCost} tokens)</span></label>
                    <input id="new-event-guests" type="number" value={newGuests} onChange={(e) => setNewGuests(Number(e.target.value))} min={10} max={5000}
                      className="w-full px-4 py-3.5 rounded-2xl outline-none transition-all bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20 text-zinc-900 dark:text-white font-medium" />
                  </div>
                  <button onClick={() => setStep(2)} disabled={!newName || !newDate}
                    className="w-full py-4 mt-2 rounded-2xl transition-all duration-300 font-medium text-base text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:shadow-none"
                    style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}>
                    Continue to Add-ons
                  </button>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-5">
                  <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                    {addonsCatalog.map(addon => {
                      const isSelected = selectedAddonIds.includes(addon.id);
                      return (
                        <div key={addon.id} onClick={() => toggleAddon(addon.id)}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 ${isSelected ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-500/10" : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50 dark:bg-zinc-950/50"}`}>
                          <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? "border-indigo-500 bg-indigo-500" : "border-zinc-300 dark:border-zinc-700"}`}>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <h4 className={`font-semibold text-sm ${isSelected ? "text-indigo-900 dark:text-indigo-100" : "text-zinc-900 dark:text-white"}`}>{addon.name}</h4>
                              <span className={`text-xs font-bold px-2 py-1 rounded-md ${isSelected ? "bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"}`}>
                                +{addon.tokenCost} T
                              </span>
                            </div>
                            <p className={`text-xs mt-1 ${isSelected ? "text-indigo-700/70 dark:text-indigo-300/70" : "text-zinc-500 dark:text-zinc-400"}`}>{addon.description}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <div className="p-5 mt-2 rounded-2xl bg-zinc-100 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center justify-between mb-3 text-sm">
                      <span className="text-zinc-500 dark:text-zinc-400 font-medium">Base Cost</span>
                      <span className="text-zinc-900 dark:text-white font-semibold">{baseTokenCost} tokens</span>
                    </div>
                    {selectedAddonIds.length > 0 && (
                      <div className="flex items-center justify-between mb-3 text-sm">
                        <span className="text-zinc-500 dark:text-zinc-400 font-medium flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Add-ons</span>
                        <span className="text-zinc-900 dark:text-white font-semibold">+{addonsCost} tokens</span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                      <span className="text-zinc-900 dark:text-white font-semibold">Total Cost</span>
                      <span className="text-indigo-600 dark:text-indigo-400 font-bold text-xl">{totalTokenCost} T</span>
                    </div>
                    <div className="flex items-center justify-between mt-3 text-xs">
                      <span className="text-zinc-500">Your Balance</span>
                      <span className={`${organizer.tokenBalance >= totalTokenCost ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 font-bold"}`}>{organizer.tokenBalance} T</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="px-5 py-4 rounded-2xl font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                      Back
                    </button>
                    <button onClick={handleCreate} disabled={organizer.tokenBalance < totalTokenCost || creating}
                      className="flex-1 py-4 rounded-2xl transition-all duration-300 font-medium text-base text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:shadow-none flex items-center justify-center"
                      style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}>
                      {creating ? "Processing..." : organizer.tokenBalance < totalTokenCost ? "Insufficient Tokens" : "Create & Deduct"}
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Event Cards */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((evt, i) => {
          const checkedIn = evt.guests?.filter((g) => g.hasCheckedIn).length || 0;
          const people = evt.guests?.reduce((s, g) => s + g.partySize, 0) || 0;
          const isUpcoming = new Date(evt.date) > new Date();
          const hasAddons = evt.eventAddons?.length > 0;

          return (
            <motion.div key={evt.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}>
              <Link href={`/admin/dashboard/events/${evt.id}`} className="block h-full p-6 rounded-[2rem] group transition-all duration-300 hover:-translate-y-1 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-zinc-200/50 dark:border-zinc-800/50 shadow-xl shadow-zinc-200/20 dark:shadow-black/20 hover:shadow-indigo-500/10 hover:border-indigo-500/30">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h3 className="text-zinc-900 dark:text-white font-bold text-xl tracking-tight leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{evt.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <CalendarDays className="w-4 h-4 text-zinc-400" />
                      <span className="text-zinc-500 dark:text-zinc-400 font-medium text-sm">
                        {new Date(evt.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${isUpcoming ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400" : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"}`}>
                    {isUpcoming ? "Upcoming" : "Active"}
                  </div>
                </div>
                
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-zinc-400 dark:text-zinc-500 text-xs font-medium uppercase tracking-wider mb-1">Invited</span>
                      <span className="text-zinc-900 dark:text-white font-semibold text-lg">{evt.guests?.length || 0}</span>
                    </div>
                    <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-800" />
                    <div className="flex flex-col">
                      <span className="text-zinc-400 dark:text-zinc-500 text-xs font-medium uppercase tracking-wider mb-1">Attendees</span>
                      <span className="text-zinc-900 dark:text-white font-semibold text-lg">{people}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
                    <span className="text-zinc-500 dark:text-zinc-400 text-sm font-medium">
                      {checkedIn}/{evt.guests?.length || 0} checked in
                    </span>
                    {hasAddons && (
                      <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-1 rounded-md">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{evt.eventAddons.length} Premium</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
        {events.length === 0 && (
          <div className="col-span-full py-20 rounded-[2rem] text-center bg-white/20 dark:bg-zinc-900/20 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 border-dashed">
            <h3 className="text-zinc-900 dark:text-white font-semibold text-xl mb-2">No events found</h3>
            <p className="text-zinc-500 dark:text-zinc-400 font-medium max-w-sm mx-auto">
              Create your first event to start inviting guests and managing check-ins.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
