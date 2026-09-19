import { notFound } from "next/navigation";
import AdminHeader from "../../admin-header";
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
      <AdminHeader title="Edit product" backHref="/admin/products" />
      <ProductForm product={product} />
    </>
  );
}
