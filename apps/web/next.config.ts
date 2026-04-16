import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@fulbito/utils", "@fulbito/types"],
  async rewrites() {
    const backend = process.env.BACKEND_URL || "http://localhost:3001";
    return [
      // Keep credential/register endpoints in backend.
      {
        source: "/api/auth/login",
        destination: `${backend}/api/auth/login`,
      },
      {
        source: "/api/auth/register",
        destination: `${backend}/api/auth/register`,
      },
      // Let NextAuth routes stay in this app (/api/auth/* except login/register).
      {
        source: "/api/:path((?!auth/).*)",
        destination: `${backend}/api/:path`,
      },
    ];
  },
};

export default nextConfig;
