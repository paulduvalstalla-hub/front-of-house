import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySession } from "@/lib/session";

// The dashboard and onboarding need a valid signed session: a real account or a demo visit.
// The app layout checks the session again on the server; this just redirects early.
export async function proxy(request: NextRequest) {
  const session = await verifySession(request.cookies.get(SESSION_COOKIE)?.value);
  if (!session) {
    const url = new URL("/sign-in", request.url);
    url.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  // Setting up a real restaurant needs an account to save it to; the demo always uses the sample.
  if (session.kind === "demo" && request.nextUrl.pathname.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/sign-up", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/onboarding"],
};
