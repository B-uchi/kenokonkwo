import type { NextConfig } from "next";

const photoHost = process.env.R2_PUBLIC_URL
  ? new URL(process.env.R2_PUBLIC_URL)
  : null;

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 85],
    // fewer size buckets = fewer image transformations on Vercel's free tier
    deviceSizes: [640, 828, 1080, 1200, 1920],
    imageSizes: [128, 256, 384],
    // optimized images stay cached for a month instead of being redone
    minimumCacheTTL: 2678400,
    remotePatterns: photoHost
      ? [{ protocol: "https", hostname: photoHost.hostname, pathname: "/photos/**" }]
      : [],
  },
};

export default nextConfig;
