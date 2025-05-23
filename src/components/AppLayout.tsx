'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { FiHome, FiBook, FiBarChart2, FiFileText, FiUsers, FiSettings, FiLogOut } from 'react-icons/fi';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();

  // For demo purposes, we'll simulate a user is always logged in
  const user = { id: '1', email: 'demo@example.com' };
  const loading = false;

  const handleSignOut = async () => {
    // For demo purposes, we'll just redirect to the home page
    router.push('/');
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: FiHome },
    { name: 'Learning', href: '/learning', icon: FiBook },
    { name: 'Trading', href: '/trading', icon: FiBarChart2 },
    { name: 'Journal', href: '/journal', icon: FiFileText },
    { name: 'Community', href: '/community', icon: FiUsers },
    { name: 'Settings', href: '/settings', icon: FiSettings },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return children;
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r border-slate-200 shadow-sm">
            <div className="flex flex-col flex-shrink-0 px-4">
              <Link href="/dashboard" className="text-lg font-semibold text-slate-900">
                Deriv Progress Tracker
              </Link>
              <p className="text-sm text-slate-600 font-medium">Master trading together</p>
            </div>
            <div className="flex flex-col flex-grow px-4 mt-5">
              <nav className="flex-1 space-y-1">
                {navItems.map((item) => {
                  const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`flex items-center px-3 py-2 text-sm font-medium rounded-md group ${
                        isActive
                          ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                          : 'text-slate-800 hover:bg-slate-100 border border-transparent'
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-5 w-5 ${
                          isActive ? 'text-indigo-700' : 'text-slate-600 group-hover:text-slate-800'
                        }`}
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
              <div className="mt-auto">
                <button
                  onClick={handleSignOut}
                  className="flex items-center w-full px-3 py-2 mt-2 text-sm font-medium text-slate-800 rounded-md hover:bg-red-50 hover:text-red-700 border border-transparent hover:border-red-100 group transition-colors"
                >
                  <FiLogOut className="w-5 h-5 mr-3 text-slate-600 group-hover:text-red-600" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile header */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <div className="md:hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shadow-sm">
            <Link href="/dashboard" className="text-lg font-semibold text-slate-900">
              Deriv Progress Tracker
            </Link>
            {/* Mobile menu button */}
            <button className="p-2 text-slate-600 rounded-md hover:text-slate-900 hover:bg-slate-100 border border-transparent hover:border-slate-200">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          <div className="py-6">
            <div className="px-4 mx-auto max-w-7xl sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
