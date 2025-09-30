'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { FiBell, FiMail, FiSmartphone, FiSave, FiLoader } from 'react-icons/fi';

interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  tradingAlerts: boolean;
  newsAlerts: boolean;
  marketUpdates: boolean;
  weeklyReports: boolean;
  securityAlerts: boolean;
}

export default function NotificationSettings() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    pushNotifications: true,
    tradingAlerts: true,
    newsAlerts: true,
    marketUpdates: false,
    weeklyReports: true,
    securityAlerts: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchNotificationPreferences();
    }
  }, [user?.id]);

  const fetchNotificationPreferences = async () => {
    try {
      const response = await fetch('/api/settings/notifications');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error fetching notification preferences:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleToggle = (key: keyof NotificationPreferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/settings/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error('Failed to update notification preferences');
      }

      addNotification({
        type: 'success',
        title: 'Preferences Updated',
        message: 'Your notification preferences have been saved.',
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: error.message || 'Failed to update notification preferences.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        enabled ? 'bg-blue-600' : 'bg-slate-200'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center mb-6">
        <FiBell className="h-5 w-5 text-slate-400 mr-2" />
        <h3 className="text-lg font-medium text-slate-900">Notification Settings</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Notification Methods */}
        <div>
          <h4 className="text-md font-medium text-slate-900 mb-4">Notification Methods</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FiMail className="h-5 w-5 text-slate-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Email Notifications</p>
                  <p className="text-sm text-slate-500">Receive notifications via email</p>
                </div>
              </div>
              <ToggleSwitch
                enabled={preferences.emailNotifications}
                onToggle={() => handleToggle('emailNotifications')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FiSmartphone className="h-5 w-5 text-slate-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Push Notifications</p>
                  <p className="text-sm text-slate-500">Receive push notifications in your browser</p>
                </div>
              </div>
              <ToggleSwitch
                enabled={preferences.pushNotifications}
                onToggle={() => handleToggle('pushNotifications')}
              />
            </div>
          </div>
        </div>

        {/* Trading Notifications */}
        <div className="border-t border-slate-200 pt-6">
          <h4 className="text-md font-medium text-slate-900 mb-4">Trading Notifications</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Trading Alerts</p>
                <p className="text-sm text-slate-500">Get notified about your trade executions and updates</p>
              </div>
              <ToggleSwitch
                enabled={preferences.tradingAlerts}
                onToggle={() => handleToggle('tradingAlerts')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Market Updates</p>
                <p className="text-sm text-slate-500">Receive important market news and updates</p>
              </div>
              <ToggleSwitch
                enabled={preferences.marketUpdates}
                onToggle={() => handleToggle('marketUpdates')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">News Alerts</p>
                <p className="text-sm text-slate-500">Get notified about relevant financial news</p>
              </div>
              <ToggleSwitch
                enabled={preferences.newsAlerts}
                onToggle={() => handleToggle('newsAlerts')}
              />
            </div>
          </div>
        </div>

        {/* Account Notifications */}
        <div className="border-t border-slate-200 pt-6">
          <h4 className="text-md font-medium text-slate-900 mb-4">Account Notifications</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Weekly Reports</p>
                <p className="text-sm text-slate-500">Receive weekly trading performance summaries</p>
              </div>
              <ToggleSwitch
                enabled={preferences.weeklyReports}
                onToggle={() => handleToggle('weeklyReports')}
              />
            </div>



            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Security Alerts</p>
                <p className="text-sm text-slate-500">Important security notifications (always enabled)</p>
              </div>
              <ToggleSwitch
                enabled={preferences.securityAlerts}
                onToggle={() => handleToggle('securityAlerts')}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t border-slate-200">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <FiLoader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Saving...
              </>
            ) : (
              <>
                <FiSave className="-ml-1 mr-2 h-4 w-4" />
                Save Preferences
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
