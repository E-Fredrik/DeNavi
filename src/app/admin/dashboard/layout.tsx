"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useOrganizer } from "@/lib/useOrganizer";
import { LayoutDashboard, CalendarDays, Coins, BookOpen, MessageCircle, Menu, X, Accessibility } from "lucide-react";
import Link from "next/link";

const NAV_ITEMS = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Overview", accessibleLabel: "Dashboard Overview", exact: true },
  { href: "/admin/dashboard/events", icon: CalendarDays, label: "Events", accessibleLabel: "Manage Your Events", exact: false },
  { href: "/admin/dashboard/tokens", icon: Coins, label: "Tokens", accessibleLabel: "Buy & Manage Tokens", exact: false },
  { href: "/admin/dashboard/angpao-ledger", icon: BookOpen, label: "Angpao Ledger", accessibleLabel: "Angpao & Gift Records", exact: false },
  { href: "/admin/dashboard/whatsapp-blast", icon: MessageCircle, label: "WhatsApp Blast", accessibleLabel: "Send WhatsApp Reminders", exact: false },
];

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { organizer, isLoaded, isSignedIn, session } = useOrganizer();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [accessibleMode, setAccessibleMode] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Wait for client hydration before deciding to redirect.
  useEffect(() => {
    setHydrated(true);
    // Load accessible mode preference
    const stored = localStorage.getItem("navi-accessible-mode");
    if (stored === "true") setAccessibleMode(true);
  }, []);

  useEffect(() => {
    if (!hydrated || !isLoaded) return;
    
    // Redirect if they are global Admin
    if (session?.user?.role === "ADMIN") {
      router.replace("/super-admin/dashboard");
      return;
    }

    if (!organizer && !isSignedIn) {
      router.replace("/sign-in");
    }
  }, [organizer, hydrated, isLoaded, isSignedIn, session, router]);

  const toggleAccessibleMode = () => {
    const next = !accessibleMode;
    setAccessibleMode(next);
    localStorage.setItem("navi-accessible-mode", String(next));
  };

  if (!hydrated || !isLoaded) {
    return <div className="min-h-screen bg-[#f8edd6] dark:bg-[#0b1022]" />;
  }

  // If redirecting, prevent render
  if (session?.user?.role === "ADMIN") {
    return <div className="min-h-screen bg-[#f8edd6] dark:bg-[#0b1022]" />;
  }

  if (!organizer) {
    return <div className="min-h-screen bg-[#f8edd6] dark:bg-[#0b1022]" />;
  }

  const a11y = accessibleMode;

  return (
    <div
      className="flex min-h-screen pt-15 bg-[#f8edd6] dark:bg-[#0b1022]"
      style={{ fontFamily: "var(--font-body)", fontSize: a11y ? "18px" : undefined }}
      data-accessible={a11y ? "true" : undefined}
    >
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen p-4 border-r border-[#867bba] dark:border-[#2a2660] bg-[#f8edd6] dark:bg-[#0b1022] justify-between">
        <div>
          <div className="flex items-center gap-2 mb-8 px-2">
            <span className="text-[#0c123b] dark:text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: a11y ? "22px" : "18px" }}>
              Dashboard
            </span>
          </div>
          <nav className="flex flex-col gap-2">
            {NAV_ITEMS.map((item) => {
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
                      : "border border-transparent hover:bg-[#f1e5ed]/50 dark:hover:bg-[#18203c]/50"
                  }`}
                >
                  <Icon className={`${a11y ? "w-6 h-6" : "w-5 h-5"} ${isActive ? "text-[#0c123b] dark:text-[#e8eeff]" : "text-[#3c58a7] dark:text-[#b3c2ff]"}`} strokeWidth={1.5} />
                  <span
                    className={isActive ? "text-[#0c123b] dark:text-[#e8eeff]" : "text-[#3c58a7] dark:text-[#b3c2ff]"}
                    style={{ fontFamily: "var(--font-body)", fontWeight: isActive ? 500 : 400, fontSize: a11y ? "16px" : "14px" }}
                  >
                    {a11y ? item.accessibleLabel : item.label}
                  </span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Accessibility Mode Toggle */}
        <div className="mt-auto pt-4 border-t border-[#867bba]/30 dark:border-[#2a2660]/30">
          <button
            onClick={toggleAccessibleMode}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              a11y
                ? "bg-[#2d3895] text-[#fbeed4]"
                : "bg-[#f1e5ed] dark:bg-[#18203c] text-[#3c58a7] dark:text-[#b3c2ff] hover:bg-[#f1e5ed]/80 dark:hover:bg-[#18203c]/80"
            }`}
          >
            <Accessibility className={a11y ? "w-6 h-6" : "w-5 h-5"} strokeWidth={1.5} />
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: a11y ? "15px" : "13px" }}>
              {a11y ? "Accessibility: ON" : "Accessible Mode"}
            </span>
          </button>
          {a11y && (
            <p className="px-4 mt-2 text-[#3c58a7] dark:text-[#b3c2ff]" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "12px" }}>
              Bigger text, clearer labels, high contrast. Tap again to turn off.
            </p>
          )}
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 bg-[#f8edd6] dark:bg-[#0b1022] border-b border-[#867bba] dark:border-[#2a2660]">
        <span className="text-[#0c123b] dark:text-[#e8eeff]" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: a11y ? "18px" : "15px" }}>Dashboard</span>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAccessibleMode}
            className={`p-2 rounded-lg transition-colors ${a11y ? "bg-[#2d3895] text-[#fbeed4]" : "text-[#3c58a7] dark:text-[#b3c2ff]"}`}
          >
            <Accessibility className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
            {mobileOpen ? <X className="w-5 h-5 text-[#0c123b] dark:text-[#e8eeff]" /> : <Menu className="w-5 h-5 text-[#0c123b] dark:text-[#e8eeff]" />}
          </button>
        </div>
      </div>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 pt-14 bg-[#f8edd6] dark:bg-[#0b1022]">
          <nav className="p-4 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
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
                  <Icon className={`${a11y ? "w-5 h-5" : "w-4 h-4"} ${isActive ? "text-[#0c123b] dark:text-[#e8eeff]" : "text-[#3c58a7] dark:text-[#b3c2ff]"}`} strokeWidth={1.5} />
                  <span
                    className={isActive ? "text-[#0c123b] dark:text-[#e8eeff]" : "text-[#3c58a7] dark:text-[#b3c2ff]"}
                    style={{ fontFamily: "var(--font-body)", fontWeight: isActive ? 500 : 400, fontSize: a11y ? "16px" : "14px" }}
                  >
                    {a11y ? item.accessibleLabel : item.label}
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