'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import AppLayout from '@/components/AppLayout';
import Avatar from '@/components/Avatar';
import AttachedItems from '@/components/journal/AttachedItems';
import { FiEdit2, FiTrash2, FiArrowLeft, FiEyeOff } from 'react-icons/fi';
import { format } from 'date-fns';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';

export default function JournalEntryView({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [entry, setEntry] = useState<any>(null);
  const [author, setAuthor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showImageModal, setShowImageModal] = useState(false);

  useEffect(() => {
    const fetchEntry = async () => {
      setLoading(true);
      try {
        const { data: journalData, error: journalError } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('id', params.id)
          .single();

        if (journalError || !journalData) {
          setError('Journal entry not found or you do not have permission to view it.');
          setLoading(false);
          return;
        }
        setEntry(journalData);

        // Fetch author profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', journalData.user_id)
          .single();
        if (!profileError && profileData) {
          setAuthor(profileData);
        }
      } catch (err) {
        setError('Failed to load journal entry');
      }
      setLoading(false);
    };
    fetchEntry();
  }, [params.id]);

  const deleteEntry = async () => {
    if (!confirm('Are you sure you want to delete this journal entry?')) return;
    try {
      const { error } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', params.id);
      if (error) throw error;
      router.push('/journal');
    } catch (err) {
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
          <p className="text-gray-600 mb-4">{error || 'The journal entry you\'re looking for doesn\'t exist or you don\'t have permission to view it.'}</p>
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

          {/* Only show edit/delete if author is current user (optional, needs auth context) */}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        {entry.image_url && (
          <div className="mb-6">
            <img
              src={entry.image_url}
              alt="Journal entry image"
              className="w-full max-w-2xl h-auto rounded-lg border border-slate-200 cursor-pointer transition-transform hover:scale-105"
              onClick={() => setShowImageModal(true)}
            />
            {showImageModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80" onClick={() => setShowImageModal(false)}>
                <img
                  src={entry.image_url}
                  alt="Journal entry preview"
                  className="max-w-full max-h-[90vh] rounded-lg shadow-lg border-4 border-white"
                  onClick={e => e.stopPropagation()}
                />
                <button
                  className="absolute top-8 right-8 text-white text-3xl font-bold bg-black bg-opacity-40 rounded-full px-3 py-1 hover:bg-opacity-70 focus:outline-none"
                  onClick={() => setShowImageModal(false)}
                  aria-label="Close preview"
                >
                  &times;
                </button>
              </div>
            )}
          </div>
        )}

        <div className="prose prose-slate max-w-none text-slate-900">
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
          <h2 className="text-lg font-semibold mb-2 text-slate-900">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {entry.tags.map((tag: string) => (
              <span
                key={tag}
                className="inline-block px-2 py-1 text-xs font-medium bg-blue-200 text-blue-900 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {author && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-2 text-slate-900">Author</h2>
          <div className="flex items-center">
            <div className="mr-4">
              <Avatar
                username={author.username || 'Unknown'}
                avatarUrl={author.avatar_url}
                size="md"
              />
            </div>
            <div>
              <p className="font-medium text-slate-900">{author.username}</p>
              {author.full_name && (
                <p className="text-sm text-slate-700">{author.full_name}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
