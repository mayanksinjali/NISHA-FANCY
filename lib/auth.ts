/**
 * Phase 1 admin auth: ONE shared password from the ADMIN_PASSWORD env var.
 *
 * On successful login we set an httpOnly cookie containing `expiry.signature`,
 * where the signature is an HMAC-SHA256 of the expiry keyed by ADMIN_PASSWORD.
 * The cookie therefore can't be forged without the password, and rotating
 * ADMIN_PASSWORD instantly invalidates every existing session.
 *
 * This file stays free of `next/headers` on purpose so Edge middleware can
 * import it. Cookie reading lives in lib/admin-guard.ts.
 */

export const SESSION_COOKIE = "store_admin_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 14; // 14 days — phone-friendly

function password(): string {
  return process.env.ADMIN_PASSWORD ?? "";
}

export function isAdminPasswordConfigured(): boolean {
  return password().length > 0;
}

async function sign(payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return [...new Uint8Array(mac)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Early-exit-free string compare. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function checkPassword(candidate: string): Promise<boolean> {
  if (!isAdminPasswordConfigured()) return false;
  // Compare HMACs rather than raw strings: constant length, no length leak.
  const [a, b] = await Promise.all([sign(candidate), sign(password())]);
  return safeEqual(a, b);
}

export async function createSessionValue(): Promise<string> {
  const expiry = String(Date.now() + SESSION_MAX_AGE * 1000);
  return `${expiry}.${await sign(expiry)}`;
}

export async function verifySessionValue(
  value: string | undefined,
): Promise<boolean> {
  if (!value || !isAdminPasswordConfigured()) return false;
  const [expiry, signature] = value.split(".");
  if (!expiry || !signature) return false;
  if (!/^\d+$/.test(expiry) || Number(expiry) < Date.now()) return false;
  return safeEqual(await sign(expiry), signature);
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
};
