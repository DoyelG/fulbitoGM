import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@fulbito/utils", "@fulbito/types"],
  async rewrites() {
    const backend = process.env.BACKEND_URL || "http://localhost:3001";
    return {
      beforeFiles: [
        {
          source: "/api/auth/login",
          destination: `${backend}/api/auth/login`,
        },
        {
          source: "/api/auth/register",
          destination: `${backend}/api/auth/register`,
        },
      ],
      fallback: [],
    };
  },
};

export default nextConfig;
