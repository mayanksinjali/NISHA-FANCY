import Link from "next/link";

type Props = {
  categories: string[];
  /** Currently selected category, or null for "All". */
  active: string | null;
  search?: string | null;
};

/**
 * Category filter as plain links (?category=...). No client JS, no dropdown —
 * it's a row of editorial labels that wraps on small screens.
 */
export default function CategoryFilter({ categories, active, search }: Props) {
  const options = [{ label: "All", value: null }, ...categories.map((c) => ({ label: c, value: c }))];

  return (
    <nav
      aria-label="Filter by category"
      className="flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-line py-4"
    >
      {options.map((option) => {
        const isActive = (option.value ?? null) === active;
        const params = new URLSearchParams();
        if (option.value) params.set("category", option.value);
        if (search) params.set("q", search);
        return (
          <Link
            key={option.label}
            href={params.toString() ? `/shop?${params.toString()}` : "/shop"}
            data-active={isActive}
            aria-current={isActive ? "page" : undefined}
            className={`eyebrow link-rule py-1 transition-colors ${
              isActive ? "text-terracotta" : "text-ink-soft hover:text-ink"
            }`}
          >
            {option.label}
          </Link>
        );
      })}
    </nav>
  );
}
