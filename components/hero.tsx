import Image from "next/image";
import Link from "next/link";

/**
 * Hero: full-bleed clothing photograph, ink scrim weighted to the left so the
 * type stays legible, content anchored bottom-left. Asymmetric on purpose —
 * nothing centred, no gradient wash, no floating rounded button.
 */
export default function Hero() {
  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 pt-0">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-bone md:aspect-[16/8.5]">
        <Image
          src="/hero-gemini.jpeg"
          alt="New clothing collection from Nisha Ghumti Fancy"
          fill
          priority
          quality={95}
          sizes="(min-width: 768px) 58vw, 100vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-2 pb-2 pt-16 md:px-5 md:pb-4">
          <div className="flex gap-1.5">
            <Link href="/shop" className="btn btn-solid px-3 py-2 text-[9px]">Shop now</Link>
            <Link href="/#new-arrivals" className="btn btn-ghost-light px-3 py-2 text-[9px]">New arrivals</Link>
          </div>
          <div className="mt-2 grid w-full grid-cols-3 divide-x divide-white/30 border-t border-white/25 pt-2 text-[10px] leading-snug text-white/85 md:text-xs">
            <span className="px-2 first:pl-0"><strong className="block text-[10px] text-white md:text-xs">Delivery</strong>Butwal area</span>
            <span className="px-2"><strong className="block text-[10px] text-white md:text-xs">Payment</strong>Cash on delivery</span>
            <span className="px-2 last:pr-0"><strong className="block text-[10px] text-white md:text-xs">Orders</strong>Over WhatsApp</span>
          </div>
        </div>
      </div>
    </section>
  );
}
