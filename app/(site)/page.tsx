import Hero from "@/components/hero";
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

      <section className="mx-auto max-w-[1500px] px-5 pt-14 md:px-10 md:pt-24">
        <SectionHeading
          id="new-arrivals"
          eyebrow="Just landed"
          title="New arrivals"
          lede="Pick your piece, see the price, and order straight on WhatsApp."
          action={{ label: "View all", href: "/shop" }}
        />

        <div className="mt-10 md:mt-14">
          <ProductGrid
            products={newArrivals}
            variant="lookbook"
            emptyMessage="The first drop is being photographed."
          />
        </div>
      </section>
    </>
  );
}
