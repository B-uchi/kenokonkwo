import type { NextConfig } from "next";

const photoHost = process.env.R2_PUBLIC_URL
  ? new URL(process.env.R2_PUBLIC_URL)
  : null;

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 85],
    remotePatterns: photoHost
      ? [{ protocol: "https", hostname: photoHost.hostname, pathname: "/photos/**" }]
      : [],
  },
};

export default nextConfig;
