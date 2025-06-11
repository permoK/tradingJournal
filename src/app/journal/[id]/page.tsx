'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useJournalEntries, useProfile } from '@/lib/hooks';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import Avatar from '@/components/Avatar';
import AttachedItems from '@/components/journal/AttachedItems';
import { FiEdit2, FiTrash2, FiArrowLeft, FiEyeOff } from 'react-icons/fi';
import { format } from 'date-fns';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import ReactMarkdown from 'react-markdown';

export default function JournalEntryView({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const { entries } = useJournalEntries(user?.id);
  const { profile } = useProfile(user?.id);

  const [entry, setEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Find the entry with the matching ID
    const foundEntry = entries.find(e => e.id === params.id);

    if (foundEntry) {
      setEntry(foundEntry);
    } else {
      setError('Journal entry not found');
    }

    setLoading(false);
  }, [entries, params.id]);

  const deleteEntry = async () => {
    if (!confirm('Are you sure you want to delete this journal entry?')) return;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real app, you would do:
      // const { error } = await supabase
      //   .from('journal_entries')
      //   .delete()
      //   .eq('id', params.id);

      // if (error) throw error;

      // Redirect to journal page
      router.push('/journal');
    } catch (err) {
      console.error('Error deleting journal entry:', err);
      setError('Failed to delete journal entry');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </AppLayout>
    );
  }

  if (error || !entry) {
    return (
      <AppLayout>
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Entry Not Found</h1>
          <p className="text-gray-600 mb-4">The journal entry you're looking for doesn't exist or you don't have permission to view it.</p>
          <button
            onClick={() => router.push('/journal')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Journal
          </button>
        </div>
      </AppLayout>
    );
  }

  const isOwner = entry.user_id === user?.id;

  return (
    <AppLayout>
      <div className="mb-6">
        <button
          onClick={() => router.push('/journal')}
          className="flex items-center text-blue-600 hover:underline mb-4"
        >
          <FiArrowLeft className="mr-2" />
          Back to Journal
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{entry.title}</h1>
            <p className="text-gray-600">
              {format(new Date(entry.created_at), 'MMMM d, yyyy')}
              {entry.is_private && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                  <FiEyeOff className="mr-1" />
                  Private
                </span>
              )}
            </p>
          </div>

          {isOwner && (
            <div className="flex gap-2">
              <Link
                href={`/journal/edit/${entry.id}`}
                className="flex items-center px-3 py-2 text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100"
              >
                <FiEdit2 className="mr-2" />
                Edit
              </Link>
              <button
                onClick={deleteEntry}
                className="flex items-center px-3 py-2 text-red-600 bg-red-50 rounded-md hover:bg-red-100"
              >
                <FiTrash2 className="mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        {entry.image_url && (
          <div className="mb-6">
            <img
              src={entry.image_url}
              alt="Journal entry image"
              className="w-full max-w-2xl h-auto rounded-lg border border-slate-200"
            />
          </div>
        )}

        <div className="prose max-w-none">
          <ReactMarkdown>{entry.content}</ReactMarkdown>
        </div>

        {/* Display attached trades and strategies */}
        <AttachedItems
          tradeIds={entry.trade_ids}
          strategyIds={entry.strategy_ids}
        />
      </div>

      {entry.tags && entry.tags.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {entry.tags.map((tag: string) => (
              <span
                key={tag}
                className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Author</h2>
        <div className="flex items-center">
          <div className="mr-4">
            <Avatar
              username={profile?.username || 'Unknown'}
              avatarUrl={profile?.avatar_url}
              size="md"
            />
          </div>
          <div>
            <p className="font-medium">{profile?.username}</p>
            {profile?.full_name && (
              <p className="text-sm text-gray-500">{profile.full_name}</p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
