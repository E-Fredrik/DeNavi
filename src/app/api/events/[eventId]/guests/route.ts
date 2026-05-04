import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

function generateQR(): string {
  return `QR-${crypto.randomUUID().substring(0, 8).toUpperCase()}`;
}

// POST /api/events/[eventId]/guests — add a guest
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId } = await params;

  // Verify ownership
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
  const { name, isPlusOne, partySize, tableNumber } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Guest name is required" }, { status: 400 });
  }

  const guest = await prisma.guest.create({
    data: {
      eventId,
      name: name.trim(),
      qrTicket: generateQR(),
      partySize: Math.max(1, Number(partySize) || 1),
      tableNumber: tableNumber?.trim() || null,
      isPlusOne: isPlusOne ?? false,
    },
  });

  return NextResponse.json(guest, { status: 201 });
}

// PATCH /api/events/[eventId]/guests — update a guest (for seating, party size edits)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId } = await params;

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
  const { guestId, tableNumber, partySize, name } = body;

  if (!guestId) {
    return NextResponse.json({ error: "Guest ID is required" }, { status: 400 });
  }

  const guest = await prisma.guest.findFirst({
    where: { id: guestId, eventId },
  });

  if (!guest) {
    return NextResponse.json({ error: "Guest not found" }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {};
  if (tableNumber !== undefined) updateData.tableNumber = tableNumber?.trim() || null;
  if (partySize !== undefined) updateData.partySize = Math.max(1, Number(partySize) || 1);
  if (name !== undefined) updateData.name = name.trim();
  if (body.hasCheckedIn !== undefined) {
    updateData.hasCheckedIn = body.hasCheckedIn;
    updateData.actualAttendees = body.hasCheckedIn ? (body.actualAttendees ?? guest.partySize) : 0;
    updateData.checkInTime = body.hasCheckedIn ? new Date() : null;
  } else if (body.actualAttendees !== undefined) {
    updateData.actualAttendees = body.actualAttendees;
  }

  const updated = await prisma.guest.update({
    where: { id: guestId },
    data: updateData,
  });

  return NextResponse.json(updated);
}

// DELETE /api/events/[eventId]/guests — delete a guest
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId } = await params;

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

  const url = new URL(request.url);
  const guestId = url.searchParams.get("guestId");

  if (!guestId) {
    return NextResponse.json({ error: "Guest ID is required" }, { status: 400 });
  }

  const guest = await prisma.guest.findFirst({
    where: { id: guestId, eventId },
  });

  if (!guest) {
    return NextResponse.json({ error: "Guest not found" }, { status: 404 });
  }

  await prisma.guest.delete({
    where: { id: guestId },
  });

  return NextResponse.json({ success: true });
}
