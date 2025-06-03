'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import Avatar from '@/components/Avatar';
import { FiArrowLeft } from 'react-icons/fi';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';

type JournalEntry = Database['public']['Tables']['journal_entries']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export default function CommunityJournalView({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [entry, setEntry] = useState<JournalEntry | null>(null);
  const [author, setAuthor] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntry = async () => {
      setLoading(true);

      try {
        // Fetch journal entry
        const { data: journalData, error: journalError } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('id', params.id)
          .eq('is_private', false)
          .single();

        if (journalError || !journalData) {
          setError('Journal entry not found or is private');
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
        console.error('Error fetching journal entry:', err);
        setError('Failed to load journal entry');
      }

      setLoading(false);
    };

    fetchEntry();
  }, [params.id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </AppLayout>
    );
  }

  if (error || !entry) {
    return (
      <AppLayout>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Entry Not Found</h1>
          <p className="text-slate-600 mb-4">The journal entry you're looking for doesn't exist or is private.</p>
          <button
            onClick={() => router.push('/community')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Back to Community
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <button
          onClick={() => router.push('/community')}
          className="flex items-center text-indigo-600 hover:text-indigo-800 mb-4 font-medium transition-colors"
        >
          <FiArrowLeft className="mr-2" />
          Back to Community
        </button>

        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{entry.title}</h1>
          <p className="text-slate-600 text-lg">
            {format(new Date(entry.created_at), 'MMMM d, yyyy')}
            {author && ` • by ${author.username}`}
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-sm border border-slate-200 mb-6">
        {entry.image_url && (
          <div className="mb-6">
            <img
              src={entry.image_url}
              alt="Journal entry image"
              className="w-full max-w-2xl h-auto rounded-lg border border-slate-200"
            />
          </div>
        )}

        <div className="prose prose-slate max-w-none">
          {entry.content.split('\n').map((paragraph, index) => (
            <p key={index} className="text-slate-800 leading-relaxed mb-4 text-base">
              {paragraph || '\u00A0'}
            </p>
          ))}
        </div>
      </div>

      {entry.tags && entry.tags.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {entry.tags.map(tag => (
              <span
                key={tag}
                className="inline-block px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {author && (
        <div className="bg-slate-50 p-6 rounded-lg border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-3">About the Author</h2>
          <div className="flex items-start space-x-4">
            <Avatar
              username={author.username}
              avatarUrl={author.avatar_url}
              size="lg"
            />
            <div className="flex-1">
              <p className="font-semibold text-slate-900 text-lg">{author.username}</p>
              {author.full_name && (
                <p className="text-slate-600 mb-2">{author.full_name}</p>
              )}
              {author.bio && (
                <p className="text-slate-700 leading-relaxed">{author.bio}</p>
              )}
              <div className="mt-3 text-sm text-slate-500">
                Member since {format(new Date(author.created_at), 'MMMM yyyy')} • {author.streak_count} day streak
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
