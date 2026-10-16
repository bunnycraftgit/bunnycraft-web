import type { NextConfig } from "next";

// Multi-Zones: distinct assetPrefix so this zone's _next/static assets don't
// collide with the storefront zone's own assets once both are proxied under
// the same public domain. See node_modules/next/dist/docs/01-app/02-guides/multi-zones.md.
const nextConfig: NextConfig = {
  assetPrefix: "/bunnycraft-admin-static",
  // Inlined at build time so the admin zone always gets its own session
  // cookie, even when both apps run in one process tree sharing env vars
  // (e.g. a single Railway service running `npm start`).
  env: {
    AUTH_COOKIE_PREFIX: process.env.AUTH_COOKIE_PREFIX ?? "admin-authjs",
  },
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
