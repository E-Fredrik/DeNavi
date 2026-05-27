"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import CinemaSeating from "@/components/CinemaSeating";
import { motion } from "motion/react";

interface Guest {
  id: string;
  name: string;
  seatNumber: string | null;
}

interface EventData {
  id: string;
  name: string;
  guests: Guest[];
}

export default function SeatingMapPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchEvent = useCallback(async () => {
    if (!eventId) return;
    try {
      const res = await fetch(`/api/events/${eventId}`);
      if (res.ok) setEvent(await res.json());
    } catch { /* */ } finally { setLoading(false); }
  }, [eventId]);

  useEffect(() => { fetchEvent(); }, [fetchEvent]);

  if (loading) return <div className="max-w-5xl px-6 lg:px-10 py-12"><p className="text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontSize: "14px" }}>Loading...</p></div>;
  if (!event) return <div className="max-w-5xl px-6 lg:px-10 py-12"><p className="text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontSize: "14px" }}>Event not found.</p></div>;

  const occupiedSeats = event.guests
    .filter((g) => g.seatNumber)
    .map((g) => ({ seatId: g.seatNumber!, guestName: g.name }));

  return (
    <div className="max-w-5xl px-6 lg:px-10 py-8 lg:py-12">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Link href={`/admin/dashboard/events/${eventId}`} className="inline-flex items-center gap-2 mb-6 hover:opacity-70 transition-opacity">
          <ArrowLeft className="w-4 h-4 text-[#3c58a7] dark:text-[#b3c2ff]" strokeWidth={1.5} />
          <span className="text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px" }}>Back to event details</span>
        </Link>
        <div className="mb-8">
          <h1 className="text-[#0c123b] dark:text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "24px", letterSpacing: "-0.02em" }}>
            Seating Map: {event.name}
          </h1>
          <p className="mt-1 text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px" }}>
            View occupied seats and assignments for your guests.
          </p>
        </div>
      </motion.div>

      <div className="p-6 rounded-xl bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] dark:border-[#2a2660]">
        <CinemaSeating mode="view" occupiedSeats={occupiedSeats} />
      </div>
    </div>
  );
}
