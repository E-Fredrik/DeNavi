import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const addons = await prisma.addon.findMany({
      orderBy: { tokenCost: 'desc' }
    });
    return NextResponse.json(addons);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch addons" }, { status: 500 });
  }
}
