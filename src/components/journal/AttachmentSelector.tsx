'use client';

import { useState, useEffect } from 'react';
import { FiX, FiSearch, FiTrendingUp, FiTarget } from 'react-icons/fi';
import { Database } from '@/types/database.types';
import { useTrades } from '@/lib/hooks';
import { useStrategies } from '@/lib/hooks';
import { useAuth } from '@/contexts/AuthContext';

type Trade = Database['public']['Tables']['trades']['Row'];
type Strategy = Database['public']['Tables']['strategies']['Row'];

interface AttachmentSelectorProps {
  selectedTradeIds: string[];
  selectedStrategyIds: string[];
  onTradeIdsChange: (tradeIds: string[]) => void;
  onStrategyIdsChange: (strategyIds: string[]) => void;
}

export default function AttachmentSelector({
  selectedTradeIds,
  selectedStrategyIds,
  onTradeIdsChange,
  onStrategyIdsChange,
}: AttachmentSelectorProps) {
  const { user } = useAuth();
  const { trades, loading: tradesLoading } = useTrades(user?.id);
  const { strategies, loading: strategiesLoading } = useStrategies(user?.id);

  const [tradeSearchTerm, setTradeSearchTerm] = useState('');
  const [strategySearchTerm, setStrategySearchTerm] = useState('');
  const [showTradeSelector, setShowTradeSelector] = useState(false);
  const [showStrategySelector, setShowStrategySelector] = useState(false);

  // Filter trades based on search term
  const filteredTrades = trades.filter(trade =>
    trade.market.toLowerCase().includes(tradeSearchTerm.toLowerCase()) ||
    trade.trade_type.toLowerCase().includes(tradeSearchTerm.toLowerCase()) ||
    (trade.notes && trade.notes.toLowerCase().includes(tradeSearchTerm.toLowerCase()))
  );

  // Filter strategies based on search term
  const filteredStrategies = strategies.filter(strategy =>
    strategy.name.toLowerCase().includes(strategySearchTerm.toLowerCase()) ||
    (strategy.description && strategy.description.toLowerCase().includes(strategySearchTerm.toLowerCase()))
  );

  // Get selected trades and strategies for display
  const selectedTrades = trades.filter(trade => selectedTradeIds.includes(trade.id));
  const selectedStrategies = strategies.filter(strategy => selectedStrategyIds.includes(strategy.id));

  const handleTradeToggle = (tradeId: string) => {
    if (selectedTradeIds.includes(tradeId)) {
      onTradeIdsChange(selectedTradeIds.filter(id => id !== tradeId));
    } else {
      onTradeIdsChange([...selectedTradeIds, tradeId]);
    }
  };

  const handleStrategyToggle = (strategyId: string) => {
    if (selectedStrategyIds.includes(strategyId)) {
      onStrategyIdsChange(selectedStrategyIds.filter(id => id !== strategyId));
    } else {
      onStrategyIdsChange([...selectedStrategyIds, strategyId]);
    }
  };

  const formatTradeDisplay = (trade: Trade) => {
    const profitLoss = trade.profit_loss || 0;
    const isProfit = profitLoss >= 0;
    return `${trade.market} - ${trade.trade_type} (${isProfit ? '+' : ''}$${profitLoss.toFixed(2)})`;
  };

  return (
    <div className="space-y-6">
      {/* Attached Trades Section */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Attached Trades ({selectedTrades.length})
        </label>
        
        {/* Selected Trades Display */}
        {selectedTrades.length > 0 && (
          <div className="mb-3 space-y-2">
            {selectedTrades.map(trade => (
              <div key={trade.id} className="flex items-center justify-between bg-blue-50 p-2 rounded-md">
                <div className="flex items-center">
                  <FiTrendingUp className="text-blue-600 mr-2" />
                  <span className="text-sm text-slate-700">{formatTradeDisplay(trade)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleTradeToggle(trade.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FiX size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Trade Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowTradeSelector(!showTradeSelector)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-left text-sm text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {showTradeSelector ? 'Hide trade selector' : 'Select trades to attach'}
          </button>

          {showTradeSelector && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {/* Search Input */}
              <div className="p-2 border-b border-slate-200">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search trades..."
                    value={tradeSearchTerm}
                    onChange={(e) => setTradeSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Trade List */}
              <div className="max-h-40 overflow-y-auto">
                {tradesLoading ? (
                  <div className="p-3 text-center text-slate-500">Loading trades...</div>
                ) : filteredTrades.length === 0 ? (
                  <div className="p-3 text-center text-slate-500">No trades found</div>
                ) : (
                  filteredTrades.map(trade => (
                    <button
                      key={trade.id}
                      type="button"
                      onClick={() => handleTradeToggle(trade.id)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center justify-between ${
                        selectedTradeIds.includes(trade.id) ? 'bg-blue-50 text-blue-700' : 'text-slate-700'
                      }`}
                    >
                      <span>{formatTradeDisplay(trade)}</span>
                      {selectedTradeIds.includes(trade.id) && (
                        <span className="text-blue-600">✓</span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Attached Strategies Section */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Attached Strategies ({selectedStrategies.length})
        </label>
        
        {/* Selected Strategies Display */}
        {selectedStrategies.length > 0 && (
          <div className="mb-3 space-y-2">
            {selectedStrategies.map(strategy => (
              <div key={strategy.id} className="flex items-center justify-between bg-green-50 p-2 rounded-md">
                <div className="flex items-center">
                  <FiTarget className="text-green-600 mr-2" />
                  <span className="text-sm text-slate-700">{strategy.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleStrategyToggle(strategy.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <FiX size={16} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Strategy Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowStrategySelector(!showStrategySelector)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md text-left text-sm text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {showStrategySelector ? 'Hide strategy selector' : 'Select strategies to attach'}
          </button>

          {showStrategySelector && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
              {/* Search Input */}
              <div className="p-2 border-b border-slate-200">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    type="text"
                    placeholder="Search strategies..."
                    value={strategySearchTerm}
                    onChange={(e) => setStrategySearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Strategy List */}
              <div className="max-h-40 overflow-y-auto">
                {strategiesLoading ? (
                  <div className="p-3 text-center text-slate-500">Loading strategies...</div>
                ) : filteredStrategies.length === 0 ? (
                  <div className="p-3 text-center text-slate-500">No strategies found</div>
                ) : (
                  filteredStrategies.map(strategy => (
                    <button
                      key={strategy.id}
                      type="button"
                      onClick={() => handleStrategyToggle(strategy.id)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center justify-between ${
                        selectedStrategyIds.includes(strategy.id) ? 'bg-green-50 text-green-700' : 'text-slate-700'
                      }`}
                    >
                      <span>{strategy.name}</span>
                      {selectedStrategyIds.includes(strategy.id) && (
                        <span className="text-green-600">✓</span>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
