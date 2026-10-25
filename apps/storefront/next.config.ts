import type { NextConfig } from "next";

// Multi-Zones: this app is the "default" zone (owns "/" and everything not
// explicitly forwarded below). It proxies the admin zone's paths to wherever
// that app is actually running — see node_modules/next/dist/docs/01-app/02-guides/multi-zones.md.
const ADMIN_ORIGIN = process.env.ADMIN_ORIGIN ?? "http://localhost:3001";

const nextConfig: NextConfig = {
  // Sequelize loads its dialect dynamically and mysql2 has native-ish deps;
  // load both with Node's require instead of bundling them.
  serverExternalPackages: ["sequelize", "mysql2"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "i.pravatar.cc" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
    unoptimized: true,
  },
  // When the admin zone has its own public hostname (ADMIN_PUBLIC_URL, e.g.
  // https://admin.example.com), send /bunnycraft-admin visitors there instead
  // of proxying. Proxying only forwards admin *pages* — the admin app's own
  // /api/* calls (login included) would land on this app instead.
  async redirects() {
    const adminPublicUrl = process.env.ADMIN_PUBLIC_URL?.replace(/\/$/, "");
    if (!adminPublicUrl) return [];
    return [
      {
        source: "/bunnycraft-admin/:path*",
        destination: `${adminPublicUrl}/bunnycraft-admin/:path*`,
        permanent: false,
      },
    ];
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
