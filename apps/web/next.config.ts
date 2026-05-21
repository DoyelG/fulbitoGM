import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@fulbito/utils", "@fulbito/types"],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'firebasestorage.googleapis.com' },
    ],
  },
};

export default nextConfig;
