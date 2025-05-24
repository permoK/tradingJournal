'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTrades } from '@/lib/hooks';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import { supabase } from '@/lib/supabase';
import { FiSave, FiX } from 'react-icons/fi';
import { format } from 'date-fns';

export default function EditTrade({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const { trades } = useTrades(user?.id);

  const [market, setMarket] = useState('');
  const [tradeType, setTradeType] = useState('Buy');
  const [tradeDate, setTradeDate] = useState('');
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [status, setStatus] = useState('open');
  const [notes, setNotes] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    // Find the trade with the matching ID
    const trade = trades.find(t => t.id === params.id);

    if (trade) {
      setMarket(trade.market);
      setTradeType(trade.trade_type);
      setTradeDate(format(new Date(trade.trade_date), 'yyyy-MM-dd'));
      setEntryPrice(trade.entry_price.toString());
      setExitPrice(trade.exit_price ? trade.exit_price.toString() : '');
      setQuantity(trade.quantity.toString());
      setStatus(trade.status);
      setNotes(trade.notes || '');
      setIsPrivate(trade.is_private);
    } else {
      setNotFound(true);
    }
  }, [trades, params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to edit a trade');
      return;
    }

    if (!market.trim() || !entryPrice || !quantity) {
      setError('Market, entry price, and quantity are required');
      return;
    }

    setLoading(true);
    setError(null);

    // Calculate profit/loss if trade is closed
    let profitLoss = null;
    if (status === 'closed' && exitPrice) {
      const entry = parseFloat(entryPrice);
      const exit = parseFloat(exitPrice);
      const qty = parseFloat(quantity);

      if (tradeType === 'Buy') {
        profitLoss = (exit - entry) * qty;
      } else {
        profitLoss = (entry - exit) * qty;
      }
    }

    // For demo purposes, we'll simulate a successful update
    // In a real application, you would use Supabase to update the trade

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // In a real app, you would do:
      // const { error } = await supabase
      //   .from('trades')
      //   .update({
      //     trade_date: new Date(tradeDate).toISOString(),
      //     market,
      //     trade_type: tradeType,
      //     entry_price: parseFloat(entryPrice),
      //     exit_price: exitPrice ? parseFloat(exitPrice) : null,
      //     quantity: parseFloat(quantity),
      //     profit_loss: profitLoss,
      //     status,
      //     notes: notes.trim() || null,
      //     is_private: isPrivate
      //   })
      //   .eq('id', params.id);

      // if (error) throw error;

      // Redirect to trading page
      router.push('/trading');
    } catch (err) {
      console.error('Error updating trade:', err);
      setError('Failed to update trade');
      setLoading(false);
    }
  };

  if (notFound) {
    return (
      <AppLayout>
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Trade Not Found</h1>
          <p className="text-gray-600 mb-4">The trade you're looking for doesn't exist or you don't have permission to view it.</p>
          <button
            onClick={() => router.push('/trading')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Back to Trading
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Trade</h1>
        <button
          onClick={() => router.push('/trading')}
          className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <FiX className="mr-2" />
          Cancel
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="market" className="block text-sm font-medium text-gray-700 mb-1">
              Market *
            </label>
            <input
              id="market"
              type="text"
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              placeholder="e.g. EUR/USD, BTC/USD, Gold"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="tradeType" className="block text-sm font-medium text-gray-700 mb-1">
              Trade Type *
            </label>
            <select
              id="tradeType"
              value={tradeType}
              onChange={(e) => setTradeType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Buy">Buy</option>
              <option value="Sell">Sell</option>
            </select>
          </div>

          <div>
            <label htmlFor="tradeDate" className="block text-sm font-medium text-gray-700 mb-1">
              Trade Date *
            </label>
            <input
              id="tradeDate"
              type="date"
              value={tradeDate}
              onChange={(e) => setTradeDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div>
            <label htmlFor="entryPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Entry Price *
            </label>
            <input
              id="entryPrice"
              type="number"
              step="any"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="exitPrice" className="block text-sm font-medium text-gray-700 mb-1">
              Exit Price {status === 'closed' && '*'}
            </label>
            <input
              id="exitPrice"
              type="number"
              step="any"
              value={exitPrice}
              onChange={(e) => setExitPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required={status === 'closed'}
              disabled={status === 'open'}
            />
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <input
              id="quantity"
              type="number"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="mt-6">
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="mt-4 mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Make this trade private</span>
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <FiSave className="mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </AppLayout>
  );
}
