'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { FiArrowLeft, FiCalendar, FiBarChart2, FiFileText, FiAward } from 'react-icons/fi';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type JournalEntry = Database['public']['Tables']['journal_entries']['Row'];
type Trade = Database['public']['Tables']['trades']['Row'];

export default function UserProfile({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [publicJournals, setPublicJournals] = useState<JournalEntry[]>([]);
  const [publicTrades, setPublicTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('journals');

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      
      // For demo purposes, we'll use mock data
      // In a real application, you would fetch from Supabase
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for demonstration
      const mockProfiles = [
        {
          id: '1',
          created_at: '2023-01-01T00:00:00.000Z',
          updated_at: '2023-01-01T00:00:00.000Z',
          username: 'demo_user',
          full_name: 'Demo User',
          avatar_url: null,
          bio: 'I am learning Deriv trading and sharing my journey. Focused on forex and cryptocurrencies.',
          streak_count: 5,
          last_active: '2023-06-01T00:00:00.000Z'
        }
      ];
      
      const mockJournals = [
        {
          id: '1',
          created_at: '2023-03-10T00:00:00.000Z',
          user_id: '1',
          title: 'My First Week of Trading',
          content: 'This week I started trading on Deriv. I focused on learning the platform and making small trades to get comfortable with the process.',
          is_private: false,
          tags: ['beginner', 'learning']
        },
        {
          id: '3',
          created_at: '2023-03-20T00:00:00.000Z',
          user_id: '1',
          title: 'Trading Psychology',
          content: 'I realized how important emotional control is in trading. Today I made a mistake by letting fear drive my decision to exit a trade too early.',
          is_private: false,
          tags: ['psychology', 'emotions']
        }
      ];
      
      const mockTrades = [
        {
          id: '1',
          created_at: '2023-04-01T00:00:00.000Z',
          user_id: '1',
          trade_date: '2023-04-01T00:00:00.000Z',
          market: 'EUR/USD',
          trade_type: 'Buy',
          entry_price: 1.0850,
          exit_price: 1.0900,
          quantity: 1,
          profit_loss: 50,
          status: 'closed' as const,
          notes: 'Good trade based on support level',
          screenshot_url: null,
          is_private: false
        },
        {
          id: '2',
          created_at: '2023-04-05T00:00:00.000Z',
          user_id: '1',
          trade_date: '2023-04-05T00:00:00.000Z',
          market: 'BTC/USD',
          trade_type: 'Sell',
          entry_price: 28000,
          exit_price: 27500,
          quantity: 0.1,
          profit_loss: 50,
          status: 'closed' as const,
          notes: 'Sold at resistance',
          screenshot_url: null,
          is_private: false
        }
      ];
      
      const foundProfile = mockProfiles.find(p => p.id === params.id);
      
      if (foundProfile) {
        setProfile(foundProfile as Profile);
        
        // Filter journals and trades for this user
        const userJournals = mockJournals
          .filter(j => j.user_id === params.id && !j.is_private)
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        
        const userTrades = mockTrades
          .filter(t => t.user_id === params.id && !t.is_private)
          .sort((a, b) => new Date(b.trade_date).getTime() - new Date(a.trade_date).getTime());
        
        setPublicJournals(userJournals as JournalEntry[]);
        setPublicTrades(userTrades as Trade[]);
      } else {
        setError('User not found');
      }
      
      setLoading(false);
    };
    
    fetchProfileData();
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

  if (error || !profile) {
    return (
      <AppLayout>
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h1>
          <p className="text-gray-600 mb-4">The user profile you're looking for doesn't exist.</p>
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
      </div>
      
      {/* Profile Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-4xl">
            {profile.username.charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold text-gray-900">{profile.username}</h1>
            {profile.full_name && (
              <p className="text-lg text-gray-700">{profile.full_name}</p>
            )}
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3">
              <div className="flex items-center text-gray-600">
                <FiCalendar className="mr-2" />
                <span>Member since {format(new Date(profile.created_at), 'MMMM yyyy')}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <FiAward className="mr-2" />
                <span>{profile.streak_count} day streak</span>
              </div>
            </div>
            
            {profile.bio && (
              <p className="mt-4 text-gray-600">{profile.bio}</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('journals')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'journals'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiFileText className="inline mr-2" />
            Public Journals ({publicJournals.length})
          </button>
          <button
            onClick={() => setActiveTab('trades')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'trades'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiBarChart2 className="inline mr-2" />
            Public Trades ({publicTrades.length})
          </button>
        </nav>
      </div>
      
      {/* Tab Content */}
      <div>
        {/* Journals Tab */}
        {activeTab === 'journals' && (
          <div className="space-y-4">
            {publicJournals.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <p className="text-gray-500">No public journal entries found</p>
              </div>
            ) : (
              publicJournals.map(journal => (
                <div key={journal.id} className="bg-white p-6 rounded-lg shadow-sm">
                  <div>
                    <h3 className="text-lg font-semibold">{journal.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {format(new Date(journal.created_at), 'MMMM d, yyyy')}
                    </p>
                  </div>
                  
                  <div className="mt-2 prose max-w-none">
                    {journal.content.length > 200 
                      ? `${journal.content.substring(0, 200)}...` 
                      : journal.content}
                  </div>
                  
                  {journal.content.length > 200 && (
                    <button
                      onClick={() => router.push(`/community/journal/${journal.id}`)}
                      className="inline-block mt-2 text-blue-600 hover:underline"
                    >
                      Read more
                    </button>
                  )}
                  
                  {journal.tags && journal.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {journal.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Trades Tab */}
        {activeTab === 'trades' && (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {publicTrades.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-500">No public trades found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entry</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P/L</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {publicTrades.map(trade => (
                      <tr key={trade.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {format(new Date(trade.trade_date), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trade.market}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trade.trade_type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trade.entry_price}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trade.exit_price || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`${
                            trade.profit_loss > 0 
                              ? 'text-green-600' 
                              : trade.profit_loss < 0 
                                ? 'text-red-600' 
                                : 'text-gray-900'
                          }`}>
                            {trade.profit_loss !== null ? (trade.profit_loss > 0 ? '+' : '') + trade.profit_loss.toFixed(2) : '-'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            trade.status === 'open' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {trade.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
