import { NextResponse } from "next/server";
import { countProducts, getProducts, ProductCatalogError } from "@/lib/products";

const MAX_LIMIT = 12;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category")?.trim() || null;
  const search = searchParams.get("q")?.trim().slice(0, 80) || null;
  // Wishlist/favorites view asks for specific IDs instead of a page.
  const ids = (searchParams.get("ids") ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 48);
  const sortParam = searchParams.get("sort");
  const sort =
    sortParam === "price-asc" || sortParam === "price-desc" ? sortParam : "newest";
  const offset = Math.max(0, Number(searchParams.get("offset") ?? 0) || 0);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number(searchParams.get("limit") ?? 6) || 6),
  );

  try {
    if (ids.length) {
      const products = await getProducts({ ids });
      return NextResponse.json({ products, hasMore: false, total: products.length });
    }
    // Both queries filter identically (including the internal `type` tag for
    // search), so the count always matches the results shown.
    const [products, total] = await Promise.all([
      getProducts({ category, search, sort, limit: offset + limit + 1 }),
      countProducts({ category, search }),
    ]);
    const page = products.slice(offset, offset + limit);
    return NextResponse.json({
      products: page,
      hasMore: products.length > offset + limit,
      total,
    });
  } catch (error) {
    if (error instanceof ProductCatalogError) {
      return NextResponse.json(
        { error: "The product catalog is temporarily unavailable." },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: "Could not load products." }, { status: 500 });
  }
}
