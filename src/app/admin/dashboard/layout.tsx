"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../../../lib/auth";
import { LayoutDashboard, CalendarDays, Coins, Menu, X } from "lucide-react";
import Link from "next/link";

const MOBILE_NAV = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "Overview", exact: true },
  { href: "/admin/dashboard/events", icon: CalendarDays, label: "Events", exact: false },
  { href: "/admin/dashboard/tokens", icon: Coins, label: "Tokens", exact: false },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { organizer } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Wait for client hydration before deciding to redirect.
  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!organizer) {
      router.replace("/login");
    }
  }, [organizer, hydrated, router]);

  if (!hydrated) {
    return <div className="min-h-screen" style={{ background: "#f8edd6" }} />;
  }

  if (!organizer) {
    // During client-side redirect, render an empty shell.
    return <div className="min-h-screen" style={{ background: "#f8edd6" }} />;
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#f8edd6", fontFamily: "var(--font-body)" }}>
      {/* Basic Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen p-4 border-r" style={{ borderColor: "#867bba", background: "#f8edd6" }}>
        <div className="flex items-center gap-2 mb-8 px-2">
          <span style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: "18px", color: "#0c123b" }}>
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
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors"
                style={{
                  background: isActive ? "#f1e5ed" : "transparent",
                  border: isActive ? "1px solid #867bba" : "1px solid transparent",
                }}
              >
                <Icon className="w-5 h-5" strokeWidth={1.5} style={{ color: isActive ? "#0c123b" : "#3c58a7" }} />
                <span style={{ fontFamily: "var(--font-body)", fontWeight: isActive ? 500 : 400, fontSize: "14px", color: isActive ? "#0c123b" : "#3c58a7" }}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4" style={{ background: "#f8edd6", borderBottom: "1px solid #867bba" }}>
        <span style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: "15px", color: "#0c123b" }}>Dashboard</span>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
          {mobileOpen ? <X className="w-5 h-5 text-[#0c123b]" /> : <Menu className="w-5 h-5 text-[#0c123b]" />}
        </button>
      </div>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 pt-14" style={{ background: "#f8edd6" }}>
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
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-left"
                  style={{
                    background: isActive ? "#f1e5ed" : "transparent",
                    border: isActive ? "1px solid #867bba" : "1px solid transparent",
                  }}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.5} style={{ color: isActive ? "#0c123b" : "#3c58a7" }} />
                  <span style={{ fontFamily: "var(--font-body)", fontWeight: isActive ? 500 : 400, fontSize: "14px", color: isActive ? "#0c123b" : "#3c58a7" }}>
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