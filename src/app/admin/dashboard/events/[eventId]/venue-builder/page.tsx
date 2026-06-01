"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LayoutTemplate } from "lucide-react";
import VenueBuilder from "@/components/VenueBuilder";
import { motion } from "motion/react";

export default function VenueBuilderPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const [eventName, setEventName] = useState("");
  const [layoutConfig, setLayoutConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const fetchLayout = useCallback(async () => {
    if (!eventId) return;
    try {
      const res = await fetch(`/api/events/${eventId}/venue-layout`);
      if (res.ok) {
        const data = await res.json();
        setEventName(data.name);
        setLayoutConfig(data.venueLayoutConfig);
      }
    } catch {
      /* */
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchLayout();
  }, [fetchLayout]);

  const handleSave = async (config: any) => {
    if (!eventId) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/events/${eventId}/venue-layout`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venueLayoutConfig: config }),
      });
      if (res.ok) {
        setToast("Layout berhasil disimpan!");
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast("Gagal menyimpan layout");
        setTimeout(() => setToast(null), 3000);
      }
    } catch {
      setToast("Terjadi kesalahan jaringan");
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl px-6 lg:px-10 py-12">
        <p style={{ fontFamily: "var(--font-body)", fontSize: "14px", color: "#867bba" }}>
          Memuat...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl px-6 lg:px-10 py-8 lg:py-12">
      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg"
          style={{
            background: "#1A1A1A",
            border: "1px solid #333333",
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            fontSize: "13px",
            color: "#e8eeff",
          }}
        >
          {toast}
        </motion.div>
      )}

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
          <LayoutTemplate className="w-5 h-5 text-[#6B0F1A]" strokeWidth={1.5} />
          <h1 style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "24px", letterSpacing: "-0.02em", color: "#e8eeff" }}>
            Atur Denah Venue
          </h1>
        </div>
        <p style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "13px", color: "#867bba" }}>
          {eventName} — Tambahkan meja, atur posisi, lalu simpan. Denah ini bisa digunakan tamu untuk pilih kursi sendiri.
        </p>
      </motion.div>

      <div className="mt-8 p-6 rounded-xl" style={{ background: "#111111", border: "1px solid #333333" }}>
        <VenueBuilder
          initialConfig={layoutConfig}
          onSave={handleSave}
          saving={saving}
        />
      </div>
    </div>
  );
}
