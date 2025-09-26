'use client';

import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { FiArrowLeft } from 'react-icons/fi';

export default function CommunityJournalView({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <FiArrowLeft className="mr-2" />
          Back
        </button>

        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Community Feature</h1>
          <p className="text-gray-600 mb-6">
            The community journal feature is currently under development.
            This feature will allow users to share and view public journal entries.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
