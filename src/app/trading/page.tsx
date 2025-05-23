'use client';

import { useState } from 'react';
import { useAuth, useTrades } from '@/lib/hooks';
import AppLayout from '@/components/AppLayout';
import { supabase } from '@/lib/supabase';
import { FiPlus, FiEye, FiEyeOff, FiEdit2, FiTrash2, FiFilter } from 'react-icons/fi';
import { format } from 'date-fns';
import Link from 'next/link';

export default function Trading() {
  const { user, loading: authLoading } = useAuth();
  const { trades, loading: tradesLoading } = useTrades(user?.id);
  
  const [showPrivate, setShowPrivate] = useState(true);
  const [marketFilter, setMarketFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const isLoading = authLoading || tradesLoading;

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
    
    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', tradeId);
    
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
          <h1 className="text-2xl font-bold text-gray-900">Trading Log</h1>
          <p className="text-gray-600">
            Track and analyze your Deriv trades
          </p>
        </div>
        <Link
          href="/trading/new"
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <FiPlus className="mr-2" />
          New Trade
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total Trades</h3>
          <p className="text-2xl font-bold">{filteredTrades.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Total P/L</h3>
          <p className={`text-2xl font-bold ${totalProfitLoss > 0 ? 'text-green-600' : totalProfitLoss < 0 ? 'text-red-600' : ''}`}>
            {totalProfitLoss > 0 ? '+' : ''}{totalProfitLoss.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Win Rate</h3>
          <p className="text-2xl font-bold">{winRate.toFixed(1)}%</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Open Trades</h3>
          <p className="text-2xl font-bold">{filteredTrades.filter(trade => trade.status === 'open').length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiFilter className="inline mr-1" /> Market
            </label>
            <select
              value={marketFilter}
              onChange={(e) => setMarketFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Markets</option>
              {markets.map(market => (
                <option key={market} value={market}>{market}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <FiFilter className="inline mr-1" /> Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setShowPrivate(!showPrivate)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
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
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredTrades.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No trades found</p>
            <Link
              href="/trading/new"
              className="inline-block mt-2 text-blue-600 hover:underline"
            >
              Record your first trade
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entry</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">P/L</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTrades.map(trade => (
                  <tr key={trade.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {format(new Date(trade.trade_date), 'MMM d, yyyy')}
                      {trade.is_private && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                          <FiEyeOff className="mr-1" size={10} />
                          Private
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trade.market}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trade.trade_type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trade.entry_price}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{trade.exit_price || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`${
                        trade.profit_loss > 0 
                          ? 'text-green-600' 
                          : trade.profit_loss < 0 
                            ? 'text-red-600' 
                            : 'text-gray-900'
                      }`}>
                        {trade.profit_loss !== null ? (trade.profit_loss > 0 ? '+' : '') + trade.profit_loss.toFixed(2) : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        trade.status === 'open' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {trade.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/trading/edit/${trade.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FiEdit2 />
                        </Link>
                        <button
                          onClick={() => deleteTrade(trade.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
