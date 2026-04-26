"use client";
import { useMemo } from "react";
import Link from "next/link";
import { useOrganizer } from "@/lib/useOrganizer";
import { db } from "../../../lib/db";
import { Coins, Users, CalendarDays, ArrowUpRight, QrCode } from "lucide-react";
import { motion } from "motion/react";

export default function DashboardOverview() {
  const { organizer } = useOrganizer();

  const events = useMemo(() => {
    if (!organizer) return [];
    return db.getEventsByOrganizer(organizer.id);
  }, [organizer]);

  const totalGuests = events.reduce((sum, e) => sum + e.guests.length, 0);
  const totalCheckedIn = events.reduce((sum, e) => sum + e.guests.filter((g) => g.hasCheckedIn).length, 0);
  const totalPlusOnes = events.reduce((sum, e) => sum + e.guests.filter((g) => g.isPlusOne).length, 0);

  if (!organizer) return null;

  return (
    <div className="max-w-5xl px-6 lg:px-10 py-8 lg:py-12">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px", color: "#3c58a7", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Dashboard
        </p>
        <h1 className="mt-2" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "28px", letterSpacing: "-0.03em", color: "#0c123b", lineHeight: 1.15 }}>
          Welcome back, {organizer.name.split(" ")[0]}.
        </h1>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8">
        {[
          { label: "Token Balance", value: organizer.tokenBalance.toString(), icon: Coins, accent: true },
          { label: "Total Events", value: events.length.toString(), icon: CalendarDays, accent: false },
          { label: "Total Guests", value: totalGuests.toString(), icon: Users, accent: false },
          { label: "Checked In", value: totalCheckedIn.toString(), icon: QrCode, accent: false },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 * i }}
            className="p-5 rounded-xl"
            style={{
              background: "#fbeed4",
              border: stat.accent ? "1px solid #2d3895" : "1px solid #867bba",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="w-4 h-4" strokeWidth={1.5} style={{ color: stat.accent ? "#2d3895" : "#867bba" }} />
            </div>
            <div style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "28px", color: "#0c123b", letterSpacing: "-0.03em" }}>
              {stat.value}
            </div>
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "12px", color: "#3c58a7" }}>
              {stat.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Events table */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "16px", color: "#0c123b" }}>
            Your Events
          </h2>
          <Link
            href="/admin/dashboard/events"
            className="flex items-center gap-1.5 hover:opacity-70 transition-opacity"
          >
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px", color: "#3c58a7" }}>View all</span>
            <ArrowUpRight className="w-3.5 h-3.5" style={{ color: "#3c58a7" }} strokeWidth={1.5} />
          </Link>
        </div>
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #867bba" }}>
          <table className="w-full">
            <thead>
              <tr style={{ background: "#fbeed4", borderBottom: "1px solid #867bba" }}>
                {["Event", "Date", "Guests", "Checked In", "Status"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 first:pl-5"
                    style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "11px", color: "#3c58a7", letterSpacing: "0.05em", textTransform: "uppercase" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {events.map((evt, idx) => {
                const checkedIn = evt.guests.filter((g) => g.hasCheckedIn).length;
                const isUpcoming = new Date(evt.date) > new Date();
                return (
                  <tr
                    key={evt.id}
                    style={{ background: "#fbeed4", borderBottom: idx < events.length - 1 ? "1px solid #f1e5ed" : "none" }}
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/dashboard/events/${evt.id}`}
                        className="hover:underline"
                        style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px", color: "#0c123b", textDecoration: "none" }}
                      >
                        {evt.name}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px", color: "#3c58a7" }}>
                        {new Date(evt.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px", color: "#0c123b" }}>
                        {evt.guests.length}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px", color: "#3c58a7" }}>
                        {checkedIn} / {evt.guests.length}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className="inline-block px-2.5 py-1 rounded"
                        style={{
                          fontFamily: "var(--font-body)",
                          fontWeight: 500,
                          fontSize: "11px",
                          color: "#3c58a7",
                          background: isUpcoming ? "#f1e5ed" : "rgba(60,88,167,0.12)",
                          border: isUpcoming ? "1px solid #867bba" : "1px solid rgba(60,88,167,0.18)",
                        }}
                      >
                        {isUpcoming ? "Upcoming" : "Active"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="p-6 rounded-xl" style={{ background: "#fbeed4", border: "1px solid #867bba" }}>
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", color: "#3c58a7", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Plus-Ones Added
          </span>
          <div className="mt-2" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "32px", color: "#0c123b", letterSpacing: "-0.03em" }}>
            {totalPlusOnes}
          </div>
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px", color: "#3c58a7" }}>
            across all events
          </span>
        </div>
        <div className="p-6 rounded-xl" style={{ background: "#fbeed4", border: "1px solid #867bba" }}>
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", color: "#3c58a7", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Check-in Rate
          </span>
          <div className="mt-2" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "32px", color: "#0c123b", letterSpacing: "-0.03em" }}>
            {totalGuests > 0 ? Math.round((totalCheckedIn / totalGuests) * 100) : 0}%
          </div>
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px", color: "#3c58a7" }}>
            overall attendance
          </span>
        </div>
      </div>
    </div>
  );
}
