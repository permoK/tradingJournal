'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import TradeFlowLogo from '@/components/TradeFlowLogo';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user is authenticated, redirect to dashboard
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }

  // Show landing page for unauthenticated users
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <TradeFlowLogo size="lg" variant="full" className="mx-auto mb-4" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">
              Master Your Trading Journey
            </h1>
            <p className="text-xl text-slate-700 mb-6">
              Comprehensive progress tracking, community collaboration, and data-driven insights for serious traders.
            </p>
            <ul className="space-y-2 mb-8">
              <li className="flex items-start">
                <svg className="h-6 w-6 text-emerald-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-slate-800 font-medium">Advanced trading analytics</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-emerald-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-slate-800 font-medium">Strategy performance tracking</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-emerald-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-slate-800 font-medium">Community learning & insights</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-emerald-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-slate-800 font-medium">Demo & real trade separation</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                Start Your Trading Journey
              </h2>
              <p className="text-slate-600 mb-6">
                Join the community of serious traders mastering their craft with TradeFlow.
              </p>

              <div className="space-y-3">
                <Link
                  href="/auth/register"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 block text-center"
                >
                  Create Free Account
                </Link>

                <Link
                  href="/auth/login"
                  className="w-full bg-white hover:bg-slate-50 text-slate-700 font-medium py-3 px-4 rounded-lg border border-slate-300 transition-colors duration-200 block text-center"
                >
                  Sign In
                </Link>
              </div>

              <p className="text-xs text-slate-500 mt-4">
                Free forever • No credit card required
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
