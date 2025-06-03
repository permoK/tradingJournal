'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import MarketSelector from '@/components/MarketSelector';
import { FiPieChart, FiShield, FiInfo, FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';
import Link from 'next/link';
import {
  calculatePositionSize,
  getMarketInfo,
  formatCurrency,
  type MarketInfo,
  type PositionSizeResult
} from '@/utils/plCalculator';

export default function PositionSizeCalculator() {
  const { user } = useAuth();

  // Form state
  const [selectedMarket, setSelectedMarket] = useState<MarketInfo | null>(null);
  const [accountBalance, setAccountBalance] = useState('');
  const [riskPercentage, setRiskPercentage] = useState('2');
  const [entryPrice, setEntryPrice] = useState('');
  const [stopLossPrice, setStopLossPrice] = useState('');

  // Results state
  const [result, setResult] = useState<PositionSizeResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Calculate position size when inputs change
  useEffect(() => {
    if (selectedMarket && accountBalance && riskPercentage && entryPrice && stopLossPrice) {
      const balanceNum = parseFloat(accountBalance);
      const riskNum = parseFloat(riskPercentage);
      const entryNum = parseFloat(entryPrice);
      const stopNum = parseFloat(stopLossPrice);

      // Validation
      if (balanceNum <= 0) {
        setValidationError('Account balance must be greater than 0');
        setResult(null);
        return;
      }
      if (riskNum <= 0 || riskNum > 100) {
        setValidationError('Risk percentage must be between 0 and 100');
        setResult(null);
        return;
      }
      if (entryNum <= 0 || stopNum <= 0) {
        setValidationError('Entry and stop loss prices must be greater than 0');
        setResult(null);
        return;
      }
      if (entryNum === stopNum) {
        setValidationError('Entry and stop loss prices cannot be the same');
        setResult(null);
        return;
      }

      setValidationError(null);

      try {
        const positionResult = calculatePositionSize({
          accountBalance: balanceNum,
          riskPercentage: riskNum,
          entryPrice: entryNum,
          stopLossPrice: stopNum,
          market: selectedMarket
        });
        setResult(positionResult);
      } catch (error) {
        setValidationError('Error calculating position size');
        setResult(null);
      }
    } else {
      setResult(null);
      setValidationError(null);
    }
  }, [selectedMarket, accountBalance, riskPercentage, entryPrice, stopLossPrice]);

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

  const handleRiskPreset = (risk: number) => {
    setRiskPercentage(risk.toString());
  };

  const isHighRisk = parseFloat(riskPercentage) > 5;

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
            <FiPieChart className="text-blue-600 mr-3 text-2xl" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Position Size Calculator</h1>
              <p className="text-slate-600">Determine optimal position size based on risk tolerance</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calculator Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Risk Parameters</h2>

          {/* Account Balance */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Account Balance (USD)
            </label>
            <input
              type="number"
              step="any"
              value={accountBalance}
              onChange={(e) => setAccountBalance(e.target.value)}
              className="w-full px-4 py-3 border-2 border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-slate-900 placeholder-slate-500"
              placeholder="Enter account balance (e.g., 10000)"
            />
          </div>

          {/* Risk Percentage */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Risk Percentage per Trade
              {isHighRisk && (
                <span className="ml-2 text-red-600 text-xs">
                  <FiAlertTriangle className="inline mr-1" />
                  High Risk
                </span>
              )}
            </label>
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="100"
              value={riskPercentage}
              onChange={(e) => setRiskPercentage(e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-md focus:outline-none focus:ring-2 focus:border-transparent bg-white text-slate-900 placeholder-slate-500 ${
                isHighRisk
                  ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
                  : 'border-slate-300 focus:ring-indigo-500 focus:border-indigo-500'
              }`}
              placeholder="Enter risk percentage (e.g., 2)"
            />

            {/* Risk Presets */}
            <div className="mt-2">
              <p className="text-xs text-slate-600 mb-2">Common risk levels:</p>
              <div className="flex flex-wrap gap-2">
                {[0.5, 1, 2, 3, 5].map((risk) => (
                  <button
                    key={risk}
                    onClick={() => handleRiskPreset(risk)}
                    className={`px-2 py-1 text-xs rounded transition-colors ${
                      parseFloat(riskPercentage) === risk
                        ? 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {risk}%
                  </button>
                ))}
              </div>
            </div>
          </div>

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
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Position Size Results</h2>

          {result ? (
            <div className="space-y-4">
              {/* Main Position Size Result */}
              <div className="p-4 rounded-lg border-2 bg-blue-50 border-blue-200">
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-700 mb-1">Recommended Position Size</p>
                  <p className="text-3xl font-bold text-blue-700">
                    {result.positionSize.toFixed(2)} lots
                  </p>
                </div>
              </div>

              {/* Risk Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium text-slate-700">Risk Amount</p>
                  <p className="text-lg font-semibold text-slate-900">{formatCurrency(result.riskAmount)}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium text-slate-700">Risk in Pips</p>
                  <p className="text-lg font-semibold text-slate-900">{result.pipRisk.toFixed(1)} pips</p>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="border-t border-slate-200 pt-4">
                <h3 className="text-sm font-medium text-slate-700 mb-3">Additional Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Contract Value:</span>
                    <span className="font-medium text-slate-900">{formatCurrency(result.contractValue)}</span>
                  </div>
                  {result.marginRequired && (
                    <div className="flex justify-between">
                      <span className="text-slate-600">Estimated Margin:</span>
                      <span className="font-medium text-slate-900">{formatCurrency(result.marginRequired)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-600">Risk Percentage:</span>
                    <span className="font-medium text-slate-900">{riskPercentage}%</span>
                  </div>
                </div>
              </div>

              {/* Risk Warning */}
              {isHighRisk && (
                <div className="p-3 bg-red-50 rounded-md border border-red-200">
                  <div className="flex items-center">
                    <FiAlertTriangle className="text-red-600 mr-2" />
                    <p className="text-red-800 text-sm font-medium">
                      High Risk Warning: Risking more than 5% per trade is considered very risky
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <FiInfo className="mx-auto text-4xl text-slate-400 mb-4" />
              <p className="text-slate-600">
                Enter risk parameters to calculate optimal position size
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="mt-8 bg-green-50 p-6 rounded-lg border border-green-200">
        <h3 className="text-lg font-semibold text-green-900 mb-3">Position Sizing Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-800">
          <div>
            <h4 className="font-medium mb-2">Risk Management Rules:</h4>
            <ul className="space-y-1">
              <li>• Never risk more than 1-2% per trade</li>
              <li>• Use consistent position sizing</li>
              <li>• Always set stop losses before entering</li>
              <li>• Consider correlation between trades</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Position Size Factors:</h4>
            <ul className="space-y-1">
              <li>• Account balance and risk tolerance</li>
              <li>• Distance to stop loss</li>
              <li>• Market volatility</li>
              <li>• Available margin</li>
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
