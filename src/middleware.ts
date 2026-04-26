import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const sessionCookie =
    request.cookies.get("better-auth.session_token") ??
    request.cookies.get("__Secure-better-auth.session_token");

  const { pathname } = request.nextUrl;

  // Protect all /admin routes — redirect to sign-in if no session cookie
  if (pathname.startsWith("/admin")) {
    if (!sessionCookie) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  // If already signed in, redirect away from auth pages
  if (pathname.startsWith("/sign-in") || pathname.startsWith("/sign-up")) {
    if (sessionCookie) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/sign-in", "/sign-up"],
};
