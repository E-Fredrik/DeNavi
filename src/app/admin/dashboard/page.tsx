"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useOrganizer } from "@/lib/useOrganizer";
import { Coins, Users, CalendarDays, ArrowUpRight, QrCode } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "@/components/LanguageProvider";

interface Guest {
  id: string;
  firstName: string;
  lastName: string;
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
  const { language } = useLanguage();
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

  const isId = language === "id";

  return (
    <div className="max-w-5xl px-6 lg:px-10 py-8 lg:py-12 min-h-screen">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="text-dash-text-muted" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Dashboard
        </p>
        <h1 className="mt-2 text-dash-text" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "28px", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
          {isId ? "Selamat datang kembali," : "Welcome back,"} {organizer.name.split(" ")[0]}.
        </h1>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8">
        {[
          { label: isId ? "Saldo Token" : "Token Balance", value: organizer.tokenBalance.toString(), icon: Coins, accent: true },
          { label: isId ? "Total Acara" : "Total Events", value: events.length.toString(), icon: CalendarDays, accent: false },
          { label: isId ? "Total Orang" : "Total People", value: totalPeople.toString(), icon: Users, accent: false },
          { label: isId ? "Sudah Check In" : "Checked In", value: totalCheckedIn.toString(), icon: QrCode, accent: false },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 * i }}
            className={`p-5 rounded-xl bg-dash-surface-alt border ${
              stat.accent ? "border-dash-accent-light" : "border-dash-border"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className={`w-4 h-4 ${stat.accent ? "text-dash-accent-light" : "text-dash-text-muted"}`} strokeWidth={1.5} />
            </div>
            <div className="text-dash-text" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "28px", letterSpacing: "-0.03em" }}>
              {stat.value}
            </div>
            <span className="text-dash-text-muted" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "12px" }}>
              {stat.label}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Events table */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-dash-text" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "16px" }}>
            {isId ? "Acara Kamu" : "Your Events"}
          </h2>
          <Link href="/admin/dashboard/events" className="flex items-center gap-1.5 hover:opacity-70 transition-opacity">
            <span className="text-dash-text-muted" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px" }}>{isId ? "Lihat semua" : "View all"}</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-dash-text-muted" strokeWidth={1.5} />
          </Link>
        </div>
        <div className="rounded-xl overflow-hidden border border-dash-border">
          <table className="w-full">
            <thead>
              <tr className="bg-dash-surface-alt border-b border-dash-border">
                {[isId ? "Acara" : "Event", isId ? "Tanggal" : "Date", isId ? "Tamu" : "Guests", isId ? "Orang" : "People", "Status"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 first:pl-5 text-dash-text-muted" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "11px", letterSpacing: "0.05em", textTransform: "uppercase" }}>
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
                  <tr key={evt.id} className={`bg-dash-surface transition-colors hover:bg-dash-surface-hover ${idx < events.length - 1 ? "border-b border-dash-border" : ""}`}>
                    <td className="px-5 py-4">
                      <Link href={`/admin/dashboard/events/${evt.id}`} className="hover:underline text-dash-text" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px", textDecoration: "none" }}>
                        {evt.name}
                      </Link>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-dash-text-muted" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px" }}>
                        {new Date(evt.date).toLocaleDateString(isId ? "id-ID" : "en-US", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-dash-text" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "13px" }}>{evt.guests.length}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-dash-text-muted" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px" }}>{people}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-block px-2.5 py-1 rounded ${isUpcoming ? "bg-gray-100 dark:bg-dash-surface-hover border border-dash-border text-dash-text-sub" : "bg-dash-surface-alt border border-dash-accent-light text-dash-accent-light"}`} style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "11px" }}>
                        {isUpcoming ? (isId ? "Akan Datang" : "Upcoming") : (isId ? "Aktif" : "Active")}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {events.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center bg-dash-surface">
                    <span className="text-dash-text-muted" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "14px" }}>
                      {isId ? "Belum ada acara. Buat acara pertamamu!" : "No events yet. Create your first event!"}
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
        <div className="p-6 rounded-xl bg-dash-surface-alt border border-dash-border">
          <span className="text-dash-text-muted" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {isId ? "Total Undangan" : "Total Invitations"}
          </span>
          <div className="mt-2 text-dash-text" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "32px", letterSpacing: "-0.03em" }}>
            {totalGuests}
          </div>
          <span className="text-dash-text-muted" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px" }}>
            {isId ? `mencakup ${totalPeople} orang total` : `covering ${totalPeople} people in total`}
          </span>
        </div>
        <div className="p-6 rounded-xl bg-dash-surface-alt border border-dash-border">
          <span className="text-dash-text-muted" style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {isId ? "Tingkat Check-in" : "Check-in Rate"}
          </span>
          <div className="mt-2 text-dash-text" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "32px", letterSpacing: "-0.03em" }}>
            {totalGuests > 0 ? Math.round((totalCheckedIn / totalGuests) * 100) : 0}%
          </div>
          <span className="text-dash-text-muted" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px" }}>
            {isId ? "kehadiran keseluruhan" : "overall attendance"}
          </span>
        </div>
      </div>
    </div>
  );
}
