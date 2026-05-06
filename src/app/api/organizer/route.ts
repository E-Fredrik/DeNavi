import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

// GET /api/organizer — get or auto-create the organizer for the current user
export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Try to find existing organizer linked to this user
  let organizer = await prisma.organizer.findUnique({
    where: { authUserId: userId },
  });

  // Auto-create organizer if none exists (handles users who registered before the pivot)
  if (!organizer) {
    // Fetch the full user record to get the new fields
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const displayName = user
      ? (user.organizerName || user.name || "Organizer")
      : "Organizer";

    organizer = await prisma.organizer.create({
      data: {
        name: displayName,
        email: session.user.email,
        authUserId: userId,
        authProvider: "BETTER_AUTH",
        tokenBalance: 1,
      },
    });
  }

  return NextResponse.json(organizer);
}

// PATCH /api/organizer — update organizer profile
export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let organizer = await prisma.organizer.findUnique({
    where: { authUserId: session.user.id },
  });

  if (!organizer) {
    return NextResponse.json({ error: "Organizer not found" }, { status: 404 });
  }

  const body = await request.json();
  const { whatsapp, globalCheckInPassword } = body;

  organizer = await prisma.organizer.update({
    where: { id: organizer.id },
    data: {
      ...(whatsapp !== undefined && { whatsapp }),
      ...(globalCheckInPassword !== undefined && { globalCheckInPassword }),
    },
  });

  return NextResponse.json(organizer);
}
