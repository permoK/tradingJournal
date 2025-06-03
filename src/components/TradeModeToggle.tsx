'use client';

import { useTradeMode } from '@/contexts/TradeModeContext';
import { FiPlay, FiPause } from 'react-icons/fi';

interface TradeModeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export default function TradeModeToggle({ className = '', showLabel = true }: TradeModeToggleProps) {
  const { isDemoMode, toggleMode } = useTradeMode();

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {showLabel && (
        <div className="flex items-center gap-2">
          <span className={`text-sm font-medium ${isDemoMode ? 'text-amber-600' : 'text-emerald-600'}`}>
            {isDemoMode ? 'Demo Mode' : 'Real Trading'}
          </span>
          {isDemoMode && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
              <FiPause className="mr-1 w-3 h-3" />
              Demo
            </span>
          )}
        </div>
      )}
      
      <button
        onClick={toggleMode}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          isDemoMode
            ? 'bg-amber-500 focus:ring-amber-500'
            : 'bg-emerald-500 focus:ring-emerald-500'
        }`}
        role="switch"
        aria-checked={isDemoMode}
        aria-label={`Switch to ${isDemoMode ? 'real' : 'demo'} mode`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isDemoMode ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
      
      {!showLabel && (
        <span className={`text-xs font-medium ${isDemoMode ? 'text-amber-600' : 'text-emerald-600'}`}>
          {isDemoMode ? 'Demo' : 'Real'}
        </span>
      )}
    </div>
  );
}
