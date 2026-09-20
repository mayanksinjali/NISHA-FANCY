import Link from "next/link";
import { STORE } from "@/lib/config";

/** Dark editorial footer — contact, nav, socials, all placeholders swappable via env. */
export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 bg-wine-deep text-paper md:mt-24">
      <div className="mx-auto max-w-[1280px] px-4 py-12 md:px-8 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr] md:gap-20">
          {/* Contact */}
          <div>
            <h2 className="eyebrow text-paper/40">Contact</h2>
            <ul className="mt-4 space-y-3 text-sm text-paper/75">
              <li>{STORE.address}</li>
              <li>
                <a
                  href={`mailto:${STORE.email}`}
                  className="transition-colors hover:text-paper"
                >
                  {STORE.email}
                </a>
              </li>
              <li className="text-paper/50">{STORE.hours}</li>
              <li>
                <Link
                  href="/admin"
                  className="text-paper/35 transition-colors hover:text-paper/70"
                >
                  Store admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h2 className="eyebrow text-paper/40">Follow</h2>
            <ul className="mt-4 grid grid-cols-2 gap-3 text-sm text-paper/75">
              {STORE.social.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 transition-colors hover:text-terracotta"
                  >
                    <span
                      aria-hidden
                      className="flex h-5 w-5 items-center justify-center rounded-full border border-paper/35 text-[10px] font-semibold text-paper/70"
                    >
                      {s.label === "Instagram"
                        ? "◎"
                        : s.label === "Facebook"
                          ? "f"
                          : "♪"}
                    </span>
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-paper/15 pt-5 text-[11px] tracking-[0.12em] text-paper/40 uppercase md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {STORE.name}
          </p>
          <p>Cash on delivery</p>
        </div>
      </div>
    </footer>
  );
}
