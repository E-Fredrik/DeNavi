"use client";

import { Tag } from "lucide-react";

const SMART_TAGS = [
  { tag: "{{Guest_Name}}", desc: "Full guest name" },
  { tag: "{{First_Name}}", desc: "First name only" },
  { tag: "{{Event_Date}}", desc: "Event date formatted" },
  { tag: "{{Event_Name}}", desc: "Event title" },
  { tag: "{{QR_Code}}", desc: "Unique QR code (auto-generated)" },
  { tag: "{{Table_Number}}", desc: "Assigned table" },
  { tag: "{{Seat_Number}}", desc: "Seat assignment" },
  { tag: "{{RSVP_Link}}", desc: "RSVP confirmation link" },
  { tag: "{{Party_Size}}", desc: "Number of guests" },
];

interface SmartTagsPanelProps {
  onInsertTag: (tag: string) => void;
}

export function SmartTagsPanel({ onInsertTag }: SmartTagsPanelProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <Tag className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        <h3 className="text-gray-900 dark:text-[#e8eeff] font-bold text-sm uppercase tracking-wide">
          Smart Tags
        </h3>
      </div>
      <p className="text-xs text-gray-600 dark:text-[#867bba] mb-3">
        Click a tag to insert it into your content. Tags will be replaced with actual data when emails are sent.
      </p>
      <div className="space-y-2">
        {SMART_TAGS.map((item) => (
          <button
            key={item.tag}
            onClick={() => onInsertTag(item.tag)}
            className="w-full flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-[#333333] bg-white dark:bg-[#111111] hover:border-purple-500 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-all text-left group"
          >
            <code className="flex-1 font-mono text-xs text-purple-700 dark:text-purple-300 font-semibold">
              {item.tag}
            </code>
            <span className="text-[10px] text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400">
              {item.desc}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
