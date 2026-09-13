"use client";

import { useActionState } from "react";
import { loginAction, type ActionState } from "./actions";

/** Password form. Client component so we can show the error inline. */
export default function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    loginAction,
    null,
  );

  return (
    <form action={formAction} className="mt-10">
      <input type="hidden" name="next" value={next} />

      <label htmlFor="password" className="eyebrow text-ink-soft">
        Password
      </label>
      <input
        id="password"
        name="password"
        type="password"
        required
        autoFocus
        autoComplete="current-password"
        placeholder="••••••••"
        className="field mt-3"
      />

      {state?.error && (
        <p
          role="alert"
          className="mt-4 border border-terracotta/40 bg-terracotta/5 px-3 py-2.5 text-sm text-terracotta-deep"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="btn btn-solid mt-6 w-full disabled:opacity-60"
      >
        {pending ? "Checking…" : "Sign in"}
      </button>
    </form>
  );
}
