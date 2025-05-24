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
  // Moved from experimental to root level
  skipMiddlewareUrlNormalize: true,
  // Moved from experimental to root level
  serverExternalPackages: [],
  experimental: {
    // Keep only valid experimental options
    workerThreads: false,
    isrFlushToDisk: false,
    authInterrupts: true
  },
  skipTrailingSlashRedirect: true,
  output: 'standalone',
  images: {
    disableStaticImages: true,
    unoptimized: true,
  },
  // Add environment variables with fallback values for build time
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
  }
};

export default nextConfig;
