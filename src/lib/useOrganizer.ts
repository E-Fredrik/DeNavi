"use client";

import { useCallback, useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";

interface Organizer {
  id: string;
  name: string;
  whatsapp: string | null;
  accessCode: string | null;
  email: string | null;
  tokenBalance: number;
  createdAt: string;
  updatedAt: string;
}

interface OrganizerState {
  organizer: Organizer | null;
  refresh: () => void;
  isLoaded: boolean;
  isSignedIn: boolean;
}

export function useOrganizer(): OrganizerState {
  const { data: session, isPending } = useSession();
  const isSignedIn = !!session?.user;
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [fetched, setFetched] = useState(false);

  const fetchOrganizer = useCallback(async () => {
    try {
      const res = await fetch("/api/organizer");
      if (res.ok) {
        const data = await res.json();
        setOrganizer(data);
      }
    } catch {
      // silently fail
    } finally {
      setFetched(true);
    }
  }, []);

  useEffect(() => {
    if (!isPending && isSignedIn) {
      fetchOrganizer();
    } else if (!isPending && !isSignedIn) {
      setOrganizer(null);
      setFetched(true);
    }
  }, [isPending, isSignedIn, fetchOrganizer]);

  const refresh = useCallback(() => {
    fetchOrganizer();
  }, [fetchOrganizer]);

  return {
    organizer,
    refresh,
    isLoaded: !isPending && fetched,
    isSignedIn,
  };
}
