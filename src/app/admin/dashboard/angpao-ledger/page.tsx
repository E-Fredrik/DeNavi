"use client";

import { useEffect, useState, useCallback } from "react";
import { useOrganizer } from "@/lib/useOrganizer";
import { BookOpen, Download, Search, X, Banknote, Gift } from "lucide-react";
import { motion } from "motion/react";

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
      "Guest",
      "From",
      "Event",
      "Amount (Rp)",
      "Gift",
      "Date",
    ].join(",");
    const rows = filtered
      .map((e) =>
        [
          `"${e.guestName}"`,
          `"${e.fromName || "-"}"`,
          `"${e.eventName}"`,
          e.amount ?? 0,
          `"${e.gift || "-"}"`,
          `"${new Date(e.createdAt).toLocaleString()}"`,
        ].join(",")
      )
      .join("\n");
    const csv = `${header}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "angpao_ledger.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl px-6 lg:px-10 py-8 lg:py-12">
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
          Financial Tracking
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
          Angpao & Gift Ledger
        </h1>
        <p
          className="mt-2 text-[#3c58a7] dark:text-[#b3c2ff]"
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 400,
            fontSize: "14px",
          }}
        >
          Every angpao and gift received across all your events — fully detailed
          for accountability and dispute prevention.
        </p>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8">
        {[
          {
            label: "Total Cash Received",
            value: formatIDR(data?.totalCash ?? 0),
            icon: Banknote,
          },
          {
            label: "Physical Gifts",
            value: (data?.totalGifts ?? 0).toString(),
            icon: Gift,
          },
          {
            label: "Total Records",
            value: (data?.totalEntries ?? 0).toString(),
            icon: BookOpen,
          },
          {
            label: "Showing",
            value: `${filtered.length} entries`,
            icon: Search,
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 * i }}
            className="p-5 rounded-xl bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] dark:border-[#2a2660]"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon
                className="w-4 h-4 text-[#867bba]"
                strokeWidth={1.5}
              />
              <span
                className="text-[#3c58a7] dark:text-[#b3c2ff]"
                style={{
                  fontFamily: "var(--font-body)",
                  fontWeight: 400,
                  fontSize: "11px",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                }}
              >
                {stat.label}
              </span>
            </div>
            <div
              className="text-[#0c123b] dark:text-[#e8eeff]"
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
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] dark:border-[#2a2660] flex-1">
          <Search
            className="w-4 h-4 flex-shrink-0 text-[#867bba]"
            strokeWidth={1.5}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by guest name or sender..."
            className="flex-1 bg-transparent outline-none text-[#0c123b] dark:text-[#e8eeff]"
            style={{ fontFamily: "var(--font-body)", fontSize: "13px" }}
          />
          {query && (
            <button onClick={() => setQuery("")}>
              <X
                className="w-3.5 h-3.5 text-[#3c58a7] dark:text-[#b3c2ff]"
                strokeWidth={1.5}
              />
            </button>
          )}
        </div>

        {eventNames.length > 1 && (
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value)}
            className="px-4 py-2.5 rounded-lg bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] dark:border-[#2a2660] text-[#0c123b] dark:text-[#e8eeff] outline-none"
            style={{ fontFamily: "var(--font-body)", fontSize: "13px" }}
          >
            <option value="">All Events</option>
            {eventNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        )}

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg transition-colors hover:bg-[#f1e5ed] dark:hover:bg-[#18203c] bg-[#fbeed4] dark:bg-[#111a34] border border-[#867bba] dark:border-[#2a2660] text-[#3c58a7] dark:text-[#b3c2ff]"
          style={{
            fontFamily: "var(--font-body)",
            fontWeight: 500,
            fontSize: "12px",
          }}
        >
          <Download className="w-3.5 h-3.5" strokeWidth={1.5} /> Export CSV
        </button>
      </div>

      {/* Ledger table */}
      <div className="mt-4 rounded-xl overflow-hidden border border-[#867bba] dark:border-[#2a2660]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="bg-[#fbeed4] dark:bg-[#111a34] border-b border-[#867bba] dark:border-[#2a2660]">
                {[
                  "Guest",
                  "From",
                  "Event",
                  "Amount",
                  "Gift",
                  "Date",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-[#3c58a7] dark:text-[#b3c2ff]"
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
                  className="bg-[#fbeed4] dark:bg-[#111a34] transition-colors hover:bg-[#f1e5ed] dark:hover:bg-[#18203c]"
                  style={{
                    borderBottom:
                      idx < filtered.length - 1
                        ? "1px solid #f1e5ed"
                        : "none",
                  }}
                >
                  <td className="px-4 py-3">
                    <span
                      className="text-[#0c123b] dark:text-[#e8eeff]"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 500,
                        fontSize: "13px",
                      }}
                    >
                      {entry.guestName}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[#3c58a7] dark:text-[#b3c2ff]"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 400,
                        fontSize: "13px",
                      }}
                    >
                      {entry.fromName || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[#3c58a7] dark:text-[#b3c2ff]"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 400,
                        fontSize: "12px",
                      }}
                    >
                      {entry.eventName}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[#0c123b] dark:text-[#e8eeff]"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 600,
                        fontSize: "13px",
                      }}
                    >
                      {entry.amount ? formatIDR(entry.amount) : "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[#3c58a7] dark:text-[#b3c2ff]"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 400,
                        fontSize: "13px",
                      }}
                    >
                      {entry.gift || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[#867bba]"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 400,
                        fontSize: "11px",
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
                    className="px-5 py-12 text-center bg-[#fbeed4] dark:bg-[#111a34]"
                  >
                    <span
                      className="text-[#3c58a7] dark:text-[#b3c2ff]"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 400,
                        fontSize: "14px",
                      }}
                    >
                      {loading
                        ? "Loading ledger data..."
                        : "No angpao or gift records found."}
                    </span>
                  </td>
                </tr>
              )}
            </tbody>
            {filtered.length > 0 && (
              <tfoot>
                <tr className="bg-[#f1e5ed] dark:bg-[#18203c] border-t border-[#867bba] dark:border-[#2a2660]">
                  <td
                    colSpan={3}
                    className="px-4 py-3 text-right"
                  >
                    <span
                      className="text-[#0c123b] dark:text-[#e8eeff]"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 600,
                        fontSize: "13px",
                      }}
                    >
                      Totals
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[#0c123b] dark:text-[#e8eeff]"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 700,
                        fontSize: "14px",
                      }}
                    >
                      {formatIDR(filteredTotal)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-[#0c123b] dark:text-[#e8eeff]"
                      style={{
                        fontFamily: "var(--font-body)",
                        fontWeight: 600,
                        fontSize: "13px",
                      }}
                    >
                      {filteredGifts} gift{filteredGifts !== 1 ? "s" : ""}
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
