import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

// POST /api/events/[eventId]/guests/[guestId]/check-in
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string; guestId: string }> }
) {
  const session = await getSession();

  const { eventId, guestId } = await params;
  let body: any = {};
  try {
    body = await request.json();
  } catch {}

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { organizer: true },
  });

  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Authorization check (either session or event password or global password)
  let authorized = false;
  if (session?.user) {
    const organizer = await prisma.organizer.findUnique({
      where: { authUserId: session.user.id },
    });
    if (organizer && event.organizerId === organizer.id) {
      authorized = true;
    }
  }

  if (!authorized && body.password) {
    if (event.checkInPassword && body.password === event.checkInPassword) {
      authorized = true;
    } else if (event.organizer?.globalCheckInPassword && body.password === event.organizer.globalCheckInPassword) {
      authorized = true;
    }
  }

  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized or invalid password" }, { status: 401 });
  }

  const guest = await prisma.guest.findFirst({
    where: { id: guestId, eventId },
    include: { angpaos: true },
  });

  if (!guest) {
    return NextResponse.json({ error: "Guest not found" }, { status: 404 });
  }

  let actualAttendees = guest.partySize;
  if (body.actualAttendees !== undefined) {
    actualAttendees = Number(body.actualAttendees);
  }

  // Update check-in status and actual attendees
  const updatedGuest = await prisma.guest.update({
    where: { id: guestId },
    data: {
      hasCheckedIn: true,
      checkInTime: guest.checkInTime || new Date(),
      actualAttendees,
    },
  });

  // Track angpao if provided
  if (body.angpaoAmount || body.angpaoGift) {
    await prisma.angpao.create({
      data: {
        guestId: guest.id,
        amount: body.angpaoAmount ? Number(body.angpaoAmount) : null,
        gift: body.angpaoGift || null,
        fromName: body.angpaoFromName || guest.name,
      }
    });
  }

  return NextResponse.json(updatedGuest);
}
