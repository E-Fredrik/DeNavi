import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: Request, { params }: { params: Promise<{ organizerId: string }> }) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { organizerId } = await params;

    const organizer = await prisma.organizer.findUnique({
      where: { id: organizerId },
      include: {
        events: {
          orderBy: { date: "desc" },
          include: {
            _count: {
              select: { guests: true }
            }
          }
        }
      }
    });

    if (!organizer) {
      return NextResponse.json({ error: "Organizer not found" }, { status: 404 });
    }

    return NextResponse.json(organizer);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch organizer details" }, { status: 500 });
  }
}
