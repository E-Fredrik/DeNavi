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

  // Auto-create organizer if none exists
  if (!organizer) {
    organizer = await prisma.organizer.create({
      data: {
        name: session.user.name ?? "Organizer",
        email: session.user.email,
        authUserId: userId,
        authProvider: "BETTER_AUTH",
        tokenBalance: 5, // starter tokens
      },
    });
  }

  return NextResponse.json(organizer);
}
