import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel handles output natively — no standalone needed
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  devIndicators: false,
};

export default nextConfig;
