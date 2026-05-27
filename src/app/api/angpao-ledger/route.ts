import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/angpao-ledger — get all angpao records for the organizer
export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const organizer = await prisma.organizer.findUnique({
    where: { authUserId: session.user.id },
  });

  if (!organizer) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
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

  const entries = angpaos.map((a) => ({
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

  return NextResponse.json({
    entries,
    totalCash,
    totalGifts,
    totalEntries: entries.length,
  });
}
