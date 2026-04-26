"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useOrganizer } from "@/lib/useOrganizer";
import { LayoutDashboard, CalendarDays, Coins, Menu, X } from "lucide-react";
import Link from "next/link";

const MOBILE_NAV = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Overview", exact: true },
  { href: "/admin/dashboard/events", icon: CalendarDays, label: "Events", exact: false },
  { href: "/admin/dashboard/tokens", icon: Coins, label: "Tokens", exact: false },
];

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { organizer, isLoaded } = useOrganizer();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Wait for client hydration before deciding to redirect.
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !isLoaded) return;
    if (!organizer) {
      router.replace("/sign-in");
    }
  }, [organizer, hydrated, isLoaded, router]);

  if (!hydrated || !isLoaded) {
    return <div className="min-h-screen bg-[#f8edd6] dark:bg-[#0b1022]" />;
  }

  if (!organizer) {
    return <div className="min-h-screen bg-[#f8edd6] dark:bg-[#0b1022]" />;
  }

  return (
    <div className="flex min-h-screen pt-15 bg-[#f8edd6] dark:bg-[#0b1022]" style={{ fontFamily: "var(--font-body)" }}>
      {/* Basic Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen p-4 border-r border-[#867bba] dark:border-[#2a2660] bg-[#f8edd6] dark:bg-[#0b1022]">
        <div className="flex items-center gap-2 mb-8 px-2">
          <span className="text-[#0c123b] dark:text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "18px" }}>
            Dashboard
          </span>
        </div>
        <nav className="flex flex-col gap-2">
          {MOBILE_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact 
              ? pathname === item.href 
              : pathname.startsWith(item.href);
            return (
              <Link
                href={item.href}
                key={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  isActive
                    ? "bg-[#f1e5ed] dark:bg-[#18203c] border border-[#867bba] dark:border-[#2a2660]"
                    : "border border-transparent"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-[#0c123b] dark:text-[#e8eeff]" : "text-[#3c58a7] dark:text-[#b3c2ff]"}`} strokeWidth={1.5} />
                <span
                  className={isActive ? "text-[#0c123b] dark:text-[#e8eeff]" : "text-[#3c58a7] dark:text-[#b3c2ff]"}
                  style={{ fontFamily: "var(--font-body)", fontWeight: isActive ? 500 : 400, fontSize: "14px" }}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 bg-[#f8edd6] dark:bg-[#0b1022] border-b border-[#867bba] dark:border-[#2a2660]">
        <span className="text-[#0c123b] dark:text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "15px" }}>Dashboard</span>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
          {mobileOpen ? <X className="w-5 h-5 text-[#0c123b] dark:text-[#e8eeff]" /> : <Menu className="w-5 h-5 text-[#0c123b] dark:text-[#e8eeff]" />}
        </button>
      </div>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 pt-14 bg-[#f8edd6] dark:bg-[#0b1022]">
          <nav className="p-4 flex flex-col gap-1">
            {MOBILE_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact 
                ? pathname === item.href 
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left ${
                    isActive
                      ? "bg-[#f1e5ed] dark:bg-[#18203c] border border-[#867bba] dark:border-[#2a2660]"
                      : "border border-transparent"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#0c123b] dark:text-[#e8eeff]" : "text-[#3c58a7] dark:text-[#b3c2ff]"}`} strokeWidth={1.5} />
                  <span
                    className={isActive ? "text-[#0c123b] dark:text-[#e8eeff]" : "text-[#3c58a7] dark:text-[#b3c2ff]"}
                    style={{ fontFamily: "var(--font-body)", fontWeight: isActive ? 500 : 400, fontSize: "14px" }}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}