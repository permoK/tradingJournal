'use client';

import { useState } from 'react';
import { useLearningTopics, useUserProgress } from '@/lib/hooks';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import { FiCheckCircle, FiClock, FiCircle, FiFilter } from 'react-icons/fi';

export default function Learning() {
  const { user, loading: authLoading } = useAuth();
  const { topics, loading: topicsLoading } = useLearningTopics();
  const { progress, loading: progressLoading, updateProgress: updateUserProgress } = useUserProgress(user?.id);

  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const isLoading = authLoading || topicsLoading || progressLoading;

  // Get unique categories
  const categories = topics ? [...new Set(topics.map(topic => topic.category))] : [];

  // Filter topics based on selected filters
  const filteredTopics = topics.filter(topic => {
    const topicProgress = progress.find(p => p.topic_id === topic.id);
    const status = topicProgress?.status || 'not_started';

    const statusMatch =
      filter === 'all' ||
      (filter === 'completed' && status === 'completed') ||
      (filter === 'in_progress' && status === 'in_progress') ||
      (filter === 'not_started' && status === 'not_started');

    const categoryMatch = categoryFilter === 'all' || topic.category === categoryFilter;

    return statusMatch && categoryMatch;
  });

  const updateProgress = async (topicId: string, status: 'not_started' | 'in_progress' | 'completed') => {
    if (!user) return;

    const updates = {
      status,
      completion_date: status === 'completed' ? new Date().toISOString() : null
    };

    const { error } = await updateUserProgress(topicId, updates);

    if (error) {
      console.error('Error updating progress:', error);
    }
  };

  const getStatusIcon = (topicId: string) => {
    const topicProgress = progress.find(p => p.topic_id === topicId);
    const status = topicProgress?.status || 'not_started';

    switch (status) {
      case 'completed':
        return <FiCheckCircle className="text-emerald-600 text-lg sm:text-xl" />;
      case 'in_progress':
        return <FiClock className="text-indigo-600 text-lg sm:text-xl" />;
      default:
        return <FiCircle className="text-slate-400 text-lg sm:text-xl" />;
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-48 sm:h-64">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-3 sm:border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Learning Path</h1>
        <p className="text-slate-700 font-medium text-sm sm:text-base">
          Track your progress through Deriv trading concepts
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-lg shadow-sm mb-4 sm:mb-6 border border-slate-200">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="flex-1">
            <label className="block text-xs sm:text-sm font-medium text-slate-800 mb-1">
              <FiFilter className="inline mr-1" /> Status
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full p-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="not_started">Not Started</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-xs sm:text-sm font-medium text-slate-800 mb-1">
              <FiFilter className="inline mr-1" /> Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Learning Topics */}
      <div className="space-y-4">
        {filteredTopics.length === 0 ? (
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm text-center border border-slate-200">
            <p className="text-slate-700 font-medium text-sm sm:text-base">No topics match your filters</p>
          </div>
        ) : (
          filteredTopics.map(topic => {
            const topicProgress = progress.find(p => p.topic_id === topic.id);
            const status = topicProgress?.status || 'not_started';

            return (
              <div key={topic.id} className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200">
                <div className="flex items-start">
                  <div className="mr-3 sm:mr-4 mt-1">
                    {getStatusIcon(topic.id)}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0">
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-slate-900">{topic.title}</h3>
                        <div className="flex flex-wrap gap-2 mt-1 mb-2">
                          <span className="inline-block px-2 py-0.5 sm:py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full border border-indigo-200">
                            {topic.category}
                          </span>
                          <span className="inline-block px-2 py-0.5 sm:py-1 text-xs font-medium bg-violet-100 text-violet-800 rounded-full border border-violet-200">
                            {topic.difficulty}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 self-start">
                        <button
                          onClick={() => updateProgress(topic.id, 'in_progress')}
                          className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md border ${
                            status === 'in_progress'
                              ? 'bg-indigo-600 text-white border-indigo-700'
                              : 'bg-indigo-50 text-indigo-800 border-indigo-200 hover:bg-indigo-100'
                          }`}
                        >
                          In Progress
                        </button>
                        <button
                          onClick={() => updateProgress(topic.id, 'completed')}
                          className={`px-2 sm:px-3 py-1 text-xs sm:text-sm rounded-md border ${
                            status === 'completed'
                              ? 'bg-emerald-600 text-white border-emerald-700'
                              : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                          }`}
                        >
                          Complete
                        </button>
                      </div>
                    </div>
                    <p className="text-sm sm:text-base text-slate-700">{topic.description}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </AppLayout>
  );
}
