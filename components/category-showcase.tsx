import Image from "next/image";
import Link from "next/link";
import { FEATURED_CATEGORIES } from "@/lib/config";

export default function CategoryShowcase() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 pt-12 md:px-8 md:pt-20">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-terracotta">Shop by category</p>
          <h2 className="mt-2 font-display text-3xl tracking-[-0.03em] md:text-5xl">Find your fit</h2>
        </div>
        <Link href="/shop" className="hidden text-sm font-medium text-ink-soft hover:text-ink sm:block">View all products →</Link>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-5">
        {FEATURED_CATEGORIES.map((category) => (
          <Link
            key={category.slug}
            href={`/shop?category=${encodeURIComponent(category.slug)}`}
            className="group relative aspect-[0.8] overflow-hidden rounded-2xl bg-bone"
          >
            <Image
              src={category.image}
              alt={`${category.label} clothing`}
              fill
              sizes="(min-width: 768px) 30vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <span className="absolute inset-x-2 bottom-2 rounded-full bg-white/92 px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.12em] text-ink md:inset-x-4 md:bottom-4 md:px-4 md:py-3 md:text-sm">
              {category.label}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
