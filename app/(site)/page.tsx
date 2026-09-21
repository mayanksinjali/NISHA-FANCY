import type { Metadata } from "next";
import HeroCarousel from "@/components/hero-carousel";
import CategoryShowcase from "@/components/category-showcase";
import ProductGrid from "@/components/product-grid";
import SectionHeading from "@/components/section-heading";
import Testimonials from "@/components/testimonials";
import Reveal from "@/components/reveal";
import { getProducts, type Product } from "@/lib/products";
import { STORE } from "@/lib/config";
import { SITE_URL } from "@/lib/seo";

/**
 * ISR: the rail refreshes from Supabase at most once a minute. Admin edits
 * still appear immediately — every product mutation calls revalidateStorefront()
 * (see app/owner/actions.ts), which purges this cache on demand.
 */
export const revalidate = 60;

/** The home page is the one canonical address for the site root. */
export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/** schema.org WebSite + SearchAction — lets Google render a sitelinks search box. */
function WebsiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: STORE.name,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
    />
  );
}

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
      <WebsiteJsonLd />
      <HeroCarousel products={newArrivals} />
      <Reveal>
        <CategoryShowcase />
      </Reveal>

      <Reveal>
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
      </Reveal>

      <Reveal>
        <Testimonials />
      </Reveal>
    </>
  );
}
