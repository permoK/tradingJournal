'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import MarketSelector from '@/components/MarketSelector';
import { FiTrendingUp, FiInfo, FiArrowLeft, FiDollarSign } from 'react-icons/fi';
import Link from 'next/link';
import { 
  calculatePipValue,
  formatCurrency,
  getSuggestedLotSizes,
  type MarketInfo,
  type PipValueResult 
} from '@/utils/plCalculator';

export default function PipValueCalculator() {
  const { user } = useAuth();
  
  // Form state
  const [selectedMarket, setSelectedMarket] = useState<MarketInfo | null>(null);
  const [positionSize, setPositionSize] = useState('1');
  
  // Results state
  const [result, setResult] = useState<PipValueResult | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Calculate pip value when inputs change
  useEffect(() => {
    if (selectedMarket && positionSize) {
      const sizeNum = parseFloat(positionSize);

      // Validation
      if (sizeNum <= 0) {
        setValidationError('Position size must be greater than 0');
        setResult(null);
        return;
      }

      setValidationError(null);
      
      try {
        const pipResult = calculatePipValue({
          market: selectedMarket,
          positionSize: sizeNum
        });
        setResult(pipResult);
      } catch (error) {
        setValidationError('Error calculating pip value');
        setResult(null);
      }
    } else {
      setResult(null);
      setValidationError(null);
    }
  }, [selectedMarket, positionSize]);

  const handleMarketSelect = (market: MarketInfo) => {
    setSelectedMarket(market);
  };

  const handleQuickLotSize = (size: number) => {
    setPositionSize(size.toString());
  };

  // Calculate pip values for different lot sizes for comparison
  const getComparisonData = () => {
    if (!selectedMarket) return [];
    
    const sizes = getSuggestedLotSizes(selectedMarket.category);
    return sizes.map(size => {
      const pipResult = calculatePipValue({
        market: selectedMarket,
        positionSize: size
      });
      return {
        size,
        pipValue: pipResult.pipValue
      };
    });
  };

  const comparisonData = getComparisonData();

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
            <FiTrendingUp className="text-amber-600 mr-3 text-2xl" />
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Pip Value Calculator</h1>
              <p className="text-slate-600">Calculate the monetary value of each pip movement</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Calculator Form */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Pip Value Parameters</h2>
          
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
                {selectedMarket.quoteCurrency && (
                  <span className="ml-2 text-xs text-slate-600">
                    Quote: {selectedMarket.quoteCurrency}
                  </span>
                )}
              </div>
            )}
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
              className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="1.00"
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
                      className={`px-2 py-1 text-xs rounded transition-colors ${
                        parseFloat(positionSize) === size
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
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

          {/* Market Information */}
          {selectedMarket && (
            <div className="border-t border-slate-200 pt-4">
              <h3 className="text-sm font-medium text-slate-700 mb-3">Market Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Symbol:</span>
                  <span className="font-medium">{selectedMarket.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Category:</span>
                  <span className="font-medium capitalize">{selectedMarket.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Pip Size:</span>
                  <span className="font-medium">{selectedMarket.pip}</span>
                </div>
                {selectedMarket.contractSize && (
                  <div className="flex justify-between">
                    <span className="text-slate-600">Contract Size:</span>
                    <span className="font-medium">{selectedMarket.contractSize.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Results Panel */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Pip Value Results</h2>
          
          {result ? (
            <div className="space-y-4">
              {/* Main Pip Value Result */}
              <div className="p-4 rounded-lg border-2 bg-amber-50 border-amber-200">
                <div className="text-center">
                  <p className="text-sm font-medium text-slate-700 mb-1">Pip Value</p>
                  <p className="text-3xl font-bold text-amber-700">
                    {formatCurrency(result.pipValue)}
                  </p>
                  <p className="text-sm text-amber-600 mt-1">per pip movement</p>
                </div>
              </div>

              {/* Additional Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium text-slate-700">Position Size</p>
                  <p className="text-lg font-semibold text-slate-900">{positionSize} lots</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium text-slate-700">Tick Size</p>
                  <p className="text-lg font-semibold text-slate-900">{result.tickSize}</p>
                </div>
              </div>

              {/* Calculation Details */}
              <div className="border-t border-slate-200 pt-4">
                <h3 className="text-sm font-medium text-slate-700 mb-3">Calculation Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Contract Size:</span>
                    <span className="font-medium">{result.contractSize.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Pip Value (USD):</span>
                    <span className="font-medium">{formatCurrency(result.pipValueInAccountCurrency)}</span>
                  </div>
                </div>
              </div>

              {/* Example Scenarios */}
              <div className="border-t border-slate-200 pt-4">
                <h3 className="text-sm font-medium text-slate-700 mb-3">Example Scenarios</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">10 pip move:</span>
                    <span className="font-medium text-emerald-700">
                      +{formatCurrency(result.pipValue * 10)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">25 pip move:</span>
                    <span className="font-medium text-emerald-700">
                      +{formatCurrency(result.pipValue * 25)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">50 pip move:</span>
                    <span className="font-medium text-emerald-700">
                      +{formatCurrency(result.pipValue * 50)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">100 pip move:</span>
                    <span className="font-medium text-emerald-700">
                      +{formatCurrency(result.pipValue * 100)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <FiInfo className="mx-auto text-4xl text-slate-400 mb-4" />
              <p className="text-slate-600">
                Select a trading pair and position size to calculate pip value
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Comparison Table */}
      {comparisonData.length > 0 && (
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Pip Value Comparison for {selectedMarket?.symbol}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 font-medium text-slate-700">Position Size</th>
                  <th className="text-right py-2 font-medium text-slate-700">Pip Value</th>
                  <th className="text-right py-2 font-medium text-slate-700">10 Pips</th>
                  <th className="text-right py-2 font-medium text-slate-700">50 Pips</th>
                  <th className="text-right py-2 font-medium text-slate-700">100 Pips</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map((item, index) => (
                  <tr key={index} className="border-b border-slate-100">
                    <td className="py-2 font-medium">{item.size} lots</td>
                    <td className="py-2 text-right">{formatCurrency(item.pipValue)}</td>
                    <td className="py-2 text-right text-emerald-700">
                      {formatCurrency(item.pipValue * 10)}
                    </td>
                    <td className="py-2 text-right text-emerald-700">
                      {formatCurrency(item.pipValue * 50)}
                    </td>
                    <td className="py-2 text-right text-emerald-700">
                      {formatCurrency(item.pipValue * 100)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="mt-8 bg-amber-50 p-6 rounded-lg border border-amber-200">
        <h3 className="text-lg font-semibold text-amber-900 mb-3">Pip Value Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-amber-800">
          <div>
            <h4 className="font-medium mb-2">Understanding Pip Values:</h4>
            <ul className="space-y-1">
              <li>• Pip value varies by currency pair and position size</li>
              <li>• Larger positions = higher pip values</li>
              <li>• JPY pairs typically have different pip calculations</li>
              <li>• Use pip values to calculate exact risk amounts</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Practical Applications:</h4>
            <ul className="space-y-1">
              <li>• Calculate exact stop loss amounts</li>
              <li>• Determine position sizes for specific risk levels</li>
              <li>• Compare profitability across different pairs</li>
              <li>• Set realistic profit targets</li>
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
