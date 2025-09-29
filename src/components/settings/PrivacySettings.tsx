'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { FiShield, FiEye, FiEyeOff, FiDownload, FiTrash2, FiSave, FiLoader } from 'react-icons/fi';

interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  showTradingStats: boolean;
  showOnlineStatus: boolean;
  allowDirectMessages: boolean;
  dataCollection: boolean;
  analyticsTracking: boolean;
  marketingEmails: boolean;
}

export default function PrivacySettings() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [settings, setSettings] = useState<PrivacySettings>({
    profileVisibility: 'public',
    showTradingStats: true,
    showOnlineStatus: true,
    allowDirectMessages: true,
    dataCollection: true,
    analyticsTracking: false,
    marketingEmails: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchPrivacySettings();
    }
  }, [user?.id]);

  const fetchPrivacySettings = async () => {
    try {
      const response = await fetch('/api/settings/privacy');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleToggle = (key: keyof PrivacySettings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleVisibilityChange = (visibility: 'public' | 'private' | 'friends') => {
    setSettings(prev => ({ ...prev, profileVisibility: visibility }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/settings/privacy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to update privacy settings');
      }

      addNotification({
        type: 'success',
        title: 'Privacy Settings Updated',
        message: 'Your privacy preferences have been saved.',
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: error.message || 'Failed to update privacy settings.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataExport = async () => {
    try {
      const response = await fetch('/api/settings/export-data', {
        method: 'POST',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tradeflow-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        addNotification({
          type: 'success',
          title: 'Data Export Started',
          message: 'Your data export has been downloaded.',
        });
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export your data. Please try again.',
      });
    }
  };

  const handleAccountDeletion = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    try {
      const response = await fetch('/api/settings/delete-account', {
        method: 'DELETE',
      });

      if (response.ok) {
        addNotification({
          type: 'success',
          title: 'Account Deletion Initiated',
          message: 'Your account deletion request has been processed.',
        });
        // Redirect to home page or logout
        window.location.href = '/';
      }
    } catch (error) {
      addNotification({
        type: 'error',
        title: 'Deletion Failed',
        message: 'Failed to delete account. Please contact support.',
      });
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
        <FiShield className="h-5 w-5 text-slate-400 mr-2" />
        <h3 className="text-lg font-medium text-slate-900">Privacy Settings</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Visibility */}
        <div>
          <h4 className="text-md font-medium text-slate-900 mb-4">Profile Visibility</h4>
          <div className="space-y-3">
            {[
              { value: 'public', label: 'Public', description: 'Anyone can view your profile' },
              { value: 'friends', label: 'Friends Only', description: 'Only your friends can view your profile' },
              { value: 'private', label: 'Private', description: 'Only you can view your profile' },
            ].map((option) => (
              <label key={option.value} className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="profileVisibility"
                  value={option.value}
                  checked={settings.profileVisibility === option.value}
                  onChange={() => handleVisibilityChange(option.value as any)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-slate-900">{option.label}</p>
                  <p className="text-sm text-slate-500">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Profile Information */}
        <div className="border-t border-slate-200 pt-6">
          <h4 className="text-md font-medium text-slate-900 mb-4">Profile Information</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Show Trading Statistics</p>
                <p className="text-sm text-slate-500">Display your trading performance on your profile</p>
              </div>
              <ToggleSwitch
                enabled={settings.showTradingStats}
                onToggle={() => handleToggle('showTradingStats')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Show Online Status</p>
                <p className="text-sm text-slate-500">Let others see when you're online</p>
              </div>
              <ToggleSwitch
                enabled={settings.showOnlineStatus}
                onToggle={() => handleToggle('showOnlineStatus')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Allow Direct Messages</p>
                <p className="text-sm text-slate-500">Allow other users to send you direct messages</p>
              </div>
              <ToggleSwitch
                enabled={settings.allowDirectMessages}
                onToggle={() => handleToggle('allowDirectMessages')}
              />
            </div>
          </div>
        </div>

        {/* Data & Analytics */}
        <div className="border-t border-slate-200 pt-6">
          <h4 className="text-md font-medium text-slate-900 mb-4">Data & Analytics</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Data Collection</p>
                <p className="text-sm text-slate-500">Allow us to collect usage data to improve the platform</p>
              </div>
              <ToggleSwitch
                enabled={settings.dataCollection}
                onToggle={() => handleToggle('dataCollection')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Analytics Tracking</p>
                <p className="text-sm text-slate-500">Help us understand how you use the platform</p>
              </div>
              <ToggleSwitch
                enabled={settings.analyticsTracking}
                onToggle={() => handleToggle('analyticsTracking')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Marketing Emails</p>
                <p className="text-sm text-slate-500">Receive promotional emails and product updates</p>
              </div>
              <ToggleSwitch
                enabled={settings.marketingEmails}
                onToggle={() => handleToggle('marketingEmails')}
              />
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="border-t border-slate-200 pt-6">
          <h4 className="text-md font-medium text-slate-900 mb-4">Data Management</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Export Your Data</p>
                <p className="text-sm text-slate-500">Download a copy of all your data</p>
              </div>
              <button
                type="button"
                onClick={handleDataExport}
                className="inline-flex items-center px-3 py-2 border border-slate-300 shadow-sm text-sm leading-4 font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FiDownload className="-ml-0.5 mr-2 h-4 w-4" />
                Export Data
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Delete Account</p>
                <p className="text-sm text-slate-500">Permanently delete your account and all data</p>
              </div>
              <button
                type="button"
                onClick={handleAccountDeletion}
                className={`inline-flex items-center px-3 py-2 border shadow-sm text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  showDeleteConfirm
                    ? 'border-red-300 text-white bg-red-600 hover:bg-red-700 focus:ring-red-500'
                    : 'border-red-300 text-red-700 bg-white hover:bg-red-50 focus:ring-red-500'
                }`}
              >
                <FiTrash2 className="-ml-0.5 mr-2 h-4 w-4" />
                {showDeleteConfirm ? 'Confirm Delete' : 'Delete Account'}
              </button>
            </div>
            {showDeleteConfirm && (
              <div className="p-4 bg-red-50 rounded-md">
                <p className="text-sm text-red-800">
                  <strong>Warning:</strong> This action cannot be undone. All your data will be permanently deleted.
                  Click "Confirm Delete" again to proceed.
                </p>
              </div>
            )}
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
                Save Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
