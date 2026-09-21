import { cookies, headers } from "next/headers";
import { SESSION_COOKIE, verifySessionValue } from "./auth";

/** Is the current request an authenticated admin? (server components/actions) */
export async function isAdminAuthenticated(): Promise<boolean> {
  const store = await cookies();
  return verifySessionValue(store.get(SESSION_COOKIE)?.value);
}

/**
 * Throwing variant. Call at the top of EVERY mutating server action —
 * server actions are public HTTP endpoints, middleware alone doesn't protect them.
 */
export async function requireAdmin(): Promise<void> {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Not authorised — please sign in again.");
  }
}

/**
 * Best-effort client address, used as the rate-limit key for the login form.
 * `x-forwarded-for` is set by Vercel and every other proxy in front of this
 * app; the fallbacks cover other hosts. Callers must treat "unknown" as one
 * shared bucket, not as a per-user identity.
 */
export async function clientIp(): Promise<string> {
  const store = await headers();
  const forwarded = store.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return (
    store.get("x-real-ip")?.trim() ||
    store.get("cf-connecting-ip")?.trim() ||
    "unknown"
  );
}
