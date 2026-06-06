"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Loader2, Ticket, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import VenueVisualizer from "@/components/VenueVisualizer";

export default function GuestRSVPPage() {
  const { guestId } = useParams<{ guestId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Selection
  const [selectedSeat, setSelectedSeat] = useState<{ tableId: string; seatNumber: number } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchRSVPData = useCallback(async () => {
    try {
      const res = await fetch(`/api/rsvp/${guestId}`);
      if (res.ok) {
        const guestData = await res.json();
        setData(guestData);
        if (guestData.tableNumber && guestData.seatNumber) {
          setSelectedSeat({
            tableId: guestData.tableNumber,
            seatNumber: parseInt(guestData.seatNumber)
          });
        }
      } else {
        setError("Tamu tidak ditemukan.");
      }
    } catch {
      setError("Gagal memuat data.");
    } finally {
      setLoading(false);
    }
  }, [guestId]);

  useEffect(() => {
    fetchRSVPData();
  }, [fetchRSVPData]);

  const handleConfirmSeat = async () => {
    if (!selectedSeat) return;
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch(`/api/rsvp/${guestId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber: selectedSeat.tableId,
          seatNumber: selectedSeat.seatNumber
        })
      });

      if (res.ok) {
        setSuccess(true);
        await fetchRSVPData();
      } else {
        const err = await res.json();
        setError(err.error || "Gagal menyimpan kursi.");
      }
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b1022] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#b3c2ff] animate-spin" />
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-[#0b1022] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#111111] border border-[#333333] rounded-[2rem] p-8 text-center shadow-xl">
          <AlertCircle className="w-12 h-12 text-[#ff6b7a] mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-[#e8eeff] mb-2" style={{ fontFamily: "var(--font-body)" }}>Kesalahan</h2>
          <p className="text-[#867bba]" style={{ fontFamily: "var(--font-body)" }}>{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { event } = data;
  
  // EO sets preset if both table and seat are populated
  const isPreset = data.tableNumber && data.seatNumber;
  // Guest can select a seat if it's not preset, overriding the general event seating mode.
  const canSelectSeat = !isPreset;
  const isSelfSelect = canSelectSeat; // Maintain backward compatibility with the variable name
  
  const occupiedSeats = event.guests
    .filter((g: any) => g.seatNumber && g.tableNumber)
    .map((g: any) => ({
      tableId: g.tableNumber,
      seatNumber: parseInt(g.seatNumber),
      guestName: `${g.firstName} ${g.lastName || ""}`.trim()
    }))
    .filter((g: any) => !isNaN(g.seatNumber));

  return (
    <div className="min-h-screen bg-[#0b1022] text-white flex flex-col items-center py-10 px-4 sm:px-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl"
      >
        <div className="text-center mb-10">
          <h4 className="text-[#867bba] font-bold tracking-widest text-xs uppercase mb-3" style={{ fontFamily: "var(--font-body)" }}>
            RSVP Kehadiran
          </h4>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 text-[#e8eeff]" style={{ fontFamily: "var(--font-body)" }}>
            {event.name}
          </h1>
          <p className="text-[#b3c2ff] mt-2" style={{ fontFamily: "var(--font-body)", fontSize: "14px" }}>
            Halo {data.firstName}, silakan konfirmasi tempat duduk Anda.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#6B0F1A]/10 border border-[#8B1F2A] rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-[#ff6b7a] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-[#ffb3b8]" style={{ fontFamily: "var(--font-body)" }}>{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-300" style={{ fontFamily: "var(--font-body)" }}>Kursi Anda berhasil dikonfirmasi! Sampai jumpa di acara.</p>
          </div>
        )}

        <div className="bg-[#111111] border border-[#333333] rounded-[2rem] p-6 sm:p-10 shadow-2xl overflow-hidden mb-8">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left: Info */}
            <div className="flex-1">
              <h2 className="text-[#e8eeff] text-lg font-semibold mb-6" style={{ fontFamily: "var(--font-body)" }}>
                Detail Undangan
              </h2>
              <div className="space-y-4">
                <div className="p-4 bg-[#1A1A1A] border border-[#333333] rounded-xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#111111] border border-[#333333] flex items-center justify-center flex-shrink-0">
                    <Ticket className="w-5 h-5 text-[#867bba]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#867bba] uppercase tracking-wider mb-0.5" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
                      KODE TIKET
                    </p>
                    <p className="text-[#e8eeff] font-mono text-sm">{data.qrTicket}</p>
                  </div>
                </div>

                <div className="p-4 bg-[#1A1A1A] border border-[#333333] rounded-xl flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#111111] border border-[#333333] flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-[#867bba]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#867bba] uppercase tracking-wider mb-0.5" style={{ fontFamily: "var(--font-body)", fontWeight: 500 }}>
                      STATUS TEMPAT DUDUK
                    </p>
                    {data.tableNumber && data.seatNumber ? (
                      <p className="text-[#4ade80] font-medium" style={{ fontFamily: "var(--font-body)", fontSize: "14px" }}>
                        Meja {data.tableNumber}, Kursi {data.seatNumber}
                      </p>
                    ) : data.tableNumber ? (
                      <p className="text-[#ffb3b8] font-medium" style={{ fontFamily: "var(--font-body)", fontSize: "14px" }}>
                        Diwajibkan di Meja {data.tableNumber} (Belum Pilih Kursi)
                      </p>
                    ) : (
                      <p className="text-[#ffb3b8] font-medium" style={{ fontFamily: "var(--font-body)", fontSize: "14px" }}>
                        Belum Memilih
                      </p>
                    )}
                  </div>
                </div>

                {isSelfSelect && (
                  <div className="mt-8 pt-8 border-t border-[#333333]">
                    <h3 className="text-[#e8eeff] font-medium mb-2" style={{ fontFamily: "var(--font-body)", fontSize: "15px" }}>
                      Pilih Kursi Anda
                    </h3>
                    <p className="text-[#867bba] text-sm mb-6" style={{ fontFamily: "var(--font-body)" }}>
                      Acara ini memungkinkan tamu untuk memilih kursi sendiri (Cinema-style). 
                      Pilih kursi yang tersedia pada denah di samping.
                    </p>

                    <button
                      disabled={!selectedSeat || submitting || (data.tableNumber === selectedSeat?.tableId && parseInt(data.seatNumber) === selectedSeat?.seatNumber)}
                      onClick={handleConfirmSeat}
                      className="w-full py-3.5 rounded-xl text-white font-semibold transition-all disabled:opacity-50"
                      style={{ background: "#6B0F1A", border: "1px solid #8B1F2A", fontFamily: "var(--font-body)" }}
                    >
                      {submitting ? (
                        <Loader2 className="w-5 h-5 mx-auto animate-spin" />
                      ) : selectedSeat ? (
                        `Konfirmasi (Meja ${selectedSeat.tableId}, Kursi ${selectedSeat.seatNumber})`
                      ) : (
                        "Pilih Kursi Dahulu"
                      )}
                    </button>
                  </div>
                )}
                
                {!isSelfSelect && (
                  <div className="mt-8 pt-8 border-t border-[#333333]">
                    <p className="text-[#867bba] text-sm" style={{ fontFamily: "var(--font-body)" }}>
                      Tempat duduk untuk acara ini diatur oleh pihak penyelenggara. Jika Anda belum mendapatkan nomor kursi, kursi Anda akan diinformasikan pada saat hari-H.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Map */}
            <div className="flex-1 flex flex-col">
              <h2 className="text-[#e8eeff] text-lg font-semibold mb-6 text-center md:text-left" style={{ fontFamily: "var(--font-body)" }}>
                Denah Venue
              </h2>
              {event.venueLayoutConfig ? (
                <div className="flex-1 flex items-center justify-center bg-[#1A1A1A] rounded-xl border border-[#333333] p-4 overflow-x-auto relative">
                  <VenueVisualizer
                    config={event.venueLayoutConfig}
                    occupiedSeats={occupiedSeats}
                    mode={isSelfSelect ? "select" : "view"}
                    selectedSeat={selectedSeat}
                    onSelectSeat={(tableId, seatNumber) => setSelectedSeat({ tableId, seatNumber })}
                    allowedTableId={data.tableNumber || undefined}
                  />
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center bg-[#1A1A1A] rounded-xl border border-[#333333] p-8 text-center">
                  <p className="text-[#867bba] text-sm" style={{ fontFamily: "var(--font-body)" }}>
                    Denah belum diatur oleh penyelenggara.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
