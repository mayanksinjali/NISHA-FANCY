import { toggleStockAction } from "./actions";

/**
 * One-tap stock switch. A plain form post — works without client JS and
 * re-renders the list through revalidatePath.
 */
export default function StockToggle({
  id,
  inStock,
}: {
  id: string;
  inStock: boolean;
}) {
  return (
    <form action={toggleStockAction}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="in_stock" value={String(!inStock)} />
      <button
        type="submit"
        aria-label={inStock ? "Mark as sold out" : "Mark as in stock"}
        className={`eyebrow border px-3 py-2.5 transition-colors ${
          inStock
            ? "border-line text-ink-soft hover:border-ink hover:text-ink"
            : "border-terracotta bg-terracotta text-paper"
        }`}
      >
        {inStock ? "In stock" : "Sold out"}
      </button>
    </form>
  );
}
