import Image from "next/image";
import Link from "next/link";
import { STORE } from "@/lib/config";

/**
 * Hero: full-bleed clothing photograph, ink scrim weighted to the left so the
 * type stays legible, content anchored bottom-left. Asymmetric on purpose —
 * nothing centred, no gradient wash, no floating rounded button.
 */
export default function Hero() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 pt-3 md:px-8 md:pt-5">
      <div className="grid grid-cols-3 divide-x divide-line border-y border-line py-2 text-[9px] text-ink-soft md:text-xs">
        <span className="px-2 first:pl-0"><strong className="block text-ink">Delivery</strong>Butwal area</span>
        <span className="px-2"><strong className="block text-ink">Payment</strong>Cash on delivery</span>
        <span className="px-2 last:pr-0"><strong className="block text-ink">Orders</strong>Over WhatsApp</span>
      </div>

      <div className="relative mt-3 min-h-[440px] overflow-hidden rounded-3xl bg-wine-deep md:min-h-[650px]">
        <Image
          src="/hero-gemini.jpeg"
          alt="New clothing collection from Nisha Ghumti Fancy"
          fill
          priority
          quality={95}
          sizes="(min-width: 768px) 58vw, 100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/35 to-transparent px-5 pb-6 pt-20 text-white md:px-12 md:pb-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/75">Everyday essentials</p>
          <h1 className="mt-3 max-w-xl font-display text-4xl leading-none tracking-[-0.04em] md:text-7xl">Style that feels like you.</h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/80">{STORE.tagline} Find your next favorite piece and order directly on WhatsApp.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link href="/shop" className="btn btn-solid px-5 py-3 text-[10px]">Shop now</Link>
            <Link href="/#new-arrivals" className="btn btn-ghost-light px-5 py-3 text-[10px]">New arrivals</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
