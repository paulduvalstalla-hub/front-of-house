import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

// Optimistic check only: the dashboard is a demo with no server-side user data.
export function proxy(request: NextRequest) {
  if (!request.cookies.get(SESSION_COOKIE)?.value) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/onboarding"],
};
