"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useAuth } from "../../../../lib/auth";
import { db } from "../../../../lib/db";
import { Plus, CalendarDays, Users, ArrowRight, X } from "lucide-react";
import { motion } from "motion/react";

export default function EventsPage() {
  const { organizer, refresh } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newGuests, setNewGuests] = useState(100);

  const events = useMemo(() => {
    if (!organizer) return [];
    return db.getEventsByOrganizer(organizer.id);
  }, [organizer, showCreate]); // re-read after create

  const tokenCost = Math.max(1, Math.ceil(newGuests / 50));

  const handleCreate = () => {
    if (!organizer || !newName || !newDate) return;
    if (organizer.tokenBalance < tokenCost) return;
    db.createEvent({
      organizerId: organizer.id,
      name: newName,
      date: new Date(newDate),
      tokenCost,
    });
    refresh();
    setNewName("");
    setNewDate("");
    setNewGuests(100);
    setShowCreate(false);
  };

  if (!organizer) return null;

  return (
    <div className="max-w-5xl px-6 lg:px-10 py-8 lg:py-12">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-start justify-between pt-10">
          <div>
            <p style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px", color: "#3c58a7", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Events
            </p>
            <h1 className="mt-2" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "28px", letterSpacing: "-0.03em", color: "#0c123b" }}>
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
            className="w-full max-w-md rounded-xl p-6"
            style={{ background: "#fbeed4", border: "1px solid #867bba" }}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "16px", color: "#0c123b" }}>Create Event</h3>
              <button onClick={() => setShowCreate(false)} className="p-1 hover:opacity-70">
                <X className="w-4 h-4" style={{ color: "#3c58a7" }} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <label htmlFor="new-event-name" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", color: "#3c58a7", letterSpacing: "0.04em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  Event Name
                </label>
                <input
                  id="new-event-name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Hartono Wedding"
                  className="w-full px-3.5 py-2.5 rounded-lg outline-none focus:border-[#2d3895] transition-colors"
                  style={{ background: "#f1e5ed", border: "1px solid #867bba", fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "14px", color: "#0c123b" }}
                />
              </div>
              <div>
                <label htmlFor="new-event-date" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", color: "#3c58a7", letterSpacing: "0.04em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  Date
                </label>
                <input
                  id="new-event-date"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg outline-none focus:border-[#2d3895] transition-colors"
                  style={{ background: "#f1e5ed", border: "1px solid #867bba", fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "14px", color: "#0c123b", colorScheme: "light" }}
                />
              </div>
              <div>
                <label htmlFor="new-event-guests" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", color: "#3c58a7", letterSpacing: "0.04em", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
                  Expected Guests
                </label>
                <input
                  id="new-event-guests"
                  type="number"
                  value={newGuests}
                  onChange={(e) => setNewGuests(Number(e.target.value))}
                  min={10}
                  max={2000}
                  className="w-full px-3.5 py-2.5 rounded-lg outline-none focus:border-[#2d3895] transition-colors"
                  style={{ background: "#f1e5ed", border: "1px solid #867bba", fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "14px", color: "#0c123b" }}
                />
              </div>

              <div className="p-4 rounded-lg" style={{ background: "#fbeed4", border: "1px solid #867bba" }}>
                <div className="flex items-center justify-between">
                  <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px", color: "#3c58a7" }}>Token cost</span>
                  <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "15px", color: "#0c123b" }}>
                    {tokenCost} token{tokenCost > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "12px", color: "#867bba" }}>Your balance</span>
                  <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "12px", color: organizer.tokenBalance >= tokenCost ? "#3c58a7" : "#2d3895" }}>
                    {organizer.tokenBalance} tokens
                  </span>
                </div>
              </div>

              <button
                onClick={handleCreate}
                disabled={!newName || !newDate || organizer.tokenBalance < tokenCost}
                className="w-full py-3 rounded-lg transition-colors duration-150 hover:bg-[#3c58a7] disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: "#2d3895", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "14px", color: "#fbeed4" }}
              >
                {organizer.tokenBalance < tokenCost ? "Insufficient Tokens" : "Create & Deduct Tokens"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Event cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3">
        {events.map((evt, i) => {
          const checkedIn = evt.guests.filter((g) => g.hasCheckedIn).length;
          const isUpcoming = new Date(evt.date) > new Date();
          return (
            <motion.div
              key={evt.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <Link
                href={`/admin/dashboard/events/${evt.id}`}
                className="block p-6 rounded-xl group transition-colors duration-150 hover:bg-[#f1e5ed]"
                style={{ background: "#fbeed4", border: "1px solid #867bba", textDecoration: "none" }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "15px", color: "#0c123b" }}>{evt.name}</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <CalendarDays className="w-3.5 h-3.5" style={{ color: "#3c58a7" }} strokeWidth={1.5} />
                      <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "12px", color: "#3c58a7" }}>
                        {new Date(evt.date).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "#3c58a7" }} strokeWidth={1.5} />
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" style={{ color: "#867bba" }} strokeWidth={1.5} />
                    <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", color: "#3c58a7" }}>{evt.guests.length}</span>
                  </div>
                  <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "12px", color: "#867bba" }}>
                    {checkedIn}/{evt.guests.length} checked in
                  </span>
                  <span
                    className="ml-auto px-2 py-0.5 rounded"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 500,
                      fontSize: "10px",
                      color: "#3c58a7",
                      background: isUpcoming ? "#f1e5ed" : "rgba(60,88,167,0.12)",
                      border: isUpcoming ? "1px solid #867bba" : "1px solid rgba(60,88,167,0.18)",
                    }}
                  >
                    {isUpcoming ? "Upcoming" : "Active"}
                  </span>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
