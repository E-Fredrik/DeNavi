"use client";

import { useEffect, useState, use } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Calendar, Loader2, Users } from "lucide-react";
import Link from "next/link";

interface Event {
  id: string;
  name: string;
  date: string;
  tokenCost: number;
  _count: {
    guests: number;
  };
}

interface OrganizerDetails {
  id: string;
  name: string;
  email: string | null;
  whatsapp: string | null;
  tokenBalance: number;
  createdAt: string;
  events: Event[];
}

export default function SuperAdminOrganizerDetailsPage({ params }: { params: Promise<{ organizerId: string }> }) {
  const { organizerId } = use(params);
  const [organizer, setOrganizer] = useState<OrganizerDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/super-admin/organizers/${organizerId}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) setOrganizer(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [organizerId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#867bba]" />
      </div>
    );
  }

  if (!organizer) {
    return <div className="text-[#3c58a7]">Organizer not found.</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-5xl"
    >
      <Link href="/super-admin/dashboard/organizers" className="inline-flex items-center gap-2 text-[#3c58a7] dark:text-[#b3c2ff] hover:opacity-70 transition-opacity">
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Organizers</span>
      </Link>

      <header className="mb-8 p-6 rounded-xl border border-[#867bba]/30 bg-[#f1e5ed] dark:bg-[#18203c]">
        <h1 className="text-2xl font-bold text-[#0c123b] dark:text-[#e8eeff] tracking-tight mb-1">
          {organizer.name}
        </h1>
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-[#3c58a7] dark:text-[#b3c2ff]">
          <div><span className="font-semibold text-[#867bba]">Email:</span> {organizer.email || "N/A"}</div>
          <div><span className="font-semibold text-[#867bba]">WhatsApp:</span> {organizer.whatsapp || "N/A"}</div>
          <div><span className="font-semibold text-[#867bba]">Tokens:</span> <span className="font-bold text-[#2d3895] dark:text-[#b3c2ff]">{organizer.tokenBalance} T</span></div>
          <div><span className="font-semibold text-[#867bba]">Joined:</span> {new Date(organizer.createdAt).toLocaleDateString()}</div>
        </div>
      </header>

      <div className="mb-4">
        <h2 className="text-lg font-bold text-[#0c123b] dark:text-[#e8eeff] uppercase tracking-tight">
          Events ({organizer.events.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {organizer.events.length > 0 ? (
          organizer.events.map((event) => (
            <Link key={event.id} href={`/super-admin/dashboard/events/${event.id}`}>
              <div className="p-5 rounded-xl border border-[#867bba]/30 bg-white dark:bg-[#0b1022] hover:border-[#2d3895] hover:shadow-lg transition-all cursor-pointer group h-full flex flex-col">
                <h3 className="text-lg font-semibold text-[#0c123b] dark:text-[#e8eeff] group-hover:text-[#2d3895] transition-colors mb-2">
                  {event.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-[#3c58a7] dark:text-[#b3c2ff] mb-4">
                  <Calendar className="w-4 h-4" />
                  {new Date(event.date).toLocaleDateString()}
                </div>
                <div className="mt-auto pt-4 border-t border-[#867bba]/10 flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5 text-[#867bba]"><Users className="w-4 h-4" /> {event._count.guests} Guests</span>
                  <span className="font-semibold text-[#2d3895] dark:text-[#b3c2ff]">{event.tokenCost} T Cost</span>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full p-8 text-center rounded-xl border border-[#867bba]/30 bg-white dark:bg-[#0b1022] text-[#867bba]">
            This organizer has not created any events yet.
          </div>
        )}
      </div>
    </motion.div>
  );
}
