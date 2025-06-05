'use client';

import React from 'react';
import { NewsArticle } from '@/lib/newsService';
import { FiExternalLink, FiClock, FiTag } from 'react-icons/fi';
import { format, formatDistanceToNow } from 'date-fns';

interface NewsCardProps {
  article: NewsArticle;
  onRead?: (articleId: string) => void;
}

export default function NewsCard({ article, onRead }: NewsCardProps) {
  const handleClick = () => {
    if (onRead) {
      onRead(article.id);
    }
    window.open(article.url, '_blank', 'noopener,noreferrer');
  };

  const getImportanceBadge = () => {
    const colors = {
      low: 'bg-gray-100 text-gray-800 border-gray-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-red-100 text-red-800 border-red-200',
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colors[article.importance]}`}>
        {article.importance.toUpperCase()}
      </span>
    );
  };

  const getCategoryBadge = () => {
    const colors = {
      forex: 'bg-blue-100 text-blue-800',
      economic: 'bg-green-100 text-green-800',
      'central-bank': 'bg-purple-100 text-purple-800',
      market: 'bg-indigo-100 text-indigo-800',
      general: 'bg-gray-100 text-gray-800',
    };

    const labels = {
      forex: 'Forex',
      economic: 'Economic',
      'central-bank': 'Central Bank',
      market: 'Market',
      general: 'General',
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colors[article.category]}`}>
        {labels[article.category]}
      </span>
    );
  };

  const formatPublishedDate = () => {
    const date = new Date(article.publishedAt);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true });
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
      {article.urlToImage && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <img
            src={article.urlToImage}
            alt={article.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      )}
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {getCategoryBadge()}
            {getImportanceBadge()}
          </div>
          <div className="flex items-center text-xs text-slate-500">
            <FiClock className="w-3 h-3 mr-1" />
            {formatPublishedDate()}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2 leading-tight">
          {article.title}
        </h3>

        <p className="text-slate-600 text-sm mb-3 line-clamp-3 leading-relaxed">
          {article.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-slate-500">
            <span className="font-medium">{article.source.name}</span>
          </div>

          <button
            onClick={handleClick}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded-md transition-colors duration-200"
          >
            Read More
            <FiExternalLink className="w-3 h-3 ml-1" />
          </button>
        </div>

        {article.tags && article.tags.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1 flex-wrap">
              <FiTag className="w-3 h-3 text-slate-400" />
              {article.tags.slice(0, 4).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700"
                >
                  {tag}
                </span>
              ))}
              {article.tags.length > 4 && (
                <span className="text-xs text-slate-500">
                  +{article.tags.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
