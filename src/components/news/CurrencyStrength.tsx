'use client';

import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiTrendingDown, FiMinus, FiRefreshCw } from 'react-icons/fi';

interface CurrencyData {
  currency: string;
  strength: number;
  change24h: number;
  trend: 'up' | 'down' | 'neutral';
  pairs: {
    pair: string;
    change: number;
    price: number;
  }[];
}

interface CurrencyStrengthProps {
  className?: string;
}

export default function CurrencyStrength({ className = '' }: CurrencyStrengthProps) {
  const [currencies, setCurrencies] = useState<CurrencyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Mock currency strength data (in production, this would come from a real API)
  const getMockCurrencyData = (): CurrencyData[] => {
    return [
      {
        currency: 'USD',
        strength: 85.2,
        change24h: 1.3,
        trend: 'up',
        pairs: [
          { pair: 'EUR/USD', change: -0.45, price: 1.0892 },
          { pair: 'GBP/USD', change: -0.32, price: 1.2654 },
          { pair: 'USD/JPY', change: 0.78, price: 149.85 },
          { pair: 'USD/CHF', change: 0.23, price: 0.8945 },
        ]
      },
      {
        currency: 'EUR',
        strength: 72.8,
        change24h: -0.8,
        trend: 'down',
        pairs: [
          { pair: 'EUR/USD', change: -0.45, price: 1.0892 },
          { pair: 'EUR/GBP', change: 0.12, price: 0.8612 },
          { pair: 'EUR/JPY', change: 0.34, price: 163.25 },
          { pair: 'EUR/CHF', change: -0.18, price: 0.9745 },
        ]
      },
      {
        currency: 'GBP',
        strength: 68.5,
        change24h: -1.2,
        trend: 'down',
        pairs: [
          { pair: 'GBP/USD', change: -0.32, price: 1.2654 },
          { pair: 'EUR/GBP', change: 0.12, price: 0.8612 },
          { pair: 'GBP/JPY', change: 0.45, price: 189.65 },
          { pair: 'GBP/CHF', change: -0.09, price: 1.1325 },
        ]
      },
      {
        currency: 'JPY',
        strength: 45.3,
        change24h: -2.1,
        trend: 'down',
        pairs: [
          { pair: 'USD/JPY', change: 0.78, price: 149.85 },
          { pair: 'EUR/JPY', change: 0.34, price: 163.25 },
          { pair: 'GBP/JPY', change: 0.45, price: 189.65 },
          { pair: 'CHF/JPY', change: 0.55, price: 167.52 },
        ]
      },
      {
        currency: 'CHF',
        strength: 78.9,
        change24h: 0.6,
        trend: 'up',
        pairs: [
          { pair: 'USD/CHF', change: 0.23, price: 0.8945 },
          { pair: 'EUR/CHF', change: -0.18, price: 0.9745 },
          { pair: 'GBP/CHF', change: -0.09, price: 1.1325 },
          { pair: 'CHF/JPY', change: 0.55, price: 167.52 },
        ]
      },
      {
        currency: 'CAD',
        strength: 62.1,
        change24h: -0.4,
        trend: 'down',
        pairs: [
          { pair: 'USD/CAD', change: 0.18, price: 1.3625 },
          { pair: 'EUR/CAD', change: -0.27, price: 1.4845 },
          { pair: 'GBP/CAD', change: -0.14, price: 1.7245 },
          { pair: 'CAD/JPY', change: 0.60, price: 110.05 },
        ]
      },
      {
        currency: 'AUD',
        strength: 58.7,
        change24h: -0.9,
        trend: 'down',
        pairs: [
          { pair: 'AUD/USD', change: -0.65, price: 0.6542 },
          { pair: 'EUR/AUD', change: 0.20, price: 1.6652 },
          { pair: 'GBP/AUD', change: 0.33, price: 1.9345 },
          { pair: 'AUD/JPY', change: 0.13, price: 98.05 },
        ]
      },
      {
        currency: 'NZD',
        strength: 55.2,
        change24h: -1.5,
        trend: 'down',
        pairs: [
          { pair: 'NZD/USD', change: -0.78, price: 0.6012 },
          { pair: 'EUR/NZD', change: 0.33, price: 1.8125 },
          { pair: 'GBP/NZD', change: 0.46, price: 2.1055 },
          { pair: 'NZD/JPY', change: 0.00, price: 90.08 },
        ]
      }
    ];
  };

  useEffect(() => {
    const fetchCurrencyData = () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setCurrencies(getMockCurrencyData());
        setLastUpdate(new Date());
        setLoading(false);
      }, 1000);
    };

    fetchCurrencyData();
    
    // Update every 30 seconds
    const interval = setInterval(fetchCurrencyData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const getStrengthColor = (strength: number) => {
    if (strength >= 80) return 'text-green-600 bg-green-50';
    if (strength >= 70) return 'text-green-500 bg-green-50';
    if (strength >= 60) return 'text-yellow-600 bg-yellow-50';
    if (strength >= 50) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    if (change < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <FiTrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <FiTrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <FiMinus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStrengthBar = (strength: number) => {
    return (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            strength >= 80 ? 'bg-green-500' :
            strength >= 70 ? 'bg-green-400' :
            strength >= 60 ? 'bg-yellow-500' :
            strength >= 50 ? 'bg-orange-500' :
            'bg-red-500'
          }`}
          style={{ width: `${strength}%` }}
        />
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-slate-200 p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Currency Strength</h3>
          <FiRefreshCw className="w-4 h-4 text-slate-400 animate-spin" />
        </div>
        <div className="space-y-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-2 bg-slate-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-slate-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-slate-900">Currency Strength</h3>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span>Updated: {lastUpdate.toLocaleTimeString()}</span>
          <FiRefreshCw className="w-3 h-3" />
        </div>
      </div>

      <div className="space-y-4">
        {currencies
          .sort((a, b) => b.strength - a.strength)
          .map((currency) => (
          <div key={currency.currency} className="border border-slate-100 rounded-lg p-4 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 bg-slate-100 rounded flex items-center justify-center text-sm font-bold text-slate-700">
                  {currency.currency}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-sm font-medium ${getStrengthColor(currency.strength)}`}>
                      {currency.strength.toFixed(1)}
                    </span>
                    {getTrendIcon(currency.trend)}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-medium ${getChangeColor(currency.change24h)}`}>
                  {currency.change24h > 0 ? '+' : ''}{currency.change24h.toFixed(1)}%
                </div>
                <div className="text-xs text-slate-500">24h change</div>
              </div>
            </div>

            <div className="mb-3">
              {getStrengthBar(currency.strength)}
            </div>

            <div className="grid grid-cols-2 gap-2">
              {currency.pairs.slice(0, 4).map((pair) => (
                <div key={pair.pair} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">{pair.pair}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-700 font-medium">{pair.price.toFixed(4)}</span>
                    <span className={`${getChangeColor(pair.change)}`}>
                      ({pair.change > 0 ? '+' : ''}{pair.change.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
        <p>Currency strength is calculated based on the performance of major currency pairs over the last 24 hours.</p>
      </div>
    </div>
  );
}
