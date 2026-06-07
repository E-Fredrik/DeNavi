"use client";

import { useEffect, useState, useCallback } from "react";
import { useOrganizer } from "@/lib/useOrganizer";
import { sendWhatsAppBlast } from "@/controllers/communicationController";
import { MessageCircle, Send, Check, X, AlertCircle, Loader2, Eye, Filter, TestTube, Smartphone } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface EventOption {
  id: string;
  name: string;
  guestCount: number;
  checkedInCount: number;
  unRsvpdCount: number;
}

interface BlastResult {
  guestId: string;
  guestName: string;
  status: "sent" | "failed" | "skipped";
  message?: string;
}

type FilterMode = "all" | "not-checked-in" | "not-rsvp";

const DEFAULT_TEMPLATE = `Halo {{guest_name}} 👋

Ini pengingat untuk acara *{{event_name}}* yang akan berlangsung pada:
📅 {{event_date}}

🎟 Kode tiket QR kamu: {{qr_link}}
👥 Jumlah undangan: {{party_size}} orang
📍 Meja/Kursi: {{table_number}}

Sampai jumpa di sana! 🎉`;

const SMART_TAGS = [
  { tag: "{{guest_name}}", desc: "Nama lengkap tamu" },
  { tag: "{{first_name}}", desc: "Nama depan" },
  { tag: "{{event_name}}", desc: "Nama acara" },
  { tag: "{{event_date}}", desc: "Tanggal acara" },
  { tag: "{{qr_link}}", desc: "Link QR Code" },
  { tag: "{{party_size}}", desc: "Jumlah tamu" },
  { tag: "{{table_number}}", desc: "Nomor meja" },
];

