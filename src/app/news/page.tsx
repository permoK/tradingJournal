'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import AppLayout from '@/components/AppLayout';
import NewsCard from '@/components/news/NewsCard';
import NewsFiltersComponent, { NewsFilters } from '@/components/news/NewsFilters';
import EconomicCalendar from '@/components/news/EconomicCalendar';
import EventDetailModal from '@/components/news/EventDetailModal';
import MarketAnalysis from '@/components/news/MarketAnalysis';
import { NewsArticle, EconomicEvent } from '@/lib/newsService';
import { FiGlobe, FiCalendar, FiRefreshCw, FiSettings, FiAlertCircle, FiTarget } from 'react-icons/fi';

export default function NewsPage() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [economicEvents, setEconomicEvents] = useState<EconomicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'news' | 'calendar' | 'analysis'>('news');
  const [selectedEvent, setSelectedEvent] = useState<EconomicEvent | null>(null);
  const [filters, setFilters] = useState<NewsFilters>({
    category: 'all',
    importance: 'all',
    search: '',
  });

  const fetchNews = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true);
    else setLoading(true);

    try {
      const params = new URLSearchParams({
        type: 'news',
        limit: '50',
      });

      if (filters.category !== 'all') params.append('category', filters.category);
      if (filters.importance !== 'all') params.append('importance', filters.importance);

      const response = await fetch(`/api/news?${params}`);
      if (!response.ok) throw new Error('Failed to fetch news');

      const data = await response.json();
      let filteredArticles = data.articles || [];

      // Apply search filter on client side
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredArticles = filteredArticles.filter((article: NewsArticle) =>
          article.title.toLowerCase().includes(searchTerm) ||
          article.description.toLowerCase().includes(searchTerm) ||
          article.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }

      setArticles(filteredArticles);
    } catch (error) {
      console.error('Error fetching news:', error);
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to fetch news. Please try again.',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchEconomicCalendar = async () => {
    try {
      const response = await fetch('/api/news?type=calendar');
      if (!response.ok) throw new Error('Failed to fetch economic calendar');

      const data = await response.json();
      setEconomicEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching economic calendar:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNews();
      fetchEconomicCalendar();
    }
  }, [user, filters]);

  const handleRefresh = () => {
    fetchNews(true);
    if (activeTab === 'calendar') {
      fetchEconomicCalendar();
    }
  };

  const handleArticleRead = async (articleId: string) => {
    try {
      await fetch('/api/news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark-read', articleId }),
      });
    } catch (error) {
      console.error('Error marking article as read:', error);
    }
  };

  const clearFilters = () => {
    setFilters({
      category: 'all',
      importance: 'all',
      search: '',
    });
  };

  const getHighImpactEvents = () => {
    return economicEvents.filter(event => event.impact === 'high');
  };

  if (loading) {
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FiGlobe className="w-6 h-6" />
              Financial News
            </h1>
            <p className="text-slate-700 font-medium">
              Stay updated with forex and economic market news
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50"
            >
              <FiRefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>

        {/* High Impact Events Alert */}
        {getHighImpactEvents().length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <FiAlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800 mb-1">
                  High Impact Events Today
                </h3>
                <div className="text-sm text-red-700">
                  {getHighImpactEvents().map((event, index) => (
                    <div key={event.id} className="mb-1">
                      <span className="font-medium">{event.time}</span> - {event.title} ({event.currency})
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-slate-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('news')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'news'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <FiGlobe className="w-4 h-4 inline mr-2" />
              News ({articles.length})
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'calendar'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <FiCalendar className="w-4 h-4 inline mr-2" />
              Economic Calendar ({economicEvents.length})
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'analysis'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <FiTarget className="w-4 h-4 inline mr-2" />
              Market Analysis
            </button>
          </nav>
        </div>

        {activeTab === 'news' ? (
          <>
            {/* Filters */}
            <NewsFiltersComponent
              filters={filters}
              onFiltersChange={setFilters}
              onClearFilters={clearFilters}
            />

            {/* News Grid */}
            {articles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <NewsCard
                    key={article.id}
                    article={article}
                    onRead={handleArticleRead}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FiGlobe className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">No news found</h3>
                <p className="text-slate-600">
                  {filters.search || filters.category !== 'all' || filters.importance !== 'all'
                    ? 'Try adjusting your filters to see more results.'
                    : 'Check back later for the latest financial news.'}
                </p>
              </div>
            )}
          </>
        ) : activeTab === 'calendar' ? (
          /* Economic Calendar */
          <EconomicCalendar
            events={economicEvents}
            onEventClick={setSelectedEvent}
          />
        ) : (
          /* Market Analysis */
          <MarketAnalysis events={economicEvents} />
        )}

        {/* Event Detail Modal */}
        {selectedEvent && (
          <EventDetailModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </div>
    </AppLayout>
  );
}
