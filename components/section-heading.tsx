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
      className="flex flex-col gap-3 border-t border-ink pt-3 md:flex-row md:items-end md:justify-between"
    >
      <div>
        <p className="eyebrow text-terracotta">{eyebrow}</p>
        <h2 className="mt-2 font-display text-[clamp(1.8rem,5vw,3.5rem)] leading-[0.95] uppercase">
          {title}
        </h2>
        {lede && (
          <p className="mt-3 max-w-lg font-display text-lg text-ink-soft italic">
            {lede}
          </p>
        )}
      </div>

      {action && (
        <Link
          href={action.href}
          className="btn btn-outline shrink-0 px-4 py-3 text-[10px] md:mb-2"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
