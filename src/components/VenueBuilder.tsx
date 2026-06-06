"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, Save, RotateCcw, Circle, RectangleHorizontal, Star, GripVertical } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface VenueBuilderProps {
  initialConfig?: VenueLayoutConfig | null;
  onSave: (config: VenueLayoutConfig) => void;
  saving?: boolean;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const DEFAULT_CONFIG: VenueLayoutConfig = {
  gridRows: 8,
  gridCols: 10,
  stagePosition: "top",
  tables: [],
};

const TABLE_PRESETS: { type: VenueTable["type"]; label: string; icon: typeof Circle; seats: number; w: number; h: number }[] = [
  { type: "round", label: "Meja Bundar", icon: Circle, seats: 8, w: 2, h: 2 },
  { type: "long", label: "Meja Panjang", icon: RectangleHorizontal, seats: 10, w: 3, h: 1 },
  { type: "vip", label: "Baris VIP", icon: Star, seats: 6, w: 3, h: 1 },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function VenueBuilder({ initialConfig, onSave, saving = false }: VenueBuilderProps) {
  const [config, setConfig] = useState<VenueLayoutConfig>(initialConfig || { ...DEFAULT_CONFIG });
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ row: 0, col: 0 });
  const gridRef = useRef<HTMLDivElement>(null);

  const cellSize = 56; // px per grid cell

  // ── Add Table ──
  const addTable = useCallback((type: VenueTable["type"]) => {
    const preset = TABLE_PRESETS.find((p) => p.type === type)!;
    const id = `tbl-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const newTable: VenueTable = {
      id,
      label: `${preset.label} ${config.tables.filter((t) => t.type === type).length + 1}`,
      type,
      row: 0,
      col: 0,
      seats: preset.seats,
      width: preset.w,
      height: preset.h,
    };
    setConfig((prev) => ({ ...prev, tables: [...prev.tables, newTable] }));
    setSelectedTableId(id);
  }, [config.tables]);

  // ── Delete Table ──
  const deleteTable = useCallback((id: string) => {
    setConfig((prev) => ({ ...prev, tables: prev.tables.filter((t) => t.id !== id) }));
    if (selectedTableId === id) setSelectedTableId(null);
  }, [selectedTableId]);

  // ── Update Table ──
  const updateTable = useCallback((id: string, updates: Partial<VenueTable>) => {
    setConfig((prev) => ({
      ...prev,
      tables: prev.tables.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }));
  }, []);

  // ── Drag handlers ──
  const handlePointerDown = (e: React.PointerEvent, tableId: string) => {
    e.preventDefault();
    const table = config.tables.find((t) => t.id === tableId);
    if (!table || !gridRef.current) return;

    const rect = gridRef.current.getBoundingClientRect();
    const col = Math.floor((e.clientX - rect.left) / cellSize);
    const row = Math.floor((e.clientY - rect.top) / cellSize);
    setDragOffset({ row: row - table.row, col: col - table.col });
    setDraggingId(tableId);
    setSelectedTableId(tableId);

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingId || !gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const col = Math.max(0, Math.min(config.gridCols - 1, Math.floor((e.clientX - rect.left) / cellSize) - dragOffset.col));
    const row = Math.max(0, Math.min(config.gridRows - 1, Math.floor((e.clientY - rect.top) / cellSize) - dragOffset.row));
    updateTable(draggingId, { row, col });
  };

  const handlePointerUp = () => {
    setDraggingId(null);
  };

  // ── Reset ──
  const resetLayout = () => {
    setConfig({ ...DEFAULT_CONFIG });
    setSelectedTableId(null);
  };

  const selectedTable = config.tables.find((t) => t.id === selectedTableId);

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {TABLE_PRESETS.map((preset) => (
          <button
            key={preset.type}
            onClick={() => addTable(preset.type)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors bg-dash-surface-alt border border-dash-border text-dash-text hover:bg-dash-surface-hover"
            style={{
              fontFamily: "var(--font-body)",
              fontWeight: 500,
              fontSize: "12px",
            }}
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
            <preset.icon className="w-3.5 h-3.5" strokeWidth={1.5} />
            {preset.label}
          </button>
        ))}

        <div className="flex-1" />

        <button
          onClick={resetLayout}
          className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:opacity-80 bg-dash-surface-alt border border-dash-border text-dash-text-muted"
          style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px" }}
        >
          <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
          Reset
        </button>

        <button
          onClick={() => onSave(config)}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors hover:opacity-90 disabled:opacity-40 bg-dash-accent text-dash-surface border border-dash-accent"
          style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "12px" }}
        >
          <Save className="w-3.5 h-3.5" strokeWidth={1.5} />
          {saving ? "Menyimpan..." : "Simpan Layout"}
        </button>
      </div>

      {/* Grid config */}
      <div className="flex items-center gap-4 mb-4 px-1">
        <label className="flex items-center gap-2 text-dash-text-muted" style={{ fontFamily: "var(--font-body)", fontSize: "12px" }}>
          Baris:
          <input
            type="number"
            value={config.gridRows}
            onChange={(e) => setConfig((p) => ({ ...p, gridRows: Math.max(4, Math.min(20, Number(e.target.value) || 8)) }))}
            min={4}
            max={20}
            className="w-14 px-2 py-1 rounded text-center bg-dash-surface-alt border border-dash-border text-dash-text"
            style={{ fontFamily: "var(--font-body)", fontSize: "12px" }}
          />
        </label>
        <label className="flex items-center gap-2 text-dash-text-muted" style={{ fontFamily: "var(--font-body)", fontSize: "12px" }}>
          Kolom:
          <input
            type="number"
            value={config.gridCols}
            onChange={(e) => setConfig((p) => ({ ...p, gridCols: Math.max(4, Math.min(20, Number(e.target.value) || 10)) }))}
            min={4}
            max={20}
            className="w-14 px-2 py-1 rounded text-center bg-dash-surface-alt border border-dash-border text-dash-text"
            style={{ fontFamily: "var(--font-body)", fontSize: "12px" }}
          />
        </label>
        <label className="flex items-center gap-2 text-dash-text-muted" style={{ fontFamily: "var(--font-body)", fontSize: "12px" }}>
          Panggung:
          <select
            value={config.stagePosition}
            onChange={(e) => setConfig((p) => ({ ...p, stagePosition: e.target.value as VenueLayoutConfig["stagePosition"] }))}
            className="px-2 py-1 rounded bg-dash-surface-alt border border-dash-border text-dash-text"
            style={{ fontFamily: "var(--font-body)", fontSize: "12px" }}
          >
            <option value="top">Atas</option>
            <option value="bottom">Bawah</option>
            <option value="left">Kiri</option>
            <option value="right">Kanan</option>
          </select>
        </label>
      </div>

      <div className="flex gap-4">
        {/* Grid Canvas */}
        <div
          ref={gridRef}
          className="relative overflow-auto rounded-xl bg-dash-bg border border-dash-border"
          style={{
            width: config.gridCols * cellSize + 2,
            height: config.gridRows * cellSize + 2,
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={() => setSelectedTableId(null)}
        >
          {/* Grid lines */}
          {Array.from({ length: config.gridRows }).map((_, r) =>
            Array.from({ length: config.gridCols }).map((_, c) => (
              <div
                key={`${r}-${c}`}
                className="absolute"
                style={{
                  left: c * cellSize,
                  top: r * cellSize,
                  width: cellSize,
                  height: cellSize,
                  borderRight: "1px solid var(--dash-border)",
                  borderBottom: "1px solid var(--dash-border)",
                }}
              />
            ))
          )}

          {/* Stage indicator */}
          <div
            className="absolute z-10 flex items-center justify-center"
            style={{
              ...(config.stagePosition === "top" && { top: 0, left: 0, right: 0, height: cellSize * 0.6 }),
              ...(config.stagePosition === "bottom" && { bottom: 0, left: 0, right: 0, height: cellSize * 0.6 }),
              ...(config.stagePosition === "left" && { top: 0, left: 0, bottom: 0, width: cellSize * 0.6 }),
              ...(config.stagePosition === "right" && { top: 0, right: 0, bottom: 0, width: cellSize * 0.6 }),
              background: "color-mix(in srgb, var(--dash-accent) 25%, transparent)",
              borderBottom: config.stagePosition === "top" ? "1px solid var(--dash-accent)" : undefined,
              borderTop: config.stagePosition === "bottom" ? "1px solid var(--dash-accent)" : undefined,
              borderRight: config.stagePosition === "left" ? "1px solid var(--dash-accent)" : undefined,
              borderLeft: config.stagePosition === "right" ? "1px solid var(--dash-accent)" : undefined,
            }}
          >
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "9px", letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--dash-accent)" }}>
              PANGGUNG
            </span>
          </div>

          {/* Tables */}
          {config.tables.map((table) => {
            const isSelected = selectedTableId === table.id;
            const isDragging = draggingId === table.id;
            const bgColor = table.type === "vip" ? "var(--dash-accent)" : table.type === "round" ? "var(--dash-surface-hover)" : "var(--dash-surface-alt)";
            const borderColor = isSelected ? "var(--dash-accent)" : "var(--dash-border)";

            return (
              <motion.div
                key={table.id}
                className="absolute z-20 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing select-none"
                style={{
                  left: table.col * cellSize,
                  top: table.row * cellSize,
                  width: table.width * cellSize,
                  height: table.height * cellSize,
                  background: bgColor,
                  border: `2px solid ${borderColor}`,
                  borderRadius: table.type === "round" ? "50%" : "8px",
                  opacity: isDragging ? 0.8 : 1,
                  boxShadow: isSelected ? "0 0 0 2px color-mix(in srgb, var(--dash-accent) 40%, transparent)" : "none",
                }}
                onPointerDown={(e) => {
                  e.stopPropagation();
                  handlePointerDown(e, table.id);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTableId(table.id);
                }}
                whileHover={{ scale: isDragging ? 1 : 1.02 }}
              >
                <GripVertical className="w-3 h-3 text-white/30 mb-0.5" strokeWidth={1.5} />
                <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "9px", color: "#fff", textAlign: "center", lineHeight: 1.2 }}>
                  {table.label}
                </span>
                <span style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "8px", color: "rgba(255,255,255,0.5)" }}>
                  {table.seats} kursi
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Properties Panel */}
        <AnimatePresence>
          {selectedTable && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="w-56 flex-shrink-0 rounded-xl p-4 flex flex-col gap-3 bg-dash-surface border border-dash-border"
            >
              <h4 className="text-dash-text" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "13px" }}>
                Properti Meja
              </h4>

              <div>
                <label className="text-dash-text-muted" style={{ fontFamily: "var(--font-body)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Label</label>
                <input
                  value={selectedTable.label}
                  onChange={(e) => updateTable(selectedTable.id, { label: e.target.value })}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-dash-bg border border-dash-border text-dash-text"
                  style={{ fontFamily: "var(--font-body)", fontSize: "12px" }}
                />
              </div>

              <div>
                <label className="text-dash-text-muted" style={{ fontFamily: "var(--font-body)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Jumlah Kursi</label>
                <input
                  type="number"
                  value={selectedTable.seats}
                  onChange={(e) => updateTable(selectedTable.id, { seats: Math.max(1, Number(e.target.value) || 1) })}
                  min={1}
                  max={20}
                  className="w-full mt-1 px-3 py-2 rounded-lg bg-dash-bg border border-dash-border text-dash-text"
                  style={{ fontFamily: "var(--font-body)", fontSize: "12px" }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-dash-text-muted" style={{ fontFamily: "var(--font-body)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Lebar</label>
                  <input
                    type="number"
                    value={selectedTable.width}
                    onChange={(e) => updateTable(selectedTable.id, { width: Math.max(1, Math.min(5, Number(e.target.value) || 1)) })}
                    min={1}
                    max={5}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-dash-bg border border-dash-border text-dash-text"
                    style={{ fontFamily: "var(--font-body)", fontSize: "12px" }}
                  />
                </div>
                <div>
                  <label className="text-dash-text-muted" style={{ fontFamily: "var(--font-body)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Tinggi</label>
                  <input
                    type="number"
                    value={selectedTable.height}
                    onChange={(e) => updateTable(selectedTable.id, { height: Math.max(1, Math.min(5, Number(e.target.value) || 1)) })}
                    min={1}
                    max={5}
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-dash-bg border border-dash-border text-dash-text"
                    style={{ fontFamily: "var(--font-body)", fontSize: "12px" }}
                  />
                </div>
              </div>

              <button
                onClick={() => deleteTable(selectedTable.id)}
                className="flex items-center justify-center gap-2 mt-2 px-3 py-2 rounded-lg transition-colors hover:opacity-80"
                style={{ background: "color-mix(in srgb, red 15%, transparent)", border: "1px solid color-mix(in srgb, red 30%, transparent)", fontFamily: "var(--font-body)", fontWeight: 500, fontSize: "12px", color: "red" }}
              >
                <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                Hapus Meja
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-4 px-1">
        {[
          { label: "Meja Bundar", color: "var(--dash-surface-hover)", shape: "rounded-full" },
          { label: "Meja Panjang", color: "var(--dash-surface-alt)", shape: "rounded" },
          { label: "VIP", color: "var(--dash-accent)", shape: "rounded" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div className={`w-4 h-4 ${item.shape}`} style={{ background: item.color, border: "1px solid var(--dash-border)" }} />
            <span className="text-dash-text-muted" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "11px" }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-3 px-1">
        <span className="text-dash-text-muted" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "11px" }}>
          {config.tables.length} meja · {config.tables.reduce((s, t) => s + t.seats, 0)} total kursi · Grid {config.gridRows}×{config.gridCols}
        </span>
      </div>
    </div>
  );
}
