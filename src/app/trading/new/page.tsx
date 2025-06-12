'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTradeMode } from '@/contexts/TradeModeContext';
import { useTrades, useActivityLogs, useStrategies, useProfile } from '@/lib/hooks';
import AppLayout from '@/components/AppLayout';
import MarketSelector from '@/components/MarketSelector';
import ImageUpload from '@/components/ImageUpload';
import SavedTradesList from '@/components/SavedTradesList';
import TradeModeToggle from '@/components/TradeModeToggle';
import { SavedTrade } from '@/components/SavedTradeCard';
import { FiPlus, FiX, FiDollarSign, FiTrendingUp, FiTrendingDown, FiInfo } from 'react-icons/fi';
import { format } from 'date-fns';
import { calculatePL, getMarketInfo, formatPL, formatPips, formatPercentage, validateTradeInputs, getSuggestedLotSizes } from '@/utils/plCalculator';
import ReactMarkdown from 'react-markdown';

export default function NewTrade() {
  const router = useRouter();
  const { user } = useAuth();
  const { isDemoMode } = useTradeMode();
  const { createMultipleTrades } = useTrades(user?.id);
  const { logActivity } = useActivityLogs(user?.id);
  const { strategies } = useStrategies(user?.id);
  const { profile, updateProfile } = useProfile(user?.id);

  // Form state
  const [market, setMarket] = useState('');
  const [selectedMarket, setSelectedMarket] = useState<any>(null);
  const [tradeType, setTradeType] = useState('buy');
  const [tradeDate, setTradeDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [quantity, setQuantity] = useState('');
  const [status, setStatus] = useState('open');
  const [notes, setNotes] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);
  const [strategyId, setStrategyId] = useState<string>('');
  const [accountBalance, setAccountBalance] = useState<number | undefined>(undefined);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [calculatedPL, setCalculatedPL] = useState<number | null>(null);
  const [plResult, setPlResult] = useState<any>(null);
  const [recentMarkets, setRecentMarkets] = useState<string[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isRecordingAll, setIsRecordingAll] = useState(false);
  const [editingTrade, setEditingTrade] = useState<SavedTrade | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Saved trades state
  const [savedTrades, setSavedTrades] = useState<SavedTrade[]>([]);

  // Load recent markets and saved trades from localStorage
  useEffect(() => {
    const savedRecentMarkets = localStorage.getItem('recentTradingMarkets');
    if (savedRecentMarkets) {
      setRecentMarkets(JSON.parse(savedRecentMarkets));
    }

    const savedTradesData = localStorage.getItem('savedTrades');
    if (savedTradesData) {
      setSavedTrades(JSON.parse(savedTradesData));
    }
  }, []);

  // Save trades to localStorage whenever savedTrades changes
  useEffect(() => {
    localStorage.setItem('savedTrades', JSON.stringify(savedTrades));
  }, [savedTrades]);

  // Calculate P&L when prices change
  useEffect(() => {
    if (entryPrice && exitPrice && quantity && status === 'closed' && selectedMarket) {
      const entry = parseFloat(entryPrice);
      const exit = parseFloat(exitPrice);
      const qty = parseFloat(quantity);

      const validation = validateTradeInputs(entry, exit, qty);
      if (validation) {
        setValidationError(validation);
        setCalculatedPL(null);
        setPlResult(null);
        return;
      }

      setValidationError(null);

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

  // Set default balance from profile
  useEffect(() => {
    if (profile && profile.balance !== null && profile.balance !== undefined && accountBalance === undefined) {
      setAccountBalance(profile.balance);
    }
  }, [profile]);

  const handleMarketSelect = (marketObj: any) => {
    setSelectedMarket(marketObj);
    setMarket(marketObj.symbol);

    const updated = [marketObj.symbol, ...recentMarkets.filter(m => m !== marketObj.symbol)].slice(0, 5);
    setRecentMarkets(updated);
    localStorage.setItem('recentTradingMarkets', JSON.stringify(updated));
  };

  const resetForm = () => {
    setMarket('');
    setSelectedMarket(null);
    setTradeType('buy');
    setTradeDate(format(new Date(), 'yyyy-MM-dd'));
    setEntryPrice('');
    setExitPrice('');
    setTakeProfit('');
    setStopLoss('');
    setQuantity('');
    setStatus('open');
    setNotes('');
    setIsPrivate(false);
    setScreenshotUrl(null);
    setStrategyId('');
    setError(null);
    setValidationError(null);
    setCalculatedPL(null);
    setPlResult(null);
    setEditingTrade(null);
    setShowPreview(false);
  };

  const handleAddTrade = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError('You must be logged in to add a trade');
      return;
    }

    if (!market.trim() || !entryPrice || !quantity) {
      setError('Market, entry price, and quantity are required');
      return;
    }

    const newTrade: SavedTrade = {
      id: editingTrade?.id || Date.now().toString(),
      market,
      tradeType: tradeType as 'buy' | 'sell',
      tradeDate,
      entryPrice,
      exitPrice,
      takeProfit,
      stopLoss,
      quantity,
      status: status as 'open' | 'closed',
      notes,
      isPrivate,
      isDemo: isDemoMode,
      screenshotUrl,
      calculatedPL: status === 'closed' ? calculatedPL : null,
      strategyId: strategyId || null
    };

    if (editingTrade) {
      // Update existing trade
      setSavedTrades(prev => prev.map(trade =>
        trade.id === editingTrade.id ? newTrade : trade
      ));
    } else {
      // Add new trade
      setSavedTrades(prev => [...prev, newTrade]);
    }

    resetForm();
  };

  const handleEditTrade = (trade: SavedTrade) => {
    setEditingTrade(trade);
    setMarket(trade.market);
    setTradeType(trade.tradeType);
    setTradeDate(trade.tradeDate);
    setEntryPrice(trade.entryPrice);
    setExitPrice(trade.exitPrice);
    setTakeProfit(trade.takeProfit || '');
    setStopLoss(trade.stopLoss || '');
    setQuantity(trade.quantity);
    setStatus(trade.status);
    setNotes(trade.notes);
    setIsPrivate(trade.isPrivate);
    setScreenshotUrl(trade.screenshotUrl || null);
    setStrategyId(trade.strategyId || '');

    // Set selected market if it exists
    const marketInfo = getMarketInfo(trade.market);
    if (marketInfo) {
      setSelectedMarket(marketInfo);
    }
  };

  const handleDeleteTrade = (tradeId: string) => {
    setSavedTrades(prev => prev.filter(trade => trade.id !== tradeId));
  };

  const handleClearAllTrades = () => {
    if (confirm('Are you sure you want to clear all saved trades?')) {
      setSavedTrades([]);
      localStorage.removeItem('savedTrades');
    }
  };

  const handleRecordAllTrades = async () => {
    if (!user || savedTrades.length === 0) return;

    setIsRecordingAll(true);
    setError(null);

    try {
      const tradesToRecord = savedTrades.map(trade => ({
        trade_date: new Date(trade.tradeDate).toISOString(),
        market: trade.market,
        trade_type: trade.tradeType,
        entry_price: parseFloat(trade.entryPrice),
        exit_price: trade.exitPrice ? parseFloat(trade.exitPrice) : null,
        quantity: parseFloat(trade.quantity),
        profit_loss: trade.calculatedPL,
        status: trade.status,
        notes: trade.notes.trim() || null,
        screenshot_url: trade.screenshotUrl,
        is_private: trade.isPrivate,
        is_demo: trade.isDemo,
        strategy_id: trade.strategyId || null
      }));

      const { error } = await createMultipleTrades(tradesToRecord);

      if (error) {
        throw new Error(error);
      }

      // Update profile balance
      const totalPL = tradesToRecord.reduce((sum, t) => sum + (t.profit_loss || 0), 0);
      if (profile && typeof profile.balance === 'number') {
        await updateProfile({ balance: profile.balance + totalPL });
      }

      // Log activity for streak tracking
      await logActivity('trading', `Recorded ${savedTrades.length} trades`);

      // Clear saved trades and redirect
      setSavedTrades([]);
      localStorage.removeItem('savedTrades');
      router.push('/trading');
    } catch (err: any) {
      console.error('Error recording trades:', err);
      setError(err.message || 'Failed to record trades');
    } finally {
      setIsRecordingAll(false);
    }
  };

  return (
    <AppLayout>
      {profile && typeof profile.balance === 'number' && (
        <div className="mb-4 flex items-center justify-center">
          <div className="bg-white border border-slate-200 rounded-lg px-4 py-2 flex items-center gap-3 shadow-sm">
            <FiInfo className="text-slate-600 text-2xl" />
            <div>
              <div className="text-sm text-slate-600">Account Balance</div>
              <div className="text-xl font-semibold text-slate-900">${profile.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
          </div>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-2xl font-bold text-slate-900">
              {editingTrade ? 'Edit Trade' : 'Record New Trades'}
            </h1>
            <TradeModeToggle />
          </div>
          <p className="text-slate-600 mt-1">
            Add multiple trades and record them all at once
            {isDemoMode && (
              <span className="text-amber-600 font-medium"> • Demo Mode Active</span>
            )}
          </p>
        </div>
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

      <form onSubmit={handleAddTrade} className="bg-white p-6 rounded-lg shadow-sm">
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
            <label htmlFor="takeProfit" className="block text-sm font-medium text-slate-700 mb-1">
              Take Profit (TP) *
            </label>
            <input
              id="takeProfit"
              type="number"
              step="any"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              required
              disabled={status === 'closed'}
            />
          </div>

          <div>
            <label htmlFor="stopLoss" className="block text-sm font-medium text-slate-700 mb-1">
              Stop Loss (SL) *
            </label>
            <input
              id="stopLoss"
              type="number"
              step="any"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              required
              disabled={status === 'closed'}
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

          <div className="md:col-span-2">
            <label htmlFor="strategy" className="block text-sm font-medium text-slate-700 mb-1">
              Trading Strategy
            </label>
            <select
              id="strategy"
              value={strategyId}
              onChange={(e) => setStrategyId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
            >
              <option value="" className="text-slate-800">No strategy selected</option>
              {strategies.filter(s => s.is_active).map(strategy => (
                <option key={strategy.id} value={strategy.id} className="text-slate-800">
                  {strategy.name} {strategy.category && `(${strategy.category})`}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-600">
              Optional: Select the trading strategy used for this trade
            </p>
          </div>
        </div>

        {/* P&L Calculator */}
        {status === 'closed' && (
          <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center mb-3">
              <FiDollarSign className="text-indigo-600 mr-2" />
              <h3 className="text-lg font-semibold text-slate-900">P&L Calculator</h3>
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
            )}
          </div>
        )}

        {/* Image Upload */}
        {user && (
          <div className="mt-6">
            <ImageUpload
              onImageUpload={setScreenshotUrl}
              currentImage={screenshotUrl}
              userId={user.id}
            />
          </div>
        )}

        <div className="mt-6">
          <label htmlFor="notes" className="block text-sm font-medium text-slate-700 mb-1">
            Notes
          </label>
          <div className="flex justify-between items-center mb-1">
            <button
              type="button"
              className={`text-xs px-2 py-1 rounded ${showPreview ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-700'}`}
              onClick={() => setShowPreview(false)}
            >
              Edit
            </button>
            <button
              type="button"
              className={`text-xs px-2 py-1 rounded ${showPreview ? 'bg-slate-100 text-slate-700' : 'bg-indigo-100 text-indigo-700'}`}
              onClick={() => setShowPreview(true)}
            >
              Preview
            </button>
          </div>
          {!showPreview ? (
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add your trade analysis, strategy, or observations..."
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-mono"
            />
          ) : (
            <div className="w-full px-3 py-2 border border-slate-300 rounded-md bg-slate-50 min-h-[60px] prose max-w-none text-slate-800">
              <ReactMarkdown>{notes || 'Nothing to preview.'}</ReactMarkdown>
            </div>
          )}
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

        <div className="flex justify-between">
          {editingTrade && (
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50"
            >
              <FiX className="mr-2" />
              Cancel Edit
            </button>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 border border-indigo-700 ml-auto"
          >
            <FiPlus className="mr-2" />
            {loading ? 'Adding...' : editingTrade ? 'Update Trade' : 'Add Trade'}
          </button>
        </div>
      </form>

      {/* Saved Trades List */}
      <SavedTradesList
        savedTrades={savedTrades}
        onEditTrade={handleEditTrade}
        onDeleteTrade={handleDeleteTrade}
        onRecordAllTrades={handleRecordAllTrades}
        onClearAllTrades={handleClearAllTrades}
        isRecording={isRecordingAll}
      />
    </AppLayout>
  );
}
