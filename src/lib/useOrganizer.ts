"use client";

import { useCallback, useMemo, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { db } from "./db";
import type { Organizer } from "./types";

function getOrganizerForSignedInUser(): Organizer | null {
  // Demo app mapping: one signed-in account controls the seeded organizer.
  return db.getOrganizer("org-001");
}

interface OrganizerState {
  organizer: Organizer | null;
  refresh: () => void;
  isLoaded: boolean;
  isSignedIn: boolean;
}

export function useOrganizer(): OrganizerState {
  const { isLoaded, isSignedIn } = useUser();
  const [version, setVersion] = useState(0);

  const organizer = useMemo(() => {
    if (!isLoaded || !isSignedIn) return null;
    return getOrganizerForSignedInUser();
  }, [isLoaded, isSignedIn, version]);

  const refresh = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  return {
    organizer,
    refresh,
    isLoaded,
    isSignedIn: Boolean(isSignedIn),
  };
}
