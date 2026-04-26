import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

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
  const { name, date, expectedGuests } = body;

  if (!name || !date) {
    return NextResponse.json({ error: "Name and date are required" }, { status: 400 });
  }

  const tokenCost = Math.max(1, Math.ceil((expectedGuests ?? 100) / 50));

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
      },
      include: { guests: true },
    }),
    prisma.organizer.update({
      where: { id: organizer.id },
      data: { tokenBalance: { decrement: tokenCost } },
    }),
  ]);

  return NextResponse.json(event, { status: 201 });
}
