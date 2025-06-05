'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { NewsArticle } from '@/lib/newsService';
import { useNotifications } from '@/contexts/NotificationContext';
import NewsPopup from './NewsPopup';
import { FiGlobe, FiExternalLink, FiClock, FiArrowRight, FiAlertTriangle } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

interface NewsWidgetProps {
  className?: string;
}

export default function NewsWidget({ className = '' }: NewsWidgetProps) {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [shownAlerts, setShownAlerts] = useState<Set<string>>(new Set());
  const { showNewsAlert } = useNotifications();

  useEffect(() => {
    fetchLatestNews();
    
    // Set up periodic refresh for news
    const interval = setInterval(fetchLatestNews, 5 * 60 * 1000); // Every 5 minutes
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Check for high-impact news that should trigger alerts
    const highImpactNews = articles.filter(
      article => 
        article.importance === 'high' && 
        !shownAlerts.has(article.id) &&
        isRecentNews(article)
    );

    highImpactNews.forEach(article => {
      showNewsAlert(
        article.title,
        article.description,
        article.importance,
        article.url
      );
      
      setShownAlerts(prev => new Set([...prev, article.id]));
    });
  }, [articles, shownAlerts, showNewsAlert]);

  const fetchLatestNews = async () => {
    try {
      const response = await fetch('/api/news?limit=5&importance=high,medium');
      if (!response.ok) throw new Error('Failed to fetch news');

      const data = await response.json();
      setArticles(data.articles || []);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  const isRecentNews = (article: NewsArticle) => {
    const articleDate = new Date(article.publishedAt);
    const now = new Date();
    const diffInHours = (now.getTime() - articleDate.getTime()) / (1000 * 60 * 60);
    return diffInHours <= 2; // Consider news from last 2 hours as recent
  };

  const handleArticleClick = (article: NewsArticle) => {
    if (article.importance === 'high') {
      setSelectedArticle(article);
    } else {
      window.open(article.url, '_blank', 'noopener,noreferrer');
    }
  };

  const getImportanceIndicator = (importance: string) => {
    switch (importance) {
      case 'high':
        return <div className="w-2 h-2 bg-red-500 rounded-full" />;
      case 'medium':
        return <div className="w-2 h-2 bg-yellow-500 rounded-full" />;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
    }
  };

  const formatPublishedDate = (publishedAt: string) => {
    const date = new Date(publishedAt);
    return formatDistanceToNow(date, { addSuffix: true });
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-slate-200 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <FiGlobe className="w-5 h-5" />
            Latest News
          </h3>
        </div>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`bg-white rounded-lg shadow-sm border border-slate-200 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <FiGlobe className="w-5 h-5" />
            Latest News
          </h3>
          <Link
            href="/news"
            className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            View All
            <FiArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {articles.length > 0 ? (
          <div className="space-y-4">
            {articles.slice(0, 4).map((article) => (
              <div
                key={article.id}
                onClick={() => handleArticleClick(article)}
                className="group cursor-pointer border border-slate-100 rounded-lg p-3 hover:border-slate-200 hover:bg-slate-50 transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getImportanceIndicator(article.importance)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium text-slate-900 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {article.title}
                      </h4>
                      {article.importance === 'high' && (
                        <FiAlertTriangle className="w-3 h-3 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 mb-2">
                      {article.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>{article.source.name}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <FiClock className="w-3 h-3" />
                          {formatPublishedDate(article.publishedAt)}
                        </div>
                      </div>
                      <FiExternalLink className="w-3 h-3 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* High Impact Alert */}
            {articles.some(article => article.importance === 'high') && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-sm">
                  <FiAlertTriangle className="w-4 h-4 text-red-500" />
                  <span className="text-red-800 font-medium">
                    High impact news detected
                  </span>
                </div>
                <p className="text-xs text-red-700 mt-1">
                  Click on high impact articles for detailed alerts
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6">
            <FiGlobe className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm text-slate-600">No recent news available</p>
          </div>
        )}
      </div>

      {/* News Popup */}
      {selectedArticle && (
        <NewsPopup
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onRead={(articleId) => {
            // Mark as read logic here
            console.log('Article read:', articleId);
          }}
        />
      )}
    </>
  );
}
