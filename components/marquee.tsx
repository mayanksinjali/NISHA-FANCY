/**
 * Slim terracotta band of scrolling text. One accent colour, used confidently
 * in exactly one place on the page.
 */
export default function Marquee({ items }: { items: string[] }) {
  // Duplicated once so the -50% translate loops seamlessly.
  const run = [...items, ...items];

  return (
    <div className="overflow-hidden border-y border-terracotta-deep/30 bg-terracotta py-3 text-paper select-none">
      <div className="marquee-track">
        {run.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="eyebrow flex shrink-0 items-center gap-8 pr-8 whitespace-nowrap"
          >
            {item}
            <span aria-hidden className="text-paper/50">
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
