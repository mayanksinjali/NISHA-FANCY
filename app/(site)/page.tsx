import Hero from "@/components/hero";
import CategoryShowcase from "@/components/category-showcase";
import ProductGrid from "@/components/product-grid";
import SectionHeading from "@/components/section-heading";
import { getProducts } from "@/lib/products";

/**
 * Products are read at request time so anything the admin adds on their phone
 * shows up on the live site immediately — no redeploy.
 */
export const revalidate = 0;

export default async function HomePage() {
  const newArrivals = await getProducts({ limit: 4 });

  return (
    <>
      <Hero />
      <CategoryShowcase />

      <section className="mx-auto max-w-[1280px] px-4 pt-5 md:px-8 md:pt-8">
        <SectionHeading
          id="new-arrivals"
          eyebrow=""
          title="New arrivals"
          lede="Pick your piece, see the price, and order straight on WhatsApp."
          action={{ label: "See all products", href: "/shop" }}
        />

        <div className="mt-3 md:mt-5">
          <ProductGrid
            products={newArrivals}
            variant="grid"
            emptyMessage="The first drop is being photographed."
          />
        </div>
      </section>
    </>
  );
}
