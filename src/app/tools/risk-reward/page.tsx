'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/lib/hooks';
import AppLayout from '@/components/AppLayout';
import MarketSelector from '@/components/MarketSelector';
import { FiTarget, FiTrendingUp, FiTrendingDown, FiInfo, FiArrowLeft, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import Link from 'next/link';
import {
  calculateRiskReward,
  formatCurrency,
  formatRatio,
  type MarketInfo,
  type RiskRewardResult
} from '@/utils/plCalculator';

export default function RiskRewardCalculator() {
  const { user } = useAuth();
  const { profile } = useProfile(user?.id);

  // Form state
  const [selectedMarket, setSelectedMarket] = useState<MarketInfo | null>(null);
  const [entryPrice, setEntryPrice] = useState('');
  const [stopLossPrice, setStopLossPrice] = useState('');
  const [takeProfitPrice, setTakeProfitPrice] = useState('');
  const [positionSize, setPositionSize] = useState('1');
  const [accountBalance, setAccountBalance] = useState('');

  // Results state
  const [result, setResult] = useState<RiskRewardResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Set default balance from profile
  useEffect(() => {
    if (profile && profile.balance !== null && profile.balance !== undefined && accountBalance === '') {
      setAccountBalance(String(profile.balance));
    }
  }, [profile, accountBalance]);

  // Calculate risk/reward when inputs change
  useEffect(() => {
    if (selectedMarket && entryPrice && stopLossPrice && takeProfitPrice && positionSize) {
      const entryNum = parseFloat(entryPrice);
      const stopNum = parseFloat(stopLossPrice);
      const tpNum = parseFloat(takeProfitPrice);
      const sizeNum = parseFloat(positionSize);

      // Validation
      if (entryNum <= 0 || stopNum <= 0 || tpNum <= 0) {
        setValidationError('All prices must be greater than 0');
        setResult(null);
        return;
      }
      if (sizeNum <= 0) {
        setValidationError('Position size must be greater than 0');
        setResult(null);
        return;
      }
      if (entryNum === stopNum || entryNum === tpNum) {
        setValidationError('Entry price cannot equal stop loss or take profit');
        setResult(null);
        return;
      }

      // Check if stop loss and take profit are on correct sides
      const isLong = tpNum > entryNum;
      const isValidStopLoss = isLong ? stopNum < entryNum : stopNum > entryNum;
      const isValidTakeProfit = isLong ? tpNum > entryNum : tpNum < entryNum;

      if (!isValidStopLoss) {
        setValidationError(
          isLong
            ? 'For long trades, stop loss must be below entry price'
            : 'For short trades, stop loss must be above entry price'
        );
        setResult(null);
        return;
      }

      if (!isValidTakeProfit) {
        setValidationError(
          isLong
            ? 'For long trades, take profit must be above entry price'
            : 'For short trades, take profit must be below entry price'
        );
        setResult(null);
        return;
      }

      setValidationError(null);

      try {
        const rrResult = calculateRiskReward({
          entryPrice: entryNum,
          stopLossPrice: stopNum,
          takeProfitPrice: tpNum,
          positionSize: sizeNum,
          market: selectedMarket
        });
        setResult(rrResult);
      } catch (error) {
        setValidationError('Error calculating risk/reward ratio');
        setResult(null);
      }
    } else {
      setResult(null);
      setValidationError(null);
    }
  }, [selectedMarket, entryPrice, stopLossPrice, takeProfitPrice, positionSize]);

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

  const isGoodRatio = result && result.riskRewardRatio >= 2;
  const isAcceptableRatio = result && result.riskRewardRatio >= 1.5 && result.riskRewardRatio < 2;
  const isPoorRatio = result && result.riskRewardRatio < 1.5;

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
            <FiTarget className="text-violet-600 mr-3 text-2xl" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Risk/Reward Calculator</h1>
              <p className="text-slate-600">Analyze risk-to-reward ratio for better trading decisions</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calculator Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Trade Setup</h2>

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

          {/* Price Inputs */}
          <div className="space-y-4 mb-6">
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
                placeholder="Enter entry price (e.g., 1.10000)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Stop Loss Price
              </label>
              <input
                type="number"
                step="any"
                value={stopLossPrice}
                onChange={(e) => setStopLossPrice(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900 placeholder-slate-500"
                placeholder="Enter stop loss price (e.g., 1.09500)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Take Profit Price
              </label>
              <input
                type="number"
                step="any"
                value={takeProfitPrice}
                onChange={(e) => setTakeProfitPrice(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900 placeholder-slate-500"
                placeholder="Enter take profit price (e.g., 1.11000)"
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
              value={positionSize}
              onChange={(e) => setPositionSize(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900 placeholder-slate-500"
              placeholder="Enter position size (e.g., 1.00)"
            />
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
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Risk/Reward Analysis</h2>

          {result ? (
            <div className="space-y-4">
              {/* Main R:R Ratio */}
              <div className={`p-4 rounded-lg border-2 ${
                isGoodRatio
                  ? 'bg-emerald-50 border-emerald-200'
                  : isAcceptableRatio
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-red-50 border-red-200'
              }`}>
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-700 mb-1">Risk/Reward Ratio</p>
                  <p className={`text-3xl font-bold ${
                    isGoodRatio ? 'text-emerald-700' : isAcceptableRatio ? 'text-amber-700' : 'text-red-700'
                  }`}>
                    {formatRatio(result.riskRewardRatio)}
                  </p>
                  <div className="flex items-center justify-center mt-2">
                    {isGoodRatio ? (
                      <div className="flex items-center text-emerald-700">
                        <FiCheckCircle className="mr-1" />
                        <span className="text-sm font-medium">Excellent</span>
                      </div>
                    ) : isAcceptableRatio ? (
                      <div className="flex items-center text-amber-700">
                        <FiCheckCircle className="mr-1" />
                        <span className="text-sm font-medium">Acceptable</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-red-700">
                        <FiXCircle className="mr-1" />
                        <span className="text-sm font-medium">Poor</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Risk and Reward Amounts */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm font-medium text-red-700">Risk Amount</p>
                  <p className="text-lg font-semibold text-red-800">{formatCurrency(result.riskAmount)}</p>
                  <p className="text-xs text-red-600">{result.riskPips.toFixed(1)} pips</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="text-sm font-medium text-emerald-700">Reward Amount</p>
                  <p className="text-lg font-semibold text-emerald-800">{formatCurrency(result.rewardAmount)}</p>
                  <p className="text-xs text-emerald-600">{result.rewardPips.toFixed(1)} pips</p>
                </div>
              </div>

              {/* Break-even Analysis */}
              <div className="border-t border-slate-200 pt-4">
                <h3 className="text-sm font-medium text-slate-700 mb-3">Break-even Analysis</h3>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Required Win Rate:</span>
                    <span className="text-lg font-semibold text-slate-900">
                      {result.breakEvenWinRate.toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    You need to win at least {result.breakEvenWinRate.toFixed(1)}% of trades to break even
                  </p>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="border-t border-slate-200 pt-4">
                <h3 className="text-sm font-medium text-slate-700 mb-3">Trade Breakdown</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Entry Price:</span>
                    <span className="font-medium text-slate-900">{parseFloat(entryPrice).toFixed(5)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Stop Loss:</span>
                    <span className="font-medium text-slate-900">{parseFloat(stopLossPrice).toFixed(5)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Take Profit:</span>
                    <span className="font-medium text-slate-900">{parseFloat(takeProfitPrice).toFixed(5)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Position Size:</span>
                    <span className="font-medium text-slate-900">{positionSize} lots</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FiInfo className="mx-auto text-4xl text-slate-400 mb-4" />
              <p className="text-slate-600">
                Enter trade setup to analyze risk/reward ratio
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-8 bg-violet-50 p-6 rounded-lg border border-violet-200">
        <h3 className="text-lg font-semibold text-violet-900 mb-3">Risk/Reward Guidelines</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-violet-800">
          <div>
            <h4 className="font-medium mb-2">Excellent (2:1+):</h4>
            <ul className="space-y-1">
              <li>• High probability of long-term profit</li>
              <li>• Can afford lower win rates</li>
              <li>• Ideal for most trading strategies</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Acceptable (1.5:1 - 2:1):</h4>
            <ul className="space-y-1">
              <li>• Decent risk management</li>
              <li>• Requires higher win rates</li>
              <li>• Suitable for experienced traders</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Poor (Below 1.5:1):</h4>
            <ul className="space-y-1">
              <li>• High risk of losses</li>
              <li>• Requires very high win rates</li>
              <li>• Generally not recommended</li>
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
