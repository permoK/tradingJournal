'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TradeModeContextType {
  isDemoMode: boolean;
  setIsDemoMode: (isDemoMode: boolean) => void;
  toggleMode: () => void;
}

const TradeModeContext = createContext<TradeModeContextType | undefined>(undefined);

interface TradeModeProviderProps {
  children: ReactNode;
}

export function TradeModeProvider({ children }: TradeModeProviderProps) {
  const [isDemoMode, setIsDemoModeState] = useState(false);

  // Load the mode from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem('tradingJournal_demoMode');
    if (savedMode !== null) {
      setIsDemoModeState(JSON.parse(savedMode));
    }
  }, []);

  // Save the mode to localStorage whenever it changes
  const setIsDemoMode = (isDemoMode: boolean) => {
    setIsDemoModeState(isDemoMode);
    localStorage.setItem('tradingJournal_demoMode', JSON.stringify(isDemoMode));
  };

  const toggleMode = () => {
    setIsDemoMode(!isDemoMode);
  };

  return (
    <TradeModeContext.Provider value={{ isDemoMode, setIsDemoMode, toggleMode }}>
      {children}
    </TradeModeContext.Provider>
  );
}

export function useTradeMode() {
  const context = useContext(TradeModeContext);
  if (context === undefined) {
    throw new Error('useTradeMode must be used within a TradeModeProvider');
  }
  return context;
}
