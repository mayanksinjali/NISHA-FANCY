import Image from "next/image";
import Link from "next/link";
import AdminHeader from "../admin-header";
import DeleteProductButton from "../delete-product-button";
import StockToggle from "../stock-toggle";
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
  const soldOut = products.filter((p) => !p.in_stock).length;

  return (
    <>
      <AdminHeader title="Products" />

      <div className="px-5 py-6">
        {flash && (
          <p className="mb-5 border border-ink bg-bone px-4 py-3 text-sm">
            {FLASH[flash]}
          </p>
        )}

        {!configured && (
          <p className="mb-5 border border-terracotta/40 bg-terracotta/5 px-4 py-3 text-sm leading-relaxed text-terracotta-deep">
            Supabase isn't configured. Set{" "}
            <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
            <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> to
            manage products.
          </p>
        )}

        {/* Counts */}
        <dl className="grid grid-cols-2 gap-3">
          <div className="border border-line bg-bone px-4 py-3">
            <dt className="eyebrow text-ink-soft">Products</dt>
            <dd className="mt-1.5 font-display text-3xl">{products.length}</dd>
          </div>
          <div className="border border-line bg-bone px-4 py-3">
            <dt className="eyebrow text-ink-soft">Sold out</dt>
            <dd className="mt-1.5 font-display text-3xl">{soldOut}</dd>
          </div>
        </dl>

        <Link href="/admin/products/new" className="btn btn-solid mt-5 w-full">
          + Add product
        </Link>

        <Link
          href="/"
          target="_blank"
          className="eyebrow link-rule mt-5 inline-block text-ink-soft"
        >
          View live store ↗
        </Link>

        {/* List */}
        <ul className="mt-7 divide-y divide-line border-y border-line">
          {products.map((product) => (
            <li key={product.id} className="flex gap-4 py-4">
              <div className="relative h-24 w-20 shrink-0 overflow-hidden bg-bone">
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt=""
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[11px] text-ink-soft">
                    No photo
                  </div>
                )}
              </div>

              <div className="flex min-w-0 flex-1 flex-col">
                <p className="truncate text-[15px] font-medium">{product.name}</p>
                <p className="mt-0.5 text-sm tabular-nums text-ink-soft">
                  {formatRs(product.price)}
                  {product.category ? ` · ${product.category}` : ""}
                </p>

                <div className="mt-auto flex flex-wrap items-center gap-2 pt-3">
                  <StockToggle id={product.id} inStock={product.in_stock} />
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="eyebrow border border-line px-3 py-2.5 transition-colors hover:border-ink"
                  >
                    Edit
                  </Link>
                  <DeleteProductButton id={product.id} name={product.name} />
                </div>
              </div>
            </li>
          ))}
        </ul>

        {configured && products.length === 0 && (
          <p className="py-12 text-center text-sm text-ink-soft">
            No products yet. Tap “Add product” to put the first piece on the
            rail.
          </p>
        )}
      </div>
    </>
  );
}
