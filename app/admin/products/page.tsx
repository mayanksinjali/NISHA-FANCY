import Link from "next/link";
import AdminHeader from "../admin-header";
import InventoryList from "../inventory-list";
import { formatRs } from "@/lib/format";
import { getAllProductsForAdmin } from "@/lib/products";
import { isAdminSupabaseConfigured } from "@/lib/supabase/admin";

export const revalidate = 0;

const FLASH: Record<string, string> = {
  added: "Product added — it's live on the site now.",
  updated: "Changes saved.",
  deleted: "Product deleted.",
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const flash = Object.keys(FLASH).find((key) => params[key]);

  const configured = isAdminSupabaseConfigured();
  const products = configured ? await getAllProductsForAdmin() : [];
  const live = products.filter((p) => p.in_stock);
  const soldOut = products.length - live.length;
  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))] as string[];
  const catalogValue = live.reduce(
    (total, p) => total + (p.sale_price ?? p.price),
    0,
  );
  const onSale = products.filter((p) => p.sale_price != null).length;

  return (
    <>
      <AdminHeader title="Dashboard" />

      <div className="mx-auto max-w-xl px-5 py-6">
        {flash && (
          <p className="admin-card mb-5 px-4 py-3 text-sm">{FLASH[flash]}</p>
        )}

        {!configured && (
          <p className="admin-card mb-5 px-4 py-3 text-sm leading-relaxed text-terracotta-deep">
            Supabase isn't configured. Set{" "}
            <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> to
            manage products.
          </p>
        )}

        {/* ---------- Dark analytics card ---------- */}
        <section className="rounded-2xl bg-[#0B1528] px-5 py-5 text-white">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
            Store admin
          </p>
          <div className="mt-2 flex items-end justify-between gap-3">
            <p className="font-display text-3xl leading-none tabular-nums">
              {formatRs(catalogValue)}
            </p>
            <p className="rounded-full bg-green-500/15 px-2.5 py-1 text-[10px] font-semibold text-green-400">
              {live.length} live
            </p>
          </div>
          <p className="mt-1 text-xs text-white/50">
            Total value of live items
          </p>

          <div className="mt-4 rounded-xl bg-white/5 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/50">
              Active catalog
            </p>
            <p className="mt-1 text-lg font-semibold tabular-nums">
              {live.length} <span className="text-white/40">/ {products.length} live</span>
            </p>
          </div>
        </section>

        {/* ---------- 3-column stat row ---------- */}
        <dl className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="admin-card px-3 py-3.5">
            <dt className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Total</dt>
            <dd className="mt-1 text-xl font-bold tabular-nums">{products.length}</dd>
          </div>
          <div className="admin-card px-3 py-3.5">
            <dt className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Live</dt>
            <dd className="mt-1 text-xl font-bold tabular-nums text-green-600">{live.length}</dd>
          </div>
          <div className="admin-card px-3 py-3.5">
            <dt className="text-[10px] font-medium uppercase tracking-wide text-gray-400">Hidden</dt>
            <dd className="mt-1 text-xl font-bold tabular-nums text-red-500">{soldOut}</dd>
          </div>
          <div className="admin-card px-3 py-3.5">
            <dt className="text-[10px] font-medium uppercase tracking-wide text-gray-400">On sale</dt>
            <dd className="mt-1 text-xl font-bold tabular-nums text-terracotta-deep">{onSale}</dd>
          </div>
        </dl>

        {/* ---------- Primary action ---------- */}
        <Link
          href="/admin/products/new"
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4" aria-hidden>
            <path d="M12 5v14M5 12h14" />
          </svg>
          Add product
        </Link>

        <div className="mt-3 flex items-center justify-between">
          <Link
            href="/"
            target="_blank"
            className="text-xs font-medium text-gray-400 transition-colors hover:text-ink"
          >
            View live store ↗
          </Link>
          <p className="text-xs text-gray-400">
            Tap a product to manage it
          </p>
        </div>

        {/* ---------- Inventory ---------- */}
        <div className="mt-5">
          <InventoryList products={products} categories={categories} />
        </div>
      </div>
    </>
  );
}
