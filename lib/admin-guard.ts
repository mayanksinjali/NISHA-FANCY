import { cookies } from "next/headers";
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
