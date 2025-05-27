'use client';

import { useEffect, useState } from 'react';
import { useProfile, useUserProgress, useLearningTopics, useActivityLogs, useTrades } from '@/lib/hooks';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import { FiBook, FiBarChart2, FiFileText, FiUsers, FiAward, FiCalendar, FiSearch, FiTrendingUp, FiTrendingDown, FiFilter, FiEye } from 'react-icons/fi';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, subWeeks, subMonths } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';
import StreakHeatmap from '@/components/StreakHeatmap';
import ProgressChart from '@/components/ProgressChart';
import TradingPairsChart from '@/components/TradingPairsChart';
import ProgressTracker from '@/components/ProgressTracker';
import AdvancedSearch from '@/components/AdvancedSearch';
import NewUserWelcome from '@/components/NewUserWelcome';

// Register Chart.js components
ChartJS.register(ArcElement, ChartTooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

export default function Dashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile(user?.id);
  const { progress, loading: progressLoading } = useUserProgress(user?.id);
  const { topics, loading: topicsLoading } = useLearningTopics();
  const { activities, loading: activitiesLoading } = useActivityLogs(user?.id);
  const { trades, loading: tradesLoading } = useTrades(user?.id);

  const [completedTopics, setCompletedTopics] = useState(0);
  const [inProgressTopics, setInProgressTopics] = useState(0);
  const [notStartedTopics, setNotStartedTopics] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryCompletedCounts, setCategoryCompletedCounts] = useState<number[]>([]);
  const [categoryInProgressCounts, setCategoryInProgressCounts] = useState<number[]>([]);
  const [categoryNotStartedCounts, setCategoryNotStartedCounts] = useState<number[]>([]);
  const [showWelcome, setShowWelcome] = useState(false);

  // Dashboard filter states
  const [dateFilter, setDateFilter] = useState('7d'); // 7d, 30d, 3m, all, specific
  const [specificDate, setSpecificDate] = useState('');
  const [marketFilter, setMarketFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  // Check if user is new (no activity, no progress, no profile data)
  useEffect(() => {
    if (!authLoading && !activitiesLoading && !progressLoading && user) {
      const isNewUser = activities.length === 0 && progress.length === 0 &&
                       (!profile || (!profile.bio && !profile.username));
      setShowWelcome(isNewUser);
    }
  }, [authLoading, activitiesLoading, progressLoading, user, activities, progress, profile]);

  // Filter trades based on selected filters
  const getFilteredTrades = () => {
    let filtered = [...trades];

    // Date filter
    if (dateFilter === 'specific' && specificDate) {
      // Filter for specific date
      const selectedDate = new Date(specificDate);
      filtered = filtered.filter(trade => {
        const tradeDate = new Date(trade.trade_date);
        return tradeDate.toDateString() === selectedDate.toDateString();
      });
    } else if (dateFilter !== 'all') {
      // Range-based filtering
      const now = new Date();
      let startDate: Date;

      switch (dateFilter) {
        case '7d':
          startDate = subDays(now, 7);
          break;
        case '30d':
          startDate = subDays(now, 30);
          break;
        case '3m':
          startDate = subMonths(now, 3);
          break;
        default:
          startDate = new Date(0); // All time
      }

      filtered = filtered.filter(trade => new Date(trade.trade_date) >= startDate);
    }

    // Market filter
    if (marketFilter !== 'all') {
      filtered = filtered.filter(trade => trade.market === marketFilter);
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(trade => trade.status === statusFilter);
    }

    return filtered;
  };

  const filteredTrades = getFilteredTrades();
  const availableMarkets = [...new Set(trades.map(trade => trade.market))];

  // Calculate trading statistics based on filtered data
  const tradingStats = {
    totalTrades: filteredTrades.length,
    totalPairs: [...new Set(filteredTrades.map(trade => trade.market))].length,
    totalProfitLoss: filteredTrades
      .filter(trade => trade.profit_loss !== null)
      .reduce((total, trade) => total + (trade.profit_loss || 0), 0),
    winningTrades: filteredTrades.filter(trade => trade.profit_loss !== null && trade.profit_loss > 0).length,
    losingTrades: filteredTrades.filter(trade => trade.profit_loss !== null && trade.profit_loss < 0).length,
    winRate: filteredTrades.filter(trade => trade.profit_loss !== null).length > 0
      ? (filteredTrades.filter(trade => trade.profit_loss !== null && trade.profit_loss > 0).length /
         filteredTrades.filter(trade => trade.profit_loss !== null).length) * 100
      : 0,
    pairData: filteredTrades.reduce((acc, trade) => {
      acc[trade.market] = (acc[trade.market] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    profitableTrades: filteredTrades.filter(trade => trade.profit_loss !== null && trade.profit_loss > 0),
    unprofitableTrades: filteredTrades.filter(trade => trade.profit_loss !== null && trade.profit_loss < 0)
  };

  useEffect(() => {
    if (!progressLoading && !topicsLoading && progress && topics) {
      const completed = progress.filter(p => p.status === 'completed').length;
      const inProgress = progress.filter(p => p.status === 'in_progress').length;
      const notStarted = topics.length - completed - inProgress;

      setCompletedTopics(completed);
      setInProgressTopics(inProgress);
      setNotStartedTopics(notStarted);

      // Process category data for the chart
      const uniqueCategories = Array.from(new Set(topics.map(topic => topic.category)));
      setCategories(uniqueCategories);

      // Calculate counts for each category
      const completedByCategory: number[] = [];
      const inProgressByCategory: number[] = [];
      const notStartedByCategory: number[] = [];

      uniqueCategories.forEach(category => {
        const topicsInCategory = topics.filter(topic => topic.category === category);
        const topicIds = topicsInCategory.map(topic => topic.id);

        const completedCount = progress.filter(p =>
          topicIds.includes(p.topic_id) && p.status === 'completed'
        ).length;

        const inProgressCount = progress.filter(p =>
          topicIds.includes(p.topic_id) && p.status === 'in_progress'
        ).length;

        const notStartedCount = topicsInCategory.length - completedCount - inProgressCount;

        completedByCategory.push(completedCount);
        inProgressByCategory.push(inProgressCount);
        notStartedByCategory.push(notStartedCount);
      });

      setCategoryCompletedCounts(completedByCategory);
      setCategoryInProgressCounts(inProgressByCategory);
      setCategoryNotStartedCounts(notStartedByCategory);
    }
  }, [progress, topics, progressLoading, topicsLoading]);

  // Chart data for profit/loss visualization
  const profitLossData = {
    labels: ['Profitable Trades', 'Losing Trades'],
    datasets: [
      {
        data: [tradingStats.winningTrades, tradingStats.losingTrades],
        backgroundColor: ['#10B981', '#EF4444'],
        borderColor: ['#059669', '#DC2626'],
        borderWidth: 2,
        hoverBackgroundColor: ['#059669', '#DC2626'],
      },
    ],
  };

  // Chart options for profit/loss
  const profitLossOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            weight: '500' as const,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed;
            const total = tradingStats.winningTrades + tradingStats.losingTrades;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0';
            return `${label}: ${value} trades (${percentage}%)`;
          }
        }
      }
    },
  };

  const progressData = {
    labels: ['Completed', 'In Progress', 'Not Started'],
    datasets: [
      {
        data: [completedTopics, inProgressTopics, notStartedTopics],
        backgroundColor: ['#10B981', '#4F46E5', '#64748B'],
        borderColor: ['#10B981', '#4F46E5', '#64748B'],
        borderWidth: 1,
      },
    ],
  };

  const isLoading = authLoading || profileLoading || progressLoading || topicsLoading || activitiesLoading || tradesLoading;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {showWelcome && <NewUserWelcome onDismiss={() => setShowWelcome(false)} />}

      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Trading Dashboard</h1>
          <p className="text-slate-700 font-medium text-sm sm:text-base">
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>

        {/* Minimal Search Bar */}
        <div className="mt-4 sm:mt-0 w-full sm:w-auto">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search trades, markets..."
              className="w-full sm:w-64 pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const searchTerm = (e.target as HTMLInputElement).value;
                  if (searchTerm.trim()) {
                    router.push(`/trading?search=${encodeURIComponent(searchTerm)}`);
                  }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm mb-6 border border-slate-200">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <FiFilter className="text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Date Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Date Range</label>
              <select
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  if (e.target.value !== 'specific') {
                    setSpecificDate('');
                  }
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white text-slate-900"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="3m">Last 3 Months</option>
                <option value="specific">Specific Date</option>
                <option value="all">All Time</option>
              </select>
            </div>

            {/* Specific Date Picker */}
            {dateFilter === 'specific' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Select Date</label>
                <input
                  type="date"
                  value={specificDate}
                  onChange={(e) => setSpecificDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white text-slate-900"
                />
              </div>
            )}

            {/* Market Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Market</label>
              <select
                value={marketFilter}
                onChange={(e) => setMarketFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white text-slate-900"
              >
                <option value="all">All Markets</option>
                {availableMarkets.map(market => (
                  <option key={market} value={market}>{market}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white text-slate-900"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Profit/Loss Chart */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Profit & Loss Overview</h2>
              <p className="text-sm text-slate-600">
                {dateFilter === 'all' ? 'All time' :
                 dateFilter === '7d' ? 'Last 7 days' :
                 dateFilter === '30d' ? 'Last 30 days' :
                 dateFilter === '3m' ? 'Last 3 months' :
                 dateFilter === 'specific' && specificDate ? format(new Date(specificDate), 'MMMM dd, yyyy') : 'Select a date'}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${tradingStats.totalProfitLoss > 0 ? 'text-emerald-600' : tradingStats.totalProfitLoss < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                {tradingStats.totalProfitLoss > 0 ? '+' : ''}{tradingStats.totalProfitLoss.toFixed(2)}
              </div>
              <div className="text-sm text-slate-600">Total P/L</div>
            </div>
          </div>

          {tradingStats.winningTrades + tradingStats.losingTrades > 0 ? (
            <div className="h-64">
              <Doughnut data={profitLossData} options={profitLossOptions} />
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-slate-500">
              <div className="text-center">
                <FiBarChart2 className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <p className="font-medium">No trade data available</p>
                <p className="text-sm">Start recording trades to see your P/L breakdown</p>
              </div>
            </div>
          )}
        </div>

        {/* Winning Rate Visualization */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Winning Rate</h2>
              <p className="text-sm text-slate-600">Performance metrics</p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${tradingStats.winRate >= 50 ? 'text-emerald-600' : 'text-amber-600'}`}>
                {tradingStats.winRate.toFixed(1)}%
              </div>
              <div className="text-sm text-slate-600">Win Rate</div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Win Rate Progress Bar */}
            <div>
              <div className="flex justify-between text-sm text-slate-600 mb-2">
                <span>Win Rate</span>
                <span>{tradingStats.winRate.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    tradingStats.winRate >= 70 ? 'bg-emerald-500' :
                    tradingStats.winRate >= 50 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.min(tradingStats.winRate, 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center justify-center mb-2">
                  <FiTrendingUp className="text-emerald-600 mr-2" />
                  <span className="text-2xl font-bold text-emerald-600">{tradingStats.winningTrades}</span>
                </div>
                <div className="text-sm text-emerald-700 font-medium">Winning Trades</div>
              </div>

              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center justify-center mb-2">
                  <FiTrendingDown className="text-red-600 mr-2" />
                  <span className="text-2xl font-bold text-red-600">{tradingStats.losingTrades}</span>
                </div>
                <div className="text-sm text-red-700 font-medium">Losing Trades</div>
              </div>
            </div>

            {/* Additional Stats */}
            <div className="pt-4 border-t border-slate-200">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Total Trades:</span>
                  <span className="font-semibold text-slate-900">{tradingStats.totalTrades}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Markets:</span>
                  <span className="font-semibold text-slate-900">{tradingStats.totalPairs}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Trades Table */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Recent Trades</h2>
            <p className="text-sm text-slate-600">
              Showing {filteredTrades.length} trades
              {dateFilter === 'specific' && specificDate ? ` for ${format(new Date(specificDate), 'MMMM dd, yyyy')}` :
               dateFilter === '7d' ? ' from last 7 days' :
               dateFilter === '30d' ? ' from last 30 days' :
               dateFilter === '3m' ? ' from last 3 months' : ''}
            </p>
          </div>
          <Link
            href="/trading"
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
          >
            View All <FiBarChart2 className="w-4 h-4" />
          </Link>
        </div>

        {filteredTrades.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">Market</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">Type</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">Entry Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">Exit Price</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">P/L</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">Date</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-700 text-sm">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredTrades.slice(0, 10).map((trade) => (
                  <tr
                    key={trade.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/trading/${trade.id}`)}
                  >
                    <td className="py-4 px-4">
                      <div className="font-medium text-slate-900">{trade.market}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        trade.trade_type === 'buy'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {trade.trade_type?.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-700">
                      {trade.entry_price ? `$${trade.entry_price.toFixed(4)}` : '-'}
                    </td>
                    <td className="py-4 px-4 text-slate-700">
                      {trade.exit_price ? `$${trade.exit_price.toFixed(4)}` : '-'}
                    </td>
                    <td className="py-4 px-4">
                      {trade.profit_loss !== null ? (
                        <span className={`font-semibold ${
                          trade.profit_loss > 0
                            ? 'text-emerald-600'
                            : trade.profit_loss < 0
                            ? 'text-red-600'
                            : 'text-slate-700'
                        }`}>
                          {trade.profit_loss > 0 ? '+' : ''}{trade.profit_loss.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-slate-500">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-slate-700 text-sm">
                      {format(new Date(trade.trade_date), 'MMM dd, yyyy')}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        trade.status === 'open'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {trade.status?.charAt(0).toUpperCase() + trade.status?.slice(1)}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/trading/${trade.id}`);
                        }}
                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
                      >
                        <FiEye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FiBarChart2 className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No trades found</h3>
            <p className="text-slate-600 mb-4">
              {dateFilter !== 'all' || marketFilter !== 'all' || statusFilter !== 'all'
                ? 'Try adjusting your filters to see more trades.'
                : 'Start recording your trades to see them here.'}
            </p>
            <Link
              href="/trading/new"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <FiBarChart2 className="mr-2 h-4 w-4" />
              Record Your First Trade
            </Link>
          </div>
        )}
      </div>

      {/* Activity Heatmap */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
        <div className="flex items-center mb-4">
          <FiCalendar className="text-indigo-700 mr-2" />
          <h2 className="text-lg font-semibold text-slate-900">Activity Streak</h2>
        </div>
        {user && <StreakHeatmap userId={user.id} />}
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
        <h2 className="text-lg font-semibold mb-4 text-slate-900">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/trading/new" className="flex items-center p-4 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-100 hover:border-emerald-200">
            <FiBarChart2 className="text-emerald-700 mr-3 text-lg" />
            <span className="text-slate-900 font-medium">Record Trade</span>
          </Link>
          <Link href="/journal/new" className="flex items-center p-4 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors border border-violet-100 hover:border-violet-200">
            <FiFileText className="text-violet-700 mr-3 text-lg" />
            <span className="text-slate-900 font-medium">Write Journal</span>
          </Link>
          <Link href="/learning" className="flex items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100 hover:border-indigo-200">
            <FiBook className="text-indigo-700 mr-3 text-lg" />
            <span className="text-slate-900 font-medium">Continue Learning</span>
          </Link>
          <Link href="/community" className="flex items-center p-4 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors border border-amber-100 hover:border-amber-200">
            <FiUsers className="text-amber-700 mr-3 text-lg" />
            <span className="text-slate-900 font-medium">View Community</span>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
