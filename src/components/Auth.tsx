'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // For demo purposes, we'll simulate a successful signup
    // In a real application, you would use Supabase or another auth provider

    setTimeout(() => {
      // Redirect to dashboard
      router.push('/dashboard');
      setLoading(false);
    }, 1500);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // For demo purposes, we'll simulate a successful login
    // In a real application, you would use Supabase or another auth provider

    setTimeout(() => {
      // Redirect to dashboard
      router.push('/dashboard');
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h2 className="mb-6 text-2xl font-bold text-center">Deriv Progress Tracker</h2>

        {error && (
          <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-lg">
            {error}
          </div>
        )}

        <form>
          <div className="mb-4">
            <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={handleSignIn}
              disabled={loading}
              className="flex-1 px-4 py-2 text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Sign In'}
            </button>

            <button
              type="button"
              onClick={handleSignUp}
              disabled={loading}
              className="flex-1 px-4 py-2 text-white bg-emerald-600 rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Loading...' : 'Sign Up'}
            </button>
          </div>

          <div className="mt-4 text-center text-sm text-gray-500">
            <p>For demo purposes, you can use any email and password</p>
          </div>
        </form>
      </div>
    </div>
  );
}
