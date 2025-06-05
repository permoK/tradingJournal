'use client';

import React, { useState, useEffect } from 'react';
import { NewsArticle } from '@/lib/newsService';
import { FiX, FiExternalLink, FiClock, FiAlertTriangle } from 'react-icons/fi';
import { format, formatDistanceToNow } from 'date-fns';

interface NewsPopupProps {
  article: NewsArticle;
  onClose: () => void;
  onRead?: (articleId: string) => void;
}

export default function NewsPopup({ article, onClose, onRead }: NewsPopupProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Match the exit animation duration
  };

  const handleReadMore = () => {
    if (onRead) {
      onRead(article.id);
    }
    window.open(article.url, '_blank', 'noopener,noreferrer');
    handleClose();
  };

  const getImportanceIcon = () => {
    if (article.importance === 'high') {
      return <FiAlertTriangle className="w-5 h-5 text-red-500" />;
    }
    return <FiClock className="w-5 h-5 text-blue-500" />;
  };

  const getImportanceColor = () => {
    switch (article.importance) {
      case 'high':
        return 'border-red-200 bg-red-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const formatPublishedDate = () => {
    const date = new Date(article.publishedAt);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return formatDistanceToNow(date, { addSuffix: true });
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`
          transform transition-all duration-300 ease-in-out
          ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        `}
      >
        <div className={`bg-white rounded-lg shadow-xl max-w-md w-full border-2 ${getImportanceColor()}`}>
          {/* Header */}
          <div className="flex items-start justify-between p-4 border-b border-slate-200">
            <div className="flex items-center gap-3">
              {getImportanceIcon()}
              <div>
                <h3 className="text-sm font-medium text-slate-900">
                  {article.importance === 'high' ? 'High Impact News Alert' : 'Market News Update'}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500">{article.source.name}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">{formatPublishedDate()}</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4">
            <h4 className="text-lg font-semibold text-slate-900 mb-3 leading-tight">
              {article.title}
            </h4>

            <p className="text-slate-600 text-sm mb-4 leading-relaxed">
              {article.description}
            </p>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap mb-4">
                {article.tags.slice(0, 3).map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-slate-100 text-slate-700"
                  >
                    {tag}
                  </span>
                ))}
                {article.tags.length > 3 && (
                  <span className="text-xs text-slate-500">
                    +{article.tags.length - 3} more
                  </span>
                )}
              </div>
            )}

            {/* Image */}
            {article.urlToImage && (
              <div className="mb-4 rounded-lg overflow-hidden">
                <img
                  src={article.urlToImage}
                  alt={article.title}
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between p-4 bg-slate-50 border-t border-slate-200">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
            >
              Dismiss
            </button>
            <button
              onClick={handleReadMore}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Read Full Article
              <FiExternalLink className="w-3 h-3 ml-2" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
