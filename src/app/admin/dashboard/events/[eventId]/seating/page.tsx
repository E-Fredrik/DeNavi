"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { ArrowLeft, Users } from "lucide-react";
import VenueVisualizer from "@/components/VenueVisualizer";
import { motion } from "motion/react";

export default function SeatingChartPage({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = use(params);
  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchEvent = useCallback(async () => {
    try {
      const res = await fetch(`/api/events/${eventId}`);
      if (res.ok) {
        setEventData(await res.json());
      }
    } catch {
      /* */
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  if (loading) {
    return (
      <div className="max-w-6xl px-6 lg:px-10 py-12">
        <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#867bba" }}>Memuat...</p>
      </div>
    );
  }

  if (!eventData) {
    return (
      <div className="max-w-6xl px-6 lg:px-10 py-12">
        <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#867bba" }}>Acara tidak ditemukan.</p>
      </div>
    );
  }

  const occupiedSeats = eventData.guests
    .filter((g: any) => g.seatNumber && g.tableNumber)
    .map((g: any) => ({
      tableId: g.tableNumber,
      seatNumber: parseInt(g.seatNumber),
      guestName: `${g.firstName} ${g.lastName || ""}`.trim(),
    }))
    .filter((g: any) => !isNaN(g.seatNumber));

  return (
    <div className="max-w-6xl px-6 lg:px-10 py-8 lg:py-12">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Link
          href={`/admin/dashboard/events/${eventId}`}
          className="inline-flex items-center gap-2 mb-6 hover:opacity-70 transition-opacity"
        >
          <ArrowLeft className="w-4 h-4 text-[#867bba]" strokeWidth={1.5} />
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px", color: "#867bba" }}>
            Kembali ke detail acara
          </span>
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <Users className="w-5 h-5 text-[#6B0F1A]" strokeWidth={1.5} />
          <h1 style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "24px", letterSpacing: "-0.02em", color: "#e8eeff" }}>
            Live Seating Chart
          </h1>
        </div>
        <p style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px", color: "#867bba" }}>
          {eventData.name} — Lihat secara real-time kursi mana yang sudah terisi oleh tamu Anda.
        </p>
      </motion.div>

      <div className="mt-8 p-6 rounded-xl" style={{ background: "#111111", border: "1px solid #333333" }}>
        {eventData.venueLayoutConfig ? (
          <VenueVisualizer
            config={eventData.venueLayoutConfig}
            occupiedSeats={occupiedSeats}
            mode="view"
          />
        ) : (
          <div className="py-12 text-center text-[#867bba]" style={{ fontFamily: "var(--font-body)" }}>
            Belum ada denah venue yang diatur. Silakan atur di menu Venue Builder.
          </div>
        )}
      </div>
    </div>
  );
}
