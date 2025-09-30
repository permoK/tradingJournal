'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import Avatar from './Avatar';
import { FiBell, FiHeart, FiMessageSquare, FiUsers, FiCopy, FiX } from 'react-icons/fi';

interface Notification {
  id: string;
  type: 'follow' | 'like' | 'comment' | 'strategy_duplicated' | 'discussion_reply';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  userId?: string;
  username?: string;
  fullName?: string;
  avatarUrl?: string;
  targetId?: string;
  targetType?: string;
}

export default function NotificationsDropdown() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock notifications for demonstration
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: 'follow',
      title: 'New Follower',
      message: 'John Doe started following you',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
      userId: 'user1',
      username: 'johndoe',
      fullName: 'John Doe',
      avatarUrl: '',
    },
    {
      id: '2',
      type: 'like',
      title: 'New Like',
      message: 'Alice Smith liked your strategy "Scalping Master"',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      userId: 'user2',
      username: 'alicesmith',
      fullName: 'Alice Smith',
      avatarUrl: '',
      targetId: 'strategy1',
      targetType: 'strategy',
    },
    {
      id: '3',
      type: 'comment',
      title: 'New Comment',
      message: 'Mike Brown commented on your discussion "Best Forex Strategies"',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
      userId: 'user3',
      username: 'mikebrown',
      fullName: 'Mike Brown',
      avatarUrl: '',
      targetId: 'discussion1',
      targetType: 'discussion',
    },
    {
      id: '4',
      type: 'strategy_duplicated',
      title: 'Strategy Duplicated',
      message: 'Sarah Wilson duplicated your strategy "Day Trading Pro"',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      userId: 'user4',
      username: 'sarahwilson',
      fullName: 'Sarah Wilson',
      avatarUrl: '',
      targetId: 'strategy2',
      targetType: 'strategy',
    },
  ];

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!session) return;
      
      setLoading(true);
      try {
        // For now, use mock data
        // In a real implementation, you'd fetch from /api/notifications
        setNotifications(mockNotifications);
        setUnreadCount(mockNotifications.filter(n => !n.isRead).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [session]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const markAsRead = async (notificationId: string) => {
    try {
      // For now, just update local state
      // In a real implementation, you'd PUT to /api/notifications
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, isRead: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      // For now, just update local state
      // In a real implementation, you'd PUT to /api/notifications with markAll=true
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'follow':
        return <FiUsers className="h-4 w-4 text-blue-600" />;
      case 'like':
        return <FiHeart className="h-4 w-4 text-red-600" />;
      case 'comment':
      case 'discussion_reply':
        return <FiMessageSquare className="h-4 w-4 text-green-600" />;
      case 'strategy_duplicated':
        return <FiCopy className="h-4 w-4 text-purple-600" />;
      default:
        return <FiBell className="h-4 w-4 text-gray-600" />;
    }
  };

  const getNotificationLink = (notification: Notification) => {
    switch (notification.targetType) {
      case 'strategy':
        return `/strategies/${notification.targetId}`;
      case 'journal':
        return `/journal/${notification.targetId}`;
      default:
        return '/dashboard';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });
    }
  };

  if (!session) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Bell */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md"
      >
        <FiBell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-indigo-600 hover:text-indigo-800"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
              </div>
            ) : notifications.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 hover:bg-gray-50 transition-colors ${
                      !notification.isRead ? 'bg-blue-50' : ''
                    }`}
                  >
                    <Link
                      href={getNotificationLink(notification)}
                      onClick={() => {
                        if (!notification.isRead) {
                          markAsRead(notification.id);
                        }
                        setIsOpen(false);
                      }}
                      className="block"
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar */}
                        <Avatar
                          src={notification.avatarUrl}
                          alt={notification.fullName || notification.username || ''}
                          size="sm"
                        />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            {getNotificationIcon(notification.type)}
                            <span className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </span>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(notification.createdAt)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiBell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">No notifications yet</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-4 border-t border-gray-200">
              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="block text-center text-sm text-indigo-600 hover:text-indigo-800"
              >
                Notification settings
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
