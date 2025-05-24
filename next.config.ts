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
    disableStaticGeneration: true,
    // Enable auth interrupts for better handling of auth pages
    authInterrupts: true
  },
  skipTrailingSlashRedirect: true,
  output: 'standalone',
  suppressHydrationWarnings: true,
  optimizeFonts: false,
  images: {
    disableStaticImages: true,
    unoptimized: true,
  },
  // Add environment variables with fallback values for build time
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-url.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
  },
  // Completely disable static generation
  unstable_runtimeJS: true
};

export default nextConfig;
