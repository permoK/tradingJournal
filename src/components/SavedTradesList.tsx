'use client';

import { FiSave, FiTrash2 } from 'react-icons/fi';
import SavedTradeCard, { SavedTrade } from './SavedTradeCard';

interface SavedTradesListProps {
  savedTrades: SavedTrade[];
  onEditTrade: (trade: SavedTrade) => void;
  onDeleteTrade: (tradeId: string) => void;
  onRecordAllTrades: () => void;
  onClearAllTrades: () => void;
  isRecording: boolean;
}

export default function SavedTradesList({
  savedTrades,
  onEditTrade,
  onDeleteTrade,
  onRecordAllTrades,
  onClearAllTrades,
  isRecording
}: SavedTradesListProps) {
  if (savedTrades.length === 0) {
    return null;
  }

  const totalPL = savedTrades.reduce((sum, trade) => {
    return sum + (trade.calculatedPL || 0);
  }, 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="mt-8 bg-slate-50 rounded-lg p-6 border border-slate-200">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Saved Trades ({savedTrades.length})
          </h3>
          {totalPL !== 0 && (
            <p className={`text-sm font-medium ${
              totalPL > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              Total P/L: {formatCurrency(totalPL)}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={onClearAllTrades}
            disabled={isRecording}
            className="flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
          >
            <FiTrash2 className="mr-1 w-4 h-4" />
            Clear All
          </button>
          
          <button
            onClick={onRecordAllTrades}
            disabled={isRecording}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 border border-indigo-700"
          >
            <FiSave className="mr-2 w-4 h-4" />
            {isRecording ? 'Recording...' : 'Record All Trades'}
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {savedTrades.map((trade) => (
          <SavedTradeCard
            key={trade.id}
            trade={trade}
            onEdit={onEditTrade}
            onDelete={onDeleteTrade}
          />
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> These trades are saved locally and haven't been recorded yet. 
          Click "Record All Trades" to save them to your trading journal.
        </p>
      </div>
    </div>
  );
}
