/**
 * Customer testimonials / WhatsApp thank-you messages.
 *
 * The store serves Butwal only, so every location is a Butwal neighborhood.
 * PLACEHOLDER CONTENT — the store owner will supply the real quotes (or
 * screenshots) later. Swap the entries below in one place; the rendering
 * component reads straight from this array. No backend or DB table needed.
 */
export type Testimonial = {
  /** The customer's words. */
  quote: string;
  /** Display name — first name + initial is fine. */
  name: string;
  /** Optional Butwal neighborhood / context line. */
  location?: string;
  /** 1–5, defaults to 5 in the UI when omitted. */
  rating?: number;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Absolutely loved the fabric quality — exactly like the photos. Delivery was quick and the size advice over WhatsApp was spot on.",
    name: "Sunita K.",
    location: "Butwal 12, Tamnagar",
    rating: 5,
  },
  {
    quote:
      "Ordered a kurta for my brother's wedding and got so many compliments. Will definitely shop again.",
    name: "Ramesh T.",
    location: "Butwal 8, Kalikanagar",
    rating: 5,
  },
  {
    quote:
      "The team replied within minutes and helped me pick the right size. Very smooth, honest service.",
    name: "Anita G.",
    location: "Butwal 10, Devinagar",
    rating: 5,
  },
  {
    quote:
      "Great value for money and the stitching is neat. Cash on delivery made it stress-free.",
    name: "Bikash S.",
    location: "Butwal 6, Chauraha",
    rating: 4,
  },
  {
    quote:
      "My go-to store for family clothes now. Everything I've ordered has lasted well.",
    name: "Pooja M.",
    location: "Butwal 5, Traffic Chowk",
    rating: 5,
  },
  {
    quote:
      "Thank you so much! The dress fits perfectly and arrived earlier than expected.",
    name: "Sarita L.",
    location: "Butwal 4, Milan Chowk",
    rating: 5,
  },
];
