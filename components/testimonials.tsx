import SectionHeading from "./section-heading";
import { TESTIMONIALS } from "@/lib/testimonials";

/** Five-pointed star row for a testimonial's rating. */
function Stars({ rating }: { rating: number }) {
  return (
    <div
      className="flex gap-0.5 text-terracotta-deep"
      role="img"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          aria-hidden
          className="h-4 w-4"
          fill={i < rating ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="m12 3 2.7 5.9 6.3.6-4.8 4.3 1.4 6.2L12 16.8 6.4 20l1.4-6.2L3 9.5l6.3-.6L12 3Z" />
        </svg>
      ))}
    </div>
  );
}

/**
 * Static testimonials section (Task 14). Content comes from
 * lib/testimonials.ts — replace the placeholders there with real customer
 * quotes / WhatsApp screenshots whenever the owner supplies them.
 */
export default function Testimonials() {
  if (!TESTIMONIALS.length) return null;

  return (
    <section className="mx-auto max-w-[1280px] px-4 pt-10 md:px-8 md:pt-16">
      <SectionHeading
        id="testimonials"
        eyebrow=""
        title="Kind words"
        lede="Real feedback from customers who ordered on WhatsApp."
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TESTIMONIALS.map((entry, index) => (
          <figure
            key={`${entry.name}-${index}`}
            className="flex h-full flex-col rounded-2xl border border-line bg-bone/40 p-5"
          >
            <Stars rating={entry.rating ?? 5} />
            <blockquote className="mt-3 flex-1 text-[15px] leading-relaxed text-ink">
              “{entry.quote}”
            </blockquote>
            <figcaption className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-soft">
              {entry.name}
              {entry.location ? <span className="font-normal"> — {entry.location}</span> : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
