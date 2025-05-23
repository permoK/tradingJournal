'use client';

import { useEffect, useState } from 'react';
import { useAuth, useProfile, useUserProgress, useLearningTopics } from '@/lib/hooks';
import AppLayout from '@/components/AppLayout';
import { FiBook, FiBarChart2, FiFileText, FiUsers, FiAward, FiCalendar } from 'react-icons/fi';
import { format } from 'date-fns';
import Link from 'next/link';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import StreakHeatmap from '@/components/StreakHeatmap';
import ProgressChart from '@/components/ProgressChart';

// Register Chart.js components
ChartJS.register(ArcElement, ChartTooltip, Legend);

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile(user?.id);
  const { progress, loading: progressLoading } = useUserProgress(user?.id);
  const { topics, loading: topicsLoading } = useLearningTopics();

  const [completedTopics, setCompletedTopics] = useState(0);
  const [inProgressTopics, setInProgressTopics] = useState(0);
  const [notStartedTopics, setNotStartedTopics] = useState(0);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoryCompletedCounts, setCategoryCompletedCounts] = useState<number[]>([]);
  const [categoryInProgressCounts, setCategoryInProgressCounts] = useState<number[]>([]);
  const [categoryNotStartedCounts, setCategoryNotStartedCounts] = useState<number[]>([]);

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

  const isLoading = authLoading || profileLoading || progressLoading || topicsLoading;

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Welcome, {profile?.username || 'Trader'}!</h1>
        <p className="text-slate-700 font-medium">
          {format(new Date(), 'EEEE, MMMM d, yyyy')} • Your current streak: <span className="text-indigo-700 font-semibold">{profile?.streak_count || 0} days</span>
        </p>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 text-slate-900">Learning Progress</h2>
          <div className="flex justify-center">
            <div className="w-48 h-48">
              <Doughnut data={progressData} />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
            <div>
              <div className="font-semibold text-emerald-600 text-lg">{completedTopics}</div>
              <div className="text-slate-700 font-medium">Completed</div>
            </div>
            <div>
              <div className="font-semibold text-indigo-600 text-lg">{inProgressTopics}</div>
              <div className="text-slate-700 font-medium">In Progress</div>
            </div>
            <div>
              <div className="font-semibold text-slate-700 text-lg">{notStartedTopics}</div>
              <div className="text-slate-700 font-medium">Not Started</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 text-slate-900">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="bg-indigo-100 p-2 rounded-full mr-3 border border-indigo-200">
                <FiBook className="text-indigo-700" />
              </div>
              <div>
                <p className="font-medium text-slate-800">Completed "Introduction to Deriv"</p>
                <p className="text-sm text-slate-600 font-medium">2 days ago</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-emerald-100 p-2 rounded-full mr-3 border border-emerald-200">
                <FiBarChart2 className="text-emerald-700" />
              </div>
              <div>
                <p className="font-medium text-slate-800">Recorded a new trade</p>
                <p className="text-sm text-slate-600 font-medium">3 days ago</p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="bg-violet-100 p-2 rounded-full mr-3 border border-violet-200">
                <FiFileText className="text-violet-700" />
              </div>
              <div>
                <p className="font-medium text-slate-800">Added a journal entry</p>
                <p className="text-sm text-slate-600 font-medium">4 days ago</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-4 text-slate-900">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/learning" className="flex items-center p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-100 hover:border-indigo-200">
              <FiBook className="text-indigo-700 mr-3" />
              <span className="text-slate-900 font-medium">Continue Learning</span>
            </Link>
            <Link href="/trading/new" className="flex items-center p-3 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-100 hover:border-emerald-200">
              <FiBarChart2 className="text-emerald-700 mr-3" />
              <span className="text-slate-900 font-medium">Record a Trade</span>
            </Link>
            <Link href="/journal/new" className="flex items-center p-3 bg-violet-50 rounded-lg hover:bg-violet-100 transition-colors border border-violet-100 hover:border-violet-200">
              <FiFileText className="text-violet-700 mr-3" />
              <span className="text-slate-900 font-medium">Write in Journal</span>
            </Link>
            <Link href="/community" className="flex items-center p-3 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors border border-amber-100 hover:border-amber-200">
              <FiUsers className="text-amber-700 mr-3" />
              <span className="text-slate-900 font-medium">View Community</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Progress by Category */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border border-slate-200">
        <div className="flex items-center mb-4">
          <FiBook className="text-indigo-700 mr-2" />
          <h2 className="text-lg font-semibold text-slate-900">Progress by Category</h2>
        </div>
        {categories.length > 0 ? (
          <ProgressChart
            categories={categories}
            completedCounts={categoryCompletedCounts}
            inProgressCounts={categoryInProgressCounts}
            notStartedCounts={categoryNotStartedCounts}
          />
        ) : (
          <div className="h-64 flex items-center justify-center text-slate-700 font-medium">
            No category data available
          </div>
        )}
      </div>

      {/* Activity Heatmap */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border border-slate-200 w-full">
        {user && <StreakHeatmap userId={user.id} />}
      </div>

      {/* Achievements */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-8 border border-slate-200">
        <h2 className="text-lg font-semibold mb-4 text-slate-900">Achievements</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex flex-col items-center p-4 bg-amber-50 rounded-lg border border-amber-200">
            <div className="bg-amber-100 p-3 rounded-full mb-2 border border-amber-200">
              <FiAward className="text-amber-700 text-xl" />
            </div>
            <span className="font-medium text-center text-slate-800">First Login</span>
            <span className="text-xs text-amber-700 font-semibold">Completed</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-indigo-50 rounded-lg border border-indigo-200">
            <div className="bg-indigo-100 p-3 rounded-full mb-2 border border-indigo-200">
              <FiAward className="text-indigo-700 text-xl" />
            </div>
            <span className="font-medium text-center text-slate-800">5-Day Streak</span>
            <span className="text-xs text-indigo-700 font-semibold">In Progress</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
            <div className="bg-emerald-100 p-3 rounded-full mb-2 border border-emerald-200">
              <FiAward className="text-emerald-700 text-xl" />
            </div>
            <span className="font-medium text-center text-slate-800">Complete 10 Lessons</span>
            <span className="text-xs text-emerald-700 font-semibold">In Progress</span>
          </div>
          <div className="flex flex-col items-center p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="bg-slate-200 p-3 rounded-full mb-2 border border-slate-300">
              <FiAward className="text-slate-600 text-xl" />
            </div>
            <span className="font-medium text-center text-slate-800">Record 5 Trades</span>
            <span className="text-xs text-slate-600 font-semibold">Not Started</span>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
