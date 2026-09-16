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
    <section className="mx-auto grid max-w-[1280px] gap-5 px-4 pt-4 md:grid-cols-[0.82fr_1.18fr] md:gap-8 md:px-8 md:pt-8">
      <div className="flex flex-col justify-center rounded-3xl bg-bone px-6 py-10 md:px-12 md:py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-terracotta">
          Everyday essentials
        </p>
        <h1 className="mt-5 max-w-md font-display text-5xl leading-[0.92] tracking-[-0.04em] text-ink md:text-7xl">
          Style that feels like you.
        </h1>
        <p className="mt-5 max-w-sm text-sm leading-6 text-ink-soft md:text-base">
          {STORE.tagline} Find your next favorite piece and order directly on WhatsApp.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/shop" className="btn btn-solid px-5 py-3 text-[10px]">
            Shop now
          </Link>
          <Link href="/#new-arrivals" className="btn btn-outline px-5 py-3 text-[10px]">
            New arrivals
          </Link>
        </div>
        <div className="mt-10 grid max-w-sm grid-cols-3 gap-3 border-t border-line pt-4 text-[10px] text-ink-soft">
          <span><strong className="block text-ink">Local</strong>Butwal delivery</span>
          <span><strong className="block text-ink">Simple</strong>Cash on delivery</span>
          <span><strong className="block text-ink">Direct</strong>WhatsApp orders</span>
        </div>
      </div>

      <div className="relative min-h-[420px] overflow-hidden rounded-3xl bg-wine-deep md:min-h-[620px]">
        <Image
          src="/hero-gemini.jpeg"
          alt="New clothing collection from Nisha Ghumti Fancy"
          fill
          priority
          quality={95}
          sizes="(min-width: 768px) 58vw, 100vw"
          className="object-cover object-center"
        />
      </div>
    </section>
  );
}
