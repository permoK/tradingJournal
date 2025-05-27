'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTrades, useActivityLogs } from '@/lib/hooks';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import MarketSelector from '@/components/MarketSelector';
import { FiSave, FiX, FiDollarSign, FiTrendingUp, FiTrendingDown, FiInfo } from 'react-icons/fi';
import { format } from 'date-fns';
import { calculatePL, getMarketInfo, formatPL, formatPips, formatPercentage, validateTradeInputs, getSuggestedLotSizes } from '@/utils/plCalculator';

export default function EditTrade({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { user } = useAuth();
  const { trades, updateTrade } = useTrades(user?.id);
  const { logActivity } = useActivityLogs(user?.id);

  const [market, setMarket] = useState('');
  const [selectedMarket, setSelectedMarket] = useState<any>(null);
  const [tradeType, setTradeType] = useState('buy');
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
  const [calculatedPL, setCalculatedPL] = useState<number | null>(null);
  const [plResult, setPlResult] = useState<any>(null);
  const [recentMarkets, setRecentMarkets] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Load recent markets from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentTradingMarkets');
    if (saved) {
      setRecentMarkets(JSON.parse(saved));
    }
  }, []);

  // Calculate P&L when prices change using professional calculator
  useEffect(() => {
    if (entryPrice && exitPrice && quantity && status === 'closed' && selectedMarket) {
      const entry = parseFloat(entryPrice);
      const exit = parseFloat(exitPrice);
      const qty = parseFloat(quantity);

      // Validate inputs
      const validation = validateTradeInputs(entry, exit, qty);
      if (validation) {
        setValidationError(validation);
        setCalculatedPL(null);
        setPlResult(null);
        return;
      }

      setValidationError(null);

      // Get market info for accurate calculation
      const marketInfo = getMarketInfo(selectedMarket.symbol);
      if (marketInfo && !isNaN(entry) && !isNaN(exit) && !isNaN(qty)) {
        try {
          const result = calculatePL({
            market: marketInfo,
            tradeType,
            entryPrice: entry,
            exitPrice: exit,
            quantity: qty
          });

          setCalculatedPL(result.profitLoss);
          setPlResult(result);
        } catch (error) {
          console.error('P&L calculation error:', error);
          setCalculatedPL(null);
          setPlResult(null);
          setValidationError('Error calculating P&L');
        }
      } else {
        setCalculatedPL(null);
        setPlResult(null);
      }
    } else {
      setCalculatedPL(null);
      setPlResult(null);
      setValidationError(null);
    }
  }, [entryPrice, exitPrice, quantity, tradeType, status, selectedMarket]);

  const handleMarketSelect = (marketObj: any) => {
    setSelectedMarket(marketObj);
    setMarket(marketObj.symbol);

    // Update recent markets
    const updated = [marketObj.symbol, ...recentMarkets.filter(m => m !== marketObj.symbol)].slice(0, 5);
    setRecentMarkets(updated);
    localStorage.setItem('recentTradingMarkets', JSON.stringify(updated));
  };

  useEffect(() => {
    // Only check for trade if trades have been loaded
    if (trades.length === 0) return;

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
      setNotFound(false);

      // Set selected market if it exists in our market list
      const marketInfo = getMarketInfo(trade.market);
      if (marketInfo) {
        setSelectedMarket(marketInfo);
      }
    } else if (trades.length > 0) {
      // Only set not found if trades have loaded but trade not found
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

    // Use calculated profit/loss
    const profitLoss = status === 'closed' ? calculatedPL : null;

    try {
      // Update the trade using the hook
      const { error } = await updateTrade(params.id, {
        trade_date: new Date(tradeDate).toISOString(),
        market,
        trade_type: tradeType,
        entry_price: parseFloat(entryPrice),
        exit_price: exitPrice ? parseFloat(exitPrice) : null,
        quantity: parseFloat(quantity),
        profit_loss: profitLoss,
        status,
        notes: notes.trim() || null,
        is_private: isPrivate
      });

      if (error) {
        throw new Error(error);
      }

      // Log activity for streak tracking
      await logActivity('trading', `Updated ${market} ${tradeType} trade`);

      // Redirect to trading page
      router.push('/trading');
    } catch (err: any) {
      console.error('Error updating trade:', err);
      setError(err.message || 'Failed to update trade');
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
        <h1 className="text-2xl font-bold text-slate-900">Edit Trade</h1>
        <button
          onClick={() => router.push('/trading')}
          className="flex items-center px-3 py-2 border border-slate-300 rounded-md hover:bg-slate-50 text-slate-700"
        >
          <FiX className="mr-2" />
          Cancel
        </button>
      </div>

      {error && (
        <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-800 rounded-md">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Market *
            </label>
            <MarketSelector
              value={market}
              onChange={handleMarketSelect}
              recentMarkets={recentMarkets}
            />
            {selectedMarket && (
              <p className="mt-1 text-xs text-slate-600">
                {selectedMarket.name} • {selectedMarket.category}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="tradeType" className="block text-sm font-medium text-slate-700 mb-1">
              Trade Type *
            </label>
            <select
              id="tradeType"
              value={tradeType}
              onChange={(e) => setTradeType(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              required
            >
              <option value="buy" className="text-slate-800">Buy (Long)</option>
              <option value="sell" className="text-slate-800">Sell (Short)</option>
            </select>
          </div>

          <div>
            <label htmlFor="tradeDate" className="block text-sm font-medium text-slate-700 mb-1">
              Trade Date *
            </label>
            <input
              id="tradeDate"
              type="date"
              value={tradeDate}
              onChange={(e) => setTradeDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              required
            />
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-slate-700 mb-1">
              Status *
            </label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              required
            >
              <option value="open" className="text-slate-800">Open</option>
              <option value="closed" className="text-slate-800">Closed</option>
            </select>
          </div>

          <div>
            <label htmlFor="entryPrice" className="block text-sm font-medium text-slate-700 mb-1">
              Entry Price *
            </label>
            <input
              id="entryPrice"
              type="number"
              step="any"
              value={entryPrice}
              onChange={(e) => setEntryPrice(e.target.value)}
              placeholder="e.g. 1.0500, 50000, 2000"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              required
            />
          </div>

          <div>
            <label htmlFor="exitPrice" className="block text-sm font-medium text-slate-700 mb-1">
              Exit Price {status === 'closed' && '*'}
            </label>
            <input
              id="exitPrice"
              type="number"
              step="any"
              value={exitPrice}
              onChange={(e) => setExitPrice(e.target.value)}
              placeholder="e.g. 1.0550, 51000, 2010"
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 disabled:bg-slate-100 disabled:text-slate-500"
              required={status === 'closed'}
              disabled={status === 'open'}
            />
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-slate-700 mb-1">
              Quantity * {selectedMarket && (
                <span className="text-xs text-slate-500">
                  ({selectedMarket.category === 'forex' ? 'lots' : 'units'})
                </span>
              )}
            </label>
            <input
              id="quantity"
              type="number"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder={selectedMarket?.category === 'forex' ? 'e.g. 0.1, 1, 10' : 'e.g. 1, 10, 100'}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              required
            />
            {selectedMarket && (
              <div className="mt-2">
                <div className="text-xs text-slate-600 mb-1">Suggested sizes:</div>
                <div className="flex flex-wrap gap-1">
                  {getSuggestedLotSizes(selectedMarket.category).map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setQuantity(size.toString())}
                      className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded border transition-colors"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* P&L Calculator */}
        {status === 'closed' && (
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center mb-3">
              <FiDollarSign className="text-indigo-600 mr-2" />
              <h3 className="text-lg font-semibold text-slate-900">Professional P&L Calculator</h3>
              {selectedMarket && (
                <span className="ml-2 text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                  {selectedMarket.category}
                </span>
              )}
            </div>

            {validationError && (
              <div className="p-3 bg-red-50 rounded-md border border-red-200 mb-3">
                <p className="text-red-800 text-sm font-medium">{validationError}</p>
              </div>
            )}

            {plResult && calculatedPL !== null && (
              <div className="space-y-4">
                {/* Main P&L Display */}
                <div className="p-4 bg-white rounded-md border border-slate-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {calculatedPL >= 0 ? (
                        <FiTrendingUp className="w-6 h-6 text-emerald-600" />
                      ) : (
                        <FiTrendingDown className="w-6 h-6 text-red-600" />
                      )}
                      <div>
                        <div className="text-sm text-slate-600">Total P&L</div>
                        <div className={`text-2xl font-bold ${
                          calculatedPL >= 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {formatPL(calculatedPL)}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm text-slate-600">Return</div>
                      <div className={`text-lg font-semibold ${
                        plResult.percentage >= 0 ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {formatPercentage(plResult.percentage)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3 bg-white rounded-md border border-slate-200">
                    <div className="text-sm text-slate-600 mb-1">Price Movement</div>
                    <div className="font-semibold text-slate-900">
                      {parseFloat(entryPrice).toFixed(selectedMarket?.category === 'forex' ? 5 : 2)} → {parseFloat(exitPrice).toFixed(selectedMarket?.category === 'forex' ? 5 : 2)}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {plResult.breakdown.priceMovement > 0 ? '+' : ''}{plResult.breakdown.priceMovement.toFixed(selectedMarket?.category === 'forex' ? 5 : 2)} points
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-md border border-slate-200">
                    <div className="text-sm text-slate-600 mb-1">Pip Movement</div>
                    <div className="font-semibold text-slate-900">
                      {formatPips(plResult.pips)}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Pip value: {selectedMarket?.pip || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!selectedMarket && (
              <div className="p-4 bg-blue-50 rounded-md border border-blue-200">
                <p className="text-blue-800 text-sm">
                  Please select a market to enable accurate P&L calculation.
                </p>
              </div>
            )}
          </div>
        )}

        <div className="mt-6">
          <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">
            Notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            placeholder="Add your trade analysis, strategy, or observations..."
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
          />
        </div>

        <div className="mt-4 mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
            />
            <span className="ml-2 text-sm text-slate-700">Make this trade private</span>
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 transition-colors"
          >
            <FiSave className="mr-2" />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </AppLayout>
  );
}
