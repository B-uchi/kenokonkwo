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
  async headers() {
    return [
      {
        // audio-only WebM is served as video/webm by default; some browsers reject that
        source: "/audio/:file*.webm",
        headers: [{ key: "Content-Type", value: "audio/webm" }],
      },
    ];
  },
};

export default nextConfig;
