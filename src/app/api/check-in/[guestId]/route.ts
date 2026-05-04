import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ guestId: string }> }
) {
  try {
    const { guestId } = await params;
    
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: {
        event: {
          include: {
            eventAddons: {
              include: {
                addon: true
              }
            }
          }
        }
      }
    });

    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    // Only return safe information (don't expose tokens or passwords)
    return NextResponse.json({
      id: guest.id,
      name: guest.name,
      partySize: guest.partySize,
      actualAttendees: guest.actualAttendees,
      tableNumber: guest.tableNumber,
      hasCheckedIn: guest.hasCheckedIn,
      checkInTime: guest.checkInTime,
      eventId: guest.event.id,
      eventName: guest.event.name,
      eventDate: guest.event.date,
      hasAngpaoTracker: guest.event.eventAddons.some(a => a.addon.id === "angpao_tracking")
    });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