export default function WhatsAppBlastPage() {
  const { organizer, isLoaded } = useOrganizer();
  const [events, setEvents] = useState<EventOption[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [messageTemplate, setMessageTemplate] = useState(DEFAULT_TEMPLATE);
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<BlastResult[] | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>("not-checked-in");
  const [showPreview, setShowPreview] = useState(true);
  const [testPhone, setTestPhone] = useState("");
  const [sendingTest, setSendingTest] = useState(false);
  const [summary, setSummary] = useState<{
    sent: number;
    failed: number;
    skipped: number;
    total: number;
  } | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 4000);
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
            checkedInCount: e.guests?.filter((g: any) => g.hasCheckedIn).length || 0,
            unRsvpdCount: 0, // RSVP feature not yet implemented in schema
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
  
  const getTargetCount = () => {
    if (!selectedEvent) return 0;
    if (filterMode === "all") return selectedEvent.guestCount;
    if (filterMode === "not-checked-in") return selectedEvent.guestCount - selectedEvent.checkedInCount;
    if (filterMode === "not-rsvp") return selectedEvent.unRsvpdCount;
    return 0;
  };

  const targetCount = getTargetCount();

  const generatePreview = () => {
    if (!selectedEvent) return "";
    return messageTemplate
      .replace(/\{\{guest_name\}\}/g, "John Doe")
      .replace(/\{\{first_name\}\}/g, "John")
      .replace(/\{\{event_name\}\}/g, selectedEvent.name)
      .replace(/\{\{event_date\}\}/g, "15 June 2026")
      .replace(/\{\{qr_link\}\}/g, "https://denavi.app/qr/abc123")
      .replace(/\{\{party_size\}\}/g, "2")
      .replace(/\{\{table_number\}\}/g, "A-5");
  };

  const insertTag = (tag: string) => {
    setMessageTemplate((prev) => prev + " " + tag);
  };

  const handleSendTest = async () => {
    if (!testPhone.trim()) {
      showToast("Masukkan nomor telepon untuk test", false);
      return;
    }
    setSendingTest(true);
    try {
      // Simulate test send (replace with actual API call)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      showToast(`Pesan test berhasil dikirim ke ${testPhone}`, true);
    } catch (err) {
      showToast("Gagal mengirim pesan test", false);
    } finally {
      setSendingTest(false);
    }
  };

  const handleSendBlast = async () => {
    if (!selectedEventId || sending || targetCount === 0) return;
    setSending(true);
    setResults(null);
    setSummary(null);
    setProgress(10);

    try {
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
        `Blast selesai! ${response.sent} terkirim, ${response.failed} gagal, ${response.skipped} dilewati.`,
        response.failed === 0
      );
    } catch (err: any) {
      showToast(err.message || "Gagal mengirim pesan massal", false);
    } finally {
      setSending(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };

  if (!isLoaded || !organizer) return null;

  return (
    <div className="max-w-7xl px-6 lg:px-10 py-8 lg:py-12 bg-dash-bg min-h-screen">
      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-6 right-6 z-50 px-6 py-4 rounded-xl shadow-2xl backdrop-blur-sm"
            style={{
              background: toast.ok ? "linear-gradient(135deg, #10b981 0%, #059669 100%)" : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
              fontFamily: "var(--font-body)",
              fontWeight: 600,
              fontSize: "14px",
              maxWidth: "400px",
            }}
          >
            <div className="flex items-center gap-3">
              {toast.ok ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              {toast.msg}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--dash-accent)] to-[var(--dash-accent-light)] flex items-center justify-center shadow-lg">
            <MessageCircle className="w-5 h-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <p className="text-dash-text-muted text-xs font-medium uppercase tracking-wider">
              Komunikasi Tamu
            </p>
            <h1 className="text-dash-text text-3xl font-bold tracking-tight">
              WhatsApp Blast
            </h1>
          </div>
        </div>
        <p className="mt-3 text-dash-text-sub text-sm leading-relaxed max-w-3xl">
          Kirim pengingat WhatsApp dengan template yang dapat disesuaikan. Gunakan smart tags untuk personalisasi otomatis dan preview real-time untuk melihat hasil akhir.
        </p>
      </motion.div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Left Column - Configuration */}
        <div className="lg:col-span-1 xl:col-span-2 space-y-6">
          
          {/* Event Selection Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-2xl dash-card border border-dash-border shadow-sm"
          >
            <label className="block mb-3 text-dash-text font-semibold text-sm tracking-wide uppercase">
              📅 Pilih Acara
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => {
                setSelectedEventId(e.target.value);
                setResults(null);
                setSummary(null);
              }}
              className="w-full px-4 py-3.5 rounded-xl outline-none bg-dash-bg border-2 border-dash-border text-dash-text font-medium transition-all focus:border-dash-accent-light focus:border-dash-accent-light focus:ring-4 focus:ring-[color-mix(in_srgb,var(--dash-accent)_20%,transparent)]"
              style={{ fontFamily: "var(--font-body)", fontSize: "15px" }}
            >
              <option value="">— Pilih acara —</option>
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.name} ({evt.guestCount} tamu)
                </option>
              ))}
            </select>

            {selectedEvent && (
              <div className="mt-4 p-4 rounded-xl bg-dash-bg border border-dash-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-dash-text-muted font-medium">Total Tamu</span>
                  <span className="text-dash-text font-bold">{selectedEvent.guestCount}</span>
                </div>
              </div>
            )}
          </motion.div>

          {/* Filter Mode */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="p-6 rounded-2xl dash-card border border-dash-border shadow-sm"
          >
            <label className="flex items-center gap-2 mb-3 text-dash-text font-semibold text-sm tracking-wide uppercase">
              <Filter className="w-4 h-4" />
              Filter Penerima
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "all", label: "Semua Tamu", icon: "👥" },
                { value: "not-checked-in", label: "Belum Check-in", icon: "🎫" },
                { value: "not-rsvp", label: "Belum RSVP", icon: "✉️" },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setFilterMode(filter.value as FilterMode)}
                  className={`p-4 rounded-xl font-medium text-sm transition-all border-2 ${
                    filterMode === filter.value
                      ? "bg-dash-accent border-dash-accent text-white shadow-lg scale-105"
                      : "bg-dash-bg border-dash-border text-dash-text-muted hover:border-dash-accent-light"
                  }`}
                >
                  <div className="text-2xl mb-1">{filter.icon}</div>
                  <div className="text-xs">{filter.label}</div>
                </button>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-dash-surface-alt border border-dash-border">
              <p className="text-dash-text-sub text-sm font-medium">
                📤 Akan dikirim ke: <strong>{targetCount} tamu</strong>
              </p>
            </div>
          </motion.div>

          {/* Message Template Editor */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-2xl dash-card border border-dash-border shadow-sm"
          >
            <label className="block mb-3 text-dash-text font-semibold text-sm tracking-wide uppercase">
              ✍️ Template Pesan
            </label>
            <textarea
              value={messageTemplate}
              onChange={(e) => setMessageTemplate(e.target.value)}
              rows={10}
              placeholder="Tulis pesan kamu di sini..."
              className="w-full px-4 py-3 rounded-xl outline-none bg-dash-bg border-2 border-dash-border text-dash-text resize-y font-mono text-sm leading-relaxed transition-all focus:border-dash-accent-light focus:border-dash-accent-light focus:ring-4 focus:ring-[color-mix(in_srgb,var(--dash-accent)_20%,transparent)]"
            />
            
            {/* Smart Tags */}
            <div className="mt-4">
              <p className="text-xs text-dash-text-muted font-medium mb-2 uppercase tracking-wide">Smart Tags (Klik untuk insert)</p>
              <div className="flex flex-wrap gap-2">
                {SMART_TAGS.map((tag) => (
                  <button
                    key={tag.tag}
                    onClick={() => insertTag(tag.tag)}
                    className="px-3 py-1.5 rounded-lg bg-dash-bg border border-dash-border text-dash-accent-light hover:bg-dash-surface-hover/30 font-mono text-xs font-semibold transition-all shadow-sm hover:shadow"
                    title={tag.desc}
                  >
                    {tag.tag}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Test Message Section */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border border-amber-200 dark:border-amber-900/50"
          >
            <label className="flex items-center gap-2 mb-3 text-amber-900 dark:text-amber-300 font-semibold text-sm tracking-wide uppercase">
              <TestTube className="w-4 h-4" />
              Kirim Pesan Test
            </label>
            <div className="flex gap-3">
              <input
                type="tel"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="+62812345678"
                className="flex-1 px-4 py-3 rounded-xl outline-none bg-dash-bg border-2 border-amber-200 dark:border-amber-900 text-dash-text font-medium focus:border-amber-500 focus:ring-4 focus:ring-amber-100 dark:focus:ring-amber-900/30"
              />
              <button
                onClick={handleSendTest}
                disabled={sendingTest || !testPhone.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {sendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {sendingTest ? "Mengirim..." : "Test"}
              </button>
            </div>
            <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
              Kirim pesan preview ke nomor telepon kamu sebelum melakukan blast massal.
            </p>
          </motion.div>

          {/* Send Blast Button */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onClick={handleSendBlast}
            disabled={!selectedEventId || sending || targetCount === 0}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-gradient-to-r from-[var(--dash-accent)] to-[var(--dash-accent-light)] text-white font-bold text-lg shadow-2xl hover:shadow-3xl transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
          >
            {sending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Mengirim... {progress}%
              </>
            ) : (
              <>
                <Send className="w-5 h-5" strokeWidth={2} />
                Kirim Blast ke {targetCount} Tamu
              </>
            )}
          </motion.button>

          {/* Progress Bar */}
          {sending && (
            <div className="h-2 rounded-full overflow-hidden bg-dash-surface-alt">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[var(--dash-accent)] to-[var(--dash-accent-light)]"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}
        </div>

        {/* Right Column - Preview & Results */}
        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          
          {/* Live Preview */}
          {showPreview && selectedEvent && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="p-4 sm:p-6 rounded-2xl dash-card border border-dash-border shadow-lg"
            >
              <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-2 text-dash-text font-semibold text-sm tracking-wide uppercase">
                  <Eye className="w-4 h-4" />
                  Live Preview
                </label>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="text-xs text-dash-text-muted hover:text-dash-text transition-colors"
                >
                  Sembunyikan
                </button>
              </div>
              
              {/* WhatsApp Chat Bubble Mockup */}
              <div className="relative max-w-sm mx-auto lg:max-w-full">
                <div className="absolute top-0 left-0 right-0 h-14 sm:h-16 bg-gradient-to-br from-green-600 to-green-700 rounded-t-2xl flex items-center px-3 sm:px-4 gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                    <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-white font-semibold text-xs sm:text-sm truncate">DeNavi Bot</p>
                    <p className="text-green-100 text-[10px] sm:text-xs">Online</p>
                  </div>
                </div>
                <div className="pt-16 sm:pt-20 pb-3 sm:pb-4 px-3 sm:px-4 bg-[#ece5dd] dark:bg-[#0b0b0b] rounded-2xl min-h-[280px] sm:min-h-[300px]">
                  <div className="bg-dash-surface rounded-2xl rounded-tl-none p-3 sm:p-4 shadow-md max-w-[90%] sm:max-w-[85%]">
                    <pre className="whitespace-pre-wrap text-xs sm:text-sm text-dash-text font-sans leading-relaxed overflow-hidden">
                      {generatePreview()}
                    </pre>
                    <p className="text-[9px] sm:text-[10px] text-dash-text-muted mt-2 text-right">
                      {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Summary */}
          {summary && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-900/50 shadow-lg"
            >
              <h3 className="text-green-900 dark:text-green-300 font-bold text-lg mb-4 flex items-center gap-2">
                <Check className="w-5 h-5" />
                Ringkasan Blast
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Terkirim", value: summary.sent, color: "text-green-600 dark:text-green-400", bg: "bg-green-100 dark:bg-green-900/30" },
                  { label: "Gagal", value: summary.failed, color: summary.failed > 0 ? "text-red-600 dark:text-red-400" : "text-dash-text-muted", bg: summary.failed > 0 ? "bg-red-100 dark:bg-red-900/30" : "bg-dash-surface-alt" },
                  { label: "Dilewati", value: summary.skipped, color: "text-dash-text-muted", bg: "bg-dash-surface-alt" },
                ].map((s) => (
                  <div key={s.label} className={`p-4 rounded-xl text-center ${s.bg}`}>
                    <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                    <span className="text-xs text-dash-text-muted font-medium uppercase tracking-wide">{s.label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Detailed Results */}
          {results && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl overflow-hidden border border-dash-border bg-dash-surface shadow-lg"
            >
              <div className="p-4 bg-dash-surface-alt border-b border-dash-border">
                <h3 className="text-dash-text font-bold text-sm uppercase tracking-wide">Detail Pengiriman</h3>
              </div>
              <div className="max-h-[400px] overflow-y-auto">
                {results.map((r, idx) => (
                  <div
                    key={r.guestId}
                    className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-dash-surface-hover border-b border-dash-border last:border-0"
                  >
                    <span className="text-dash-text font-medium text-sm">{r.guestName}</span>
                    <div className="flex items-center gap-2">
                      {r.status === "sent" && <Check className="w-4 h-4 text-green-500" strokeWidth={2.5} />}
                      {r.status === "failed" && <AlertCircle className="w-4 h-4 text-red-500" strokeWidth={2.5} />}
                      {r.status === "skipped" && <X className="w-4 h-4 text-dash-text-muted" strokeWidth={2.5} />}
                      <span className={`text-xs font-bold uppercase tracking-wide ${r.status === "sent" ? "text-green-600 dark:text-green-400" : r.status === "failed" ? "text-red-600 dark:text-red-400" : "text-dash-text-muted"}`}>
                        {r.status === "sent" ? "Terkirim" : r.status === "failed" ? "Gagal" : "Dilewati"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Empty State */}
          {!results && !sending && (
            <div className="p-12 rounded-2xl bg-dash-surface-alt border border-dash-border text-center">
              <MessageCircle className="w-16 h-16 text-dash-text-muted mx-auto mb-4" strokeWidth={1} />
              <p className="text-dash-text-muted text-sm">
                Hasil pengiriman akan muncul di sini setelah blast selesai.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
