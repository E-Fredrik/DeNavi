import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const organizers = await prisma.organizer.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { events: true }
        }
      }
    });

    return NextResponse.json(organizers);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch organizers" }, { status: 500 });
  }
}
