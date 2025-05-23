'use client';

import { useState } from 'react';
import { useAuth, useLearningTopics, useUserProgress } from '@/lib/hooks';
import AppLayout from '@/components/AppLayout';
import { supabase } from '@/lib/supabase';
import { FiCheckCircle, FiClock, FiCircle, FiFilter } from 'react-icons/fi';

export default function Learning() {
  const { user, loading: authLoading } = useAuth();
  const { topics, loading: topicsLoading } = useLearningTopics();
  const { progress, loading: progressLoading } = useUserProgress(user?.id);
  
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
    
    const existingProgress = progress.find(p => p.topic_id === topicId);
    
    if (existingProgress) {
      // Update existing progress
      const { error } = await supabase
        .from('user_progress')
        .update({ 
          status,
          completion_date: status === 'completed' ? new Date().toISOString() : existingProgress.completion_date
        })
        .eq('id', existingProgress.id);
      
      if (error) {
        console.error('Error updating progress:', error);
      }
    } else {
      // Create new progress entry
      const { error } = await supabase
        .from('user_progress')
        .insert({
          user_id: user.id,
          topic_id: topicId,
          status,
          completion_date: status === 'completed' ? new Date().toISOString() : null
        });
      
      if (error) {
        console.error('Error creating progress:', error);
      }
    }
  };

  const getStatusIcon = (topicId: string) => {
    const topicProgress = progress.find(p => p.topic_id === topicId);
    const status = topicProgress?.status || 'not_started';
    
    switch (status) {
      case 'completed':
        return <FiCheckCircle className="text-green-500 text-xl" />;
      case 'in_progress':
        return <FiClock className="text-blue-500 text-xl" />;
      default:
        return <FiCircle className="text-gray-300 text-xl" />;
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Learning Path</h1>
        <p className="text-gray-600">
          Track your progress through Deriv trading concepts
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiFilter className="inline mr-1" /> Status
            </label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="not_started">Not Started</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiFilter className="inline mr-1" /> Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
          <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <p className="text-gray-500">No topics match your filters</p>
          </div>
        ) : (
          filteredTopics.map(topic => {
            const topicProgress = progress.find(p => p.topic_id === topic.id);
            const status = topicProgress?.status || 'not_started';
            
            return (
              <div key={topic.id} className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-start">
                  <div className="mr-4 mt-1">
                    {getStatusIcon(topic.id)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{topic.title}</h3>
                        <div className="flex gap-2 mt-1 mb-2">
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                            {topic.category}
                          </span>
                          <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                            {topic.difficulty}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateProgress(topic.id, 'in_progress')}
                          className={`px-3 py-1 text-sm rounded-md ${
                            status === 'in_progress'
                              ? 'bg-blue-600 text-white'
                              : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                          }`}
                        >
                          In Progress
                        </button>
                        <button
                          onClick={() => updateProgress(topic.id, 'completed')}
                          className={`px-3 py-1 text-sm rounded-md ${
                            status === 'completed'
                              ? 'bg-green-600 text-white'
                              : 'bg-green-100 text-green-800 hover:bg-green-200'
                          }`}
                        >
                          Complete
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-600">{topic.description}</p>
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
