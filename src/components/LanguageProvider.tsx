"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Language = "en" | "id";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    "dashboard.title": "Dashboard",
    "nav.home": "Home",
    "nav.events": "Events",
    "nav.tokens": "Tokens",
    "nav.angpao": "Angpao Ledger",
    "nav.whatsapp": "WhatsApp Blast",
    "a11y.toggle": "Accessibility Mode",
    "a11y.active": "Accessibility Mode: ON",
    "a11y.desc": "Larger text, clearer labels, high contrast. Tap again to turn off.",
    "angpao.title": "Angpao & Gift Ledger",
    "angpao.desc": "All angpaos and physical gifts received from all your events are recorded here for full accountability.",
    "angpao.totalCash": "TOTAL CASH RECEIVED",
    "angpao.totalGifts": "PHYSICAL GIFTS",
    "angpao.totalEntries": "TOTAL ENTRIES",
    "angpao.showing": "SHOWING",
    "angpao.search": "Search by guest name or sender...",
    "angpao.export": "Export CSV",
    "angpao.col.guest": "GUEST",
    "angpao.col.from": "FROM",
    "angpao.col.event": "EVENT",
    "angpao.col.cash": "CASH AMOUNT",
    "angpao.col.gift": "PHYSICAL GIFT",
    "angpao.col.date": "DATE",
    "angpao.empty": "No angpao or gift records found.",
    "angpao.total": "Total",
    "angpao.giftSuffix": "gifts",
    "event.back": "Back to event list",
    "event.addGuest": "Add Guest",
    "event.seating": "Seating Map",
    "event.venueBuilder": "Venue Builder",
    "event.emailBuilder": "Email Builder",
    "event.locked": "Locked: Needs Custom Email Template Addon",
    "event.security": "Security",
    "event.export": "Export",
    "event.stats.invites": "Invites",
    "event.stats.totalGuests": "Total Guests",
    "event.stats.checkedIn": "Checked In",
    "event.stats.avgParty": "Avg Party Size",
    "event.stats.totalAngpao": "Total Angpao",
    "event.stats.totalGifts": "Physical Gifts",
    "event.mode.search": "Search",
    "event.mode.scan": "Scan QR",
    "event.scan.manual": "Or enter code manually",
    "event.scan.placeholder": "Enter QR ticket code",
    "event.scan.verify": "Verify",
    "event.search.placeholder": "Search guest name...",
    "event.list.invite": "Invite",
    "event.list.edit": "Edit",
    "event.list.present": "PRESENT",
    "event.list.checkin": "Check In",
    "event.list.empty": "No guests found. Add your first guest!",
  },
  id: {
    "dashboard.title": "Dasbor",
    "nav.home": "Beranda",
    "nav.events": "Acara",
    "nav.tokens": "Token",
    "nav.angpao": "Buku Angpao",
    "nav.whatsapp": "WhatsApp Blast",
    "a11y.toggle": "Mode Aksesibilitas",
    "a11y.active": "Mode Aksesibilitas: AKTIF",
    "a11y.desc": "Teks lebih besar, label lebih jelas, kontras tinggi. Ketuk lagi untuk mematikan.",
    "angpao.title": "Buku Angpao & Hadiah",
    "angpao.desc": "Semua angpao dan hadiah yang diterima dari semua acara Anda — tercatat dengan detail untuk akuntabilitas.",
    "angpao.totalCash": "TOTAL UANG DITERIMA",
    "angpao.totalGifts": "HADIAH FISIK",
    "angpao.totalEntries": "TOTAL CATATAN",
    "angpao.showing": "MENAMPILKAN",
    "angpao.search": "Cari berdasarkan nama tamu atau pengirim...",
    "angpao.export": "Ekspor CSV",
    "angpao.col.guest": "TAMU",
    "angpao.col.from": "DARI",
    "angpao.col.event": "ACARA",
    "angpao.col.cash": "JUMLAH UANG",
    "angpao.col.gift": "HADIAH FISIK",
    "angpao.col.date": "TANGGAL",
    "angpao.empty": "Tidak ada catatan angpao atau hadiah yang ditemukan.",
    "angpao.total": "Total",
    "angpao.giftSuffix": "hadiah",
    "event.back": "Kembali ke daftar acara",
    "event.addGuest": "Tambah Tamu",
    "event.seating": "Denah Tempat Duduk",
    "event.venueBuilder": "Pembuat Denah",
    "event.emailBuilder": "Pembuat Email",
    "event.locked": "Terkunci: Butuh Addon Email Kustom",
    "event.security": "Keamanan",
    "event.export": "Ekspor",
    "event.stats.invites": "Undangan",
    "event.stats.totalGuests": "Total Tamu",
    "event.stats.checkedIn": "Sudah Check-In",
    "event.stats.avgParty": "Rata-rata Rombongan",
    "event.stats.totalAngpao": "Total Angpao",
    "event.stats.totalGifts": "Hadiah Fisik",
    "event.mode.search": "Pencarian",
    "event.mode.scan": "Pindai QR",
    "event.scan.manual": "Atau masukkan kode secara manual",
    "event.scan.placeholder": "Masukkan kode tiket QR",
    "event.scan.verify": "Verifikasi",
    "event.search.placeholder": "Cari nama tamu...",
    "event.list.invite": "Undang",
    "event.list.edit": "Edit",
    "event.list.present": "HADIR",
    "event.list.checkin": "Check In",
    "event.list.empty": "Belum ada tamu. Tambahkan tamu pertama Anda!",
  }
};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check localStorage for a11y mode which maps to language per user preference
    const storedA11y = localStorage.getItem("navi-accessible-mode");
    if (storedA11y === "true") {
      setLanguage("id"); // Accessibility mode switches to Indonesian by default
    } else {
      setLanguage("en");
    }
    setIsLoaded(true);
  }, []);

  // Sync language when a11y mode changes
  useEffect(() => {
    const handleStorageChange = () => {
      const storedA11y = localStorage.getItem("navi-accessible-mode");
      if (storedA11y === "true") {
        setLanguage("id");
      } else {
        setLanguage("en");
      }
    };
    window.addEventListener("storage", handleStorageChange);
    // Custom event dispatching from layout.tsx
    window.addEventListener("navi-a11y-toggled", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("navi-a11y-toggled", handleStorageChange);
    };
  }, []);

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  if (!isLoaded) return null; // Avoid hydration mismatch

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
