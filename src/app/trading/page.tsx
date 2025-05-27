'use client';

import { useState, useEffect } from 'react';
import { useTrades } from '@/lib/hooks';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import { FiPlus, FiEye, FiEyeOff, FiEdit2, FiTrash2, FiFilter, FiTrendingUp } from 'react-icons/fi';
import { format, subDays } from 'date-fns';
import Link from 'next/link';
import TradePerformanceChart from '@/components/TradePerformanceChart';

export default function Trading() {
  const { user, loading: authLoading } = useAuth();
  const { trades, loading: tradesLoading, deleteTrade: deleteTradeHook } = useTrades(user?.id);

  const [showPrivate, setShowPrivate] = useState(true);
  const [marketFilter, setMarketFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [performanceLabels, setPerformanceLabels] = useState<string[]>([]);
  const [performanceData, setPerformanceData] = useState<number[]>([]);

  const isLoading = authLoading || tradesLoading;

  // Process trade data for performance chart
  useEffect(() => {
    if (!tradesLoading && trades.length > 0) {
      // Get closed trades with profit/loss data
      const closedTrades = trades
        .filter(trade => trade.status === 'closed' && trade.profit_loss !== null)
        .sort((a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime());

      if (closedTrades.length > 0) {
        // Get the last 10 trades or all if less than 10
        const recentTrades = closedTrades.slice(-10);

        const labels = recentTrades.map(trade => format(new Date(trade.trade_date), 'MMM d'));
        const data = recentTrades.map(trade => trade.profit_loss || 0);

        setPerformanceLabels(labels);
        setPerformanceData(data);
      }
    }
  }, [trades, tradesLoading]);

  // Get unique markets
  const markets = trades ? [...new Set(trades.map(trade => trade.market))] : [];

  // Filter trades based on selected filters
  const filteredTrades = trades.filter(trade => {
    const matchesPrivacy = showPrivate || !trade.is_private;
    const matchesMarket = marketFilter === 'all' || trade.market === marketFilter;
    const matchesStatus = statusFilter === 'all' || trade.status === statusFilter;

    return matchesPrivacy && matchesMarket && matchesStatus;
  });

  const deleteTrade = async (tradeId: string) => {
    if (!confirm('Are you sure you want to delete this trade?')) return;

    const { error } = await deleteTradeHook(tradeId);

    if (error) {
      console.error('Error deleting trade:', error);
      alert('Failed to delete trade');
    }
  };

  const calculateTotalProfitLoss = () => {
    return filteredTrades
      .filter(trade => trade.profit_loss !== null)
      .reduce((total, trade) => total + (trade.profit_loss || 0), 0);
  };

  const totalProfitLoss = calculateTotalProfitLoss();
  const profitableTrades = filteredTrades.filter(trade => trade.profit_loss !== null && trade.profit_loss > 0).length;
  const losingTrades = filteredTrades.filter(trade => trade.profit_loss !== null && trade.profit_loss < 0).length;
  const winRate = filteredTrades.length > 0
    ? (profitableTrades / filteredTrades.filter(trade => trade.profit_loss !== null).length) * 100
    : 0;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Trading Journal</h1>
          <p className="text-slate-700 font-medium">
            Track and analyze your Deriv trades
          </p>
        </div>
        <Link
          href="/trading/new"
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 shadow-sm border border-indigo-700 hover:border-indigo-800"
        >
          <FiPlus className="mr-2" />
          New Trade
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600">Total Trades</h3>
          <p className="text-2xl font-bold text-slate-900">{filteredTrades.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600">Total P/L</h3>
          <p className={`text-2xl font-bold ${totalProfitLoss > 0 ? 'text-emerald-600' : totalProfitLoss < 0 ? 'text-red-600' : 'text-slate-900'}`}>
            {totalProfitLoss > 0 ? '+' : ''}{totalProfitLoss.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600">Win Rate</h3>
          <p className="text-2xl font-bold text-slate-900">{winRate.toFixed(1)}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-600">Open Trades</h3>
          <p className="text-2xl font-bold text-slate-900">{filteredTrades.filter(trade => trade.status === 'open').length}</p>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6 border border-slate-200">
        <div className="flex items-center mb-4">
          <FiTrendingUp className="text-indigo-700 mr-2" />
          <h2 className="text-lg font-semibold text-slate-900">Performance Trend</h2>
        </div>
        {performanceData.length > 0 ? (
          <TradePerformanceChart
            labels={performanceLabels}
            profitLossData={performanceData}
          />
        ) : (
          <div className="h-64 flex items-center justify-center text-slate-700 font-medium">
            No performance data available. Complete some trades to see your performance trend.
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <FiFilter className="inline mr-1" /> Market
            </label>
            <select
              value={marketFilter}
              onChange={(e) => setMarketFilter(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            >
              <option value="all" className="text-slate-800">All Markets</option>
              {markets.map(market => (
                <option key={market} value={market} className="text-slate-800">{market}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              <FiFilter className="inline mr-1" /> Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            >
              <option value="all" className="text-slate-800">All Statuses</option>
              <option value="open" className="text-slate-800">Open</option>
              <option value="closed" className="text-slate-800">Closed</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setShowPrivate(!showPrivate)}
              className="flex items-center px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-50 text-slate-700"
            >
              {showPrivate ? (
                <>
                  <FiEyeOff className="mr-2" />
                  Hide Private
                </>
              ) : (
                <>
                  <FiEye className="mr-2" />
                  Show Private
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Trades */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-slate-200">
        {filteredTrades.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-slate-700 font-medium">No trades found</p>
            <Link
              href="/trading/new"
              className="inline-block mt-2 text-indigo-700 hover:text-indigo-900 font-medium"
            >
              Record your first trade
            </Link>
          </div>
        ) : (
          <div>
            {/* Desktop table view */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Market</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Entry</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Exit</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">P/L</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredTrades.map(trade => (
                    <tr key={trade.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-medium">
                        {format(new Date(trade.trade_date), 'MMM d, yyyy')}
                        {trade.is_private && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                            <FiEyeOff className="mr-1" size={10} />
                            Private
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{trade.market}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{trade.trade_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{trade.entry_price}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{trade.exit_price || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`${
                          trade.profit_loss > 0
                            ? 'text-emerald-600 font-semibold'
                            : trade.profit_loss < 0
                              ? 'text-red-600 font-semibold'
                              : 'text-slate-900'
                        }`}>
                          {trade.profit_loss !== null ? (trade.profit_loss > 0 ? '+' : '') + trade.profit_loss.toFixed(2) : '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          trade.status === 'open'
                            ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                            : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {trade.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-3">
                          <Link
                            href={`/trading/edit/${trade.id}`}
                            className="text-indigo-600 hover:text-indigo-900 p-1 hover:bg-indigo-50 rounded-full"
                            title="Edit trade"
                          >
                            <FiEdit2 size={18} />
                          </Link>
                          <button
                            onClick={() => deleteTrade(trade.id)}
                            className="text-red-600 hover:text-red-900 p-1 hover:bg-red-50 rounded-full"
                            title="Delete trade"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card view */}
            <div className="md:hidden divide-y divide-slate-200">
              {filteredTrades.map(trade => (
                <div key={trade.id} className="p-4 hover:bg-slate-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-medium text-slate-900">
                        {format(new Date(trade.trade_date), 'MMM d, yyyy')}
                        {trade.is_private && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                            <FiEyeOff className="mr-1" size={10} />
                            Private
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-700 mt-1">{trade.market} • {trade.trade_type}</div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      trade.status === 'open'
                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}>
                      {trade.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <span className="text-slate-600">Entry:</span> {trade.entry_price}
                    </div>
                    <div>
                      <span className="text-slate-600">Exit:</span> {trade.exit_price || '-'}
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-600">P/L:</span>{' '}
                      <span className={`${
                        trade.profit_loss > 0
                          ? 'text-emerald-600 font-semibold'
                          : trade.profit_loss < 0
                            ? 'text-red-600 font-semibold'
                            : 'text-slate-900'
                      }`}>
                        {trade.profit_loss !== null ? (trade.profit_loss > 0 ? '+' : '') + trade.profit_loss.toFixed(2) : '-'}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 border-t border-slate-100 pt-2">
                    <Link
                      href={`/trading/edit/${trade.id}`}
                      className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-full"
                      title="Edit trade"
                    >
                      <FiEdit2 size={18} />
                    </Link>
                    <button
                      onClick={() => deleteTrade(trade.id)}
                      className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full"
                      title="Delete trade"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
