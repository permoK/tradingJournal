'use client';

import { useState } from 'react';
import { useStrategies } from '@/lib/hooks';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import { FiPlus, FiEdit, FiTrash2, FiBarChart2, FiTrendingUp, FiTrendingDown, FiFilter, FiEye, FiPieChart, FiLayers } from 'react-icons/fi';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Strategies() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { strategies, loading: strategiesLoading, deleteStrategy } = useStrategies(user?.id);

  const [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const isLoading = authLoading || strategiesLoading;

  // Get unique categories
  const categories = strategies ? [...new Set(strategies.map(strategy => strategy.category).filter(Boolean))] : [];

  // Filter strategies
  const filteredStrategies = strategies.filter(strategy => {
    const statusMatch = filter === 'all' ||
      (filter === 'active' && strategy.is_active) ||
      (filter === 'inactive' && !strategy.is_active);

    const categoryMatch = categoryFilter === 'all' || strategy.category === categoryFilter;

    return statusMatch && categoryMatch;
  });

  const handleDeleteStrategy = async (strategyId: string) => {
    if (window.confirm('Are you sure you want to delete this strategy?')) {
      const { error } = await deleteStrategy(strategyId);
      if (error) {
        alert('Failed to delete strategy: ' + error);
      }
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 70) return 'text-emerald-600';
    if (rate >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-slate-700 font-medium">Loading strategies...</div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Trading Strategies</h1>
            <p className="text-slate-700 font-medium text-sm sm:text-base">
              Manage your custom trading strategies and track their performance
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href="/strategies/compare"
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
            >
              <FiLayers className="mr-2 h-4 w-4" />
              Compare
            </Link>
            <Link
              href="/strategies/new"
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
            >
              <FiPlus className="mr-2 h-4 w-4" />
              New Strategy
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <FiFilter className="text-slate-600" />
          <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Status</label>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              <option value="all">All Strategies</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Strategies Grid */}
      <div className="space-y-4">
        {filteredStrategies.length === 0 ? (
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm text-center border border-slate-200">
            <FiBarChart2 className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No strategies found</h3>
            <p className="text-slate-700 font-medium text-sm sm:text-base mb-4">
              {strategies.length === 0
                ? "Get started by creating your first trading strategy"
                : "No strategies match your current filters"
              }
            </p>
            {strategies.length === 0 && (
              <Link
                href="/strategies/new"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-sm"
              >
                <FiPlus className="mr-2 h-4 w-4" />
                Create Strategy
              </Link>
            )}
          </div>
        ) : (
          filteredStrategies.map(strategy => (
            <div key={strategy.id} className="bg-white p-4 sm:p-6 rounded-lg shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    {strategy.image_url && (
                      <img
                        src={strategy.image_url}
                        alt={strategy.name}
                        className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base sm:text-lg font-semibold text-slate-900">{strategy.name}</h3>
                        <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full ${
                          strategy.is_active
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-800 border border-slate-200'
                        }`}>
                          {strategy.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>

                      {strategy.category && (
                        <span className="inline-block px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full border border-indigo-200 mb-2">
                          {strategy.category}
                        </span>
                      )}

                      {strategy.description && (
                        <p className="text-slate-700 text-sm mb-2">{strategy.description}</p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <FiBarChart2 className="text-slate-500" />
                          <span className="text-slate-600">Total Trades: {strategy.total_trades}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {strategy.success_rate >= 50 ? (
                            <FiTrendingUp className={getSuccessRateColor(strategy.success_rate)} />
                          ) : (
                            <FiTrendingDown className={getSuccessRateColor(strategy.success_rate)} />
                          )}
                          <span className={`font-medium ${getSuccessRateColor(strategy.success_rate)}`}>
                            Success Rate: {strategy.success_rate.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    href={`/strategies/${strategy.id}`}
                    className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                    title="View details"
                  >
                    <FiEye className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/strategies/${strategy.id}/analytics`}
                    className="p-2 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-md transition-colors"
                    title="View analytics"
                  >
                    <FiPieChart className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/strategies/edit/${strategy.id}`}
                    className="p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                    title="Edit strategy"
                  >
                    <FiEdit className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDeleteStrategy(strategy.id)}
                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    title="Delete strategy"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </AppLayout>
  );
}
