import Link from "next/link";

type Props = {
  eyebrow: string;
  title: string;
  /** Optional italic display sub-line. */
  lede?: string;
  action?: { label: string; href: string };
  id?: string;
};

/** Shared editorial section head: tiny label, big serif title, optional link. */
export default function SectionHeading({
  eyebrow,
  title,
  lede,
  action,
  id,
}: Props) {
  return (
    <div
      id={id}
      className="flex flex-col gap-4 border-t border-line pt-4 md:flex-row md:items-end md:justify-between"
    >
      <div>
        {eyebrow && <p className="eyebrow text-terracotta-deep">{eyebrow}</p>}
        <h2 className="mt-2 font-display text-[clamp(2rem,5vw,3.8rem)] leading-none tracking-[-0.03em]">
          {title}
        </h2>
        {lede && (
          <p className="mt-3 max-w-lg text-sm leading-6 text-ink-soft md:text-base">
            {lede}
          </p>
        )}
      </div>

      {action && (
        <Link
          href={action.href}
          className="btn btn-outline shrink-0 px-4 py-3 text-[11px] md:mb-2"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
