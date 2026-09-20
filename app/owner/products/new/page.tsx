import OwnerHeader from "../../owner-header";
import ProductForm from "../../product-form";

export const revalidate = 0;

export default async function NewProductPage() {
  return (
    <>
      <OwnerHeader title="Add product" backHref="/owner/products" />
      <ProductForm />
    </>
  );
}
