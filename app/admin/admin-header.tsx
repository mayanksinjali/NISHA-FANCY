import Link from "next/link";
import { logoutAction } from "./actions";

/** Fixed admin top bar: back link, title, sign out. */
export default function AdminHeader({
  title,
  backHref,
}: {
  title: string;
  backHref?: string;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-paper/95 backdrop-blur-sm">
      <div className="flex h-14 items-center justify-between gap-3 px-5">
        <div className="flex min-w-0 items-center gap-3">
          {backHref && (
            <Link
              href={backHref}
              aria-label="Back"
              className="-ml-2 flex h-10 w-8 items-center justify-center text-xl"
            >
              ←
            </Link>
          )}
          <h1 className="truncate font-display text-lg tracking-wide uppercase">
            {title}
          </h1>
        </div>

        <form action={logoutAction}>
          <button type="submit" className="eyebrow py-2 text-ink-soft">
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
