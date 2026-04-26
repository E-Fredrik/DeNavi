import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

// POST /api/events/[eventId]/guests/[guestId]/check-in
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; guestId: string }> }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { eventId, guestId } = await params;

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

  const guest = await prisma.guest.findFirst({
    where: { id: guestId, eventId },
  });

  if (!guest) {
    return NextResponse.json({ error: "Guest not found" }, { status: 404 });
  }

  if (guest.hasCheckedIn) {
    return NextResponse.json({ error: "Already checked in" }, { status: 400 });
  }

  let actualAttendees = guest.partySize;
  try {
    const body = await request.json();
    if (body.actualAttendees !== undefined) {
      actualAttendees = Number(body.actualAttendees);
    }
  } catch {
    // If no body provided, fallback to partySize
  }

  const updated = await prisma.guest.update({
    where: { id: guestId },
    data: {
      hasCheckedIn: true,
      checkInTime: new Date(),
      actualAttendees,
    },
  });

  return NextResponse.json(updated);
}
