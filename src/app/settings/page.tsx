'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import ProfileSettings from '@/components/settings/ProfileSettings';
import SecuritySettings from '@/components/settings/SecuritySettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import PrivacySettings from '@/components/settings/PrivacySettings';
import TradingPreferences from '@/components/settings/TradingPreferences';
import DataManagement from '@/components/settings/DataManagement';
import { FiUser, FiLock, FiBell, FiShield, FiTrendingUp, FiDatabase } from 'react-icons/fi';

type SettingsTab = 'profile' | 'security' | 'notifications' | 'privacy' | 'trading' | 'data';

export default function Settings() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

  if (status === 'loading') {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </AppLayout>
    );
  }

  if (!session) {
    router.push('/auth/login');
    return null;
  }

  const tabs = [
    {
      id: 'profile' as SettingsTab,
      name: 'Profile Settings',
      description: 'Update your profile information, avatar, and bio',
      icon: FiUser,
    },
    {
      id: 'security' as SettingsTab,
      name: 'Security',
      description: 'Change password and security settings',
      icon: FiLock,
    },
    {
      id: 'notifications' as SettingsTab,
      name: 'Notifications',
      description: 'Configure email and push notifications',
      icon: FiBell,
    },
    {
      id: 'privacy' as SettingsTab,
      name: 'Privacy',
      description: 'Manage privacy and data settings',
      icon: FiShield,
    },
    {
      id: 'trading' as SettingsTab,
      name: 'Trading Preferences',
      description: 'Set your default trading preferences',
      icon: FiTrendingUp,
    },
    {
      id: 'data' as SettingsTab,
      name: 'Data Management',
      description: 'Export and import your trading data',
      icon: FiDatabase,
    },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'profile':
        return <ProfileSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'notifications':
        return <NotificationSettings />;
      case 'privacy':
        return <PrivacySettings />;
      case 'trading':
        return <TradingPreferences />;
      case 'data':
        return <DataManagement />;
      default:
        return <ProfileSettings />;
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings Panel</h1>
          <p className="text-slate-600">Manage your account settings and preferences</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-1/4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-slate-700 hover:bg-slate-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center">
                      <Icon className={`h-5 w-5 mr-3 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                      <div>
                        <div className="font-medium">{tab.name}</div>
                        <div className="text-sm text-slate-500 hidden lg:block">{tab.description}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>

            {/* Coming Soon Section */}
            <div className="mt-8 bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 mb-2">Coming Soon:</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Advanced security options</li>
                <li>• API key management</li>
                <li>• Backup & restore</li>
                <li>• Integration with brokers</li>
                <li>• Advanced analytics</li>
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {renderActiveTab()}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}


