import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Remote images we render through next/image.
    // - *.supabase.co  -> product photos served from Supabase Storage
    // - images.unsplash.com -> editorial placeholder photography (swap for your own shoots)
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "*.supabase.in" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    // Product photos uploaded before the admin panel started setting a
    // per-file cacheControl fall back to the bucket default, which Supabase
    // serves as `Cache-Control: no-cache`. Without a floor, the image
    // optimizer computes maxAge = 0 for those, caches nothing, and re-fetches
    // every photo from Supabase on every request — which is what made photos
    // intermittently drop on the live site (and forced `unoptimized`).
    // minimumCacheTTL overrides the upstream TTL, so optimized images are
    // cached (and served from Vercel's CDN) for at least a day. Photo URLs
    // are content-addressed (new upload = new UUID path), so a long TTL is safe.
    minimumCacheTTL: 86400,
  },
  experimental: {
    serverActions: {
      // Admin uploads a photo straight from a phone. The client downscales it first
      // (see lib/compress-image.ts) but keep headroom for large originals.
      bodySizeLimit: "16mb",
    },
  },
};

export default nextConfig;
