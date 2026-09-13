import Link from "next/link";
import { NAV_LINKS, STORE } from "@/lib/config";
import { whatsappGeneralUrl } from "@/lib/whatsapp";

/** Dark editorial footer — contact, nav, socials, all placeholders swappable via env. */
export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 bg-ink text-paper">
      <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          {/* Wordmark + tagline */}
          <div className="md:col-span-5">
            <p className="font-display text-3xl tracking-[0.16em] uppercase md:text-4xl">
              {STORE.name}
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-paper/60">
              {STORE.tagline}
            </p>
            <a
              href={whatsappGeneralUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost-light mt-8"
            >
              Order on WhatsApp
            </a>
          </div>

          {/* Nav */}
          <div className="md:col-span-3">
            <h2 className="eyebrow text-paper/40">Menu</h2>
            <ul className="mt-5 space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-paper/80 transition-colors hover:text-paper"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/admin"
                  className="text-sm text-paper/35 transition-colors hover:text-paper/70"
                >
                  Store admin
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="md:col-span-2">
            <h2 className="eyebrow text-paper/40">Contact</h2>
            <ul className="mt-5 space-y-3 text-sm text-paper/80">
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
            </ul>
          </div>

          {/* Social */}
          <div className="md:col-span-2">
            <h2 className="eyebrow text-paper/40">Follow</h2>
            <ul className="mt-5 space-y-3 text-sm text-paper/80">
              {STORE.social.map((s) => (
                <li key={s.label}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition-colors hover:text-paper"
                  >
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-2 border-t border-paper/15 pt-6 text-[11px] tracking-[0.14em] text-paper/40 uppercase md:flex-row md:items-center md:justify-between">
          <p>
            © {year} {STORE.name}
          </p>
          <p>Cash on delivery</p>
        </div>
      </div>
    </footer>
  );
}
