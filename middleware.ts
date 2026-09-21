import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionValue } from "./lib/auth";

/**
 * Gate every /owner route except the login screen (/owner itself renders the
 * login form when there's no valid session). Each owner page and server action
 * re-checks auth as well — middleware is convenience, not the only lock.
 */
/**
 * Installable-PWA plumbing that must stay reachable while signed out: the
 * manifest advertises the owner app, and the service worker + offline shell
 * make it installable. All three are static, non-sensitive files.
 */
const PUBLIC_OWNER_FILES = new Set([
  "/owner/sw.js",
  "/owner/offline.html",
  "/owner/manifest.webmanifest",
]);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/owner") return NextResponse.next();
  if (PUBLIC_OWNER_FILES.has(pathname)) return NextResponse.next();

  const authed = await verifySessionValue(
    request.cookies.get(SESSION_COOKIE)?.value,
  );
  if (authed) return NextResponse.next();

  const loginUrl = new URL("/owner", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/owner/:path*"],
};
