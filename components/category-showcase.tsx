import Image from "next/image";
import Link from "next/link";
import { FEATURED_CATEGORIES } from "@/lib/config";

export default function CategoryShowcase() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 pt-4 md:px-8 md:pt-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-terracotta-deep">Shop by category</p>
          <h2 className="mt-1 font-display text-2xl tracking-[-0.03em] md:text-4xl">Find your fit</h2>
        </div>
        <Link href="/shop" className="hidden text-sm font-medium text-ink-soft hover:text-ink sm:block">View all products →</Link>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-1.5 md:gap-3">
        {FEATURED_CATEGORIES.map((category) => (
          <Link
            key={category.slug}
            href={`/shop?category=${encodeURIComponent(category.slug)}`}
            className="group relative aspect-square overflow-hidden rounded-lg bg-bone"
          >
            <Image
              src={category.image}
              alt={category.alt}
              fill
              sizes="(min-width: 768px) 30vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-x-1 bottom-1 rounded-full bg-white/92 px-1.5 py-1.5 text-center text-[11px] font-semibold uppercase tracking-[0.04em] text-ink md:inset-x-2 md:bottom-2 md:px-2 md:py-1.5">
              {category.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
