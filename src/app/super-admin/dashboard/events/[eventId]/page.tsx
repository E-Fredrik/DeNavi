"use client";

import { useEffect, useState, use } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Calendar, Loader2, Users, Gift, CheckCircle2, XCircle } from "lucide-react";
import Link from "next/link";

interface Guest {
  id: string;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  status: "PENDING" | "CONFIRMED" | "DECLINED";
  isAttended: boolean;
  tableNumber: string | null;
  pax: number;
  angpaos: any[];
}

interface EventAddon {
  addon: {
    name: string;
  };
}

interface EventDetails {
  id: string;
  name: string;
  date: string;
  tokenCost: number;
  checkInPassword: string | null;
  guests: Guest[];
  eventAddons: EventAddon[];
  organizer: {
    id: string;
    name: string;
  };
}

export default function SuperAdminEventDetailsPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/super-admin/events/${eventId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setEvent(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [eventId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#867bba]" />
      </div>
    );
  }

  if (!event) {
    return <div className="text-[#3c58a7]">Event not found.</div>;
  }

  const attendedCount = event.guests.filter(g => g.isAttended).length;
  const angpaoTotal = event.guests.reduce((sum, g) => sum + g.angpaos.reduce((a, angpao) => a + angpao.amount, 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-5xl"
    >
      <Link href={`/super-admin/dashboard/organizers/${event.organizer.id}`} className="inline-flex items-center gap-2 text-[#3c58a7] dark:text-[#b3c2ff] hover:opacity-70 transition-opacity">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Organizer</span>
      </Link>

      {/* Header */}
      <header className="mb-8 p-6 rounded-xl border border-[#867bba]/30 bg-[#f1e5ed] dark:bg-[#18203c] relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-[#0c123b] dark:text-[#e8eeff] tracking-tight mb-2">
            {event.name}
          </h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#3c58a7] dark:text-[#b3c2ff]">
            <div className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {new Date(event.date).toLocaleDateString()}</div>
            <div className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {event.guests.length} Guests ({attendedCount} Attended)</div>
            <div className="font-semibold text-[#867bba]">Tokens Used: <span className="text-[#2d3895] dark:text-[#b3c2ff]">{event.tokenCost} T</span></div>
            {event.eventAddons.length > 0 && (
              <div className="flex items-center gap-2 ml-auto">
                {event.eventAddons.map((ea, idx) => (
                  <span key={idx} className="px-2 py-1 text-xs font-semibold rounded-md bg-[#2d3895] text-white">
                    {ea.addon.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Guest List */}
      <div className="rounded-xl border border-[#867bba]/30 bg-white dark:bg-[#0b1022] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#867bba]/30 bg-[#f1e5ed] dark:bg-[#18203c] flex items-center justify-between">
          <h2 className="font-bold text-[#0c123b] dark:text-[#e8eeff] uppercase tracking-wider text-sm">Guest List</h2>
          {angpaoTotal > 0 && (
             <span className="text-sm font-bold text-[#2d3895] dark:text-[#b3c2ff] bg-[#fbeed4] dark:bg-[#111a34] px-3 py-1 rounded-full flex items-center gap-1.5">
               <Gift className="w-4 h-4" /> Total Angpao: Rp {angpaoTotal.toLocaleString()}
             </span>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#f1e5ed]/50 dark:bg-[#18203c]/50 border-b border-[#867bba]/30">
                <th className="px-6 py-3 font-semibold text-[#3c58a7] dark:text-[#b3c2ff]">Name</th>
                <th className="px-6 py-3 font-semibold text-[#3c58a7] dark:text-[#b3c2ff]">Contact</th>
                <th className="px-6 py-3 font-semibold text-[#3c58a7] dark:text-[#b3c2ff]">Status</th>
                <th className="px-6 py-3 font-semibold text-[#3c58a7] dark:text-[#b3c2ff]">Table/Pax</th>
                <th className="px-6 py-3 font-semibold text-[#3c58a7] dark:text-[#b3c2ff]">Check-in</th>
              </tr>
            </thead>
            <tbody>
              {event.guests.length > 0 ? (
                event.guests.map((guest) => (
                  <tr key={guest.id} className="border-b border-[#867bba]/10 hover:bg-[#f1e5ed]/30 dark:hover:bg-[#18203c]/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-[#0c123b] dark:text-[#e8eeff]">
                      {guest.name}
                    </td>
                    <td className="px-6 py-4 text-[#3c58a7] dark:text-[#b3c2ff]">
                      <div>{guest.email || "No email"}</div>
                      <div className="text-xs text-[#867bba]">{guest.phoneNumber || "No phone"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        guest.status === "CONFIRMED" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                        guest.status === "DECLINED" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                        "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}>
                        {guest.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#3c58a7] dark:text-[#b3c2ff]">
                      {guest.tableNumber ? `Table ${guest.tableNumber}` : "No Table"} <span className="text-[#867bba]">({guest.pax} pax)</span>
                    </td>
                    <td className="px-6 py-4">
                      {guest.isAttended ? (
                        <span className="flex items-center gap-1.5 text-green-600 dark:text-green-400 font-medium text-xs">
                          <CheckCircle2 className="w-4 h-4" /> Checked In
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-[#867bba] text-xs">
                          <XCircle className="w-4 h-4" /> Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#867bba]">
                    No guests invited yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
