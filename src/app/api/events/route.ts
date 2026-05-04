import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/events — list events for the current organizer
export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const organizer = await prisma.organizer.findUnique({
    where: { authUserId: session.user.id },
  });

  if (!organizer) {
    return NextResponse.json([]);
  }

  const events = await prisma.event.findMany({
    where: { organizerId: organizer.id },
    include: {
      guests: true,
      eventAddons: true,
    },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(events);
}

// POST /api/events — create a new event
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const organizer = await prisma.organizer.findUnique({
    where: { authUserId: session.user.id },
  });

  if (!organizer) {
    return NextResponse.json({ error: "No organizer profile" }, { status: 400 });
  }

  const body = await request.json();
  const { name, date, expectedGuests, addonIds } = body;

  if (!name || !date) {
    return NextResponse.json({ error: "Name and date are required" }, { status: 400 });
  }

  // Base token cost based on expected guests
  let tokenCost = Math.max(1, Math.ceil((expectedGuests ?? 100) / 50));

  // Add-ons cost calculation
  let selectedAddons: any[] = [];
  if (addonIds && Array.isArray(addonIds) && addonIds.length > 0) {
    selectedAddons = await prisma.addon.findMany({
      where: { id: { in: addonIds } }
    });
    const addonCost = selectedAddons.reduce((acc, curr) => acc + curr.tokenCost, 0);
    tokenCost += addonCost;
  }

  if (organizer.tokenBalance < tokenCost) {
    return NextResponse.json({ error: "Insufficient tokens" }, { status: 400 });
  }

  // Create event and deduct tokens in a transaction
  const [event] = await prisma.$transaction([
    prisma.event.create({
      data: {
        organizerId: organizer.id,
        name,
        date: new Date(date),
        tokenCost,
        eventAddons: {
          create: selectedAddons.map(addon => ({
            addonId: addon.id
          }))
        }
      },
      include: { guests: true, eventAddons: true },
    }),
    prisma.organizer.update({
      where: { id: organizer.id },
      data: { tokenBalance: { decrement: tokenCost } },
    }),
  ]);

  return NextResponse.json(event, { status: 201 });
}
