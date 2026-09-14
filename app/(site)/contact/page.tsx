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
    <div className="mx-auto max-w-[1500px] px-5 pt-5 md:px-10 md:pt-10">
      <div className="max-w-3xl py-3 md:py-6">
        <p className="max-w-md text-lg leading-snug text-ink-soft md:text-xl">
          Questions on sizing, fabric or delivery? Message us — we reply the
          same day.
        </p>

        <dl className="mt-6">
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
  );
}
