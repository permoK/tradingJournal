'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import { supabase } from '@/lib/supabase';
import { FiUser, FiBarChart2, FiFileText, FiSearch, FiLayers } from 'react-icons/fi';
import { format } from 'date-fns';
import Link from 'next/link';
import { Database } from '@/types/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];
type JournalEntry = Database['public']['Tables']['journal_entries']['Row'];
type Trade = Database['public']['Tables']['trades']['Row'];
type Strategy = Database['public']['Tables']['strategies']['Row'];

export default function Community() {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [publicJournals, setPublicJournals] = useState<JournalEntry[]>([]);
  const [publicTrades, setPublicTrades] = useState<Trade[]>([]);
  const [publicStrategies, setPublicStrategies] = useState<Strategy[]>([]);
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

      // Fetch public strategies
      const { data: strategiesData, error: strategiesError } = await supabase
        .from('strategies')
        .select('*')
        .eq('is_private', false)
        .order('created_at', { ascending: false });

      if (strategiesError) {
        console.error('Error fetching strategies:', strategiesError);
      } else {
        setPublicStrategies(strategiesData || []);
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

  const filteredStrategies = publicStrategies.filter(strategy =>
    strategy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (strategy.description && strategy.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (strategy.category && strategy.category.toLowerCase().includes(searchTerm.toLowerCase()))
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
          <button
            onClick={() => setActiveTab('strategies')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'strategies'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            <FiLayers className="inline mr-2" />
            Public Strategies
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
                <Link key={profile.id} href={`/community/profile/${profile.id}`}>
                  <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-slate-200 hover:border-indigo-300">
                    <div className="flex items-center">
                      <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xl mr-4">
                        {profile.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 hover:text-indigo-700 transition-colors">{profile.username}</h3>
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
                        <p className="mt-3 text-sm text-slate-700 line-clamp-2">{profile.bio}</p>
                      )}
                    </div>
                    <div className="mt-4 text-xs text-indigo-600 font-medium">
                      Click to view profile →
                    </div>
                  </div>
                </Link>
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
                <Link key={journal.id} href={`/community/journal/${journal.id}`}>
                  <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-slate-200 hover:border-indigo-300">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 hover:text-indigo-700 transition-colors">{journal.title}</h3>
                        <p className="text-sm text-slate-600 mb-2">
                          {format(new Date(journal.created_at), 'MMMM d, yyyy')} • by {
                            profiles.find(p => p.id === journal.user_id)?.username || 'Unknown User'
                          }
                        </p>
                      </div>
                    </div>

                    <div className="mt-2 prose max-w-none text-slate-800">
                      {journal.content.length > 200
                        ? `${journal.content.substring(0, 200)}...`
                        : journal.content}
                    </div>

                    {journal.tags && journal.tags.length > 0 && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        {journal.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {journal.tags.length > 3 && (
                          <span className="text-xs text-slate-500">+{journal.tags.length - 3} more</span>
                        )}
                      </div>
                    )}

                    <div className="mt-4 text-xs text-indigo-600 font-medium">
                      Click to read full entry →
                    </div>
                  </div>
                </Link>
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
                      <tr key={trade.id} className="hover:bg-slate-50 cursor-pointer transition-colors">
                        <Link href={`/community/trade/${trade.id}`} className="contents">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-medium hover:text-indigo-700">
                            {profiles.find(p => p.id === trade.user_id)?.username || 'Unknown User'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                            {format(new Date(trade.trade_date), 'MMM d, yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800 font-medium">{trade.market}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              trade.trade_type === 'buy'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {trade.trade_type.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">{trade.entry_price.toFixed(4)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                            {trade.exit_price ? trade.exit_price.toFixed(4) : '-'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`font-medium ${
                              trade.profit_loss > 0
                                ? 'text-emerald-600'
                                : trade.profit_loss < 0
                                  ? 'text-red-600'
                                  : 'text-slate-800'
                            }`}>
                              {trade.profit_loss !== null ? (trade.profit_loss > 0 ? '+$' : '-$') + Math.abs(trade.profit_loss).toFixed(2) : '-'}
                            </span>
                          </td>
                        </Link>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Strategies Tab */}
        {activeTab === 'strategies' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStrategies.length === 0 ? (
              <div className="col-span-full bg-white p-6 rounded-lg shadow-sm text-center">
                <p className="text-slate-700 font-medium">No public strategies found</p>
              </div>
            ) : (
              filteredStrategies.map(strategy => (
                <Link key={strategy.id} href={`/community/strategy/${strategy.id}`}>
                  <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-slate-200 hover:border-indigo-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 hover:text-indigo-700 transition-colors mb-1">
                          {strategy.name}
                        </h3>
                        <p className="text-sm text-slate-600 mb-2">
                          by {profiles.find(p => p.id === strategy.user_id)?.username || 'Unknown User'}
                        </p>
                        {strategy.category && (
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded-full">
                            {strategy.category}
                          </span>
                        )}
                      </div>
                      {strategy.image_url && (
                        <img
                          src={strategy.image_url}
                          alt={strategy.name}
                          className="w-16 h-16 rounded-lg object-cover border border-slate-200 ml-4"
                        />
                      )}
                    </div>

                    {strategy.description && (
                      <p className="text-sm text-slate-700 mb-4 line-clamp-3">
                        {strategy.description}
                      </p>
                    )}

                    <div className="flex justify-between items-center text-sm">
                      <div className="flex space-x-4">
                        <div className="text-slate-600">
                          <span className="font-medium">Success Rate:</span>
                          <span className={`ml-1 font-semibold ${
                            strategy.success_rate >= 70 ? 'text-emerald-600' :
                            strategy.success_rate >= 50 ? 'text-amber-600' : 'text-red-600'
                          }`}>
                            {strategy.success_rate.toFixed(1)}%
                          </span>
                        </div>
                        <div className="text-slate-600">
                          <span className="font-medium">Trades:</span>
                          <span className="ml-1 font-semibold text-slate-800">{strategy.total_trades}</span>
                        </div>
                      </div>
                      <div className="text-xs text-slate-500">
                        {format(new Date(strategy.created_at), 'MMM d, yyyy')}
                      </div>
                    </div>

                    <div className="mt-4 text-xs text-indigo-600 font-medium">
                      Click to view strategy →
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
