import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionValue } from "./lib/auth";

/**
 * Gate every /admin route except the login screen (/admin itself renders the
 * login form when there's no valid session). Each admin page and server action
 * re-checks auth as well — middleware is convenience, not the only lock.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin") return NextResponse.next();

  const authed = await verifySessionValue(
    request.cookies.get(SESSION_COOKIE)?.value,
  );
  if (authed) return NextResponse.next();

  const loginUrl = new URL("/admin", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
