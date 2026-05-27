"use client";

import { useEffect, useState, useCallback } from "react";
import { useOrganizer } from "@/lib/useOrganizer";
import { sendWhatsAppBlast } from "@/controllers/communicationController";
import { MessageCircle, Send, Check, X, AlertCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface EventOption {
  id: string;
  name: string;
  guestCount: number;
  checkedInCount: number;
}

interface BlastResult {
  guestId: string;
  guestName: string;
  status: "sent" | "failed" | "skipped";
  message?: string;
}

const DEFAULT_TEMPLATE = `Halo {guestName} 👋

Ini pengingat untuk acara *{eventName}* yang akan berlangsung pada:
📅 {eventDate}

🎟 Kode tiket QR kamu: {qrTicket}
👥 Jumlah undangan: {partySize} orang
📍 Meja/Kursi: {tableNumber}

Sampai jumpa di sana! 🎉`;

export default function WhatsAppBlastPage() {
  const { organizer, isLoaded } = useOrganizer();
  const [events, setEvents] = useState<EventOption[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [messageTemplate, setMessageTemplate] = useState(DEFAULT_TEMPLATE);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BlastResult[] | null>(null);
  const [summary, setSummary] = useState<{
    sent: number;
    failed: number;
    skipped: number;
    total: number;
  } | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(
          data.map((e: any) => ({
            id: e.id,
            name: e.name,
            guestCount: e.guests?.length || 0,
            checkedInCount:
              e.guests?.filter((g: any) => g.hasCheckedIn).length || 0,
          }))
        );
      }
    } catch {
      /* */
    }
  }, []);

  useEffect(() => {
    if (organizer) fetchEvents();
  }, [organizer, fetchEvents]);

  const selectedEvent = events.find((e) => e.id === selectedEventId);
  const pendingGuests = selectedEvent
    ? selectedEvent.guestCount - selectedEvent.checkedInCount
    : 0;

  const handleSendBlast = async () => {
    if (!selectedEventId || sending) return;
    setSending(true);
    setResults(null);
    setSummary(null);
    setProgress(10);

    try {
      // Simulate progress while server action runs
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 5, 90));
      }, 500);

      const response = await sendWhatsAppBlast(
        selectedEventId,
        messageTemplate
      );

      clearInterval(progressInterval);
      setProgress(100);

      setResults(response.results);
      setSummary({
        sent: response.sent,
        failed: response.failed,
        skipped: response.skipped,
        total: response.totalGuests,
      });

      showToast(
        `Blast complete! ${response.sent} sent, ${response.failed} failed, ${response.skipped} skipped.`,
        response.failed === 0
      );
    } catch (err: any) {
      showToast(err.message || "Failed to send blast", false);
    } finally {
      setSending(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  if (!isLoaded || !organizer) return null;

  return (
    <div className="max-w-5xl px-6 lg:px-10 py-8 lg:py-12">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-4 right-4 z-50 px-4 py-3 rounded-lg bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] dark:border-[#2a2660] text-[#3c58a7] dark:text-[#b3c2ff]"
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: "13px",
            }}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p
          className="text-[#3c58a7] dark:text-[#b3c2ff]"
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 400,
            fontSize: "13px",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          Guest Communication
        </p>
        <h1
          className="mt-2 text-[#0c123b] dark:text-[#e8eeff]"
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: "28px",
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
          }}
        >
          WhatsApp Blast
        </h1>
        <p
          className="mt-2 text-[#3c58a7] dark:text-[#b3c2ff]"
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 400,
            fontSize: "14px",
          }}
        >
          Send personalized reminders to all your guests via WhatsApp. Guests
          who&apos;ve already checked in will be skipped automatically.
        </p>
      </motion.div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left — Config */}
        <div className="flex flex-col gap-5">
          {/* Event selector */}
          <div className="p-5 rounded-xl bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] dark:border-[#2a2660]">
            <label
              className="block mb-2 text-[#3c58a7] dark:text-[#b3c2ff]"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                fontSize: "12px",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Select Event
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => {
                setSelectedEventId(e.target.value);
                setResults(null);
                setSummary(null);
              }}
              className="w-full px-4 py-3 rounded-lg outline-none bg-[#f1e5ed] dark:bg-[#18203c] border border-[#867bba] dark:border-[#2a2660] text-[#0c123b] dark:text-[#e8eeff]"
              style={{ fontFamily: "var(--font-body)", fontSize: "14px" }}
            >
              <option value="">— Choose an event —</option>
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.name} ({evt.guestCount} guests)
                </option>
              ))}
            </select>

            {selectedEvent && (
              <div className="mt-3 flex items-center gap-4">
                <span
                  className="text-[#3c58a7] dark:text-[#b3c2ff]"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 400,
                    fontSize: "12px",
                  }}
                >
                  📤 Will send to:{" "}
                  <strong className="text-[#0c123b] dark:text-[#e8eeff]">
                    {pendingGuests} guests
                  </strong>
                </span>
                <span
                  className="text-[#867bba]"
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 400,
                    fontSize: "11px",
                  }}
                >
                  ({selectedEvent.checkedInCount} already checked in — skipped)
                </span>
              </div>
            )}
          </div>

          {/* Message template */}
          <div className="p-5 rounded-xl bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] dark:border-[#2a2660]">
            <label
              className="block mb-2 text-[#3c58a7] dark:text-[#b3c2ff]"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                fontSize: "12px",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              Message Template
            </label>
            <textarea
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              rows={10}
              className="w-full px-4 py-3 rounded-lg outline-none bg-[#f1e5ed] dark:bg-[#18203c] border border-[#867bba] dark:border-[#2a2660] text-[#0c123b] dark:text-[#e8eeff] resize-y"
              style={{
                fontFamily: "var(--font-body)",
                fontSize: "13px",
                lineHeight: 1.6,
              }}
            />
            <div className="mt-2 flex flex-wrap gap-1.5">
              {[
                "{guestName}",
                "{eventName}",
                "{eventDate}",
                "{qrTicket}",
                "{partySize}",
                "{tableNumber}",
              ].map((v) => (
                <span
                  key={v}
                  className="px-2 py-1 rounded bg-[#f1e5ed] dark:bg-[#18203c] border border-[#867bba] dark:border-[#2a2660] text-[#3c58a7] dark:text-[#b3c2ff]"
                  style={{
                    fontFamily: "monospace",
                    fontSize: "10px",
                    fontWeight: 500,
                  }}
                >
                  {v}
                </span>
              ))}
            </div>
          </div>

          {/* Send button */}
          <button
            onClick={handleSendBlast}
            disabled={!selectedEventId || sending || pendingGuests === 0}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg hover:bg-[#3c58a7] transition-colors disabled:opacity-40"
            style={{
              background: "#2d3895",
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: "14px",
              color: "#fbeed4",
            }}
          >
            {sending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending... {progress}%
              </>
            ) : (
              <>
                <Send className="w-4 h-4" strokeWidth={1.5} />
                Send WhatsApp Blast to {pendingGuests} Guests
              </>
            )}
          </button>

          {/* Progress bar */}
          {sending && (
            <div className="h-1.5 rounded-full overflow-hidden bg-[#f1e5ed] dark:bg-[#18203c]">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "#2d3895" }}
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}
        </div>

        {/* Right — Results */}
        <div className="flex flex-col gap-4">
          {summary && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-xl bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] dark:border-[#2a2660]"
            >
              <h3
                className="text-[#0c123b] dark:text-[#e8eeff] mb-3"
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  fontSize: "15px",
                }}
              >
                Blast Summary
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "Sent",
                    value: summary.sent,
                    color: "#2d3895",
                  },
                  {
                    label: "Failed",
                    value: summary.failed,
                    color: summary.failed > 0 ? "#dc2626" : "#867bba",
                  },
                  {
                    label: "Skipped",
                    value: summary.skipped,
                    color: "#867bba",
                  },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 700,
                        fontSize: "24px",
                        color: s.color,
                      }}
                    >
                      {s.value}
                    </div>
                    <span
                      className="text-[#3c58a7] dark:text-[#b3c2ff]"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 400,
                        fontSize: "11px",
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {s.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {results && (
            <div className="rounded-xl overflow-hidden border border-[#867bba] dark:border-[#2a2660]">
              <div className="max-h-[400px] overflow-y-auto">
                {results.map((r, idx) => (
                  <div
                    key={r.guestId}
                    className="flex items-center justify-between px-4 py-2.5 bg-[#fbeed4] dark:bg-[#111a34] transition-colors hover:bg-[#f1e5ed] dark:hover:bg-[#18203c]"
                    style={{
                      borderBottom:
                        idx < results.length - 1
                          ? "1px solid #f1e5ed"
                          : "none",
                    }}
                  >
                    <span
                      className="text-[#0c123b] dark:text-[#e8eeff]"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 500,
                        fontSize: "12px",
                      }}
                    >
                      {r.guestName}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {r.status === "sent" && (
                        <Check
                          className="w-3.5 h-3.5 text-[#2d3895]"
                          strokeWidth={2}
                        />
                      )}
                      {r.status === "failed" && (
                        <AlertCircle
                          className="w-3.5 h-3.5 text-red-500"
                          strokeWidth={2}
                        />
                      )}
                      {r.status === "skipped" && (
                        <X
                          className="w-3.5 h-3.5 text-[#867bba]"
                          strokeWidth={2}
                        />
                      )}
                      <span
                        className={
                          r.status === "sent"
                            ? "text-[#2d3895]"
                            : r.status === "failed"
                            ? "text-red-500"
                            : "text-[#867bba]"
                        }
                        style={{
                          fontFamily: "var(--font-body)",
                          fontWeight: 500,
                          fontSize: "10px",
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                        }}
                      >
                        {r.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {!results && !sending && (
            <div className="p-8 rounded-xl bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] dark:border-[#2a2660] text-center">
              <MessageCircle
                className="w-10 h-10 text-[#867bba] mx-auto mb-3"
                strokeWidth={1}
              />
              <p
                className="text-[#3c58a7] dark:text-[#b3c2ff]"
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                  fontSize: "13px",
                }}
              >
                Select an event and click &quot;Send Blast&quot; to send
                reminders to all guests who haven&apos;t checked in yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
