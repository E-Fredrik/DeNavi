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
  angpaoStatus: string;
  createdAt: Date;
}

interface LedgerResponse {
  entries: AngpaoEntry[];
  totalCash: number;
  totalGifts: number;
  totalEntries: number;
  noGiftCount: number;
}

// ─── Helper: build display name from firstName + lastName ─────────────────────

function guestDisplayName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim();
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
    return { success: false, error: "Masukkan jumlah uang atau deskripsi hadiah" };
  }

  // No upper limit on amount — only validate it's positive if provided
  if (amount !== null && amount !== undefined) {
    if (amount <= 0) {
      return { success: false, error: "Jumlah harus lebih dari nol" };
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
    return { success: false, error: "Tamu tidak ditemukan" };
  }

  const organizer = await prisma.organizer.findUnique({
    where: { authUserId: session.user.id },
  });

  if (!organizer || guest.event.organizerId !== organizer.id) {
    return { success: false, error: "Unauthorized" };
  }

  const displayName = guestDisplayName(guest.firstName, guest.lastName);

  // Create angpao record and update guest status in a transaction
  const angpao = await prisma.$transaction(async (tx) => {
    const created = await tx.angpao.create({
      data: {
        guestId,
        amount: amount ?? null,
        gift: gift?.trim() || null,
        fromName: fromName?.trim() || displayName,
        status: "SUCCESS",
      },
    });

    // Update guest's angpao status to SUCCESS
    await tx.guest.update({
      where: { id: guestId },
      data: { angpaoStatus: "SUCCESS" },
    });

    return created;
  });

  return { success: true, id: angpao.id };
}

// ─── Submit "No Gift" ─────────────────────────────────────────────────────────
// Marks a guest as having attended but not bringing any gift

export async function submitNoGift(
  guestId: string
): Promise<{ success: boolean; error?: string }> {
  const session = await getSession();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    include: {
      event: {
        include: { organizer: true },
      },
    },
  });

  if (!guest) {
    return { success: false, error: "Tamu tidak ditemukan" };
  }

  const organizer = await prisma.organizer.findUnique({
    where: { authUserId: session.user.id },
  });

  if (!organizer || guest.event.organizerId !== organizer.id) {
    return { success: false, error: "Unauthorized" };
  }

  await prisma.guest.update({
    where: { id: guestId },
    data: { angpaoStatus: "NO_GIFT" },
  });

  return { success: true };
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
    guestName: guestDisplayName(a.guest.firstName, a.guest.lastName),
    eventName: a.guest.event.name,
    eventId: a.guest.event.id,
    amount: a.amount,
    gift: a.gift,
    fromName: a.fromName,
    angpaoStatus: a.status,
    createdAt: a.createdAt,
  }));

  const totalCash = entries.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalGifts = entries.filter((e) => e.gift).length;
  const noGiftCount = entries.filter((e) => e.angpaoStatus === "NO_GIFT").length;

  return {
    entries,
    totalCash,
    totalGifts,
    totalEntries: entries.length,
    noGiftCount,
  };
}
