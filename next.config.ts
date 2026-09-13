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
