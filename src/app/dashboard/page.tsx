'use client';

import { useEffect, useState } from 'react';
import { useProfile, useUserProgress, useLearningTopics, useActivityLogs, useTrades } from '@/lib/hooks';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import { FiBook, FiBarChart2, FiFileText, FiUsers, FiAward, FiCalendar, FiSearch, FiTrendingUp } from 'react-icons/fi';
import { format } from 'date-fns';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import StreakHeatmap from '@/components/StreakHeatmap';
import ProgressChart from '@/components/ProgressChart';
import TradingPairsChart from '@/components/TradingPairsChart';
import ProgressTracker from '@/components/ProgressTracker';
import AdvancedSearch from '@/components/AdvancedSearch';
import NewUserWelcome from '@/components/NewUserWelcome';

// Register Chart.js components
ChartJS.register(ArcElement, ChartTooltip, Legend);

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
  // Check if user is new (no activity, no progress, no profile data)
  useEffect(() => {
    if (!authLoading && !activitiesLoading && !progressLoading && user) {
      const isNewUser = activities.length === 0 && progress.length === 0 &&
                       (!profile || (!profile.bio && !profile.username));
      setShowWelcome(isNewUser);
    }
  }, [authLoading, activitiesLoading, progressLoading, user, activities, progress, profile]);

  // Calculate trading statistics
  const tradingStats = {
    totalTrades: trades.length,
    totalPairs: [...new Set(trades.map(trade => trade.market))].length,
    totalProfitLoss: trades
      .filter(trade => trade.profit_loss !== null)
      .reduce((total, trade) => total + (trade.profit_loss || 0), 0),
    winRate: trades.length > 0
      ? (trades.filter(trade => trade.profit_loss !== null && trade.profit_loss > 0).length /
         trades.filter(trade => trade.profit_loss !== null).length) * 100
      : 0,
    pairData: trades.reduce((acc, trade) => {
      acc[trade.market] = (acc[trade.market] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
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

      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Welcome, {profile?.username || user?.email?.split('@')[0] || 'Trader'}!</h1>
        <p className="text-slate-700 font-medium text-sm sm:text-base">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Streak Bar - Moved to Top */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 sm:p-6 rounded-lg shadow-sm mb-6 sm:mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold mb-1">Current Streak</h2>
            <p className="text-indigo-100 text-sm sm:text-base">Keep up the great work!</p>
          </div>
          <div className="text-right">
            <div className="text-3xl sm:text-4xl font-bold">{profile?.streak_count || 0}</div>
            <div className="text-indigo-100 text-sm sm:text-base">days</div>
          </div>
        </div>
      </div>

      {/* Advanced Search */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm mb-6 sm:mb-8 border border-slate-200">
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Quick Search</h2>
          <p className="text-sm text-slate-600">Find trades, journals, markets, and community content</p>
        </div>
        <AdvancedSearch />
      </div>

      {/* Trading Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-slate-900">Trading Statistics</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 text-sm">Total Trades</span>
              <span className="font-semibold text-slate-900">{tradingStats.totalTrades}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 text-sm">Trading Pairs</span>
              <span className="font-semibold text-slate-900">{tradingStats.totalPairs}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 text-sm">Total P/L</span>
              <span className={`font-semibold ${tradingStats.totalProfitLoss > 0 ? 'text-emerald-600' : tradingStats.totalProfitLoss < 0 ? 'text-red-600' : 'text-slate-900'}`}>
                {tradingStats.totalProfitLoss > 0 ? '+' : ''}{tradingStats.totalProfitLoss.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 text-sm">Learning Progress</span>
              <span className="font-semibold text-indigo-600">{Math.round((completedTopics / (topics?.length || 1)) * 100)}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-slate-900">Recent Activity</h2>
          <div className="space-y-3 sm:space-y-4">
            {activities.length > 0 ? (
              activities.slice(0, 3).map((activity) => {
                const getActivityIcon = (type: string) => {
                  switch (type) {
                    case 'learning':
                      return <FiBook className="text-indigo-700 text-sm sm:text-base" />;
                    case 'trading':
                      return <FiBarChart2 className="text-emerald-700 text-sm sm:text-base" />;
                    case 'journal':
                      return <FiFileText className="text-violet-700 text-sm sm:text-base" />;
                    default:
                      return <FiCalendar className="text-slate-700 text-sm sm:text-base" />;
                  }
                };

                const getActivityBg = (type: string) => {
                  switch (type) {
                    case 'learning':
                      return 'bg-indigo-100 border-indigo-200';
                    case 'trading':
                      return 'bg-emerald-100 border-emerald-200';
                    case 'journal':
                      return 'bg-violet-100 border-violet-200';
                    default:
                      return 'bg-slate-100 border-slate-200';
                  }
                };

                const timeAgo = (date: string) => {
                  const now = new Date();
                  const activityDate = new Date(date);
                  const diffInDays = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));

                  if (diffInDays === 0) return 'Today';
                  if (diffInDays === 1) return '1 day ago';
                  return `${diffInDays} days ago`;
                };

                return (
                  <div key={activity.id} className="flex items-start">
                    <div className={`p-1.5 sm:p-2 rounded-full mr-2 sm:mr-3 border ${getActivityBg(activity.activity_type)}`}>
                      {getActivityIcon(activity.activity_type)}
                    </div>
                    <div>
                      <p className="font-medium text-slate-800 text-sm sm:text-base">{activity.activity_title}</p>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium">{timeAgo(activity.created_at)}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8">
                <FiCalendar className="mx-auto h-12 w-12 text-slate-400 mb-4" />
                <p className="text-slate-600 font-medium">No recent activity</p>
                <p className="text-sm text-slate-500">Start learning, trading, or journaling to see your activity here!</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-slate-900">Quick Actions</h2>
          <div className="space-y-2 sm:space-y-3">
            <Link href="/learning" className="flex items-center p-2 sm:p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100 hover:border-indigo-200">
              <FiBook className="text-indigo-700 mr-2 sm:mr-3 text-sm sm:text-base" />
              <span className="text-slate-900 font-medium text-sm sm:text-base">Continue Learning</span>
            </Link>
            <Link href="/trading/new" className="flex items-center p-2 sm:p-3 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-100 hover:border-emerald-200">
              <FiBarChart2 className="text-emerald-700 mr-2 sm:mr-3 text-sm sm:text-base" />
              <span className="text-slate-900 font-medium text-sm sm:text-base">Record a Trade</span>
            </Link>
            <Link href="/journal/new" className="flex items-center p-2 sm:p-3 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors border border-violet-100 hover:border-violet-200">
              <FiFileText className="text-violet-700 mr-2 sm:mr-3 text-sm sm:text-base" />
              <span className="text-slate-900 font-medium text-sm sm:text-base">Write in Journal</span>
            </Link>
            <Link href="/community" className="flex items-center p-2 sm:p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors border border-amber-100 hover:border-amber-200">
              <FiUsers className="text-amber-700 mr-2 sm:mr-3 text-sm sm:text-base" />
              <span className="text-slate-900 font-medium text-sm sm:text-base">View Community</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Trading Pairs Visualization */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm mb-6 sm:mb-8 border border-slate-200">
        <div className="flex items-center mb-3 sm:mb-4">
          <FiBarChart2 className="text-emerald-700 mr-2 text-sm sm:text-base" />
          <h2 className="text-base sm:text-lg font-semibold text-slate-900">Trading Pairs & Volume</h2>
        </div>
        {Object.keys(tradingStats.pairData).length > 0 ? (
          <TradingPairsChart pairData={tradingStats.pairData} />
        ) : (
          <div className="h-48 sm:h-64 flex items-center justify-center text-slate-700 font-medium text-sm sm:text-base">
            No trading data available. Start recording trades to see your pair distribution.
          </div>
        )}
      </div>

      {/* Progress Tracker with Filtering */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm mb-6 sm:mb-8 border border-slate-200">
        <div className="flex items-center mb-3 sm:mb-4">
          <FiTrendingUp className="text-indigo-700 mr-2 text-sm sm:text-base" />
          <h2 className="text-base sm:text-lg font-semibold text-slate-900">Progress Tracker</h2>
        </div>
        {trades.length > 0 ? (
          <ProgressTracker trades={trades} />
        ) : (
          <div className="h-48 sm:h-64 flex items-center justify-center text-slate-700 font-medium text-sm sm:text-base">
            No trade data available. Record some trades to see your progress over time.
          </div>
        )}
      </div>

      {/* Progress by Category */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm mb-6 sm:mb-8 border border-slate-200">
        <div className="flex items-center mb-3 sm:mb-4">
          <FiBook className="text-indigo-700 mr-2 text-sm sm:text-base" />
          <h2 className="text-base sm:text-lg font-semibold text-slate-900">Progress by Category</h2>
        </div>
        {categories.length > 0 ? (
          <ProgressChart
            categories={categories}
            completedCounts={categoryCompletedCounts}
            inProgressCounts={categoryInProgressCounts}
            notStartedCounts={categoryNotStartedCounts}
          />
        ) : (
          <div className="h-48 sm:h-64 flex items-center justify-center text-slate-700 font-medium text-sm sm:text-base">
            No category data available
          </div>
        )}
      </div>

      {/* Activity Heatmap */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm mb-6 sm:mb-8 border border-slate-200 w-full">
        {user && <StreakHeatmap userId={user.id} />}
      </div>

      {/* Achievements */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm mb-6 sm:mb-8 border border-slate-200">
        <h2 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-slate-900">Achievements</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
          <div className="flex flex-col items-center p-2 sm:p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="bg-amber-100 p-2 sm:p-3 rounded-full mb-1 sm:mb-2 border border-amber-200">
              <FiAward className="text-amber-700 text-base sm:text-xl" />
            </div>
            <span className="font-medium text-center text-slate-800 text-xs sm:text-sm">First Login</span>
            <span className="text-[10px] sm:text-xs text-amber-700 font-semibold">Completed</span>
          </div>
          <div className="flex flex-col items-center p-2 sm:p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="bg-indigo-100 p-2 sm:p-3 rounded-full mb-1 sm:mb-2 border border-indigo-200">
              <FiAward className="text-indigo-700 text-base sm:text-xl" />
            </div>
            <span className="font-medium text-center text-slate-800 text-xs sm:text-sm">5-Day Streak</span>
            <span className="text-[10px] sm:text-xs text-indigo-700 font-semibold">In Progress</span>
          </div>
          <div className="flex flex-col items-center p-2 sm:p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="bg-emerald-100 p-2 sm:p-3 rounded-full mb-1 sm:mb-2 border border-emerald-200">
              <FiAward className="text-emerald-700 text-base sm:text-xl" />
            </div>
            <span className="font-medium text-center text-slate-800 text-xs sm:text-sm">Complete 10 Lessons</span>
            <span className="text-[10px] sm:text-xs text-emerald-700 font-semibold">In Progress</span>
          </div>
          <div className="flex flex-col items-center p-2 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="bg-slate-200 p-2 sm:p-3 rounded-full mb-1 sm:mb-2 border border-slate-300">
              <FiAward className="text-slate-600 text-base sm:text-xl" />
            </div>
            <span className="font-medium text-center text-slate-800 text-xs sm:text-sm">Record 5 Trades</span>
            <span className="text-[10px] sm:text-xs text-slate-600 font-semibold">Not Started</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
