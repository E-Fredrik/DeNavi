import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/auth/access-code
 *
 * Logs in an organizer using their unique access code.
 * Creates a session directly in the DB and sets the cookie.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessCode } = body;

    if (!accessCode || typeof accessCode !== "string") {
      return NextResponse.json(
        { error: "Access code is required" },
        { status: 400 }
      );
    }

    const code = accessCode.trim().toUpperCase();

    // Look up the user by their access code
    const user = await prisma.user.findUnique({
      where: { accessCode: code },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid access code. Please check and try again." },
        { status: 401 }
      );
    }

    if (user.accountType !== "ORGANIZER") {
      return NextResponse.json(
        { error: "This access code is not associated with an organizer account." },
        { status: 403 }
      );
    }

    // Create the session directly via Prisma (bypasses password requirement)
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.session.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        token: sessionToken,
        expiresAt,
        ipAddress: request.headers.get("x-forwarded-for") || null,
        userAgent: request.headers.get("user-agent") || null,
      },
    });

    // Update the organizer sign-in metadata
    const organizer = await prisma.organizer.findUnique({
      where: { authUserId: user.id },
    });

    if (organizer) {
      await prisma.organizer.update({
        where: { id: organizer.id },
        data: {
          lastSignInAt: new Date(),
          signInCount: { increment: 1 },
        },
      });

      // Log the sign-in event
      await prisma.signInEvent.create({
        data: {
          organizerId: organizer.id,
          provider: "ACCESS_CODE",
          authUserId: user.id,
          ipAddress: request.headers.get("x-forwarded-for") || null,
          userAgent: request.headers.get("user-agent") || null,
        },
      });
    }

    // Set the session cookie — Better Auth uses "better-auth.session_token"
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        accountType: user.accountType,
        organizerName: user.organizerName,
      },
    });

    response.cookies.set("better-auth.session_token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return response;
  } catch (error: unknown) {
    console.error("Access code login error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
