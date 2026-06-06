"use client";

import { useEffect, useState, useCallback } from "react";
import { useOrganizer } from "@/lib/useOrganizer";
import { BookOpen, Download, Search, X, Banknote, Gift } from "lucide-react";
import { motion } from "motion/react";
import { useLanguage } from "@/components/LanguageProvider";

interface AngpaoEntry {
  id: string;
  guestName: string;
  eventName: string;
  eventId: string;
  amount: number | null;
  gift: string | null;
  fromName: string | null;
  createdAt: string;
}

interface LedgerData {
  entries: AngpaoEntry[];
  totalCash: number;
  totalGifts: number;
  totalEntries: number;
}

function formatIDR(val: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val);
}

export default function AngpaoLedgerPage() {
  const { organizer, isLoaded } = useOrganizer();
  const { t } = useLanguage();
  const [data, setData] = useState<LedgerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [eventFilter, setEventFilter] = useState("");

  const fetchLedger = useCallback(async () => {
    try {
      const res = await fetch("/api/angpao-ledger");
      if (res.ok) setData(await res.json());
    } catch {
      /* */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (organizer) fetchLedger();
  }, [organizer, fetchLedger]);

  if (!isLoaded || !organizer) return null;

  const entries = data?.entries ?? [];

  // Unique events for filter
  const eventNames = [...new Set(entries.map((e) => e.eventName))];

  // Filtered entries
  const filtered = entries.filter((e) => {
    const matchesQuery = query.trim()
      ? e.guestName.toLowerCase().includes(query.toLowerCase()) ||
        (e.fromName ?? "").toLowerCase().includes(query.toLowerCase())
      : true;
    const matchesEvent = eventFilter ? e.eventName === eventFilter : true;
    return matchesQuery && matchesEvent;
  });

  const filteredTotal = filtered.reduce((sum, e) => sum + (e.amount || 0), 0);
  const filteredGifts = filtered.filter((e) => e.gift).length;

  const handleExportCSV = () => {
    const header = [
      t("angpao.col.guest"),
      t("angpao.col.from"),
      t("angpao.col.event"),
      t("angpao.col.cash"),
      t("angpao.col.gift"),
      t("angpao.col.date"),
    ].join(",");
    const rows = filtered
      .map((e) =>
        [
          `"${e.guestName}"`,
          `"${e.fromName || "-"}"`,
          `"${e.eventName}"`,
          e.amount ?? 0,
          `"${e.gift || "-"}"`,
          `"${new Date(e.createdAt).toLocaleString("id-ID")}"`,
        ].join(",")
      )
      .join("\n");
    const csv = `${header}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "buku_angpao.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl px-6 lg:px-10 py-8 lg:py-12 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p
          className="text-dash-text-muted"
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 400,
            fontSize: "13px",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
          }}
        >
          {t("nav.angpao")}
        </p>
        <h1
          className="mt-2 text-dash-text"
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 700,
            fontSize: "28px",
            letterSpacing: "-0.03em",
            lineHeight: 1.15,
          }}
        >
          {t("angpao.title")}
        </h1>
        <p
          className="mt-2 text-dash-text-muted"
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 400,
            fontSize: "14px",
          }}
        >
          {t("angpao.desc")}
        </p>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8">
        {[
          {
            label: t("angpao.totalCash"),
            value: formatIDR(data?.totalCash ?? 0),
            icon: Banknote,
          },
          {
            label: t("angpao.totalGifts"),
            value: (data?.totalGifts ?? 0).toString(),
            icon: Gift,
          },
          {
            label: t("angpao.totalEntries"),
            value: (data?.totalEntries ?? 0).toString(),
            icon: BookOpen,
          },
          {
            label: t("angpao.showing"),
            value: `${filtered.length}`,
            icon: Search,
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 * i }}
            className="p-5 rounded-xl bg-dash-surface-alt border border-dash-border"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon
                className="w-4 h-4 text-dash-text-muted"
                strokeWidth={1.5}
              />
              <span
                className="text-dash-text-muted"
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 500,
                  fontSize: "11px",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                {stat.label}
              </span>
            </div>
            <div
              className="text-dash-text"
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 700,
                fontSize: "20px",
                letterSpacing: "-0.02em",
              }}
            >
              {stat.value}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters + Export */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-dash-surface-alt border border-dash-border flex-1 focus-within:border-[#867bba] transition-colors">
          <Search
            className="w-4 h-4 flex-shrink-0 text-dash-text-muted"
            strokeWidth={1.5}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("angpao.search")}
            className="flex-1 bg-transparent outline-none text-dash-text placeholder-[#867bba]"
            style={{ fontFamily: "var(--font-body)", fontSize: "13px" }}
          />
          {query && (
            <button onClick={() => setQuery("")}>
              <X
                className="w-4 h-4 text-dash-text-muted hover:text-dash-text transition-colors"
                strokeWidth={1.5}
              />
            </button>
          )}
        </div>

        {eventNames.length > 1 && (
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg bg-dash-surface-alt border border-dash-border text-dash-text outline-none"
            style={{ fontFamily: "var(--font-body)", fontSize: "13px" }}
          >
            <option value="">{t("angpao.col.event")}</option>
            {eventNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors bg-dash-surface-alt hover:bg-dash-surface-hover border border-dash-border text-dash-text"
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            fontSize: "12px",
          }}
        >
          <Download className="w-4 h-4" strokeWidth={1.5} /> {t("angpao.export")}
        </button>
      </div>

      {/* Ledger table */}
      <div className="mt-6 rounded-xl overflow-hidden border border-dash-border bg-dash-surface-alt">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="bg-dash-surface-alt border-b border-dash-border">
                {[
                  t("angpao.col.guest"),
                  t("angpao.col.from"),
                  t("angpao.col.event"),
                  t("angpao.col.cash"),
                  t("angpao.col.gift"),
                  t("angpao.col.date"),
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-4 text-dash-text-muted"
                    style={{
                      fontFamily: "var(--font-body)",
                      fontWeight: 500,
                      fontSize: "11px",
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry, idx) => (
                <tr
                  key={entry.id}
                  className="bg-dash-surface-alt transition-colors hover:bg-dash-surface-hover/50"
                  style={{
                    borderBottom:
                      idx < filtered.length - 1
                        ? "1px solid #333333"
                        : "none",
                  }}
                >
                  <td className="px-5 py-4">
                    <span
                      className="text-dash-text"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 500,
                        fontSize: "13px",
                      }}
                    >
                      {entry.guestName}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="text-dash-text-muted"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 400,
                        fontSize: "13px",
                      }}
                    >
                      {entry.fromName || "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="text-dash-text-muted"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 400,
                        fontSize: "13px",
                      }}
                    >
                      {entry.eventName}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="text-dash-text"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 600,
                        fontSize: "13px",
                      }}
                    >
                      {entry.amount ? formatIDR(entry.amount) : "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="text-dash-text-muted"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 400,
                        fontSize: "13px",
                      }}
                    >
                      {entry.gift || "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="text-dash-text-muted"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 400,
                        fontSize: "12px",
                      }}
                    >
                      {new Date(entry.createdAt).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-12 text-center bg-dash-surface-alt"
                  >
                    <span
                      className="text-dash-text-muted"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 400,
                        fontSize: "14px",
                      }}
                    >
                      {loading
                        ? "..."
                        : t("angpao.empty")}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr className="bg-dash-surface border-t border-dash-border">
                  <td
                    colSpan={3}
                    className="px-5 py-4 text-right"
                  >
                    <span
                      className="text-dash-text"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 600,
                        fontSize: "13px",
                      }}
                    >
                      {t("angpao.total")}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="text-dash-text"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 700,
                        fontSize: "14px",
                      }}
                    >
                      {formatIDR(filteredTotal)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="text-dash-text"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 600,
                        fontSize: "13px",
                      }}
                    >
                      {filteredGifts} {t("angpao.giftSuffix")}
                    </span>
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}
