import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@fulbito/utils", "@fulbito/types"],
};

export default nextConfig;

