import AdminHeader from "../../admin-header";
import ProductForm from "../../product-form";

export const revalidate = 0;

export default async function NewProductPage() {
  return (
    <>
      <AdminHeader title="Add product" backHref="/admin/products" />
      <ProductForm />
    </>
  );
}
