'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/lib/hooks';
import AppLayout from '@/components/AppLayout';
import MarketSelector from '@/components/MarketSelector';
import { FiDollarSign, FiTrendingUp, FiTrendingDown, FiInfo, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import {
  calculatePL,
  getMarketInfo,
  formatPL,
  formatPips,
  formatPercentage,
  validateTradeInputs,
  getSuggestedLotSizes,
  formatCurrency,
  type MarketInfo,
  type PLResult
} from '@/utils/plCalculator';

export default function ProfitLossCalculator() {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);

  // Form state
  const [selectedMarket, setSelectedMarket] = useState<MarketInfo | null>(null);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [accountBalance, setAccountBalance] = useState('');

  // Results state
  const [result, setResult] = useState<PLResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Set default balance from profile
  useEffect(() => {
    if (profile && profile.balance !== null && profile.balance !== undefined && accountBalance === '') {
      setAccountBalance(String(profile.balance));
    }
  }, [profile, accountBalance]);

  // Calculate P&L when inputs change
  useEffect(() => {
    if (selectedMarket && entryPrice && exitPrice && quantity) {
      const entryNum = parseFloat(entryPrice);
      const exitNum = parseFloat(exitPrice);
      const quantityNum = parseFloat(quantity);

      const validation = validateTradeInputs({
        market: selectedMarket,
        tradeType,
        entryPrice: entryNum,
        exitPrice: exitNum,
        quantity: quantityNum
      });

      if (validation) {
        setValidationError(validation);
        setResult(null);
      } else {
        setValidationError(null);
        const plResult = calculatePL({
          market: selectedMarket,
          tradeType,
          entryPrice: entryNum,
          exitPrice: exitNum,
          quantity: quantityNum
        });
        setResult(plResult);
      }
    } else {
      setResult(null);
      setValidationError(null);
    }
  }, [selectedMarket, tradeType, entryPrice, exitPrice, quantity]);

  const handleMarketSelect = (market: any) => {
    // Convert MarketSelector's Market interface to MarketInfo
    const marketInfo: MarketInfo = {
      symbol: market.symbol,
      category: market.category,
      pip: market.pip,
      contractSize: market.category === 'forex' ? 100000 :
                   market.category === 'commodities' ? 1000 :
                   market.category === 'indices' ? 1 :
                   market.category === 'crypto' ? 1 : 1,
      quoteCurrency: market.symbol.includes('/') ? market.symbol.split('/')[1] : 'USD'
    };
    setSelectedMarket(marketInfo);
  };

  const handleQuickLotSize = (size: number) => {
    setQuantity(size.toString());
  };

  const isProfit = result && result.profitLoss > 0;
  const isLoss = result && result.profitLoss < 0;

  return (
    <AppLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link
            href="/tools"
            className="flex items-center text-slate-600 hover:text-slate-800 mr-4"
          >
            <FiArrowLeft className="mr-2" />
            Back to Tools
          </Link>
          <div className="flex items-center">
            <FiDollarSign className="text-emerald-600 mr-3 text-2xl" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Profit & Loss Calculator</h1>
              <p className="text-slate-600">Calculate potential profit or loss before entering a trade</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calculator Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Trade Parameters</h2>

          {/* Market Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Trading Pair/Asset
            </label>
            <MarketSelector onMarketSelect={handleMarketSelect} />
            {selectedMarket && (
              <div className="mt-2 flex items-center">
                <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                  {selectedMarket.category}
                </span>
                <span className="ml-2 text-xs text-slate-600">
                  Pip: {selectedMarket.pip}
                </span>
              </div>
            )}
          </div>

          {/* Trade Type */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Trade Type
            </label>
            <div className="flex space-x-4">
              <button
                onClick={() => setTradeType('buy')}
                className={`flex items-center px-4 py-2 rounded-md border transition-colors ${
                  tradeType === 'buy'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <FiTrendingUp className="mr-2" />
                Buy/Long
              </button>
              <button
                onClick={() => setTradeType('sell')}
                className={`flex items-center px-4 py-2 rounded-md border transition-colors ${
                  tradeType === 'sell'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <FiTrendingDown className="mr-2" />
                Sell/Short
              </button>
            </div>
          </div>

          {/* Price Inputs */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Entry Price
              </label>
              <input
                type="number"
                step="any"
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900 placeholder-slate-500"
                placeholder="Enter entry price (e.g., 1.0850)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Exit Price
              </label>
              <input
                type="number"
                step="any"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900 placeholder-slate-500"
                placeholder="Enter exit price (e.g., 1.0900)"
              />
            </div>
          </div>

          {/* Position Size */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Position Size (Lots)
            </label>
            <input
              type="number"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900 placeholder-slate-500"
              placeholder="Enter position size (e.g., 1.00)"
            />

            {/* Quick Lot Size Buttons */}
            {selectedMarket && (
              <div className="mt-2">
                <p className="text-xs text-slate-600 mb-2">Quick sizes:</p>
                <div className="flex flex-wrap gap-2">
                  {getSuggestedLotSizes(selectedMarket.category).map((size) => (
                    <button
                      key={size}
                      onClick={() => handleQuickLotSize(size)}
                      className="px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition-colors"
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Validation Error */}
          {validationError && (
            <div className="p-3 bg-red-50 rounded-md border border-red-200 mb-4">
              <p className="text-red-800 text-sm font-medium">{validationError}</p>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Calculation Results</h2>

          {result ? (
            <div className="space-y-4">
              {/* Main P&L Result */}
              <div className={`p-4 rounded-lg border-2 ${
                isProfit
                  ? 'bg-emerald-50 border-emerald-200'
                  : isLoss
                    ? 'bg-red-50 border-red-200'
                    : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-700 mb-1">Profit/Loss</p>
                  <p className={`text-3xl font-bold ${
                    isProfit ? 'text-emerald-700' : isLoss ? 'text-red-700' : 'text-slate-700'
                  }`}>
                    {formatCurrency(result.profitLoss)}
                  </p>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium text-slate-700">Pip Movement</p>
                  <p className="text-lg font-semibold text-slate-900">{formatPips(result.pips)}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium text-slate-700">Return %</p>
                  <p className="text-lg font-semibold text-slate-900">{formatPercentage(result.percentage)}</p>
                </div>
              </div>

              {/* Breakdown */}
              <div className="border-t border-slate-200 pt-4">
                <h3 className="text-sm font-medium text-slate-700 mb-3">Calculation Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Price Movement:</span>
                    <span className="font-medium text-slate-900">{result.breakdown.priceMovement.toFixed(5)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Contract Value:</span>
                    <span className="font-medium text-slate-900">{formatCurrency(result.breakdown.contractValue)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Position Value:</span>
                    <span className="font-medium text-slate-900">{formatCurrency(result.breakdown.totalValue)}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FiInfo className="mx-auto text-4xl text-slate-400 mb-4" />
              <p className="text-slate-600">
                Enter trade parameters to see profit/loss calculation
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">Calculator Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div>
            <h4 className="font-medium mb-2">Understanding Results:</h4>
            <ul className="space-y-1">
              <li>• Positive values indicate profit</li>
              <li>• Negative values indicate loss</li>
              <li>• Pip movement shows price change in pips</li>
              <li>• Return % shows percentage gain/loss</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Best Practices:</h4>
            <ul className="space-y-1">
              <li>• Always calculate before entering trades</li>
              <li>• Consider risk-to-reward ratios</li>
              <li>• Use appropriate position sizes</li>
              <li>• Factor in spread and commissions</li>
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
