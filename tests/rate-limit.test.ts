import { beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  checkRateLimit,
  formatRetryAfter,
  recordFailure,
  resetAllRateLimits,
  resetRateLimit,
} from "../lib/rate-limit.ts";

const MINUTE = 60 * 1000;

describe("rate limit", () => {
  beforeEach(() => resetAllRateLimits());

  it("allows the first attempts", () => {
    const now = 1_000_000;
    assert.equal(checkRateLimit("ip", now).allowed, true);
    for (let i = 0; i < 4; i++) {
      const outcome = recordFailure("ip", now);
      assert.equal(outcome.seconds, 0);
      assert.equal(checkRateLimit("ip", now).allowed, true);
    }
  });

  it("locks out on the fifth failure", () => {
    const now = 1_000_000;
    for (let i = 0; i < 5; i++) recordFailure("ip", now);

    const status = checkRateLimit("ip", now);
    assert.equal(status.allowed, false);
    assert.ok(status.retryAfterSeconds > 0);
  });

  it("keeps other keys unaffected", () => {
    const now = 1_000_000;
    for (let i = 0; i < 5; i++) recordFailure("attacker", now);
    assert.equal(checkRateLimit("attacker", now).allowed, false);
    assert.equal(checkRateLimit("owner", now).allowed, true);
  });

  it("forgets failures once the window slides past them", () => {
    const start = 1_000_000;
    for (let i = 0; i < 4; i++) recordFailure("ip", start);
    // A minute of silence, four more slow guesses, then another quiet spell.
    for (let i = 0; i < 4; i++) recordFailure("ip", start + 2 * MINUTE);
    const later = start + 25 * MINUTE;
    assert.equal(checkRateLimit("ip", later).allowed, true);
  });

  it("unlocks itself after the lockout expires", () => {
    const now = 1_000_000;
    for (let i = 0; i < 5; i++) recordFailure("ip", now);
    assert.equal(checkRateLimit("ip", now).allowed, false);
    assert.equal(checkRateLimit("ip", now + 16 * MINUTE).allowed, true);
  });

  it("clears the history on a successful sign-in", () => {
    const now = 1_000_000;
    for (let i = 0; i < 5; i++) recordFailure("ip", now);
    resetRateLimit("ip");
    assert.equal(checkRateLimit("ip", now).allowed, true);
  });
});

describe("formatRetryAfter", () => {
  it("reads naturally for seconds and minutes", () => {
    assert.equal(formatRetryAfter(1), "1 second");
    assert.equal(formatRetryAfter(45), "45 seconds");
    assert.equal(formatRetryAfter(60), "60 seconds");
    assert.equal(formatRetryAfter(61), "2 minutes");
    assert.equal(formatRetryAfter(900), "15 minutes");
  });
});
