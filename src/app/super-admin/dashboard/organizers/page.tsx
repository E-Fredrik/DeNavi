"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Search, Loader2 } from "lucide-react";

interface Organizer {
  id: string;
  name: string;
  email: string | null;
  whatsapp: string | null;
  tokenBalance: number;
  _count: {
    events: number;
  };
  createdAt: string;
}

export default function SuperAdminOrganizersPage() {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  useEffect(() => {
    fetch("/api/super-admin/organizers")
      .then(res => res.json())
      .then(data => {
        if (!data.error) setOrganizers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = organizers.filter(o => 
    o.name.toLowerCase().includes(query.toLowerCase()) || 
    (o.email && o.email.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-5xl"
    >
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-[#0c123b] dark:text-[#e8eeff] uppercase tracking-tight mb-2">
          Organizers
        </h1>
        <p className="text-[#3c58a7] dark:text-[#b3c2ff] text-sm">
          Manage platform organizers and monitor their activity.
        </p>
      </header>

      <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f1e5ed] dark:bg-[#18203c] border border-[#867bba]/30">
        <Search className="w-5 h-5 text-[#867bba]" />
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search organizers by name or email..." 
          className="flex-1 bg-transparent border-none outline-none text-[#0c123b] dark:text-[#e8eeff] placeholder-[#867bba]"
        />
      </div>

      <div className="rounded-xl border border-[#867bba]/30 bg-white dark:bg-[#0b1022] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-[#f1e5ed] dark:bg-[#18203c] border-b border-[#867bba]/30">
                <th className="px-6 py-4 font-semibold text-[#3c58a7] dark:text-[#b3c2ff]">Name</th>
                <th className="px-6 py-4 font-semibold text-[#3c58a7] dark:text-[#b3c2ff]">Contact</th>
                <th className="px-6 py-4 font-semibold text-[#3c58a7] dark:text-[#b3c2ff]">Events</th>
                <th className="px-6 py-4 font-semibold text-[#3c58a7] dark:text-[#b3c2ff]">Tokens</th>
                <th className="px-6 py-4 font-semibold text-[#3c58a7] dark:text-[#b3c2ff]">Joined</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#867bba]">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                    Loading organizers...
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((org) => (
                  <tr key={org.id} className="border-b border-[#867bba]/10 hover:bg-[#f1e5ed]/50 dark:hover:bg-[#18203c]/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#0c123b] dark:text-[#e8eeff]">{org.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[#3c58a7] dark:text-[#b3c2ff]">{org.email || "No email"}</div>
                      {org.whatsapp && <div className="text-xs text-[#867bba] mt-0.5">{org.whatsapp}</div>}
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#fbeed4] dark:bg-[#111a34] text-[#2d3895] font-semibold text-xs border border-[#867bba]/20">
                        {org._count.events}
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#2d3895] dark:text-[#b3c2ff]">
                      {org.tokenBalance} T
                    </td>
                    <td className="px-6 py-4 text-[#867bba]">
                      {new Date(org.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => window.location.href = `/super-admin/dashboard/organizers/${org.id}`} className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#2d3895] text-[#fbeed4] hover:bg-[#3c58a7] transition-colors">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#867bba]">
                    No organizers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
