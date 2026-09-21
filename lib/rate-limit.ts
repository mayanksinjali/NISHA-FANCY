/**
 * Tiny in-memory sliding-window limiter for the admin login.
 *
 * Deliberately dependency-free: the owner panel has one shared password and no
 * user accounts, so the cheapest real hardening is "stop people guessing".
 *
 * Caveats worth knowing before you rely on this:
 *  - State lives in the process. On Vercel, each serverless instance keeps its
 *    own counters, so the effective limit is (attempts × warm instances). That
 *    still turns an unbounded brute-force into a handful of tries per minute,
 *    and it costs nothing.
 *  - It's best-effort by design: a cold start forgets the counters.
 * If you ever need a hard guarantee, move the counters to Postgres/Upstash.
 */

/** How long failures are counted for. */
const WINDOW_MS = 10 * 60 * 1000;
/** Failures allowed inside one window before the key is locked out. */
const MAX_FAILURES = 5;
/** How long a lockout lasts once tripped. */
const LOCKOUT_MS = 15 * 60 * 1000;
/** Hard cap on tracked keys so a flood can't grow the map without bound. */
const MAX_TRACKED_KEYS = 5000;

type Bucket = { failures: number[]; lockedUntil: number };

const buckets = new Map<string, Bucket>();

/** Drop stale state so the map doesn't leak across a long-lived process. */
function prune(now: number): void {
  for (const [key, bucket] of buckets) {
    const newest = bucket.failures[bucket.failures.length - 1] ?? 0;
    const expired = bucket.failures.length === 0 || now - newest > WINDOW_MS;
    if (bucket.lockedUntil <= now && expired) buckets.delete(key);
  }
}

export type RateLimitStatus = {
  /** May this request proceed? */
  allowed: boolean;
  /** Seconds the caller should wait before retrying (0 when allowed). */
  retryAfterSeconds: number;
};

/**
 * Check a key WITHOUT recording anything — call this before doing the
 * expensive/sensitive work, then call `recordFailure` only if it fails.
 */
export function checkRateLimit(key: string, now = Date.now()): RateLimitStatus {
  const bucket = buckets.get(key);
  if (!bucket) return { allowed: true, retryAfterSeconds: 0 };

  if (bucket.lockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((bucket.lockedUntil - now) / 1000),
    };
  }

  const recent = bucket.failures.filter((at) => now - at < WINDOW_MS);
  if (recent.length >= MAX_FAILURES) {
    const unlockAt = recent[0] + WINDOW_MS;
    bucket.lockedUntil = Math.max(unlockAt, now + 1000);
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil((bucket.lockedUntil - now) / 1000),
    };
  }

  return { allowed: true, retryAfterSeconds: 0 };
}

/** Record one failed attempt and trip the lockout once the window is full. */
export function recordFailure(key: string, now = Date.now()): FailureOutcome {
  prune(now);
  if (buckets.size >= MAX_TRACKED_KEYS && !buckets.has(key)) {
    // Oldest insertion wins — Map preserves insertion order.
    const oldest = buckets.keys().next().value;
    if (oldest !== undefined) buckets.delete(oldest);
  }

  const bucket = buckets.get(key) ?? { failures: [], lockedUntil: 0 };
  bucket.failures = [...bucket.failures.filter((at) => now - at < WINDOW_MS), now];
  if (bucket.failures.length >= MAX_FAILURES) {
    bucket.lockedUntil = now + LOCKOUT_MS;
  }
  buckets.set(key, bucket);

  return describeWait(bucket, now);
}

/** Clear the key's history — call after a successful sign-in. */
export function resetRateLimit(key: string): void {
  buckets.delete(key);
}

/** Test-only: wipe every counter. */
export function resetAllRateLimits(): void {
  buckets.clear();
}

function describeWait(bucket: Bucket, now: number): FailureOutcome {
  if (bucket.lockedUntil <= now) {
    const left = MAX_FAILURES - bucket.failures.length;
    return { seconds: 0, remainingAttempts: Math.max(0, left) };
  }
  return {
    seconds: Math.ceil((bucket.lockedUntil - now) / 1000),
    remainingAttempts: 0,
  };
}

/** Shape returned by recordFailure — how long the caller is benched for. */
export type FailureOutcome = {
  /** Lockout time in seconds; 0 while attempts remain. */
  seconds: number;
  /** Attempts left in the window (0 once locked out). */
  remainingAttempts: number;
};

/** "14 minutes" style wording for the login error message. */
export function formatRetryAfter(seconds: number): string {
  if (seconds <= 60) return `${seconds} second${seconds === 1 ? "" : "s"}`;
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}
