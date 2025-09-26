'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { FiArrowLeft, FiEdit3 } from 'react-icons/fi';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditJournalEntry({ params }: PageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === 'loading') {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  if (!session) {
    router.push('/auth/login');
    return null;
  }
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/journal"
            className="inline-flex items-center text-slate-600 hover:text-slate-900"
          >
            <FiArrowLeft className="mr-2" />
            Back to Journal
          </Link>
        </div>

        {/* Placeholder Content */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          <div className="text-center">
            <FiEdit3 className="mx-auto h-16 w-16 text-slate-400 mb-4" />
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Edit Journal Entry</h1>
            <p className="text-slate-600 mb-6">
              This feature is currently under development. Journal entry editing will be available soon.
            </p>
            <div className="bg-slate-50 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-slate-900 mb-2">Coming Soon:</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Rich text editor with markdown support</li>
                <li>• Image upload and management</li>
                <li>• Attach trades and strategies</li>
                <li>• Tag management</li>
                <li>• Privacy settings</li>
                <li>• Live preview mode</li>
              </ul>
            </div>
            <Link
              href="/journal"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <FiArrowLeft className="mr-2" />
              Back to Journal
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}


