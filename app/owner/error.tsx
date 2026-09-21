"use client";

import { useEffect } from "react";
import Link from "next/link";

/**
 * Owner-panel error boundary. A failed save or a Supabase hiccup on
 * /owner/* lands here instead of Next's default error screen, with a retry
 * that re-runs the render.
 */
export default function OwnerError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[owner] render error:", error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-sm flex-col justify-center px-6 py-16">
      <div className="admin-card px-6 py-6 text-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
          Owner panel
        </p>
        <h1 className="mt-3 text-lg font-semibold leading-tight">
          Something went wrong
        </h1>
        <p className="mt-2 text-xs leading-relaxed text-ink-soft">
          Your last change may not have saved. Try again — if it keeps failing,
          check that Supabase is reachable.
        </p>
        <div className="mt-6 grid gap-2">
          <button
            type="button"
            onClick={reset}
            className="w-full rounded-full bg-blue-600 py-3 text-xs font-semibold uppercase tracking-wide text-white transition-colors hover:bg-blue-700"
          >
            Try again
          </button>
          <Link
            href="/owner/products"
            className="w-full rounded-full border border-gray-200 py-3 text-center text-xs font-semibold uppercase tracking-wide text-ink transition-colors hover:border-gray-300"
          >
            Back to products
          </Link>
        </div>
        {error.digest && (
          <p className="mt-5 text-[11px] text-gray-400">
            Reference: <code className="font-mono">{error.digest}</code>
          </p>
        )}
      </div>
    </div>
  );
}
