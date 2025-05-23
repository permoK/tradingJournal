'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/hooks';
import AppLayout from '@/components/AppLayout';
import { supabase } from '@/lib/supabase';
import { FiUser, FiBarChart2, FiFileText, FiSearch } from 'react-icons/fi';
import { format } from 'date-fns';
import Link from 'next/link';
import { Database } from '@/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type JournalEntry = Database['public']['Tables']['journal_entries']['Row'];
type Trade = Database['public']['Tables']['trades']['Row'];

export default function Community() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [publicJournals, setPublicJournals] = useState<JournalEntry[]>([]);
  const [publicTrades, setPublicTrades] = useState<Trade[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('members');

  useEffect(() => {
    const fetchCommunityData = async () => {
      setLoading(true);

      // Fetch profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('streak_count', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      } else {
        setProfiles(profilesData || []);
      }

      // Fetch public journal entries
      const { data: journalsData, error: journalsError } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('is_private', false)
        .order('created_at', { ascending: false });

      if (journalsError) {
        console.error('Error fetching journals:', journalsError);
      } else {
        setPublicJournals(journalsData || []);
      }

      // Fetch public trades
      const { data: tradesData, error: tradesError } = await supabase
        .from('trades')
        .select('*')
        .eq('is_private', false)
        .order('trade_date', { ascending: false });

      if (tradesError) {
        console.error('Error fetching trades:', tradesError);
      } else {
        setPublicTrades(tradesData || []);
      }

      setLoading(false);
    };

    fetchCommunityData();
  }, []);

  // Filter data based on search term
  const filteredProfiles = profiles.filter(profile =>
    profile.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (profile.full_name && profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredJournals = publicJournals.filter(journal =>
    journal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    journal.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTrades = publicTrades.filter(trade =>
    trade.market.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trade.trade_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (trade.notes && trade.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const isLoading = authLoading || loading;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Community</h1>
        <p className="text-slate-700 font-medium">
          Connect with other Deriv traders and share insights
        </p>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-slate-500" />
          </div>
          <input
            type="text"
            placeholder="Search community..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-slate-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('members')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'members'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <FiUser className="inline mr-2" />
            Members
          </button>
          <button
            onClick={() => setActiveTab('journals')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'journals'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <FiFileText className="inline mr-2" />
            Public Journals
          </button>
          <button
            onClick={() => setActiveTab('trades')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'trades'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <FiBarChart2 className="inline mr-2" />
            Public Trades
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProfiles.length === 0 ? (
              <div className="col-span-full bg-white p-6 rounded-lg shadow-sm text-center">
                <p className="text-slate-700 font-medium">No members found</p>
              </div>
            ) : (
              filteredProfiles.map(profile => (
                <div key={profile.id} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl mr-4">
                      {profile.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{profile.username}</h3>
                      {profile.full_name && (
                        <p className="text-sm text-slate-600">{profile.full_name}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600 font-medium">Streak:</span>
                      <span className="font-medium text-slate-800">{profile.streak_count} days</span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-slate-600 font-medium">Member since:</span>
                      <span className="font-medium text-slate-800">{format(new Date(profile.created_at), 'MMM yyyy')}</span>
                    </div>
                    {profile.bio && (
                      <p className="mt-3 text-sm text-slate-700">{profile.bio}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Journals Tab */}
        {activeTab === 'journals' && (
          <div className="space-y-4">
            {filteredJournals.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow-sm text-center">
                <p className="text-slate-700 font-medium">No public journal entries found</p>
              </div>
            ) : (
              filteredJournals.map(journal => (
                <div key={journal.id} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{journal.title}</h3>
                      <p className="text-sm text-slate-600 mb-2">
                        {format(new Date(journal.created_at), 'MMMM d, yyyy')} • by {
                          profiles.find(p => p.id === journal.user_id)?.username || 'Unknown User'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 prose max-w-none text-slate-800">
                    {journal.content.length > 300
                      ? `${journal.content.substring(0, 300)}...`
                      : journal.content}
                  </div>

                  {journal.content.length > 300 && (
                    <Link
                      href={`/community/journal/${journal.id}`}
                      className="inline-block mt-2 text-indigo-700 font-medium hover:underline"
                    >
                      Read more
                    </Link>
                  )}

                  {journal.tags && journal.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {journal.tags.map(tag => (
                        <span
                          key={tag}
                          className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full"
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
            {filteredTrades.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-slate-700 font-medium">No public trades found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Trader</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Market</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Entry</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Exit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">P/L</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredTrades.map(trade => (
                      <tr key={trade.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-medium">
                          {profiles.find(p => p.id === trade.user_id)?.username || 'Unknown User'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                          {format(new Date(trade.trade_date), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">{trade.market}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">{trade.trade_type}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">{trade.entry_price}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">{trade.exit_price || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`${
                            trade.profit_loss > 0
                              ? 'text-emerald-600 font-medium'
                              : trade.profit_loss < 0
                                ? 'text-red-600 font-medium'
                                : 'text-slate-800 font-medium'
                          }`}>
                            {trade.profit_loss !== null ? (trade.profit_loss > 0 ? '+' : '') + trade.profit_loss.toFixed(2) : '-'}
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
