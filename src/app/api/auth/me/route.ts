import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/auth/me — returns the full user record for the current session.
 * Used after sign-up to retrieve the generated access code.
 */
export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      accountType: true,
      organizerName: true,
      accessCode: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
}
