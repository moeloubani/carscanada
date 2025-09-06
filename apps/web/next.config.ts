import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // Temporarily ignore ESLint errors during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Continue build even if there are type errors
    ignoreBuildErrors: false,
  },
  output: 'standalone',
};

export default nextConfig;
