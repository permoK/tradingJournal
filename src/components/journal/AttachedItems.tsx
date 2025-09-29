'use client';

import { useEffect, useState } from 'react';
import { FiTrendingUp, FiTarget, FiExternalLink } from 'react-icons/fi';
import { Database } from '@/types/database.types';
import { useTrades, useStrategies } from '@/lib/hooks';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

type Trade = Database['public']['Tables']['trades']['Row'];
type Strategy = Database['public']['Tables']['strategies']['Row'];

interface AttachedItemsProps {
  tradeIds: string[] | null;
  strategyIds: string[] | null;
}

export default function AttachedItems({ tradeIds, strategyIds }: AttachedItemsProps) {
  const { user } = useAuth();
  const { trades } = useTrades(user?.id);
  const { strategies } = useStrategies(user?.id);

  const [attachedTrades, setAttachedTrades] = useState<Trade[]>([]);
  const [attachedStrategies, setAttachedStrategies] = useState<Strategy[]>([]);

  useEffect(() => {
    if (tradeIds && tradeIds.length > 0) {
      const filteredTrades = trades.filter(trade => tradeIds.includes(trade.id));
      setAttachedTrades(filteredTrades);
    } else {
      setAttachedTrades([]);
    }
  }, [trades, tradeIds]);

  useEffect(() => {
    if (strategyIds && strategyIds.length > 0) {
      const filteredStrategies = strategies.filter(strategy => strategyIds.includes(strategy.id));
      setAttachedStrategies(filteredStrategies);
    } else {
      setAttachedStrategies([]);
    }
  }, [strategies, strategyIds]);

  const formatTradeDisplay = (trade: Trade) => {
    const profitLoss = Number(trade.profit_loss) || 0;
    const isProfit = profitLoss >= 0;
    return {
      title: `${trade.market} - ${trade.trade_type}`,
      subtitle: `${isProfit ? '+' : ''}$${profitLoss.toFixed(2)}`,
      isProfit
    };
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  if (attachedTrades.length === 0 && attachedStrategies.length === 0) {
    return null;
  }

  return (
    <div className="mt-6 space-y-4">
      {/* Attached Trades */}
      {attachedTrades.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center">
            <FiTrendingUp className="mr-2" />
            Attached Trades ({attachedTrades.length})
          </h4>
          <div className="space-y-2">
            {attachedTrades.map(trade => {
              const tradeInfo = formatTradeDisplay(trade);
              return (
                <Link
                  key={trade.id}
                  href={`/trading/${trade.id}`}
                  className="block p-3 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-900">{tradeInfo.title}</span>
                        <span className={`text-sm font-medium ${
                          tradeInfo.isProfit ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {tradeInfo.subtitle}
                        </span>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-slate-500">
                          {formatDate(trade.trade_date)} • {trade.status}
                        </span>
                        <FiExternalLink className="text-blue-600" size={14} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Attached Strategies */}
      {attachedStrategies.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center">
            <FiTarget className="mr-2" />
            Attached Strategies ({attachedStrategies.length})
          </h4>
          <div className="space-y-2">
            {attachedStrategies.map(strategy => (
              <Link
                key={strategy.id}
                href={`/strategies/${strategy.id}`}
                className="block p-3 bg-green-50 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-slate-900">{strategy.name}</span>
                      <FiExternalLink className="text-green-600" size={14} />
                    </div>
                    {strategy.description && (
                      <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                        {strategy.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-500">
                        {strategy.category && `${strategy.category} • `}
                        {strategy.success_rate}% success rate
                      </span>
                      <span className="text-xs text-slate-500">
                        {strategy.total_trades} trades
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
