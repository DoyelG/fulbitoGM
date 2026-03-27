import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@fulbito/utils", "@fulbito/types", "@fulbito/ui"],
};

export default nextConfig;
