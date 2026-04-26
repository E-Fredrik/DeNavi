import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

// POST /api/tokens — buy tokens (demo: instantly adds them)
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const organizer = await prisma.organizer.findUnique({
    where: { authUserId: session.user.id },
  });

  if (!organizer) {
    return NextResponse.json({ error: "No organizer profile" }, { status: 400 });
  }

  const body = await request.json();
  const amount = Math.max(1, Math.min(50, Number(body.amount) || 1));

  const updated = await prisma.organizer.update({
    where: { id: organizer.id },
    data: { tokenBalance: { increment: amount } },
  });

  return NextResponse.json(updated);
}
