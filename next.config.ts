import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  experimental: {
    serverComponentsExternalPackages: [],
    missingSuspenseWithCSRBailout: {
      ignoreMissingSuspenseBoundaries: true
    },
    // Skip prerendering for auth pages
    skipMiddlewareUrlNormalize: true,
    // Add this to disable static generation for auth pages
    workerThreads: false,
    // Disable prerendering
    isrFlushToDisk: false,
    // Disable static generation for all pages
    disableStaticGeneration: true
  },
  skipTrailingSlashRedirect: true,
  output: 'standalone',
  suppressHydrationWarnings: true,
  optimizeFonts: false,
  images: {
    disableStaticImages: true,
    unoptimized: true,
  },
  // Add this to disable static generation for specific paths
  exportPathMap: async function() {
    return {
      '/': { page: '/' },
      // Exclude auth pages from static generation
      '/auth/login': { page: '/auth/login', skipPrerender: true },
      '/auth/register': { page: '/auth/register', skipPrerender: true },
      '/auth/forgot-password': { page: '/auth/forgot-password', skipPrerender: true },
      '/auth/verify-email': { page: '/auth/verify-email', skipPrerender: true },
      '/auth/callback': { page: '/auth/callback', skipPrerender: true },
    };
  }
};

export default nextConfig;
