"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { ShieldAlert, Users, Ticket, Menu, X, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/auth-client";

const MOBILE_NAV = [
  { href: "/super-admin/dashboard", icon: LayoutDashboard, label: "Overview", exact: true },
  { href: "/super-admin/dashboard/organizers", icon: Users, label: "Organizers", exact: false },
  { href: "/super-admin/dashboard/promo-codes", icon: Ticket, label: "Promo Codes", exact: false },
];

export default function SuperAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { data: session, isPending } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated || isPending) return;
    if (!session?.user || session.user.role !== "ADMIN") {
      router.replace("/admin/dashboard"); // Re-route to regular dashboard if not admin
    }
  }, [session, hydrated, isPending, router]);

  if (!hydrated || isPending || !session?.user || session.user.role !== "ADMIN") {
    return <div className="min-h-screen bg-[#f8edd6] dark:bg-[#0b1022]" />;
  }

  return (
    <div className="flex min-h-screen pt-15 bg-[#f8edd6] dark:bg-[#0b1022]" style={{ fontFamily: "var(--font-body)" }}>
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 min-h-screen p-4 border-r border-[#867bba] dark:border-[#2a2660] bg-[#f8edd6] dark:bg-[#0b1022]">
        <div className="flex items-center gap-2 mb-8 px-2">
          <ShieldAlert className="w-6 h-6 text-[#d33]" />
          <h2 className="text-[#0c123b] dark:text-[#e8eeff] font-bold tracking-tight uppercase" style={{ fontSize: "16px" }}>
            Super Admin
          </h2>
        </div>
        <nav className="flex flex-col gap-2 flex-grow">
          {MOBILE_NAV.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? "bg-[#2d3895] text-[#e8eeff]"
                    : "text-[#3c58a7] dark:text-[#b3c2ff] hover:bg-[#f1e5ed] dark:hover:bg-[#18203c]"
                }`}
                style={{ fontWeight: isActive ? 600 : 500, fontSize: "14px" }}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-[#e8eeff]" : "text-[#867bba] dark:text-[#b3c2ff]"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto px-2 pb-4">
          <Button
            variant="ghost"
            onClick={async () => {
              await signOut();
              router.push("/");
            }}
            className="w-full justify-start text-[#d33] hover:text-[#d33] hover:bg-red-500/10"
          >
            Log Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full h-full min-h-screen bg-[#f8edd6] dark:bg-[#0b1022] overflow-x-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b border-[#867bba] dark:border-[#2a2660] bg-[#f8edd6] dark:bg-[#0b1022]">
          <div className="flex items-center gap-2">
             <ShieldAlert className="w-6 h-6 text-[#d33]" />
            <h2 className="text-[#0c123b] dark:text-[#e8eeff] font-bold" style={{ fontSize: "16px" }}>
               Super Admin
            </h2>
          </div>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 text-[#3c58a7] dark:text-[#b3c2ff] hover:bg-[#f1e5ed] dark:hover:bg-[#18203c] rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <div className="p-4 lg:p-8 overflow-y-auto w-full">
          {children}
        </div>
      </main>

      {/* Mobile Drawer Navigation */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-[#0c123b]/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <nav className="relative w-64 bg-[#f8edd6] dark:bg-[#0b1022] h-full shadow-2xl flex flex-col p-4 border-r border-[#867bba] dark:border-[#2a2660]">
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center gap-2">
                 <ShieldAlert className="w-5 h-5 text-[#d33]" />
                <h2 className="text-[#0c123b] dark:text-[#e8eeff] font-bold uppercase" style={{ fontSize: "14px" }}>
                   Super Admin
                </h2>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 text-[#3c58a7] dark:text-[#b3c2ff] hover:bg-[#f1e5ed] dark:hover:bg-[#18203c] rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-2 flex-grow">
              {MOBILE_NAV.map((item) => {
                const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-[#2d3895] text-[#e8eeff]"
                        : "text-[#3c58a7] dark:text-[#b3c2ff] hover:bg-[#f1e5ed] dark:hover:bg-[#18203c]"
                    }`}
                    style={{ fontWeight: isActive ? 600 : 500, fontSize: "14px" }}
                  >
                    <item.icon className={`w-5 h-5 ${isActive ? "text-[#e8eeff]" : "text-[#867bba] dark:text-[#b3c2ff]"}`} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        </div>
      )}
    </div>
  );
}