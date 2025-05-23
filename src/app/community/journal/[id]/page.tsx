'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
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
      
      // For demo purposes, we'll use mock data
      // In a real application, you would fetch from Supabase
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for demonstration
      const mockEntries = [
        {
          id: '1',
          created_at: '2023-03-10T00:00:00.000Z',
          user_id: '1',
          title: 'My First Week of Trading',
          content: 'This week I started trading on Deriv. I focused on learning the platform and making small trades to get comfortable with the process.\n\nI began by watching some tutorial videos and reading the documentation. The platform is quite intuitive, but there are many features to explore.\n\nI made my first trade on EUR/USD with a small amount. It was a buy position based on a support level I identified. The trade was successful, and I made a small profit.\n\nI\'m planning to continue with small trades while I learn more about technical analysis and develop my trading strategy.',
          is_private: false,
          tags: ['beginner', 'learning']
        },
        {
          id: '3',
          created_at: '2023-03-20T00:00:00.000Z',
          user_id: '1',
          title: 'Trading Psychology',
          content: 'I realized how important emotional control is in trading. Today I made a mistake by letting fear drive my decision to exit a trade too early.\n\nI had a good position on Gold, and all indicators were pointing to continued upward movement. However, after a small pullback, I got nervous and closed the position. Shortly after, the price continued upward as initially expected.\n\nThis experience taught me that I need to work on my emotional discipline. I\'m going to start keeping a separate journal specifically for tracking my emotional state during trades.\n\nSome strategies I plan to implement:\n1. Set clear entry and exit points before entering a trade\n2. Use stop losses instead of manually exiting due to fear\n3. Take breaks when feeling emotionally charged\n4. Review my trades objectively after the fact',
          is_private: false,
          tags: ['psychology', 'emotions']
        }
      ];
      
      const mockProfiles = [
        {
          id: '1',
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-01T00:00:00.000Z',
          username: 'demo_user',
          full_name: 'Demo User',
          avatar_url: null,
          bio: 'I am learning Deriv trading',
          streak_count: 5,
          last_active: '2023-06-01T00:00:00.000Z'
        }
      ];
      
      const foundEntry = mockEntries.find(e => e.id === params.id);
      
      if (foundEntry) {
        setEntry(foundEntry as JournalEntry);
        
        // Find the author
        const foundAuthor = mockProfiles.find(p => p.id === foundEntry.user_id);
        if (foundAuthor) {
          setAuthor(foundAuthor as Profile);
        }
      } else {
        setError('Journal entry not found or is private');
      }
      
      setLoading(false);
    };
    
    fetchEntry();
  }, [params.id]);

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
          <p className="text-gray-600 mb-4">The journal entry you're looking for doesn't exist or is private.</p>
          <button
            onClick={() => router.push('/community')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
          className="flex items-center text-blue-600 hover:underline mb-4"
        >
          <FiArrowLeft className="mr-2" />
          Back to Community
        </button>
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{entry.title}</h1>
          <p className="text-gray-600">
            {format(new Date(entry.created_at), 'MMMM d, yyyy')}
            {author && ` • by ${author.username}`}
          </p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="prose max-w-none">
          {entry.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
      
      {entry.tags && entry.tags.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-2">Tags</h2>
          <div className="flex flex-wrap gap-2">
            {entry.tags.map(tag => (
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
      
      {author && (
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Author</h2>
          <div className="flex items-center">
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl mr-4">
              {author.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium">{author.username}</p>
              {author.full_name && (
                <p className="text-sm text-gray-500">{author.full_name}</p>
              )}
              {author.bio && (
                <p className="text-sm text-gray-600 mt-1">{author.bio}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
