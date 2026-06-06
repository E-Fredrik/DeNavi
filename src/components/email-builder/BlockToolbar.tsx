"use client";

import { Type, Image as ImageIcon, QrCode, Minus, Link as LinkIcon, Sparkles } from "lucide-react";

interface BlockToolbarProps {
  onAddBlock: (type: "text" | "image" | "qrcode" | "divider" | "button") => void;
}

export function BlockToolbar({ onAddBlock }: BlockToolbarProps) {
  const blocks = [
    { type: "text" as const, icon: Type, label: "Text Block", desc: "Add rich text content" },
    { type: "image" as const, icon: ImageIcon, label: "Image", desc: "Upload or link image" },
    { type: "qrcode" as const, icon: QrCode, label: "QR Code", desc: "Guest check-in QR" },
    { type: "button" as const, icon: LinkIcon, label: "CTA Button", desc: "RSVP or action link" },
    { type: "divider" as const, icon: Minus, label: "Divider", desc: "Visual separator" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-gray-900 dark:text-[#e8eeff] font-bold text-sm uppercase tracking-wide">
          Add Blocks
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {blocks.map((block) => (
          <button
            key={block.type}
            onClick={() => onAddBlock(block.type)}
            className="group flex flex-col items-center justify-center p-4 rounded-xl border-2 border-gray-200 dark:border-[#333333] bg-white dark:bg-[#111111] hover:border-indigo-500 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all hover:scale-105 active:scale-95"
            title={block.desc}
          >
            <block.icon className="w-6 h-6 text-gray-600 dark:text-[#867bba] group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2" strokeWidth={1.5} />
            <span className="text-xs font-semibold text-gray-700 dark:text-[#b3c2ff] group-hover:text-indigo-700 dark:group-hover:text-indigo-300">
              {block.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
