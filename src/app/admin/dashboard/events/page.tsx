"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useOrganizer } from "@/lib/useOrganizer";
import { Plus, CalendarDays, Users, ArrowRight, X } from "lucide-react";
import { motion } from "motion/react";

interface Guest {
  id: string;
  name: string;
  hasCheckedIn: boolean;
  isPlusOne: boolean;
  partySize: number;
}

interface EventWithGuests {
  id: string;
  name: string;
  date: string;
  tokenCost: number;
  guests: Guest[];
}

export default function EventsPage() {
  const { organizer, refresh } = useOrganizer();
  const [events, setEvents] = useState<EventWithGuests[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newGuests, setNewGuests] = useState(100);
  const [creating, setCreating] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events");
      if (res.ok) setEvents(await res.json());
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (organizer) fetchEvents();
  }, [organizer, fetchEvents]);

  const tokenCost = Math.max(1, Math.ceil(newGuests / 50));

  const handleCreate = async () => {
    if (!organizer || !newName || !newDate || creating) return;
    if (organizer.tokenBalance < tokenCost) return;
    setCreating(true);
    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, date: newDate, expectedGuests: newGuests }),
      });
      if (res.ok) {
        refresh();
        await fetchEvents();
        setNewName("");
        setNewDate("");
        setNewGuests(100);
        setShowCreate(false);
      }
    } finally {
      setCreating(false);
    }
  };

  if (!organizer) return null;

  return (
    <div className="max-w-5xl px-6 lg:px-10 py-8 lg:py-12">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-start justify-between pt-10">
          <div>
            <p className="text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px", letterSpacing: "0.06em", textTransform: "uppercase" }}>Events</p>
            <h1 className="mt-2 text-[#0c123b] dark:text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "28px", letterSpacing: "-0.03em" }}>
              Manage Your Events
            </h1>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors duration-150 hover:bg-[#3c58a7]"
            style={{ background: "#2d3895", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px", color: "#fbeed4" }}
          >
            <Plus className="w-4 h-4" strokeWidth={1.5} />
            New Event
          </button>
        </div>
      </motion.div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(12,18,59,0.45)" }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-md rounded-xl p-6 bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] dark:border-[#2a2660]"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[#0c123b] dark:text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "16px" }}>Create Event</h3>
              <button onClick={() => setShowCreate(false)} className="p-1 hover:opacity-70">
                <X className="w-4 h-4 text-[#3c58a7] dark:text-[#b3c2ff]" strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex flex-col gap-5">
              <div>
                <label htmlFor="new-event-name" className="block mb-1.5 text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Event Name</label>
                <input id="new-event-name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Hartono Wedding"
                  className="w-full px-3.5 py-2.5 rounded-lg outline-none transition-colors bg-[#f1e5ed] dark:bg-[#18203c] border border-[#867bba] dark:border-[#2a2660] text-[#0c123b] dark:text-[#e8eeff]"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "14px" }} />
              </div>
              <div>
                <label htmlFor="new-event-date" className="block mb-1.5 text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Date</label>
                <input id="new-event-date" type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg outline-none transition-colors bg-[#f1e5ed] dark:bg-[#18203c] border border-[#867bba] dark:border-[#2a2660] text-[#0c123b] dark:text-[#e8eeff]"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "14px" }} />
              </div>
              <div>
                <label htmlFor="new-event-guests" className="block mb-1.5 text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>Expected Guests</label>
                <input id="new-event-guests" type="number" value={newGuests} onChange={(e) => setNewGuests(Number(e.target.value))} min={10} max={2000}
                  className="w-full px-3.5 py-2.5 rounded-lg outline-none transition-colors bg-[#f1e5ed] dark:bg-[#18203c] border border-[#867bba] dark:border-[#2a2660] text-[#0c123b] dark:text-[#e8eeff]"
                  style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "14px" }} />
              </div>
              <div className="p-4 rounded-lg bg-[#fbeed4] dark:bg-[#0b1022] border border-[#867bba] dark:border-[#2a2660]">
                <div className="flex items-center justify-between">
                  <span className="text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px" }}>Token cost</span>
                  <span className="text-[#0c123b] dark:text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "15px" }}>{tokenCost} token{tokenCost > 1 ? "s" : ""}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[#867bba]" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "12px" }}>Your balance</span>
                  <span className={`${organizer.tokenBalance >= tokenCost ? "text-[#3c58a7] dark:text-[#b3c2ff]" : "text-[#2d3895]"}`} style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "12px" }}>{organizer.tokenBalance} tokens</span>
                </div>
              </div>
              <button onClick={handleCreate} disabled={!newName || !newDate || organizer.tokenBalance < tokenCost || creating}
                className="w-full py-3 rounded-lg transition-colors duration-150 hover:bg-[#3c58a7] disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: "#2d3895", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "14px", color: "#fbeed4" }}>
                {creating ? "Creating..." : organizer.tokenBalance < tokenCost ? "Insufficient Tokens" : "Create & Deduct Tokens"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Event cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3">
        {events.map((evt, i) => {
          const checkedIn = evt.guests.filter((g) => g.hasCheckedIn).length;
          const people = evt.guests.reduce((s, g) => s + g.partySize, 0);
          const isUpcoming = new Date(evt.date) > new Date();
          return (
            <motion.div key={evt.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.05 }}>
              <Link
                href={`/admin/dashboard/events/${evt.id}`}
                className="block p-6 rounded-xl group transition-colors duration-150 hover:bg-[#f1e5ed] dark:hover:bg-[#18203c] bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] dark:border-[#2a2660]"
                style={{ textDecoration: "none" }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-[#0c123b] dark:text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "15px" }}>{evt.name}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <CalendarDays className="w-3.5 h-3.5 text-[#3c58a7] dark:text-[#b3c2ff]" strokeWidth={1.5} />
                      <span className="text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "12px" }}>
                        {new Date(evt.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#3c58a7] dark:text-[#b3c2ff]" strokeWidth={1.5} />
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#867bba]" strokeWidth={1.5} />
                    <span className="text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px" }}>{evt.guests.length} inv · {people} ppl</span>
                  </div>
                  <span className="text-[#867bba]" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "12px" }}>
                    {checkedIn}/{evt.guests.length} checked in
                  </span>
                  <span className={`ml-auto px-2 py-0.5 rounded text-[#3c58a7] dark:text-[#b3c2ff] ${isUpcoming ? "bg-[#f1e5ed] dark:bg-[#18203c] border border-[#867bba] dark:border-[#2a2660]" : "bg-[rgba(60,88,167,0.12)] border border-[rgba(60,88,167,0.18)]"}`}
                    style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "10px" }}>
                    {isUpcoming ? "Upcoming" : "Active"}
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
        {events.length === 0 && (
          <div className="col-span-full p-8 rounded-xl text-center bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] dark:border-[#2a2660]">
            <span className="text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "14px" }}>
              No events yet. Click &quot;New Event&quot; to create your first one!
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
