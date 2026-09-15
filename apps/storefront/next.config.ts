import type { NextConfig } from "next";

// Multi-Zones: this app is the "default" zone (owns "/" and everything not
// explicitly forwarded below). It proxies the admin zone's paths to wherever
// that app is actually running — see node_modules/next/dist/docs/01-app/02-guides/multi-zones.md.
const ADMIN_ORIGIN = process.env.ADMIN_ORIGIN ?? "http://localhost:3001";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
    unoptimized: true,
  },
  async rewrites() {
    return [
      { source: "/bunnycraft-admin", destination: `${ADMIN_ORIGIN}/bunnycraft-admin` },
      { source: "/bunnycraft-admin/:path+", destination: `${ADMIN_ORIGIN}/bunnycraft-admin/:path+` },
      {
        source: "/bunnycraft-admin-static/:path+",
        destination: `${ADMIN_ORIGIN}/bunnycraft-admin-static/:path+`,
      },
    ];
  },
};

export default nextConfig;
