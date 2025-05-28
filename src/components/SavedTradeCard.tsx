'use client';

import { FiEdit, FiTrash2, FiTrendingUp, FiTrendingDown, FiImage } from 'react-icons/fi';
import { format } from 'date-fns';

export interface SavedTrade {
  id: string;
  market: string;
  tradeType: 'buy' | 'sell';
  tradeDate: string;
  entryPrice: string;
  exitPrice: string;
  quantity: string;
  status: 'open' | 'closed';
  notes: string;
  isPrivate: boolean;
  screenshotUrl?: string | null;
  calculatedPL?: number | null;
}

interface SavedTradeCardProps {
  trade: SavedTrade;
  onEdit: (trade: SavedTrade) => void;
  onDelete: (tradeId: string) => void;
}

export default function SavedTradeCard({ trade, onEdit, onDelete }: SavedTradeCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const getProfitLossColor = (pl: number | null) => {
    if (pl === null || pl === 0) return 'text-slate-600';
    return pl > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getProfitLossIcon = (pl: number | null) => {
    if (pl === null || pl === 0) return null;
    return pl > 0 ? <FiTrendingUp className="w-4 h-4" /> : <FiTrendingDown className="w-4 h-4" />;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-semibold text-slate-900">{trade.market}</h3>
            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
              trade.tradeType === 'buy' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {trade.tradeType.toUpperCase()}
            </span>
            <span className={`px-2 py-1 text-xs rounded-full font-medium ${
              trade.status === 'open' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-slate-100 text-slate-800'
            }`}>
              {trade.status.toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-slate-600">
            {format(new Date(trade.tradeDate), 'MMM d, yyyy')}
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onEdit(trade)}
            className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
            title="Edit trade"
          >
            <FiEdit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(trade.id)}
            className="p-1 text-slate-400 hover:text-red-600 transition-colors"
            title="Delete trade"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-3">
        <div>
          <p className="text-xs text-slate-500 mb-1">Entry Price</p>
          <p className="text-sm font-medium text-slate-900">${trade.entryPrice}</p>
        </div>
        {trade.exitPrice && (
          <div>
            <p className="text-xs text-slate-500 mb-1">Exit Price</p>
            <p className="text-sm font-medium text-slate-900">${trade.exitPrice}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-slate-500 mb-1">Quantity</p>
          <p className="text-sm font-medium text-slate-900">{trade.quantity}</p>
        </div>
        {trade.calculatedPL !== null && trade.calculatedPL !== undefined && (
          <div>
            <p className="text-xs text-slate-500 mb-1">P/L</p>
            <div className={`flex items-center space-x-1 text-sm font-medium ${getProfitLossColor(trade.calculatedPL)}`}>
              {getProfitLossIcon(trade.calculatedPL)}
              <span>{formatCurrency(trade.calculatedPL)}</span>
            </div>
          </div>
        )}
      </div>

      {trade.notes && (
        <div className="mb-3">
          <p className="text-xs text-slate-500 mb-1">Notes</p>
          <p className="text-sm text-slate-700 line-clamp-2">{trade.notes}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {trade.screenshotUrl && (
            <div className="flex items-center text-xs text-slate-500">
              <FiImage className="w-3 h-3 mr-1" />
              Screenshot attached
            </div>
          )}
          {trade.isPrivate && (
            <span className="text-xs text-slate-500">Private</span>
          )}
        </div>
      </div>

      {trade.screenshotUrl && (
        <div className="mt-3">
          <img
            src={trade.screenshotUrl}
            alt="Trade screenshot"
            className="w-full h-32 object-cover rounded border border-slate-200"
          />
        </div>
      )}
    </div>
  );
}
