'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import { FiSettings, FiUser, FiLock, FiBell, FiShield } from 'react-icons/fi';

export default function Settings() {
  const { data: session, status } = useSession();
  const router = useRouter();

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
  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-600">Manage your account settings and preferences</p>
        </div>

        {/* Placeholder Content */}
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
          <div className="text-center">
            <FiSettings className="mx-auto h-16 w-16 text-slate-400 mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Settings Panel</h2>
            <p className="text-slate-600 mb-6">
              This feature is currently under development. Account settings will be available soon.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 rounded-lg p-4">
                <FiUser className="h-8 w-8 text-slate-400 mb-2" />
                <h3 className="font-medium text-slate-900 mb-1">Profile Settings</h3>
                <p className="text-sm text-slate-600">Update your profile information, avatar, and bio</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <FiLock className="h-8 w-8 text-slate-400 mb-2" />
                <h3 className="font-medium text-slate-900 mb-1">Security</h3>
                <p className="text-sm text-slate-600">Change password and security settings</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <FiBell className="h-8 w-8 text-slate-400 mb-2" />
                <h3 className="font-medium text-slate-900 mb-1">Notifications</h3>
                <p className="text-sm text-slate-600">Configure email and push notifications</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4">
                <FiShield className="h-8 w-8 text-slate-400 mb-2" />
                <h3 className="font-medium text-slate-900 mb-1">Privacy</h3>
                <p className="text-sm text-slate-600">Manage privacy and data settings</p>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-slate-900 mb-2">Coming Soon:</h3>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Profile customization</li>
                <li>• Password management</li>
                <li>• Notification preferences</li>
                <li>• Trading preferences</li>
                <li>• Data export/import</li>
                <li>• Account deletion</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}


