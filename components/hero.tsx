import Image from "next/image";
import Link from "next/link";

/**
 * Hero: full-bleed clothing photograph, ink scrim weighted to the left so the
 * type stays legible, content anchored bottom-left. Asymmetric on purpose —
 * nothing centred, no gradient wash, no floating rounded button.
 */
export default function Hero() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 pt-3 md:px-8 md:pt-5">
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-bone md:aspect-[16/8.5]">
        <Image
          src="/hero-gemini.jpeg"
          alt="New clothing collection from Nisha Ghumti Fancy"
          fill
          priority
          quality={95}
          sizes="(min-width: 768px) 58vw, 100vw"
          className="object-contain object-center"
        />
        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 bg-gradient-to-t from-black/65 to-transparent px-3 pb-3 pt-14 md:px-6 md:pb-5">
          <div className="flex gap-2">
            <Link href="/shop" className="btn btn-solid px-4 py-2.5 text-[10px]">Shop now</Link>
            <Link href="/#new-arrivals" className="btn btn-ghost-light px-4 py-2.5 text-[10px]">New arrivals</Link>
          </div>
          <div className="grid grid-cols-3 divide-x divide-white/30 text-[8px] text-white/85 md:text-[10px]">
            <span className="px-2 first:pl-0"><strong className="block text-white">Delivery</strong>Butwal area</span>
            <span className="px-2"><strong className="block text-white">Payment</strong>Cash on delivery</span>
            <span className="px-2 last:pr-0"><strong className="block text-white">Orders</strong>Over WhatsApp</span>
          </div>
        </div>
      </div>
    </section>
  );
}
