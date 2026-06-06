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
            <p className="text-dash-text-muted font-medium tracking-widest text-xs uppercase mb-2">Workspace</p>
            <h1 className="text-dash-text font-semibold text-3xl sm:text-4xl tracking-tight">
              Manage Events
            </h1>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-full transition-all duration-300 shadow-lg bg-dash-accent text-dash-surface hover:opacity-90 font-medium text-sm"
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
              className="absolute inset-0 bg-dash-bg/60 backdrop-blur-sm"
              onClick={() => setShowCreate(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, type: "spring", bounce: 0.2 }}
              className="w-full max-w-lg rounded-[2rem] p-8 bg-dash-surface/80 backdrop-blur-2xl border border-dash-border shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-dash-text font-semibold text-2xl tracking-tight">New Event</h3>
                  <p className="text-dash-text-muted text-sm mt-1">Step {step} of 2</p>
                </div>
                <button onClick={() => setShowCreate(false)} className="w-10 h-10 rounded-full bg-dash-surface-alt flex items-center justify-center transition-colors hover:bg-dash-surface-hover text-dash-text-muted">
                  <X className="w-5 h-5" strokeWidth={2} />
                </button>
              </div>

              {step === 1 ? (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col gap-6">
                  <div>
                    <label htmlFor="new-event-name" className="block mb-2 text-dash-text font-medium text-sm">Event Name</label>
                    <input id="new-event-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Navian Annual Gala"
                      className="w-full px-4 py-3.5 rounded-2xl outline-none transition-all bg-dash-surface-alt border border-dash-border focus:border-dash-accent-light focus:ring-2 focus:ring-dash-accent/20 text-dash-text font-medium placeholder:text-dash-text-muted/60" />
                  </div>
                  <div>
                    <label htmlFor="new-event-date" className="block mb-2 text-dash-text font-medium text-sm">Date</label>
                    <input id="new-event-date" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl outline-none transition-all bg-dash-surface-alt border border-dash-border focus:border-dash-accent-light focus:ring-2 focus:ring-dash-accent/20 text-dash-text font-medium" />
                  </div>
                  <div>
                    <label htmlFor="new-event-guests" className="block mb-2 text-dash-text font-medium text-sm">Expected Guests <span className="text-dash-text-muted font-normal ml-1">({baseTokenCost} tokens)</span></label>
                    <input id="new-event-guests" type="number" value={newGuests} onChange={(e) => setNewGuests(Number(e.target.value))} min={10} max={5000}
                      className="w-full px-4 py-3.5 rounded-2xl outline-none transition-all bg-dash-surface-alt border border-dash-border focus:border-dash-accent-light focus:ring-2 focus:ring-dash-accent/20 text-dash-text font-medium" />
                  </div>
                  <button onClick={() => setStep(2)} disabled={!newName || !newDate}
                    className="w-full py-4 mt-2 rounded-2xl transition-all duration-300 font-medium text-base text-dash-surface bg-dash-accent shadow-lg hover:opacity-90 disabled:opacity-50 disabled:shadow-none">
                    Continue to Add-ons
                  </button>
                </motion.div>
              ) : (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-5">
                  <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                    {addonsCatalog.length === 0 ? (
                      <div className="p-4 rounded-2xl border-2 border-dash-border border-dashed text-center text-dash-text-muted text-sm">
                        No add-ons available at this time.
                      </div>
                    ) : (
                      addonsCatalog.map(addon => {
                        const isSelected = selectedAddonIds.includes(addon.id);
                        return (
                          <div key={addon.id} onClick={() => toggleAddon(addon.id)}
                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 ${isSelected ? "border-dash-accent bg-dash-surface-hover/50" : "border-dash-border hover:border-dash-border bg-dash-surface-alt"}`}>
                            <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${isSelected ? "border-dash-accent bg-dash-accent" : "border-dash-border"}`}>
                              {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-dash-surface" strokeWidth={3} />}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <h4 className={`font-semibold text-sm ${isSelected ? "text-dash-text-sub" : "text-dash-text"}`}>{addon.name}</h4>
                                <span className={`text-xs font-bold px-2 py-1 rounded-md ${isSelected ? "bg-dash-surface-hover text-dash-accent" : "bg-dash-surface-alt text-dash-text-muted"}`}>
                                  +{addon.tokenCost} T
                                </span>
                              </div>
                              <p className={`text-xs mt-1 ${isSelected ? "text-dash-accent" : "text-dash-text-muted"}`}>{addon.description}</p>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>

                  <div className="p-5 mt-2 rounded-2xl bg-dash-surface-alt border border-dash-border">
                    <div className="flex items-center justify-between mb-3 text-sm">
                      <span className="text-dash-text-muted font-medium">Base Cost</span>
                      <span className="text-dash-text font-semibold">{baseTokenCost} tokens</span>
                    </div>
                    {selectedAddonIds.length > 0 && (
                      <div className="flex items-center justify-between mb-3 text-sm">
                        <span className="text-dash-text-muted font-medium flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Add-ons</span>
                        <span className="text-dash-text font-semibold">+{addonsCost} tokens</span>
                      </div>
                    )}
                    <div className="pt-3 border-t border-dash-border flex items-center justify-between">
                      <span className="text-dash-text font-semibold">Total Cost</span>
                      <span className="text-dash-accent-light font-bold text-xl">{totalTokenCost} T</span>
                    </div>
                    <div className="flex items-center justify-between mt-3 text-xs">
                      <span className="text-dash-text-muted">Your Balance</span>
                      <span className={`${organizer.tokenBalance >= totalTokenCost ? "text-dash-text" : "text-red-500 font-bold"}`}>{organizer.tokenBalance} T</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button onClick={() => setStep(1)} className="px-5 py-4 rounded-2xl font-medium text-dash-text bg-dash-surface-alt hover:bg-dash-surface-hover transition-colors">
                      Back
                    </button>
                    <button onClick={handleCreate} disabled={organizer.tokenBalance < totalTokenCost || creating}
                      className="flex-1 py-4 rounded-2xl transition-all duration-300 font-medium text-base text-dash-surface bg-dash-accent shadow-lg hover:opacity-90 disabled:opacity-50 disabled:shadow-none flex items-center justify-center">
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
              <Link href={`/admin/dashboard/events/${evt.id}`} className="block h-full p-6 rounded-[2rem] group transition-all duration-300 hover:-translate-y-1 bg-dash-surface-alt/60 backdrop-blur-xl border border-dash-border/50 shadow-xl shadow-dash-border/20 hover:shadow-dash-accent/10 hover:border-dash-accent/30">
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <h3 className="text-dash-text font-bold text-xl tracking-tight leading-tight group-hover:text-dash-accent-light transition-colors">{evt.name}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <CalendarDays className="w-4 h-4 text-dash-text-muted" />
                      <span className="text-dash-text-muted font-medium text-sm">
                        {new Date(evt.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                  <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${isUpcoming ? "bg-dash-surface-hover text-dash-accent-light" : "bg-dash-surface text-dash-text-sub"}`}>
                    {isUpcoming ? "Upcoming" : "Active"}
                  </div>
                </div>
                
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-dash-text-muted text-xs font-medium uppercase tracking-wider mb-1">Invited</span>
                      <span className="text-dash-text font-semibold text-lg">{evt.guests?.length || 0}</span>
                    </div>
                    <div className="w-px h-8 bg-dash-border" />
                    <div className="flex flex-col">
                      <span className="text-dash-text-muted text-xs font-medium uppercase tracking-wider mb-1">Attendees</span>
                      <span className="text-dash-text font-semibold text-lg">{people}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-dash-border/50">
                    <span className="text-dash-text-muted text-sm font-medium">
                      {checkedIn}/{evt.guests?.length || 0} checked in
                    </span>
                    {hasAddons && (
                      <div className="flex items-center gap-1.5 text-dash-accent-light bg-dash-surface-hover/50 px-2 py-1 rounded-md">
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
          <div className="col-span-full py-20 rounded-[2rem] text-center bg-dash-surface/20 backdrop-blur-sm border border-dash-border/50 border-dashed">
            <h3 className="text-dash-text font-semibold text-xl mb-2">No events found</h3>
            <p className="text-dash-text-muted font-medium max-w-sm mx-auto">
              Create your first event to start inviting guests and managing check-ins.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
