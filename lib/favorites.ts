/**
 * Wishlist / favorites (Task 2). Purely client-side — favorited product IDs
 * live in localStorage, no backend. A custom event keeps every FavoriteButton
 * and the favorites page in sync within the tab; `storage` covers other tabs.
 */
export const FAVORITES_STORAGE_KEY = "nisha-fancy-favorites";
export const FAVORITES_EVENT = "favorites-updated";

/** Read the stored favorite IDs, tolerating corrupt/missing data. */
export function readFavoriteIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(FAVORITES_STORAGE_KEY) ?? "[]");
    return Array.isArray(raw)
      ? raw.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

/** Persist the favorite IDs and notify listeners. */
export function writeFavoriteIds(ids: string[]): void {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event(FAVORITES_EVENT));
}

/** Toggle one product. Returns its new favorited state. */
export function toggleFavorite(id: string): boolean {
  const current = readFavoriteIds();
  const favorited = current.includes(id);
  const next = favorited ? current.filter((value) => value !== id) : [...current, id];
  writeFavoriteIds(next);
  return !favorited;
}
