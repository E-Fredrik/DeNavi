"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AngpaoEntry {
  id: string;
  guestName: string;
  eventName: string;
  eventId: string;
  amount: number | null;
  gift: string | null;
  fromName: string | null;
  createdAt: Date;
}

interface LedgerResponse {
  entries: AngpaoEntry[];
  totalCash: number;
  totalGifts: number;
  totalEntries: number;
}

// ─── Submit Custom Angpao ─────────────────────────────────────────────────────
// No fixed nominal limit — accepts any positive integer amount in IDR

export async function submitCustomAngpao(
  guestId: string,
  amount: number | null,
  gift: string | null,
  fromName: string | null
): Promise<{ success: boolean; id?: string; error?: string }> {
  const session = await getSession();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  // Validate: at least one of amount or gift must be provided
  if (!amount && !gift) {
    return { success: false, error: "Please provide an amount or gift description" };
  }

  // No upper limit on amount — only validate it's positive if provided
  if (amount !== null && amount !== undefined) {
    if (amount <= 0) {
      return { success: false, error: "Amount must be a positive number" };
    }
  }

  // Verify the guest exists and organizer owns the event
  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    include: {
      event: {
        include: { organizer: true },
      },
    },
  });

  if (!guest) {
    return { success: false, error: "Guest not found" };
  }

  const organizer = await prisma.organizer.findUnique({
    where: { authUserId: session.user.id },
  });

  if (!organizer || guest.event.organizerId !== organizer.id) {
    return { success: false, error: "Unauthorized" };
  }

  const angpao = await prisma.angpao.create({
    data: {
      guestId,
      amount: amount ?? null,
      gift: gift?.trim() || null,
      fromName: fromName?.trim() || guest.name,
    },
  });

  return { success: true, id: angpao.id };
}

// ─── Get Angpao Ledger ────────────────────────────────────────────────────────
// Aggregated ledger data across all events for the organizer

export async function getAngpaoLedger(): Promise<LedgerResponse> {
  const session = await getSession();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const organizer = await prisma.organizer.findUnique({
    where: { authUserId: session.user.id },
  });

  if (!organizer) {
    throw new Error("Organizer not found");
  }

  const angpaos = await prisma.angpao.findMany({
    where: {
      guest: {
        event: {
          organizerId: organizer.id,
        },
      },
    },
    include: {
      guest: {
        include: {
          event: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const entries: AngpaoEntry[] = angpaos.map((a) => ({
    id: a.id,
    guestName: a.guest.name,
    eventName: a.guest.event.name,
    eventId: a.guest.event.id,
    amount: a.amount,
    gift: a.gift,
    fromName: a.fromName,
    createdAt: a.createdAt,
  }));

  const totalCash = entries.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalGifts = entries.filter((e) => e.gift).length;

  return {
    entries,
    totalCash,
    totalGifts,
    totalEntries: entries.length,
  };
}
