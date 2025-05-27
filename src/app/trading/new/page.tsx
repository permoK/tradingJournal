'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTrades, useActivityLogs } from '@/lib/hooks';
import AppLayout from '@/components/AppLayout';
import MarketSelector from '@/components/MarketSelector';
import { FiSave, FiX, FiDollarSign, FiTrendingUp, FiTrendingDown, FiInfo } from 'react-icons/fi';
import { format } from 'date-fns';
import { calculatePL, getMarketInfo, formatPL, formatPips, formatPercentage, validateTradeInputs, getSuggestedLotSizes } from '@/utils/plCalculator';

export default function NewTrade() {
  const router = useRouter();
  const { user } = useAuth();
  const { createTrade } = useTrades(user?.id);
  const { logActivity } = useActivityLogs(user?.id);

  const [market, setMarket] = useState('');
  const [selectedMarket, setSelectedMarket] = useState<any>(null);
  const [tradeType, setTradeType] = useState('buy');
  const [tradeDate, setTradeDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [status, setStatus] = useState('open');
  const [notes, setNotes] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to record a trade');
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
      // Create the trade using the hook
      const { error } = await createTrade({
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
      await logActivity('trading', `Recorded ${market} ${tradeType} trade`);

      // Redirect to trading page
      router.push('/trading');
    } catch (err: any) {
      console.error('Error recording trade:', err);
      setError(err.message || 'Failed to record trade');
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Record New Trade</h1>
        <button
          onClick={() => router.push('/trading')}
          className="flex items-center px-3 py-2 border border-slate-300 rounded-md hover:bg-slate-50 text-slate-700"
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
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
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

                  <div className="p-3 bg-white rounded-md border border-slate-200">
                    <div className="text-sm text-slate-600 mb-1">Position Size</div>
                    <div className="font-semibold text-slate-900">
                      {quantity} {selectedMarket?.category === 'forex' ? 'lots' : 'units'}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Contract value: {plResult.breakdown.contractValue.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-md border border-slate-200">
                    <div className="text-sm text-slate-600 mb-1">Total Investment</div>
                    <div className="font-semibold text-slate-900">
                      ${plResult.breakdown.totalValue.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Entry × Position
                    </div>
                  </div>
                </div>

                {/* Market Info */}
                {selectedMarket && (
                  <div className="p-3 bg-blue-50 rounded-md border border-blue-200">
                    <div className="flex items-center mb-2">
                      <FiInfo className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium text-blue-900">Market Information</span>
                    </div>
                    <div className="text-xs text-blue-800 space-y-1">
                      <div>Category: {selectedMarket.category.charAt(0).toUpperCase() + selectedMarket.category.slice(1)}</div>
                      <div>Pip Size: {selectedMarket.pip}</div>
                      {selectedMarket.contractSize && (
                        <div>Contract Size: {selectedMarket.contractSize.toLocaleString()}</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!plResult && !validationError && entryPrice && exitPrice && quantity && selectedMarket && (
              <div className="p-4 bg-amber-50 rounded-md border border-amber-200">
                <p className="text-amber-800 text-sm">
                  Calculating P&L for {selectedMarket.symbol}...
                </p>
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
            <span className="ml-2 text-sm text-slate-700 font-medium">Make this trade private</span>
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 border border-indigo-700"
          >
            <FiSave className="mr-2" />
            {loading ? 'Saving...' : 'Record Trade'}
          </button>
        </div>
      </form>
    </AppLayout>
  );
}
