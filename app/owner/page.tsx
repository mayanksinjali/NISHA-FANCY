import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-guard";
import { isAdminPasswordConfigured } from "@/lib/auth";
import { STORE } from "@/lib/config";
import LoginForm from "./login-form";

/** /owner — login screen, or a redirect straight through if already signed in. */
export default async function OwnerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const target = next?.startsWith("/owner") ? next : "/owner/products";

  if (await isAdminAuthenticated()) redirect(target);

  return (
    <div className="flex min-h-dvh flex-col justify-center px-6 py-16">
      <div className="mx-auto w-full max-w-sm">
        <div className="rounded-2xl bg-[#0B1528] px-6 py-6 text-white">
          <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
            </span>
            Owner access
          </p>
          <h1 className="mt-3 text-xl font-semibold leading-tight">
            {STORE.name}
          </h1>
          <p className="mt-1 text-xs leading-relaxed text-white/50">
            Sign in to add products, change prices and update stock.
          </p>
        </div>

        <div className="admin-card mt-4 px-6 py-6">
          {isAdminPasswordConfigured() ? (
            <LoginForm next={target} />
          ) : (
            <p className="text-sm leading-relaxed text-terracotta-deep">
              <code className="font-mono">ADMIN_PASSWORD</code> isn&apos;t set.
              Add it to <code className="font-mono">.env.local</code> (or your
              Vercel environment variables) and restart the server.
            </p>
          )}

          <Link
            href="/"
            className="mt-6 block text-center text-xs font-medium text-gray-400 transition-colors hover:text-ink"
          >
            ← Back to store
          </Link>
        </div>
      </div>
    </div>
  );
}
