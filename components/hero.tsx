import Image from "next/image";
import Link from "next/link";
import { EDITORIAL_IMAGES, STORE } from "@/lib/config";

/**
 * Hero: full-bleed clothing photograph, ink scrim weighted to the left so the
 * type stays legible, content anchored bottom-left. Asymmetric on purpose —
 * nothing centred, no gradient wash, no floating rounded button.
 */
export default function Hero() {
  return (
    <section className="relative isolate flex min-h-[76svh] flex-col justify-end overflow-hidden bg-ink md:min-h-[92svh]">
      <Image
        src={EDITORIAL_IMAGES.hero}
        alt="Rail of clothing in a studio"
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover object-[58%_center]"
      />

      {/* Legibility scrim: solid-ish at the bottom-left, clear at top-right. */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-tr from-ink/90 via-ink/55 to-ink/10"
      />

      {/* Vertical side label */}
      <span className="eyebrow absolute top-1/2 right-4 hidden -translate-y-1/2 rotate-90 text-paper/55 lg:block">
        Est. 2026 — Nepal
      </span>

      <div className="relative mx-auto w-full max-w-[1500px] px-4 pt-20 pb-8 md:px-10 md:pb-14">
        <p className="eyebrow text-paper/70">New season / Volume 01</p>

        <h1 className="mt-5 max-w-[10ch] font-display text-[clamp(2.7rem,12vw,9.5rem)] leading-[0.82] tracking-[-0.01em] text-paper uppercase md:max-w-none">
          {STORE.name}
        </h1>

        <div className="mt-6 flex flex-col gap-6 md:mt-10 md:flex-row md:items-end md:justify-between">
          <p className="max-w-sm font-display text-lg leading-snug text-paper/85 italic md:max-w-md md:text-2xl">
            {STORE.tagline}
          </p>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/shop" className="btn btn-solid w-full sm:w-auto">
              Shop the collection
            </Link>
            <Link href="/#new-arrivals" className="btn btn-ghost-light w-full sm:w-auto">
              New arrivals
            </Link>
          </div>
        </div>
      </div>

      {/* Thin index strip — editorial meta, not an icon feature row. */}
      <div className="relative border-t border-paper/20">
        <dl className="mx-auto grid max-w-[1500px] grid-cols-2 divide-paper/20 px-4 text-paper/75 md:grid-cols-3 md:divide-x md:px-10">
          {[
            ["Delivery", "Butwal Metropolitan Area"],
            ["Payment", "Cash on delivery"],
            ["Orders", "Placed over WhatsApp, one message"],
          ].map(([term, detail], i) => (
            <div
              key={term}
              className={`py-4 md:px-6 md:first:pl-0 ${
                i === 2 ? "col-span-2 md:col-span-1" : ""
              }`}
            >
              <dt className="eyebrow text-paper/45">{term}</dt>
              <dd className="mt-1.5 text-[13px] leading-snug">{detail}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
