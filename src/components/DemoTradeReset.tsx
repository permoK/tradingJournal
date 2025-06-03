'use client';

import { useState } from 'react';
import { FiTrash2, FiAlertTriangle } from 'react-icons/fi';

interface DemoTradeResetProps {
  onReset?: () => void;
  className?: string;
}

export default function DemoTradeReset({ onReset, className = '' }: DemoTradeResetProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/trades/reset-demo', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to reset demo trades');
      }

      setShowConfirm(false);
      if (onReset) {
        onReset();
      }
    } catch (error) {
      console.error('Error resetting demo trades:', error);
      alert('Failed to reset demo trades. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (showConfirm) {
    return (
      <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-start">
          <FiAlertTriangle className="text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-amber-800 mb-2">
              Reset All Demo Trades?
            </h3>
            <p className="text-sm text-amber-700 mb-4">
              This will permanently delete all your demo trades. This action cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                disabled={loading}
                className="px-3 py-1.5 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Yes, Reset All'}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                disabled={loading}
                className="px-3 py-1.5 bg-slate-200 text-slate-700 text-sm rounded hover:bg-slate-300 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className={`flex items-center px-3 py-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md hover:bg-amber-100 transition-colors ${className}`}
    >
      <FiTrash2 className="mr-2 h-4 w-4" />
      Reset Demo Trades
    </button>
  );
}
