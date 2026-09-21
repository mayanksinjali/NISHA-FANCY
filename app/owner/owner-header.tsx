import Link from "next/link";
import InstallButton from "./install-button";
import { logoutAction } from "./actions";

const NAV = [
  { label: "Dashboard", href: "/owner/products" },
  { label: "Add product", href: "/owner/products/new" },
];

/**
 * Fixed owner top bar: store identity with a live "Online" pulse, nav links,
 * sign out. White card look, sticky on scroll.
 */
export default function OwnerHeader({
  title,
  backHref,
}: {
  title: string;
  backHref?: string;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-xl items-center justify-between gap-3 px-5">
        <div className="flex min-w-0 items-center gap-3">
          {backHref && (
            <Link
              href={backHref}
              aria-label="Back"
              className="-ml-2 flex h-10 w-8 items-center justify-center text-xl text-ink"
            >
              ←
            </Link>
          )}
          <div className="min-w-0">
            <p className="truncate text-[15px] font-semibold leading-tight">
              {title}
            </p>
            <p className="flex items-center gap-1.5 text-[11px] text-gray-400">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-green-500" />
              </span>
              Online
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hidden text-xs font-medium text-gray-500 transition-colors hover:text-ink sm:block"
            >
              {item.label}
            </Link>
          ))}
          <InstallButton className="text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700" />
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-xs font-medium text-gray-400 transition-colors hover:text-terracotta"
            >
              Sign out
            </button>
          </form>
        </nav>
      </div>
    </header>
  );
}
