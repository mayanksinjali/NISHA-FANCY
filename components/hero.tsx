import Image from "next/image";
import Link from "next/link";

/**
 * Hero: full-bleed clothing photograph, ink scrim weighted to the left so the
 * type stays legible, content anchored bottom-left. Asymmetric on purpose —
 * nothing centred, no gradient wash, no floating rounded button.
 */
export default function Hero() {
  return (
    <section className="relative isolate flex aspect-[16/9] flex-col justify-end overflow-hidden bg-wine-deep md:aspect-auto md:min-h-[92svh]">
      <Image
        src="/hero-gemini.jpeg"
        alt="Nisha Ghumti Fancy fashion campaign"
        fill
        priority
        quality={95}
        sizes="100vw"
        className="-z-10 object-cover object-center"
      />

      <div aria-hidden className="hero-bottom-scrim absolute inset-x-0 bottom-0 -z-10" />

      <div className="relative mt-auto">
        <div className="mx-auto flex w-full max-w-[1500px] gap-2 px-4 pb-5 md:px-10 md:pb-8">
          <Link href="/shop" className="btn btn-solid flex-1 px-3 py-3 text-[10px] sm:flex-none sm:px-5">
            Shop the collection
          </Link>
          <Link href="/#new-arrivals" className="btn btn-ghost-light flex-1 px-3 py-3 text-[10px] sm:flex-none sm:px-5">
            New arrivals
          </Link>
        </div>

      {/* Thin index strip — editorial meta, not an icon feature row. */}
      <div className="relative border-t border-paper/20 bg-wine-deep/55">
        <dl className="mx-auto grid max-w-[1500px] grid-cols-3 divide-x divide-paper/20 px-3 text-paper/75 md:px-10">
          {[
            ["Delivery", "Butwal Metropolitan Area"],
            ["Payment", "Cash on delivery"],
            ["Orders", "Placed over WhatsApp, one message"],
          ].map(([term, detail], i) => (
            <div
              key={term}
              className="px-2 py-3 first:pl-0 last:pr-0 md:px-6 md:first:pl-0"
            >
              <dt className="eyebrow text-paper/45">{term}</dt>
              <dd className="mt-1 text-[10px] leading-snug md:text-[13px]">{detail}</dd>
            </div>
          ))}
        </dl>
      </div>
      </div>
    </section>
  );
}
