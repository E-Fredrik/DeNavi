"use client";
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { Organizer } from "./types";
import { db } from "./db";

interface AuthState {
  organizer: Organizer | null;
  login: (accessCode: string) => Organizer | null;
  logout: () => void;
  refresh: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [organizer, setOrganizer] = useState<Organizer | null>(null);

  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const saved = sessionStorage.getItem("navi_org_id");
      if (saved) setOrganizer(db.getOrganizer(saved));
    } catch (e) {
      // ignore (e.g., storage unavailable)
    }
  }, []);

  const login = useCallback((accessCode: string): Organizer | null => {
    const org = db.findOrganizerByAccessCode(accessCode.trim().toUpperCase());
    if (org) {
      try {
        if (typeof window !== "undefined") sessionStorage.setItem("navi_org_id", org.id);
      } catch {}
      setOrganizer(org);
    }
    return org;
  }, []);

  const logout = useCallback(() => {
    try {
      if (typeof window !== "undefined") sessionStorage.removeItem("navi_org_id");
    } catch {}
    setOrganizer(null);
  }, []);

  const refresh = useCallback(() => {
    if (organizer) {
      const updated = db.getOrganizer(organizer.id);
      if (updated) setOrganizer(updated);
    }
  }, [organizer]);

  return (
    <AuthContext.Provider value={{ organizer, login, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
