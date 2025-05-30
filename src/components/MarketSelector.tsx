'use client';

import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiTrendingUp, FiDollarSign, FiGlobe } from 'react-icons/fi';

interface Market {
  symbol: string;
  name: string;
  category: 'forex' | 'commodities' | 'indices' | 'crypto';
  pip: number;
  spread?: number;
}

interface MarketSelectorProps {
  value?: string;
  onChange?: (market: Market) => void;
  onMarketSelect?: (market: Market) => void;
  recentMarkets?: string[];
}

const MARKETS: Market[] = [
  // Forex Major Pairs
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', category: 'forex', pip: 0.0001 },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', category: 'forex', pip: 0.0001 },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', category: 'forex', pip: 0.01 },
  { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', category: 'forex', pip: 0.0001 },
  { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', category: 'forex', pip: 0.0001 },
  { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', category: 'forex', pip: 0.0001 },
  { symbol: 'NZD/USD', name: 'New Zealand Dollar / US Dollar', category: 'forex', pip: 0.0001 },

  // Forex Minor Pairs
  { symbol: 'EUR/GBP', name: 'Euro / British Pound', category: 'forex', pip: 0.0001 },
  { symbol: 'EUR/JPY', name: 'Euro / Japanese Yen', category: 'forex', pip: 0.01 },
  { symbol: 'GBP/JPY', name: 'British Pound / Japanese Yen', category: 'forex', pip: 0.01 },

  // Commodities
  { symbol: 'GOLD', name: 'Gold Spot', category: 'commodities', pip: 0.01 },
  { symbol: 'SILVER', name: 'Silver Spot', category: 'commodities', pip: 0.001 },
  { symbol: 'OIL', name: 'Crude Oil', category: 'commodities', pip: 0.01 },
  { symbol: 'NATGAS', name: 'Natural Gas', category: 'commodities', pip: 0.001 },

  // Indices
  { symbol: 'SPX500', name: 'S&P 500', category: 'indices', pip: 0.1 },
  { symbol: 'NAS100', name: 'NASDAQ 100', category: 'indices', pip: 0.1 },
  { symbol: 'US30', name: 'Dow Jones 30', category: 'indices', pip: 1 },
  { symbol: 'GER40', name: 'Germany 40', category: 'indices', pip: 0.1 },
  { symbol: 'UK100', name: 'UK 100', category: 'indices', pip: 0.1 },

  // Crypto
  { symbol: 'BTC/USD', name: 'Bitcoin / US Dollar', category: 'crypto', pip: 1 },
  { symbol: 'ETH/USD', name: 'Ethereum / US Dollar', category: 'crypto', pip: 0.01 },
  { symbol: 'LTC/USD', name: 'Litecoin / US Dollar', category: 'crypto', pip: 0.01 },
];

const MarketSelector: React.FC<MarketSelectorProps> = ({ value, onChange, onMarketSelect, recentMarkets = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const selectorRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter markets based on search and category
  const filteredMarkets = MARKETS.filter(market => {
    const matchesSearch = market.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         market.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || market.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get recent markets
  const recentMarketObjects = recentMarkets
    .map(symbol => MARKETS.find(m => m.symbol === symbol))
    .filter(Boolean) as Market[];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'forex':
        return <FiGlobe className="w-4 h-4 text-blue-600" />;
      case 'commodities':
        return <FiTrendingUp className="w-4 h-4 text-amber-600" />;
      case 'indices':
        return <FiDollarSign className="w-4 h-4 text-emerald-600" />;
      case 'crypto':
        return <FiTrendingUp className="w-4 h-4 text-purple-600" />;
      default:
        return <FiSearch className="w-4 h-4 text-slate-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'forex':
        return 'bg-blue-100 text-blue-800';
      case 'commodities':
        return 'bg-amber-100 text-amber-800';
      case 'indices':
        return 'bg-emerald-100 text-emerald-800';
      case 'crypto':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const handleMarketSelect = (market: Market) => {
    setSelectedMarket(market);

    // Call the appropriate callback
    if (onChange) {
      onChange(market);
    }
    if (onMarketSelect) {
      onMarketSelect(market);
    }

    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={selectorRef} className="relative">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 bg-white cursor-pointer flex items-center justify-between hover:border-slate-400 transition-colors"
      >
        <span className={(value || selectedMarket) ? 'text-slate-900 font-medium' : 'text-slate-500'}>
          {value || selectedMarket?.symbol || 'Click to select a trading pair...'}
        </span>
        <FiSearch className="w-4 h-4 text-slate-400" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-50 max-h-96 overflow-hidden">
          {/* Search and Category Filter */}
          <div className="p-3 border-b border-slate-200">
            <div className="relative mb-3">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Type to search markets (e.g., EUR/USD, Gold, Bitcoin)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-3 py-3 border-2 border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm bg-white text-slate-900 placeholder-slate-500"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCategory('all');
                }}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCategory('forex');
                }}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                  selectedCategory === 'forex'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Forex
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCategory('commodities');
                }}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                  selectedCategory === 'commodities'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Commodities
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCategory('indices');
                }}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                  selectedCategory === 'indices'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Indices
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCategory('crypto');
                }}
                className={`px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                  selectedCategory === 'crypto'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Crypto
              </button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {/* Recent Markets */}
            {recentMarketObjects.length > 0 && searchTerm === '' && selectedCategory === 'all' && (
              <div className="p-3 border-b border-slate-100">
                <h4 className="text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">Recent</h4>
                {recentMarketObjects.map(market => (
                  <button
                    key={`recent-${market.symbol}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarketSelect(market);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-indigo-50 hover:border-indigo-200 rounded-md transition-colors flex items-center justify-between cursor-pointer border border-transparent"
                  >
                    <div className="flex items-center space-x-3">
                      {getCategoryIcon(market.category)}
                      <div>
                        <div className="font-semibold text-slate-900">{market.symbol}</div>
                        <div className="text-xs text-slate-600">{market.name}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getCategoryColor(market.category)}`}>
                      {market.category}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* All Markets */}
            <div className="p-3">
              {filteredMarkets.length > 0 ? (
                filteredMarkets.map(market => (
                  <button
                    key={market.symbol}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarketSelect(market);
                    }}
                    className="w-full text-left px-4 py-3 hover:bg-indigo-50 hover:border-indigo-200 rounded-md transition-colors flex items-center justify-between cursor-pointer border border-transparent"
                  >
                    <div className="flex items-center space-x-3">
                      {getCategoryIcon(market.category)}
                      <div>
                        <div className="font-semibold text-slate-900">{market.symbol}</div>
                        <div className="text-xs text-slate-600">{market.name}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${getCategoryColor(market.category)}`}>
                      {market.category}
                    </span>
                  </button>
                ))
              ) : (
                <div className="text-center py-4 text-slate-500">
                  No markets found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketSelector;
