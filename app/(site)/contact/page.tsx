import type { Metadata } from "next";
import { STORE } from "@/lib/config";
import { whatsappGeneralUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Contact",
  description: "Find us, message us, order from us.",
};

export default function ContactPage() {
  const details = [
    { label: "WhatsApp", value: `+${STORE.whatsappNumber}`, href: whatsappGeneralUrl() },
    { label: "Email", value: STORE.email, href: `mailto:${STORE.email}` },
    { label: "Studio", value: STORE.address },
    { label: "Hours", value: STORE.hours },
  ];

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 md:px-8 md:py-12">
      <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:gap-16">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-terracotta-deep">We are here to help</p>
          <h1 className="mt-3 font-display text-5xl leading-none tracking-[-0.04em] md:text-7xl">Let&apos;s talk.</h1>
          <p className="mt-5 max-w-md text-base leading-7 text-ink-soft">
          Questions on sizing, fabric or delivery? Message us — we reply the
          same day.
          </p>
        </div>

        <div>
        <dl>
          {details.map((item) => (
            <div
              key={item.label}
              className="border-t border-line py-3 first:border-t-ink"
            >
              <dt className="eyebrow text-ink-soft">{item.label}</dt>
              <dd className="mt-1 text-base">
                {item.href ? (
                  <a
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      item.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="link-rule"
                  >
                    {item.value}
                  </a>
                ) : (
                  item.value
                )}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 border-t border-line pt-5">
          <p className="eyebrow text-ink-soft">Follow</p>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {STORE.social.map((s) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-rule text-base"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <a
          href={whatsappGeneralUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-solid mt-6 w-full sm:w-auto"
        >
          Message us on WhatsApp
        </a>
        </div>
      </div>
    </div>
  );
}
