'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="flex flex-col justify-center">
            <h1 className="text-4xl font-bold text-slate-800 mb-4">
              Trading Progress Tracker
            </h1>
            <p className="text-xl text-slate-700 mb-6">
              Track your trading journey, learn together with friends, and master trading consistently.
            </p>
            <ul className="space-y-2 mb-8">
              <li className="flex items-start">
                <svg className="h-6 w-6 text-emerald-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-slate-800 font-medium">Track your learning progress</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-emerald-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-slate-800 font-medium">Keep a private trading journal</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-emerald-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-slate-800 font-medium">Share insights with friends</span>
              </li>
              <li className="flex items-start">
                <svg className="h-6 w-6 text-emerald-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-slate-800 font-medium">Build consistency with streak tracking</span>
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border border-slate-200">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-800 mb-4">
                Get Started Today
              </h2>
              <p className="text-slate-600 mb-6">
                Join thousands of traders improving their skills and tracking their progress.
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
