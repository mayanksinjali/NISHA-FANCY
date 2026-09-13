import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-guard";
import { isAdminPasswordConfigured } from "@/lib/auth";
import { STORE } from "@/lib/config";
import LoginForm from "./login-form";

/** /admin — login screen, or a redirect straight through if already signed in. */
export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const target = next?.startsWith("/admin") ? next : "/admin/products";

  if (await isAdminAuthenticated()) redirect(target);

  return (
    <div className="flex min-h-dvh flex-col justify-center px-6 py-16">
      <div className="mx-auto w-full max-w-sm">
        <p className="eyebrow text-terracotta">Staff only</p>
        <h1 className="mt-4 font-display text-4xl leading-none uppercase">
          {STORE.name}
        </h1>
        <p className="mt-3 text-sm text-ink-soft">
          Sign in to add products, change prices and update stock.
        </p>

        {isAdminPasswordConfigured() ? (
          <LoginForm next={target} />
        ) : (
          <p className="mt-8 border border-terracotta/40 bg-terracotta/5 px-4 py-3 text-sm leading-relaxed text-terracotta-deep">
            <code className="font-mono">ADMIN_PASSWORD</code> isn't set. Add it
            to <code className="font-mono">.env.local</code> (or your Vercel
            environment variables) and restart the server.
          </p>
        )}

        <Link
          href="/"
          className="eyebrow link-rule mt-10 inline-block text-ink-soft"
        >
          ← Back to store
        </Link>
      </div>
    </div>
  );
}
