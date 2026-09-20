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

/** One review card. Fixed width so the duplicated track loops seamlessly. */
function TestimonialCard({
  entry,
  className = "",
}: {
  entry: (typeof TESTIMONIALS)[number];
  className?: string;
}) {
  return (
    <figure
      className={`flex w-[19rem] shrink-0 flex-col rounded-2xl border border-line bg-paper p-5 shadow-[0_1px_10px_rgba(23,23,23,0.04)] ${className}`}
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
  );
}

/**
 * Infinite side-drifting review strip. Content comes from
 * lib/testimonials.ts — replace the placeholders there with real customer
 * quotes / WhatsApp screenshots whenever the owner supplies them.
 *
 * Two rows drift in opposite directions (like incoming reviews), each row
 * duplicated once so the -50% translate loops seamlessly. Rows are offset
 * vertically so cards read as a flowing band rather than a straight line.
 * `pause-on-hover` freezes the row under the cursor for easy reading, and
 * prefers-reduced-motion disables the drift entirely in globals.css.
 */
export default function Testimonials() {
  if (!TESTIMONIALS.length) return null;

  // Enough cards per row that the duplicated run always fills wide screens.
  const perRow = Math.max(TESTIMONIALS.length / 2, 4);
  const rowA = TESTIMONIALS.slice(0, perRow);
  const rowB = TESTIMONIALS.slice(perRow);
  const stripA = [...rowA, ...rowA];
  const stripB = [...rowB, ...rowB];

  return (
    <section className="pt-10 md:pt-16">
      <div className="mx-auto max-w-[1280px] px-4 md:px-8">
        <SectionHeading
          id="testimonials"
          eyebrow=""
          title="Kind words"
          lede="Real feedback from customers across Butwal who ordered on WhatsApp."
        />
      </div>

      <div className="testimonials-fade group relative mt-6">
        {/* Row 1 — drifts right-to-left, nudged up */}
        <div className="overflow-hidden py-2">
          <ul className="testimonials-track-reverse gap-4 pr-4">
            {stripA.map((entry, i) => (
              <li key={`a-${entry.name}-${i}`}>
                <TestimonialCard entry={entry} className="-rotate-1" />
              </li>
            ))}
          </ul>
        </div>

        {/* Row 2 — drifts left-to-right, nudged down */}
        <div className="overflow-hidden py-2">
          <ul className="testimonials-track gap-4 pr-4">
            {stripB.map((entry, i) => (
              <li key={`b-${entry.name}-${i}`}>
                <TestimonialCard entry={entry} className="rotate-1" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
