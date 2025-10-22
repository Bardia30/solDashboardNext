import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    // ❗️Build will succeed even with lint errors
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
