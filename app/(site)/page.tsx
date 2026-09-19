import HeroCarousel from "@/components/hero-carousel";
import CategoryShowcase from "@/components/category-showcase";
import ProductGrid from "@/components/product-grid";
import SectionHeading from "@/components/section-heading";
import { getProducts, type Product } from "@/lib/products";
import { STORE } from "@/lib/config";
import { SITE_URL } from "@/lib/seo";

/**
 * ISR: the rail refreshes from Supabase at most once a minute. Admin edits
 * still appear immediately — every product mutation calls revalidateStorefront()
 * (see app/admin/actions.ts), which purges this cache on demand.
 */
export const revalidate = 60;

/** schema.org ClothingStore (a LocalBusiness) — hours, address and contact. */
function StoreJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: STORE.name,
    description: STORE.tagline,
    url: SITE_URL,
    image: `${SITE_URL}/logo.jpeg`,
    telephone: `+${STORE.whatsappNumber}`,
    email: STORE.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Butwal 12, Tamnagar",
      addressLocality: "Butwal",
      addressCountry: "NP",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ],
        opens: "09:00",
        closes: "21:00",
      },
    ],
    sameAs: STORE.social.map((social) => social.href),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
    />
  );
}

export default async function HomePage() {
  let newArrivals: Product[] = [];
  try {
    newArrivals = await getProducts({ limit: 8 });
  } catch {
    // Catalog briefly unavailable — render the page without the rail.
    newArrivals = [];
  }

  return (
    <>
      <StoreJsonLd />
      <HeroCarousel products={newArrivals} />
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
