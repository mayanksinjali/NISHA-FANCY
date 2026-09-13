/** Formatting helpers shared by the storefront and the admin panel. */

/** 2450 -> "2,450" (no decimals unless the price actually has paisa). */
export function formatPrice(value: number): string {
  const hasFraction = Math.abs(value % 1) > 0;
  return value.toLocaleString("en-US", {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  });
}

/** 2450 -> "Rs. 2,450" */
export function formatRs(value: number): string {
  return `Rs. ${formatPrice(value)}`;
}

/** Two-digit lookbook index: 1 -> "01" */
export function indexLabel(i: number): string {
  return String(i + 1).padStart(2, "0");
}
