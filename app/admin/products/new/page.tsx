import AdminHeader from "../../admin-header";
import ProductForm from "../../product-form";
import { getCategories } from "@/lib/products";

export const revalidate = 0;

export default async function NewProductPage() {
  const knownCategories = await getCategories();

  return (
    <>
      <AdminHeader title="Add product" backHref="/admin/products" />
      <ProductForm knownCategories={knownCategories} />
    </>
  );
}
