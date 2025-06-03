'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import { FiArrowLeft, FiEdit, FiBarChart2, FiTrendingUp, FiTrendingDown, FiCalendar, FiPieChart } from 'react-icons/fi';
import Link from 'next/link';
import { Database } from '@/types/database.types';

type Strategy = Database['public']['Tables']['strategies']['Row'];

export default function StrategyDetail() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStrategy = async () => {
      if (!params.id) return;

      try {
        const response = await fetch(`/api/strategies/${params.id}`);
        if (!response.ok) {
          throw new Error('Strategy not found');
        }
        const data = await response.json();
        setStrategy(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStrategy();
  }, [params.id]);

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 70) return 'text-emerald-600';
    if (rate >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-slate-700 font-medium">Loading strategy...</div>
        </div>
      </AppLayout>
    );
  }

  if (error || !strategy) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Strategy Not Found</h2>
          <p className="text-slate-600 mb-4">{error || 'The strategy you are looking for does not exist.'}</p>
          <Link
            href="/strategies"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Back to Strategies
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/strategies"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          >
            <FiArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{strategy.name}</h1>
          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
            strategy.is_active
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              : 'bg-slate-100 text-slate-800 border border-slate-200'
          }`}>
            {strategy.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
        <div className="flex items-center gap-4 ml-11">
          {strategy.category && (
            <span className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full border border-indigo-200">
              {strategy.category}
            </span>
          )}
          <div className="flex gap-2">
            <Link
              href={`/strategies/${strategy.id}/analytics`}
              className="inline-flex items-center px-3 py-1.5 bg-indigo-100 text-indigo-800 rounded-md hover:bg-indigo-200 transition-colors text-sm font-medium"
            >
              <FiPieChart className="mr-1.5 h-3.5 w-3.5" />
              View Analytics
            </Link>
            <Link
              href={`/strategies/edit/${strategy.id}`}
              className="inline-flex items-center px-3 py-1.5 bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200 transition-colors text-sm font-medium"
            >
              <FiEdit className="mr-1.5 h-3.5 w-3.5" />
              Edit Strategy
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Strategy Image */}
          {strategy.image_url && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
              <img
                src={strategy.image_url}
                alt={strategy.name}
                className="w-full h-64 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Description */}
          {strategy.description && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Overview</h2>
              <p className="text-slate-700 leading-relaxed">{strategy.description}</p>
            </div>
          )}

          {/* Detailed Strategy */}
          {strategy.details && (
            <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-3">Strategy Details</h2>
              <div className="prose prose-slate max-w-none">
                <pre className="whitespace-pre-wrap text-slate-700 leading-relaxed font-sans">
                  {strategy.details}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Performance Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Performance</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiBarChart2 className="text-slate-500 h-4 w-4" />
                  <span className="text-sm text-slate-600">Total Trades</span>
                </div>
                <span className="font-semibold text-slate-900">{strategy.total_trades}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {strategy.success_rate >= 50 ? (
                    <FiTrendingUp className={`h-4 w-4 ${getSuccessRateColor(strategy.success_rate)}`} />
                  ) : (
                    <FiTrendingDown className={`h-4 w-4 ${getSuccessRateColor(strategy.success_rate)}`} />
                  )}
                  <span className="text-sm text-slate-600">Success Rate</span>
                </div>
                <span className={`font-semibold ${getSuccessRateColor(strategy.success_rate)}`}>
                  {strategy.success_rate.toFixed(1)}%
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiTrendingUp className="text-emerald-500 h-4 w-4" />
                  <span className="text-sm text-slate-600">Profitable Trades</span>
                </div>
                <span className="font-semibold text-emerald-600">{strategy.profitable_trades}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FiTrendingDown className="text-red-500 h-4 w-4" />
                  <span className="text-sm text-slate-600">Losing Trades</span>
                </div>
                <span className="font-semibold text-red-600">
                  {strategy.total_trades - strategy.profitable_trades}
                </span>
              </div>
            </div>
          </div>

          {/* Strategy Info */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Information</h2>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-slate-600">Created</span>
                <div className="flex items-center gap-2 mt-1">
                  <FiCalendar className="text-slate-400 h-4 w-4" />
                  <span className="text-sm font-medium text-slate-900">
                    {new Date(strategy.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-sm text-slate-600">Last Updated</span>
                <div className="flex items-center gap-2 mt-1">
                  <FiCalendar className="text-slate-400 h-4 w-4" />
                  <span className="text-sm font-medium text-slate-900">
                    {new Date(strategy.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-sm text-slate-600">Status</span>
                <div className="mt-1">
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                    strategy.is_active
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-800 border border-slate-200'
                  }`}>
                    {strategy.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/trading/new"
                className="w-full flex items-center justify-center px-4 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-sm font-medium"
              >
                <FiBarChart2 className="mr-2 h-4 w-4" />
                Record Trade with this Strategy
              </Link>
              <Link
                href={`/strategies/${strategy.id}/analytics`}
                className="w-full flex items-center justify-center px-4 py-2 bg-indigo-100 text-indigo-800 rounded-md hover:bg-indigo-200 transition-colors text-sm font-medium"
              >
                <FiPieChart className="mr-2 h-4 w-4" />
                View Detailed Analytics
              </Link>
              <Link
                href={`/strategies/edit/${strategy.id}`}
                className="w-full flex items-center justify-center px-4 py-2 bg-amber-100 text-amber-800 rounded-md hover:bg-amber-200 transition-colors text-sm font-medium"
              >
                <FiEdit className="mr-2 h-4 w-4" />
                Edit Strategy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
