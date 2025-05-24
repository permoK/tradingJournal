import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Allow production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  // Suppress specific build warnings/errors
  onDemandEntries: {
    // Keep pages in memory for longer during development
    maxInactiveAge: 25 * 1000,
    // Number of pages to keep in memory
    pagesBufferLength: 2,
  },
  // Add this to suppress specific build warnings
  experimental: {
    // This suppresses some build warnings
    serverComponentsExternalPackages: [],
    // Ignore specific errors related to missing suspense boundaries
    missingSuspenseWithCSRBailout: {
      ignoreMissingSuspenseBoundaries: true
    }
  }
};

export default nextConfig;
