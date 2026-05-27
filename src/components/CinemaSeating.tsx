"use client";

import { useState, useMemo } from "react";
import { motion } from "motion/react";

interface SeatData {
  id: string; // e.g. "A1"
  row: string;
  number: number;
  status: "available" | "occupied" | "selected";
  guestName?: string | null;
}

interface CinemaSeatingProps {
  rows?: number;
  seatsPerRow?: number;
  occupiedSeats?: { seatId: string; guestName?: string | null }[];
  selectedSeat?: string | null;
  mode: "select" | "view";
  onSeatSelect?: (seatId: string) => void;
}

const ROW_LABELS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default function CinemaSeating({
  rows = 8,
  seatsPerRow = 10,
  occupiedSeats = [],
  selectedSeat = null,
  mode,
  onSeatSelect,
}: CinemaSeatingProps) {
  const [hoveredSeat, setHoveredSeat] = useState<string | null>(null);

  const seatMap = useMemo(() => {
    const occupiedMap = new Map(
      occupiedSeats.map((s) => [s.seatId, s.guestName ?? null])
    );
    const grid: SeatData[][] = [];

    for (let r = 0; r < rows; r++) {
      const rowLabel = ROW_LABELS[r] || `R${r + 1}`;
      const rowSeats: SeatData[] = [];
      for (let s = 1; s <= seatsPerRow; s++) {
        const id = `${rowLabel}${s}`;
        let status: SeatData["status"] = "available";
        if (occupiedMap.has(id)) status = "occupied";
        if (selectedSeat === id) status = "selected";
        rowSeats.push({
          id,
          row: rowLabel,
          number: s,
          status,
          guestName: occupiedMap.get(id) ?? null,
        });
      }
      grid.push(rowSeats);
    }
    return grid;
  }, [rows, seatsPerRow, occupiedSeats, selectedSeat]);

  const getSeatColor = (seat: SeatData) => {
    switch (seat.status) {
      case "selected":
        return {
          bg: "#2d3895",
          border: "#3c58a7",
          text: "#fbeed4",
        };
      case "occupied":
        return {
          bg: "#333333",
          border: "#444444",
          text: "#888888",
        };
      default:
        return {
          bg: "#1A1A1A",
          border: "#333333",
          text: "#b3c2ff",
        };
    }
  };

  const handleSeatClick = (seat: SeatData) => {
    if (mode !== "select") return;
    if (seat.status === "occupied") return;
    onSeatSelect?.(seat.id);
  };

  const hoveredData = useMemo(() => {
    if (!hoveredSeat) return null;
    for (const row of seatMap) {
      for (const seat of row) {
        if (seat.id === hoveredSeat) return seat;
      }
    }
    return null;
  }, [hoveredSeat, seatMap]);

  return (
    <div className="w-full">
      {/* Stage / Screen indicator */}
      <div className="flex justify-center mb-6">
        <div
          className="px-12 py-2 rounded-b-2xl text-center"
          style={{
            background: "#2d3895",
            border: "1px solid #3c58a7",
            borderTop: "none",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: "11px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#fbeed4",
            }}
          >
            Stage / Front
          </span>
        </div>
      </div>

      {/* Seat grid */}
      <div className="overflow-x-auto pb-4">
        <div className="flex flex-col items-center gap-1.5 min-w-fit mx-auto">
          {seatMap.map((row, rowIdx) => (
            <div key={rowIdx} className="flex items-center gap-1">
              {/* Row label */}
              <div className="w-6 text-center flex-shrink-0">
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 500,
                    fontSize: "10px",
                    color: "#867bba",
                  }}
                >
                  {row[0]?.row}
                </span>
              </div>

              {/* Seats */}
              <div className="flex gap-1">
                {row.map((seat) => {
                  const colors = getSeatColor(seat);
                  const isClickable =
                    mode === "select" && seat.status !== "occupied";

                  return (
                    <motion.button
                      key={seat.id}
                      whileHover={isClickable ? { scale: 1.15 } : {}}
                      whileTap={isClickable ? { scale: 0.95 } : {}}
                      onClick={() => handleSeatClick(seat)}
                      onMouseEnter={() => setHoveredSeat(seat.id)}
                      onMouseLeave={() => setHoveredSeat(null)}
                      disabled={!isClickable && mode === "select"}
                      className={`w-8 h-8 rounded-md flex items-center justify-center transition-all duration-150 ${
                        isClickable
                          ? "cursor-pointer hover:ring-1 hover:ring-[#2d3895]"
                          : mode === "select"
                          ? "cursor-not-allowed opacity-60"
                          : "cursor-default"
                      }`}
                      style={{
                        background: colors.bg,
                        border: `1px solid ${colors.border}`,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-body)",
                          fontWeight: 500,
                          fontSize: "8px",
                          color: colors.text,
                        }}
                      >
                        {seat.number}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Row label right */}
              <div className="w-6 text-center flex-shrink-0">
                <span
                  style={{
                    fontFamily: "var(--font-body)",
                    fontWeight: 500,
                    fontSize: "10px",
                    color: "#867bba",
                  }}
                >
                  {row[0]?.row}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredData && (
        <div className="flex justify-center mt-2">
          <div
            className="px-3 py-1.5 rounded-lg"
            style={{
              background: "#111111",
              border: "1px solid #333333",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 500,
                fontSize: "12px",
                color: "#e8eeff",
              }}
            >
              {hoveredData.id}
              {hoveredData.guestName && (
                <span style={{ color: "#867bba" }}>
                  {" "}
                  — {hoveredData.guestName}
                </span>
              )}
              {hoveredData.status === "available" && mode === "select" && (
                <span style={{ color: "#3c58a7" }}> — Click to select</span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-4">
        {[
          { label: "Available", bg: "#1A1A1A", border: "#333333" },
          { label: "Occupied", bg: "#333333", border: "#444444" },
          { label: "Selected", bg: "#2d3895", border: "#3c58a7" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div
              className="w-4 h-4 rounded-sm"
              style={{
                background: item.bg,
                border: `1px solid ${item.border}`,
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-body)",
                fontWeight: 400,
                fontSize: "11px",
                color: "#867bba",
              }}
            >
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
