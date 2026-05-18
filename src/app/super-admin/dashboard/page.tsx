"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<{ organizers: number; events: number } | null>(null);

  useEffect(() => {
    fetch("/api/super-admin/stats")
      .then(res => res.json())
      .then(data => {
        if (!data.error) setStats(data);
      })
      .catch(() => {});
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-5xl"
    >
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-[#0c123b] dark:text-[#e8eeff] uppercase tracking-tight mb-2">
          System Overview
        </h1>
        <p className="text-[#3c58a7] dark:text-[#b3c2ff] text-sm">
          Welcome back to the Super Admin console. Here you can monitor platform usage.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
         <div className="p-4 rounded-xl border border-[#867bba]/30 bg-[#f1e5ed] dark:bg-[#18203c]">
            <h3 className="text-sm font-medium text-[#867bba] mb-1">Total Organizers</h3>
            <p className="text-2xl font-semibold text-[#0c123b] dark:text-[#e8eeff]">
              {stats ? stats.organizers : "--"}
            </p>
         </div>
         <div className="p-4 rounded-xl border border-[#867bba]/30 bg-[#f1e5ed] dark:bg-[#18203c]">
            <h3 className="text-sm font-medium text-[#867bba] mb-1">Total Events</h3>
            <p className="text-2xl font-semibold text-[#0c123b] dark:text-[#e8eeff]">
              {stats ? stats.events : "--"}
            </p>
         </div>
      </div>
    </motion.div>
  );
}