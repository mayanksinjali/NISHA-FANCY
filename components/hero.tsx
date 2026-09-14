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
          quality={95}
          sizes="100vw"
          className="object-contain object-center"
        />
      </div>

      <div className="flex gap-2 px-4 py-2 md:mx-auto md:w-full md:max-w-[1500px] md:px-10 md:py-3">
          <Link href="/shop" className="btn btn-solid flex-1 px-3 py-2 text-[9px] sm:flex-none sm:px-4">
            Shop the collection
          </Link>
          <Link href="/#new-arrivals" className="btn btn-ghost-light flex-1 px-3 py-2 text-[9px] sm:flex-none sm:px-4">
            New arrivals
          </Link>
        </div>
    </section>
  );
}
