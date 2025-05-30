'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import Avatar from '@/components/Avatar';
import { FiArrowLeft, FiCalendar, FiBarChart2, FiFileText, FiAward, FiLayers, FiTrendingUp, FiDollarSign, FiTarget } from 'react-icons/fi';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import Link from 'next/link';

type Profile = Database['public']['Tables']['profiles']['Row'];
type JournalEntry = Database['public']['Tables']['journal_entries']['Row'];
type Trade = Database['public']['Tables']['trades']['Row'];
type Strategy = Database['public']['Tables']['strategies']['Row'];

interface ProfileStats {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalProfitLoss: number;
  currentWinStreak: number;
  maxWinStreak: number;
  topTradedPairs: Array<{
    market: string;
    count: number;
    profitLoss: number;
  }>;
}

function calculateProfileStats(trades: Trade[]): ProfileStats {
  // Filter only closed trades with profit/loss data
  const closedTrades = trades.filter(trade => trade.status === 'closed' && trade.profit_loss !== null);

  // Sort trades by date for streak calculation
  const sortedTrades = [...closedTrades].sort((a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime());

  // Basic statistics
  const totalTrades = closedTrades.length;
  const winningTrades = closedTrades.filter(trade => trade.profit_loss! > 0).length;
  const losingTrades = closedTrades.filter(trade => trade.profit_loss! < 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const totalProfitLoss = closedTrades.reduce((sum, trade) => sum + (trade.profit_loss || 0), 0);

  // Calculate winning streaks
  let currentWinStreak = 0;
  let maxWinStreak = 0;
  let tempStreak = 0;

  // Calculate current streak from the end
  for (let i = sortedTrades.length - 1; i >= 0; i--) {
    if (sortedTrades[i].profit_loss! > 0) {
      currentWinStreak++;
    } else {
      break;
    }
  }

  // Calculate max streak
  for (const trade of sortedTrades) {
    if (trade.profit_loss! > 0) {
      tempStreak++;
      maxWinStreak = Math.max(maxWinStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  // Calculate top traded pairs
  const pairStats = trades.reduce((acc, trade) => {
    if (!acc[trade.market]) {
      acc[trade.market] = { count: 0, profitLoss: 0 };
    }
    acc[trade.market].count++;
    if (trade.profit_loss !== null) {
      acc[trade.market].profitLoss += trade.profit_loss;
    }
    return acc;
  }, {} as Record<string, { count: number; profitLoss: number }>);

  const topTradedPairs = Object.entries(pairStats)
    .map(([market, stats]) => ({
      market,
      count: stats.count,
      profitLoss: stats.profitLoss
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return {
    totalTrades,
    winningTrades,
    losingTrades,
    winRate,
    totalProfitLoss,
    currentWinStreak,
    maxWinStreak,
    topTradedPairs
  };
}

export default function UserProfile({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [publicJournals, setPublicJournals] = useState<JournalEntry[]>([]);
  const [publicTrades, setPublicTrades] = useState<Trade[]>([]);
  const [publicStrategies, setPublicStrategies] = useState<Strategy[]>([]);
  const [profileStats, setProfileStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('journals');

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);

      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', params.id)
          .single();

        if (profileError || !profileData) {
          setError('Profile not found');
          setLoading(false);
          return;
        }

        setProfile(profileData);

        // Fetch public journal entries
        const { data: journalData, error: journalError } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', params.id)
          .eq('is_private', false)
          .order('created_at', { ascending: false })
          .limit(20);

        if (!journalError && journalData) {
          setPublicJournals(journalData);
        }

        // Fetch public trades (exclude demo trades)
        const { data: tradeData, error: tradeError } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', params.id)
          .eq('is_private', false)
          .eq('is_demo', false)
          .order('trade_date', { ascending: false })
          .limit(20);

        if (!tradeError && tradeData) {
          setPublicTrades(tradeData);
        }

        // Fetch public strategies
        const { data: strategyData, error: strategyError } = await supabase
          .from('strategies')
          .select('*')
          .eq('user_id', params.id)
          .eq('is_private', false)
          .order('created_at', { ascending: false })
          .limit(20);

        if (!strategyError && strategyData) {
          setPublicStrategies(strategyData);
        }

        // Fetch ALL trades for statistics calculation (both public and private)
        const { data: allTradesData, error: allTradesError } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', params.id)
          .order('trade_date', { ascending: false });

        if (!allTradesError && allTradesData) {
          const stats = calculateProfileStats(allTradesData);
          setProfileStats(stats);
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile');
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
          <Avatar
            username={profile.username}
            avatarUrl={profile.avatar_url}
            size="xl"
          />

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

      {/* Trading Statistics */}
      {profileStats && (
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Trading Performance</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Winning Streak */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <FiTrendingUp className="text-2xl text-emerald-600 mr-2" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">{profileStats.currentWinStreak}</div>
                  <div className="text-sm text-gray-600">Current Win Streak</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Max: {profileStats.maxWinStreak} wins
              </div>
            </div>

            {/* Profitability */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <FiDollarSign className="text-2xl text-blue-600 mr-2" />
                <div>
                  <div className={`text-2xl font-bold ${
                    profileStats.totalProfitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'
                  }`}>
                    {profileStats.totalProfitLoss >= 0 ? '+' : ''}${profileStats.totalProfitLoss.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Total P/L</div>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Win Rate: {profileStats.winRate.toFixed(1)}% ({profileStats.winningTrades}/{profileStats.totalTrades})
              </div>
            </div>

            {/* Top Traded Pairs */}
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                <FiTarget className="text-2xl text-purple-600 mr-2" />
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {profileStats.topTradedPairs.length > 0 ? profileStats.topTradedPairs[0].market : 'N/A'}
                  </div>
                  <div className="text-sm text-gray-600">Top Traded Pair</div>
                </div>
              </div>
              {profileStats.topTradedPairs.length > 0 && (
                <div className="text-xs text-gray-500">
                  {profileStats.topTradedPairs[0].count} trades
                  {profileStats.topTradedPairs.length > 1 && (
                    <span>, {profileStats.topTradedPairs[1].market} ({profileStats.topTradedPairs[1].count})</span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
          <button
            onClick={() => setActiveTab('strategies')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'strategies'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <FiLayers className="inline mr-2" />
            Public Strategies ({publicStrategies.length})
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
                <Link key={journal.id} href={`/community/journal/${journal.id}`}>
                  <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-slate-200 hover:border-indigo-300">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 hover:text-indigo-700 transition-colors">{journal.title}</h3>
                      <p className="text-sm text-slate-500 mb-2">
                        {format(new Date(journal.created_at), 'MMMM d, yyyy')}
                      </p>
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
                  <tbody className="bg-white divide-y divide-slate-200">
                    {publicTrades.map(trade => (
                      <tr key={trade.id} className="hover:bg-slate-50 cursor-pointer transition-colors">
                        <Link href={`/community/trade/${trade.id}`} className="contents">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">
                            {format(new Date(trade.trade_date), 'MMM d, yyyy')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 hover:text-indigo-700">{trade.market}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              trade.trade_type === 'buy' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              trade.status === 'open' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {trade.status}
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
            {publicStrategies.length === 0 ? (
              <div className="col-span-full bg-white p-6 rounded-lg shadow-sm text-center">
                <p className="text-gray-500">No public strategies found</p>
              </div>
            ) : (
              publicStrategies.map(strategy => (
                <Link key={strategy.id} href={`/community/strategy/${strategy.id}`}>
                  <div className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-slate-200 hover:border-indigo-300">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 hover:text-indigo-700 transition-colors mb-1">
                          {strategy.name}
                        </h3>
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
