import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ guestId: string }> }
) {
  try {
    const { guestId } = await params;
    
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: {
        event: {
          include: {
            guests: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                tableNumber: true,
                seatNumber: true
              }
            }
          }
        }
      }
    });

    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    return NextResponse.json(guest);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ guestId: string }> }
) {
  try {
    const { guestId } = await params;
    const body = await request.json();
    const { tableNumber, seatNumber } = body;

    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
      include: { event: true }
    });

    if (!guest) {
      return NextResponse.json({ error: "Guest not found" }, { status: 404 });
    }

    const isPreset = guest.tableNumber && guest.seatNumber;
    if (isPreset) {
      return NextResponse.json({ error: "Your seat is already assigned by the organizer." }, { status: 400 });
    }

    if (guest.tableNumber && guest.tableNumber !== tableNumber) {
      return NextResponse.json({ error: "You can only select a seat at your assigned table." }, { status: 400 });
    }

    // Check if the seat is already taken
    const existing = await prisma.guest.findFirst({
      where: {
        eventId: guest.eventId,
        tableNumber: tableNumber,
        seatNumber: seatNumber.toString(),
        id: { not: guestId }
      }
    });

    if (existing) {
      return NextResponse.json({ error: "Kursi ini sudah dipesan oleh tamu lain" }, { status: 400 });
    }

    const updatedGuest = await prisma.guest.update({
      where: { id: guestId },
      data: {
        tableNumber: tableNumber,
        seatNumber: seatNumber.toString()
      }
    });

    return NextResponse.json(updatedGuest);
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
