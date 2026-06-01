"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Check } from "lucide-react";

interface VenueTable {
  id: string;
  label: string;
  type: "round" | "long" | "vip";
  row: number;
  col: number;
  seats: number;
  width: number;
  height: number;
}

interface VenueLayoutConfig {
  gridRows: number;
  gridCols: number;
  stagePosition: "top" | "bottom" | "left" | "right";
  tables: VenueTable[];
}

interface OccupiedSeat {
  tableId: string;
  seatNumber: number;
  guestName: string;
}

interface VenueVisualizerProps {
  config: VenueLayoutConfig;
  occupiedSeats: OccupiedSeat[];
  mode: "view" | "select" | "selectTable";
  selectedSeat?: { tableId: string; seatNumber?: number } | null;
  onSelectSeat?: (tableId: string, seatNumber: number) => void;
  onSelectTable?: (tableId: string) => void;
  allowedTableId?: string | null;
}

export default function VenueVisualizer({
  config,
  occupiedSeats,
  mode,
  selectedSeat,
  onSelectSeat,
  onSelectTable,
  allowedTableId,
}: VenueVisualizerProps) {
  const [activeTable, setActiveTable] = useState<VenueTable | null>(null);

  const cellSize = 56;

  // Occupancy map: tableId -> seatNumber -> guestName
  const occupancyMap = new Map<string, Map<number, string>>();
  occupiedSeats.forEach((occ) => {
    if (!occupancyMap.has(occ.tableId)) {
      occupancyMap.set(occ.tableId, new Map());
    }
    occupancyMap.get(occ.tableId)!.set(occ.seatNumber, occ.guestName);
  });

  const getTableOccupancy = (table: VenueTable) => {
    const occ = occupancyMap.get(table.id);
    return occ ? occ.size : 0;
  };

  return (
    <div className="w-full flex flex-col gap-6 items-center">
      {/* Grid Canvas */}
      <div
        className="relative overflow-auto rounded-xl max-w-full"
        style={{
          width: config.gridCols * cellSize + 2,
          height: config.gridRows * cellSize + 2,
          background: "#111111",
          border: "1px solid #333333",
        }}
      >
        {/* Stage indicator */}
        <div
          className="absolute z-10 flex items-center justify-center"
          style={{
            ...(config.stagePosition === "top" && { top: 0, left: 0, right: 0, height: cellSize * 0.6 }),
            ...(config.stagePosition === "bottom" && { bottom: 0, left: 0, right: 0, height: cellSize * 0.6 }),
            ...(config.stagePosition === "left" && { top: 0, left: 0, bottom: 0, width: cellSize * 0.6 }),
            ...(config.stagePosition === "right" && { top: 0, right: 0, bottom: 0, width: cellSize * 0.6 }),
            background: "rgba(107, 15, 26, 0.25)",
            borderBottom: config.stagePosition === "top" ? "1px solid #6B0F1A" : undefined,
            borderTop: config.stagePosition === "bottom" ? "1px solid #6B0F1A" : undefined,
            borderRight: config.stagePosition === "left" ? "1px solid #6B0F1A" : undefined,
            borderLeft: config.stagePosition === "right" ? "1px solid #6B0F1A" : undefined,
          }}
        >
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#6B0F1A" }}>
            PANGGUNG
          </span>
        </div>

        {/* Tables */}
        {config.tables.map((table) => {
          const occCount = getTableOccupancy(table);
          const isFull = occCount >= table.seats;
          const hasMySeat = selectedSeat?.tableId === table.id;

          const isAllowed = mode === "view" || !allowedTableId || allowedTableId === table.id;
          const bgColor = table.type === "vip" ? "#6B0F1A" : table.type === "round" ? "#1f2937" : "#1a2332";
          const borderColor = hasMySeat ? "#fff" : "#333333";

          return (
            <motion.button
              key={table.id}
              onClick={() => {
                if (!isAllowed) return;
                if (mode === "selectTable") {
                  onSelectTable?.(table.id);
                } else {
                  setActiveTable(table);
                }
              }}
              whileHover={{ scale: isAllowed ? 1.02 : 1 }}
              whileTap={{ scale: isAllowed ? 0.98 : 1 }}
              disabled={!isAllowed}
              className={`absolute z-20 flex flex-col items-center justify-center transition-colors ${!isAllowed ? "cursor-not-allowed" : "cursor-pointer"}`}
              style={{
                left: table.col * cellSize,
                top: table.row * cellSize,
                width: table.width * cellSize,
                height: table.height * cellSize,
                background: bgColor,
                border: `2px solid ${borderColor}`,
                borderRadius: table.type === "round" ? "50%" : "8px",
                opacity: mode === "select" && ((isFull && !hasMySeat) || !isAllowed) ? 0.4 : 1,
                boxShadow: hasMySeat ? "0 0 0 3px rgba(255,255,255,0.2)" : "none",
              }}
            >
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "9px", color: "#fff", textAlign: "center", lineHeight: 1.2 }}>
                {table.label}
              </span>
              <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "8px", color: "rgba(255,255,255,0.6)" }}>
                {occCount}/{table.seats} terisi
              </span>
              {hasMySeat && (
                <div className="absolute -top-2 -right-2 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center border-2 border-[#111]">
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Detail Modal / Panel */}
      <AnimatePresence>
        {activeTable && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setActiveTable(null)}
          >
            <div
              className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
              style={{ background: "#111111", border: "1px solid #333333" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-4 border-b border-[#333333] bg-[#1A1A1A]">
                <div>
                  <h3 style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "16px", color: "#e8eeff" }}>
                    {activeTable.label}
                  </h3>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "#867bba" }}>
                    Tipe: {activeTable.type.toUpperCase()} · {activeTable.seats} Kursi
                  </p>
                </div>
                <button
                  onClick={() => setActiveTable(null)}
                  className="p-2 hover:bg-[#333333] rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-[#867bba]" />
                </button>
              </div>

              <div className="p-4 max-h-[60vh] overflow-y-auto">
                {mode === "select" && (
                  <p className="mb-4" style={{ fontFamily: "var(--font-body)", fontSize: "13px", color: "#b3c2ff" }}>
                    Silakan pilih kursi yang tersedia di meja ini.
                  </p>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: activeTable.seats }).map((_, i) => {
                    const sNum = i + 1;
                    const guest = occupancyMap.get(activeTable.id)?.get(sNum);
                    const isMySeat = selectedSeat?.tableId === activeTable.id && selectedSeat?.seatNumber === sNum;
                    const isOccupied = !!guest;

                    return (
                      <button
                        key={sNum}
                        disabled={mode === "view" || (isOccupied && !isMySeat)}
                        onClick={() => {
                          if (mode === "select" && !isOccupied) {
                            onSelectSeat?.(activeTable.id, sNum);
                            setActiveTable(null);
                          }
                        }}
                        className="flex flex-col items-center justify-center p-3 rounded-xl transition-all"
                        style={{
                          background: isMySeat ? "#6B0F1A" : isOccupied ? "#1a1a1a" : "#222222",
                          border: `1px solid ${isMySeat ? "#8B1F2A" : isOccupied ? "#333333" : "#444"}`,
                          opacity: isOccupied && !isMySeat ? 0.5 : 1,
                          cursor: mode === "view" || (isOccupied && !isMySeat) ? "default" : "pointer",
                        }}
                      >
                        <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "14px", color: isMySeat ? "#fff" : "#e8eeff" }}>
                          Kursi {sNum}
                        </span>
                        {isOccupied && !isMySeat ? (
                          <span className="mt-1 line-clamp-1 break-all" style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "#867bba" }}>
                            {guest}
                          </span>
                        ) : isMySeat ? (
                          <span className="mt-1" style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "#ffb3b8" }}>
                            Pilihan Anda
                          </span>
                        ) : (
                          <span className="mt-1" style={{ fontFamily: "var(--font-body)", fontSize: "11px", color: "#4ade80" }}>
                            Tersedia
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
