import type { NextConfig } from "next";

/**
 * Security headers applied to every response.
 *
 * The CSP is deliberately narrow: only the directives that can't break the
 * app. `frame-ancestors` (clickjacking), `base-uri` and `object-src` don't
 * touch scripts or inline JSON-LD, so they're safe to ship without nonces.
 * Add a full script-src policy only once you're ready to maintain a nonce.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Belt and braces with the CSP frame-ancestors below (older browsers).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Content-Security-Policy",
    value: "frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  // Don't advertise the framework and version on every response.
  poweredByHeader: false,
  // Hide the floating dev-tools button — its "issues" counter is noisy when
  // Supabase briefly hiccups, and errors still surface in the terminal.
  devIndicators: false,
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        // HSTS is only meaningful over HTTPS and is ignored on plain http.
        source: "/:path*",
        has: [{ type: "header", key: "x-forwarded-proto", value: "https" }],
        headers: [
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
      {
        // Product photos and the logo are content-addressed / immutable.
        source: "/:all*(jpeg|jpg|png|webp|svg|ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
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
