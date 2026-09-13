import Image from "next/image";
import Link from "next/link";

/**
 * Hero: full-bleed clothing photograph, ink scrim weighted to the left so the
 * type stays legible, content anchored bottom-left. Asymmetric on purpose —
 * nothing centred, no gradient wash, no floating rounded button.
 */
export default function Hero() {
  return (
    <section className="relative isolate flex flex-col overflow-hidden bg-wine-deep">
      <div className="relative aspect-[16/9] w-full">
        <Image
          src="/hero-gemini.jpeg"
          alt="Nisha Ghumti Fancy fashion campaign"
          fill
          priority
          sizes="100vw"
          className="object-contain object-center"
        />
      </div>

      <div className="flex gap-2 px-4 py-4 md:mx-auto md:w-full md:max-w-[1500px] md:px-10 md:py-6">
        <Link href="/shop" className="btn btn-solid flex-1 px-3 py-3 text-[10px] sm:flex-none sm:px-5">
          Shop the collection
        </Link>
        <Link href="/#new-arrivals" className="btn btn-ghost-light flex-1 px-3 py-3 text-[10px] sm:flex-none sm:px-5">
          New arrivals
        </Link>
      </div>

      {/* Thin index strip — editorial meta, not an icon feature row. */}
      <div className="relative border-t border-paper/20">
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
    </section>
  );
}
