"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useOrganizer } from "@/lib/useOrganizer";
import { LayoutDashboard, CalendarDays, Coins, BookOpen, MessageCircle, Menu, X, Accessibility } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { organizer, isLoaded, isSignedIn, session } = useOrganizer();
  const { t, language } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [accessibleMode, setAccessibleMode] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const NAV_ITEMS = [
    { href: "/admin/dashboard", icon: LayoutDashboard, label: t("nav.home"), exact: true },
    { href: "/admin/dashboard/events", icon: CalendarDays, label: t("nav.events"), exact: false },
    { href: "/admin/dashboard/tokens", icon: Coins, label: t("nav.tokens"), exact: false },
    { href: "/admin/dashboard/angpao-ledger", icon: BookOpen, label: t("nav.angpao"), exact: false },
    { href: "/admin/dashboard/whatsapp-blast", icon: MessageCircle, label: t("nav.whatsapp"), exact: false },
  ];

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
    window.dispatchEvent(new Event("navi-a11y-toggled"));
  };

  if (!hydrated || !isLoaded) {
    return <div className="min-h-screen bg-dash-bg" />;
  }

  // If redirecting, prevent render
  if (session?.user?.role === "ADMIN") {
    return <div className="min-h-screen bg-dash-bg" />;
  }

  if (!organizer) {
    return <div className="min-h-screen bg-dash-bg" />;
  }

  const a11y = accessibleMode;

  return (
    <div
      className="flex min-h-screen bg-dash-bg"
      style={{ fontFamily: "var(--font-body)", fontSize: a11y ? "18px" : undefined }}
      data-accessible={a11y ? "true" : undefined}
    >
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen p-4 border-r border-dash-border bg-dash-surface justify-between">
        <div>
          <div className="flex items-center gap-2 mb-8 px-2">
            <span className="text-dash-text" style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: a11y ? "22px" : "18px" }}>
              {t("dashboard.title")}
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
                      ? "bg-dash-surface-hover border border-dash-border"
                      : "border border-transparent hover:bg-dash-surface-hover/50"
                  }`}
                >
                  <Icon className={`${a11y ? "w-6 h-6" : "w-5 h-5"} ${isActive ? "text-dash-accent" : "text-dash-text-muted"}`} strokeWidth={1.5} />
                  <span
                    className={isActive ? "text-dash-text" : "text-dash-text-muted"}
                    style={{ fontFamily: "var(--font-body)", fontWeight: isActive ? 500 : 400, fontSize: a11y ? "16px" : "14px" }}
                  >
                    {item.label}
                  </span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Accessibility Mode Toggle */}
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-[#333333]">
          <button
            onClick={toggleAccessibleMode}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
              a11y
                ? "bg-dash-accent text-dash-surface"
                : "bg-dash-surface-alt text-dash-text-muted hover:opacity-80"
            }`}
          >
            <Accessibility className={a11y ? "w-6 h-6" : "w-5 h-5"} strokeWidth={1.5} />
            <span style={{ fontFamily: "var(--font-body)", fontWeight: 500, fontSize: a11y ? "15px" : "13px" }}>
              {a11y ? t("a11y.active") : t("a11y.toggle")}
            </span>
          </button>
          {a11y && (
            <p className="px-4 mt-2 text-dash-text-muted" style={{ fontFamily: "var(--font-body)", fontWeight: 400, fontSize: "12px" }}>
              {t("a11y.desc")}
            </p>
          )}
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-4 bg-dash-bg border-b border-dash-border">
        <span className="text-dash-text" style={{ fontFamily: "var(--font-body)", fontWeight: 600, fontSize: a11y ? "18px" : "15px" }}>{t("dashboard.title")}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleAccessibleMode}
            className={`p-2 rounded-lg transition-colors ${a11y ? "bg-dash-accent text-dash-surface" : "text-dash-text-muted"}`}
            aria-label={t("a11y.toggle")}
          >
            <Accessibility className="w-5 h-5" strokeWidth={1.5} />
          </button>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2" aria-label="Menu">
            {mobileOpen ? <X className="w-5 h-5 text-dash-text" /> : <Menu className="w-5 h-5 text-dash-text" />}
          </button>
        </div>
      </div>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 pt-14 bg-dash-bg">
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
                      ? "bg-dash-surface-hover border border-dash-border"
                      : "border border-transparent"
                  }`}
                >
                  <Icon className={`${a11y ? "w-5 h-5" : "w-4 h-4"} ${isActive ? "text-dash-accent" : "text-dash-text-muted"}`} strokeWidth={1.5} />
                  <span
                    className={isActive ? "text-dash-text" : "text-dash-text-muted"}
                    style={{ fontFamily: "var(--font-body)", fontWeight: isActive ? 500 : 400, fontSize: a11y ? "16px" : "14px" }}
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