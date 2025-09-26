'use client';

import { useSession } from 'next-auth/react';
import AppLayout from '@/components/AppLayout';
import { FiUsers, FiMessageSquare, FiTrendingUp } from 'react-icons/fi';

export default function Community() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Community</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Connect with other traders, share strategies, and learn from the community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <FiUsers className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Members</h3>
            <p className="text-gray-600">Connect with fellow traders and share experiences.</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <FiMessageSquare className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Discussions</h3>
            <p className="text-gray-600">Join conversations about trading strategies and market insights.</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <FiTrendingUp className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Strategies</h3>
            <p className="text-gray-600">Discover and share successful trading strategies.</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Coming Soon</h2>
          <p className="text-gray-600 mb-6">
            The community features are currently under development. Soon you'll be able to:
          </p>
          <ul className="text-left max-w-md mx-auto space-y-2 text-gray-600 mb-6">
            <li>• View and interact with other traders' profiles</li>
            <li>• Share and discover trading strategies</li>
            <li>• Read public journal entries</li>
            <li>• Participate in community discussions</li>
            <li>• Follow successful traders</li>
          </ul>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
