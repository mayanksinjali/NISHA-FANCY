import type { Metadata } from "next";
import FavoritesView from "@/components/favorites-view";

export const metadata: Metadata = {
  title: "Favorites",
  description:
    "Pieces you've saved at Nisha Ghumti Fancy. Add to cart and order on WhatsApp.",
};

export default function FavoritesPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-7 md:px-8 md:py-12">
      <h1 className="font-display text-4xl tracking-[-0.03em] md:text-5xl">
        Favorites
      </h1>
      <div className="mt-7">
        <FavoritesView />
      </div>
    </div>
  );
}
