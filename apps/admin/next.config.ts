import type { NextConfig } from "next";

// Multi-Zones: distinct assetPrefix so this zone's _next/static assets don't
// collide with the storefront zone's own assets once both are proxied under
// the same public domain. See node_modules/next/dist/docs/01-app/02-guides/multi-zones.md.
const nextConfig: NextConfig = {
  assetPrefix: "/bunnycraft-admin-static",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
