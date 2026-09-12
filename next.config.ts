import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos",
      },
      {
        protocol: "https",
        hostname: "i.pravatar.cc",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    // Placeholder imagery is served from picsum.photos, which redirects to
    // fastly.picsum.photos — proxying it through Next's image optimizer adds
    // a server-side hop that's been unreliable. Fetch it directly instead;
    // revisit once real product photography (likely self-hosted) lands.
    unoptimized: true,
  },
};

export default nextConfig;
