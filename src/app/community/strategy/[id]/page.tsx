'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import Avatar from '@/components/Avatar';
import { FiArrowLeft, FiUser, FiCalendar, FiBarChart2, FiLayers, FiTrendingUp, FiTrendingDown, FiCopy } from 'react-icons/fi';
import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { Database } from '@/types/database.types';
import Link from 'next/link';

type Strategy = Database['public']['Tables']['strategies']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface CommunityStrategyPageProps {
  params: Promise<{ id: string }>;
}

interface StrategyWithTrades extends Strategy {
  real_trades?: Array<{
    id: string;
    profit_loss: number | null;
    status: string;
    is_demo: boolean;
  }>;
}

export default function CommunityStrategyPage({ params }: CommunityStrategyPageProps) {
  const router = useRouter();
  const [strategy, setStrategy] = useState<StrategyWithTrades | null>(null);
  const [author, setAuthor] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [duplicating, setDuplicating] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Calculate real-time strategy performance from real trades only
  const calculateStrategyPerformance = (strategy: StrategyWithTrades) => {
    const realTrades = strategy.real_trades || [];
    // Filter out demo trades and only include closed trades with profit/loss data
    const closedRealTrades = realTrades.filter(trade =>
      trade.status === 'closed' &&
      trade.profit_loss !== null &&
      trade.is_demo === false
    );

    if (closedRealTrades.length === 0) {
      return {
        totalTrades: 0,
        successRate: 0,
        profitableTrades: 0
      };
    }

    const profitableTrades = closedRealTrades.filter(trade => trade.profit_loss! > 0);
    const successRate = (profitableTrades.length / closedRealTrades.length) * 100;

    return {
      totalTrades: closedRealTrades.length,
      successRate: successRate,
      profitableTrades: profitableTrades.length
    };
  };

  useEffect(() => {
    const fetchStrategy = async () => {
      try {
        const { id } = await params;

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        setCurrentUser(user);

        // Fetch strategy with real trades only
        const { data: strategyData, error: strategyError } = await supabase
          .from('strategies')
          .select(`
            *,
            real_trades:trades!strategy_id(
              id,
              profit_loss,
              status,
              is_demo
            )
          `)
          .eq('id', id)
          .eq('is_private', false)
          .single();

        if (strategyError) {
          throw new Error('Strategy not found or is private');
        }

        setStrategy(strategyData);

        // Fetch author profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', strategyData.user_id)
          .single();

        if (!profileError) {
          setAuthor(profileData);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStrategy();
  }, [params]);

  const handleDuplicate = async () => {
    if (!strategy || !currentUser) return;

    setDuplicating(true);
    try {
      const response = await fetch(`/api/strategies/${strategy.id}/duplicate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to duplicate strategy');
      }

      const data = await response.json();

      // Show success message and redirect to user's strategies
      alert('Strategy duplicated successfully! You can find it in your strategies page.');
      router.push('/strategies');
    } catch (error: any) {
      alert('Error duplicating strategy: ' + error.message);
    } finally {
      setDuplicating(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="w-12 h-12 border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </AppLayout>
    );
  }

  if (error || !strategy) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Strategy Not Found</h2>
          <p className="text-slate-600 mb-4">{error || 'This strategy may be private or does not exist.'}</p>
          <Link
            href="/community"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Back to Community
          </Link>
        </div>
      </AppLayout>
    );
  }

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 70) return 'text-emerald-600';
    if (rate >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

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

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{strategy.name}</h1>
            <div className="flex items-center text-slate-600 text-lg mb-4">
              <FiUser className="mr-2" />
              <span>by {author?.username || 'Unknown User'}</span>
              <span className="mx-3">•</span>
              <FiCalendar className="mr-2" />
              <span>{format(new Date(strategy.created_at), 'MMMM d, yyyy')}</span>
              {strategy.duplicate_count > 0 && (
                <>
                  <span className="mx-3">•</span>
                  <FiLayers className="mr-2" />
                  <span>{strategy.duplicate_count} duplicates</span>
                </>
              )}
            </div>
            {strategy.category && (
              <span className="inline-block px-3 py-1 text-sm font-medium bg-indigo-100 text-indigo-800 rounded-full">
                {strategy.category}
              </span>
            )}
          </div>

          {/* Duplicate Button */}
          {currentUser && currentUser.id !== strategy.user_id && (
            <div className="ml-4">
              <button
                onClick={handleDuplicate}
                disabled={duplicating}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                <FiCopy className="mr-2 h-4 w-4" />
                {duplicating ? 'Duplicating...' : 'Duplicate Strategy'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Strategy Image */}
          {strategy.image_url && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <img
                src={strategy.image_url}
                alt={strategy.name}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Description */}
          {strategy.description && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Overview</h2>
              <p className="text-slate-700 leading-relaxed">{strategy.description}</p>
            </div>
          )}

          {/* Detailed Description */}
          {strategy.details && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Strategy Details</h2>
              <div className="prose prose-slate max-w-none">
                {strategy.details.split('\n').map((paragraph, index) => (
                  <p key={index} className="text-slate-700 leading-relaxed mb-4">
                    {paragraph || '\u00A0'}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Performance Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center">
              <FiBarChart2 className="mr-2" />
              Real Trade Performance
            </h3>
            {(() => {
              const performance = calculateStrategyPerformance(strategy);
              return (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Success Rate</span>
                    <span className={`font-bold text-lg ${getSuccessRateColor(performance.successRate)}`}>
                      {performance.successRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Real Trades</span>
                    <span className="font-bold text-lg text-slate-800">{performance.totalTrades}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Profitable Trades</span>
                    <span className="font-bold text-lg text-emerald-600">{performance.profitableTrades}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-600 font-medium">Losing Trades</span>
                    <span className="font-bold text-lg text-red-600">{performance.totalTrades - performance.profitableTrades}</span>
                  </div>
                  {performance.totalTrades === 0 && (
                    <div className="text-center py-4">
                      <p className="text-sm text-slate-500">No real trades recorded yet</p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* Author Info */}
          {author && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Strategy Author</h3>
              <Link href={`/community/profile/${author.id}`} className="block hover:bg-slate-50 rounded-lg p-3 transition-colors">
                <div className="flex items-center">
                  <div className="mr-4">
                    <Avatar
                      username={author.username}
                      avatarUrl={author.avatar_url}
                      size="md"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 hover:text-indigo-700 transition-colors">{author.username}</h4>
                    {author.full_name && (
                      <p className="text-sm text-slate-600">{author.full_name}</p>
                    )}
                    <p className="text-xs text-slate-500">
                      Member since {format(new Date(author.created_at), 'MMM yyyy')}
                    </p>
                  </div>
                </div>
                {author.bio && (
                  <p className="mt-3 text-sm text-slate-700 line-clamp-3">{author.bio}</p>
                )}
                <div className="mt-3 text-xs text-indigo-600 font-medium">
                  View profile →
                </div>
              </Link>
            </div>
          )}

          {/* Strategy Status */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Status</h3>
            <div className="flex items-center">
              <div className={`w-3 h-3 rounded-full mr-3 ${strategy.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></div>
              <span className="text-slate-700 font-medium">
                {strategy.is_active ? 'Active Strategy' : 'Inactive Strategy'}
              </span>
            </div>
            <p className="text-sm text-slate-600 mt-2">
              {strategy.is_active
                ? 'This strategy is currently being used by the author'
                : 'This strategy is no longer actively used'
              }
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
