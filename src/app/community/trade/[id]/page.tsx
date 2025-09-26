'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { FiArrowLeft, FiBarChart2 } from 'react-icons/fi';

interface CommunityTradePageProps {
  params: Promise<{ id: string }>;
}

export default function CommunityTradeDetail({ params }: CommunityTradePageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

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
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
          >
            <FiArrowLeft className="h-5 w-5 mr-1" />
            Back
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Community Trade</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <FiBarChart2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Trade View Coming Soon</h2>
          <p className="text-gray-600 mb-6">
            Community trade viewing is currently under development. Soon you'll be able to:
          </p>
          <ul className="text-left max-w-md mx-auto space-y-2 text-gray-600 mb-6">
            <li>• View detailed trade information and analysis</li>
            <li>• See trade entry and exit points</li>
            <li>• Access trade screenshots and charts</li>
            <li>• View trader profiles and performance</li>
            <li>• Learn from successful trading strategies</li>
          </ul>
          <button
            onClick={() => router.push('/community')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Community
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
