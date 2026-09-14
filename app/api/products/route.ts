import { NextResponse } from "next/server";
import { getProducts, ProductCatalogError } from "@/lib/products";

const MAX_LIMIT = 12;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category")?.trim() || null;
  const offset = Math.max(0, Number(searchParams.get("offset") ?? 0) || 0);
  const limit = Math.min(
    MAX_LIMIT,
    Math.max(1, Number(searchParams.get("limit") ?? 6) || 6),
  );

  try {
    const products = await getProducts({ category, limit: offset + limit + 1 });
    const page = products.slice(offset, offset + limit);
    return NextResponse.json({
      products: page,
      hasMore: products.length > offset + limit,
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