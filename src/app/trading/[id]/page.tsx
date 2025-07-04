'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useStrategies } from '@/lib/hooks';
import AppLayout from '@/components/AppLayout';
import { FiArrowLeft, FiEdit, FiCalendar, FiBarChart2, FiDollarSign, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { format } from 'date-fns';
import Link from 'next/link';

interface Trade {
  id: string;
  user_id: string;
  strategy_id: string | null;
  market: string;
  trade_type: 'buy' | 'sell';
  entry_price: number | null;
  exit_price: number | null;
  quantity: number | null;
  profit_loss: number | null;
  trade_date: string;
  status: 'open' | 'closed';
  notes: string | null;
  screenshot_url: string | null;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

export default function TradeDetail() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { strategies } = useStrategies(user?.id);
  const [trade, setTrade] = useState<Trade | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrade = async () => {
      if (!params.id) return;

      try {
        const response = await fetch(`/api/trades/${params.id}`);
        if (!response.ok) {
          throw new Error('Trade not found');
        }
        const data = await response.json();
        setTrade(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load trade');
      } finally {
        setLoading(false);
      }
    };

    fetchTrade();
  }, [params.id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </AppLayout>
    );
  }

  if (error || !trade) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Trade Not Found</h2>
          <p className="text-slate-600 mb-6">{error || 'The trade you are looking for does not exist.'}</p>
          <Link
            href="/trading"
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Back to Trades
          </Link>
        </div>
      </AppLayout>
    );
  }

  const canEdit = user?.id === trade.user_id;

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"
            >
              <FiArrowLeft className="mr-2 h-4 w-4" />
              Back
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{trade.market} Trade</h1>
              <p className="text-slate-600">
                {format(new Date(trade.trade_date), 'MMMM dd, yyyy')}
              </p>
            </div>
          </div>

          {canEdit && (
            <Link
              href={`/trading/edit/${trade.id}`}
              className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <FiEdit className="mr-2 h-4 w-4" />
              Edit Trade
            </Link>
          )}
        </div>
      </div>

      {/* Trade Screenshot */}
      {trade.screenshot_url && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Trade Screenshot</h2>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <img
              src={trade.screenshot_url}
              alt="Trade screenshot"
              className="w-full h-auto max-h-96 object-contain"
            />
          </div>
        </div>
      )}

      {/* Trade Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Trade Information</h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Market:</span>
              <span className="font-semibold text-slate-900">{trade.market}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-600">Type:</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                trade.trade_type === 'buy'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {trade.trade_type?.toUpperCase()}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-600">Status:</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                trade.status === 'open'
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-slate-100 text-slate-800'
              }`}>
                {trade.status?.charAt(0).toUpperCase() + trade.status?.slice(1)}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-600">Entry Price:</span>
              <span className="font-semibold text-slate-900">
                {trade.entry_price ? `$${trade.entry_price.toFixed(4)}` : '-'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-600">Exit Price:</span>
              <span className="font-semibold text-slate-900">
                {trade.exit_price ? `$${trade.exit_price.toFixed(4)}` : '-'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-600">Quantity:</span>
              <span className="font-semibold text-slate-900">
                {trade.quantity ? trade.quantity.toFixed(4) : '-'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-600">Strategy:</span>
              <span className="font-semibold text-slate-900">
                {trade.strategy_id ? (
                  (() => {
                    const strategy = strategies.find(s => s.id === trade.strategy_id);
                    return strategy ? (
                      <Link
                        href={`/strategies/${strategy.id}`}
                        className="text-indigo-600 hover:text-indigo-800 hover:underline"
                      >
                        {strategy.name}
                      </Link>
                    ) : 'Unknown Strategy';
                  })()
                ) : (
                  <span className="text-slate-500">No strategy</span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Performance */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Performance</h2>

          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-2">
              {trade.profit_loss !== null ? (
                trade.profit_loss > 0 ? (
                  <FiTrendingUp className="text-emerald-600 mr-2 h-6 w-6" />
                ) : trade.profit_loss < 0 ? (
                  <FiTrendingDown className="text-red-600 mr-2 h-6 w-6" />
                ) : (
                  <FiBarChart2 className="text-slate-600 mr-2 h-6 w-6" />
                )
              ) : (
                <FiBarChart2 className="text-slate-600 mr-2 h-6 w-6" />
              )}

              <span className={`text-3xl font-bold ${
                trade.profit_loss !== null
                  ? trade.profit_loss > 0
                    ? 'text-emerald-600'
                    : trade.profit_loss < 0
                    ? 'text-red-600'
                    : 'text-slate-900'
                  : 'text-slate-900'
              }`}>
                {trade.profit_loss !== null
                  ? `${trade.profit_loss > 0 ? '+' : ''}${trade.profit_loss.toFixed(2)}`
                  : '-'
                }
              </span>
            </div>
            <p className="text-slate-600">Profit/Loss</p>
          </div>

          {trade.entry_price && trade.exit_price && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Price Change:</span>
                <span className={`font-semibold ${
                  trade.exit_price > trade.entry_price ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {((trade.exit_price - trade.entry_price) / trade.entry_price * 100).toFixed(2)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Notes */}
      {trade.notes && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Notes</h2>
          <p className="text-slate-700 whitespace-pre-wrap">{trade.notes}</p>
        </div>
      )}

      {/* Timestamps */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Timeline</h2>
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <FiCalendar className="text-slate-400 mr-2 h-4 w-4" />
            <span className="text-slate-600">Created:</span>
            <span className="ml-2 text-slate-900">
              {format(new Date(trade.created_at), 'MMMM dd, yyyy \'at\' h:mm a')}
            </span>
          </div>
          {trade.updated_at !== trade.created_at && (
            <div className="flex items-center text-sm">
              <FiCalendar className="text-slate-400 mr-2 h-4 w-4" />
              <span className="text-slate-600">Last updated:</span>
              <span className="ml-2 text-slate-900">
                {format(new Date(trade.updated_at), 'MMMM dd, yyyy \'at\' h:mm a')}
              </span>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
