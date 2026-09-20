import { notFound } from "next/navigation";
import OwnerHeader from "../../owner-header";
import ProductForm from "../../product-form";
import { getProductForAdmin } from "@/lib/products";

export const revalidate = 0;

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await getProductForAdmin(id);

  if (!product) notFound();

  return (
    <>
      <OwnerHeader title="Edit product" backHref="/owner/products" />
      <ProductForm product={product} />
    </>
  );
}
