"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useOrganizer } from "@/lib/useOrganizer";
import { Coins, Users, CalendarDays, ArrowUpRight, QrCode } from "lucide-react";
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

export default function DashboardOverview() {
  const { organizer, isLoaded } = useOrganizer();
  const [events, setEvents] = useState<EventWithGuests[]>([]);

  useEffect(() => {
    if (!organizer) return;
    fetch("/api/events")
      .then((r) => r.json())
      .then((data) => setEvents(data))
      .catch(() => {});
  }, [organizer]);

  const totalGuests = events.reduce((sum, e) => sum + e.guests.length, 0);
  const totalPeople = events.reduce((sum, e) => sum + e.guests.reduce((s, g) => s + g.partySize, 0), 0);
  const totalCheckedIn = events.reduce((sum, e) => sum + e.guests.filter((g) => g.hasCheckedIn).length, 0);

  if (!isLoaded || !organizer) return null;

  return (
    <div className="max-w-5xl px-6 lg:px-10 py-8 lg:py-12">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Dashboard
        </p>
        <h1 className="mt-2 text-[#0c123b] dark:text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "28px", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
          Welcome back, {organizer.name.split(" ")[0]}.
        </h1>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8">
        {[
          { label: "Token Balance", value: organizer.tokenBalance.toString(), icon: Coins, accent: true },
          { label: "Total Events", value: events.length.toString(), icon: CalendarDays, accent: false },
          { label: "Total People", value: totalPeople.toString(), icon: Users, accent: false },
          { label: "Checked In", value: totalCheckedIn.toString(), icon: QrCode, accent: false },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 * i }}
            className={`p-5 rounded-xl bg-[#fbeed4] dark:bg-[#111a34] ${
              stat.accent ? "border border-[#2d3895]" : "border border-[#867bba] dark:border-[#2a2660]"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`w-4 h-4 ${stat.accent ? "text-[#2d3895]" : "text-[#867bba]"}`} strokeWidth={1.5} />
            </div>
            <div className="text-[#0c123b] dark:text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "28px", letterSpacing: "-0.03em" }}>
              {stat.value}
            </div>
            <span className="text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "12px" }}>
              {stat.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Events table */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[#0c123b] dark:text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "16px" }}>
            Your Events
          </h2>
          <Link href="/admin/dashboard/events" className="flex items-center gap-1.5 hover:opacity-70 transition-opacity">
            <span className="text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px" }}>View all</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#3c58a7] dark:text-[#b3c2ff]" strokeWidth={1.5} />
          </Link>
        </div>
        <div className="rounded-xl overflow-hidden border border-[#867bba] dark:border-[#2a2660]">
          <table className="w-full">
            <thead>
              <tr className="bg-[#fbeed4] dark:bg-[#111a34] border-b border-[#867bba] dark:border-[#2a2660]">
                {["Event", "Date", "Guests", "People", "Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 first:pl-5 text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "11px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((evt, idx) => {
                const people = evt.guests.reduce((s, g) => s + g.partySize, 0);
                const isUpcoming = new Date(evt.date) > new Date();
                return (
                  <tr key={evt.id} className="bg-[#fbeed4] dark:bg-[#111a34]" style={{ borderBottom: idx < events.length - 1 ? "1px solid" : "none", borderColor: "var(--border-subtle, #f1e5ed)" }}>
                    <td className="px-5 py-4">
                      <Link href={`/admin/dashboard/events/${evt.id}`} className="hover:underline text-[#0c123b] dark:text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px", textDecoration: "none" }}>
                        {evt.name}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px" }}>
                        {new Date(evt.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[#0c123b] dark:text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px" }}>{evt.guests.length}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px" }}>{people}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded text-[#3c58a7] dark:text-[#b3c2ff] ${isUpcoming ? "bg-[#f1e5ed] dark:bg-[#18203c] border border-[#867bba] dark:border-[#2a2660]" : "bg-[rgba(60,88,167,0.12)] border border-[rgba(60,88,167,0.18)]"}`} style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "11px" }}>
                        {isUpcoming ? "Upcoming" : "Active"}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {events.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center bg-[#fbeed4] dark:bg-[#111a34]">
                    <span className="text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "14px" }}>
                      No events yet. Create your first event!
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="p-6 rounded-xl bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] dark:border-[#2a2660]">
          <span className="text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Total Invitations
          </span>
          <div className="mt-2 text-[#0c123b] dark:text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "32px", letterSpacing: "-0.03em" }}>
            {totalGuests}
          </div>
          <span className="text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px" }}>
            covering {totalPeople} people total
          </span>
        </div>
        <div className="p-6 rounded-xl bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] dark:border-[#2a2660]">
          <span className="text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Check-in Rate
          </span>
          <div className="mt-2 text-[#0c123b] dark:text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "32px", letterSpacing: "-0.03em" }}>
            {totalGuests > 0 ? Math.round((totalCheckedIn / totalGuests) * 100) : 0}%
          </div>
          <span className="text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px" }}>
            overall attendance
          </span>
        </div>
      </div>
    </div>
  );
}
