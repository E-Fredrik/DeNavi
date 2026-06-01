import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/events/[eventId]/venue-layout — get the venue layout config
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
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

  const event = await prisma.event.findFirst({
    where: { id: eventId, organizerId: organizer.id },
    select: {
      id: true,
      name: true,
      seatingMode: true,
      venueLayoutConfig: true,
    },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  return NextResponse.json(event);
}

// PUT /api/events/[eventId]/venue-layout — save/update the venue layout config
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const { eventId } = await params;
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

  const event = await prisma.event.findFirst({
    where: { id: eventId, organizerId: organizer.id },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const body = await request.json();
  const { venueLayoutConfig } = body;

  const updated = await prisma.event.update({
    where: { id: eventId },
    data: { venueLayoutConfig: venueLayoutConfig ?? null },
    select: {
      id: true,
      name: true,
      seatingMode: true,
      venueLayoutConfig: true,
    },
  });

  return NextResponse.json(updated);
}
