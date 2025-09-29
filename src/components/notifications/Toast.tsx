'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNotifications, Notification } from '@/contexts/NotificationContext';
import { FiX, FiInfo, FiCheckCircle, FiAlertTriangle, FiAlertCircle, FiGlobe } from 'react-icons/fi';

interface ToastProps {
  notification: Notification;
}

function Toast({ notification }: ToastProps) {
  const { removeNotification } = useNotifications();
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      removeNotification(notification.id);
    }, 300); // Match the exit animation duration
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <FiCheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <FiAlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <FiAlertCircle className="w-5 h-5 text-red-500" />;
      case 'news':
        return <FiGlobe className="w-5 h-5 text-blue-500" />;
      default:
        return <FiInfo className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-300';
      case 'warning':
        return 'bg-yellow-50 border-yellow-300';
      case 'error':
        return 'bg-red-50 border-red-300';
      case 'news':
        return 'bg-blue-50 border-blue-300';
      default:
        return 'bg-blue-50 border-blue-300';
    }
  };

  const getImportanceBadge = () => {
    if (notification.type !== 'news' || !notification.newsData) return null;
    
    const { importance } = notification.newsData;
    const badgeColors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${badgeColors[importance]}`}>
        {importance.toUpperCase()}
      </span>
    );
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-in-out mb-3
        ${isVisible && !isExiting ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${isExiting ? 'translate-x-full opacity-0' : ''}
      `}
    >
      <div className={`max-w-sm w-full bg-white shadow-lg rounded-lg border ${getBackgroundColor()}`} style={{ minWidth: '320px' }}>
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              {getIcon()}
            </div>
            <div className="ml-3 w-0 flex-1">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-slate-900">
                  {notification.title}
                </p>
                {getImportanceBadge()}
              </div>
              <p className="text-sm text-slate-700 mb-2">
                {notification.message}
              </p>
              {notification.action && (
                <button
                  onClick={notification.action.onClick}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  {notification.action.label}
                </button>
              )}
            </div>
            <div className="ml-4 flex-shrink-0 flex">
              <button
                onClick={handleClose}
                className="bg-white rounded-md inline-flex text-slate-400 hover:text-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <span className="sr-only">Close</span>
                <FiX className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ToastContainer() {
  const { notifications } = useNotifications();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || notifications.length === 0) return null;

  const toastContainer = (
    <div
      className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none max-w-sm"
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        zIndex: 9999,
        maxWidth: '24rem'
      }}
    >
      {notifications.map((notification) => (
        <div key={notification.id} className="pointer-events-auto">
          <Toast notification={notification} />
        </div>
      ))}
    </div>
  );

  return createPortal(toastContainer, document.body);
}
