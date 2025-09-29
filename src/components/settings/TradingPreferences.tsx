'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { FiTrendingUp, FiSave, FiLoader, FiDollarSign, FiPercent } from 'react-icons/fi';

interface TradingPreferences {
  defaultRiskPercentage: number;
  defaultLeverage: number;
  preferredTimeframe: string;
  autoCalculatePositionSize: boolean;
  showPnLInPercentage: boolean;
  defaultCurrency: string;
  riskManagementAlerts: boolean;
  maxDailyLoss: number;
  maxPositionsOpen: number;
  tradingHoursOnly: boolean;
  confirmBeforeClosing: boolean;
}

export default function TradingPreferences() {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [preferences, setPreferences] = useState<TradingPreferences>({
    defaultRiskPercentage: 2,
    defaultLeverage: 1,
    preferredTimeframe: '1h',
    autoCalculatePositionSize: true,
    showPnLInPercentage: false,
    defaultCurrency: 'USD',
    riskManagementAlerts: true,
    maxDailyLoss: 5,
    maxPositionsOpen: 5,
    tradingHoursOnly: false,
    confirmBeforeClosing: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      fetchTradingPreferences();
    }
  }, [user?.id]);

  const fetchTradingPreferences = async () => {
    try {
      const response = await fetch('/api/settings/trading');
      if (response.ok) {
        const data = await response.json();
        setPreferences(data);
      }
    } catch (error) {
      console.error('Error fetching trading preferences:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setPreferences(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleToggle = (key: keyof TradingPreferences) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/settings/trading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(preferences),
      });

      if (!response.ok) {
        throw new Error('Failed to update trading preferences');
      }

      addNotification({
        type: 'success',
        title: 'Trading Preferences Updated',
        message: 'Your trading preferences have been saved.',
      });
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: error.message || 'Failed to update trading preferences.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
        enabled ? 'bg-blue-600' : 'bg-slate-200'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  );

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <div className="flex items-center mb-6">
        <FiTrendingUp className="h-5 w-5 text-slate-400 mr-2" />
        <h3 className="text-lg font-medium text-slate-900">Trading Preferences</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Risk Management */}
        <div>
          <h4 className="text-md font-medium text-slate-900 mb-4">Risk Management</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="defaultRiskPercentage" className="block text-sm font-medium text-slate-700 mb-2">
                Default Risk per Trade (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="defaultRiskPercentage"
                  name="defaultRiskPercentage"
                  value={preferences.defaultRiskPercentage}
                  onChange={handleInputChange}
                  min="0.1"
                  max="10"
                  step="0.1"
                  className="w-full px-3 py-2 pr-8 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <FiPercent className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label htmlFor="maxDailyLoss" className="block text-sm font-medium text-slate-700 mb-2">
                Max Daily Loss (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  id="maxDailyLoss"
                  name="maxDailyLoss"
                  value={preferences.maxDailyLoss}
                  onChange={handleInputChange}
                  min="1"
                  max="20"
                  step="0.5"
                  className="w-full px-3 py-2 pr-8 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <FiPercent className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              </div>
            </div>

            <div>
              <label htmlFor="defaultLeverage" className="block text-sm font-medium text-slate-700 mb-2">
                Default Leverage
              </label>
              <select
                id="defaultLeverage"
                name="defaultLeverage"
                value={preferences.defaultLeverage}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={1}>1:1 (No Leverage)</option>
                <option value={2}>1:2</option>
                <option value={5}>1:5</option>
                <option value={10}>1:10</option>
                <option value={20}>1:20</option>
                <option value={50}>1:50</option>
                <option value={100}>1:100</option>
              </select>
            </div>

            <div>
              <label htmlFor="maxPositionsOpen" className="block text-sm font-medium text-slate-700 mb-2">
                Max Open Positions
              </label>
              <input
                type="number"
                id="maxPositionsOpen"
                name="maxPositionsOpen"
                value={preferences.maxPositionsOpen}
                onChange={handleInputChange}
                min="1"
                max="20"
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Trading Defaults */}
        <div className="border-t border-slate-200 pt-6">
          <h4 className="text-md font-medium text-slate-900 mb-4">Trading Defaults</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="preferredTimeframe" className="block text-sm font-medium text-slate-700 mb-2">
                Preferred Timeframe
              </label>
              <select
                id="preferredTimeframe"
                name="preferredTimeframe"
                value={preferences.preferredTimeframe}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1m">1 Minute</option>
                <option value="5m">5 Minutes</option>
                <option value="15m">15 Minutes</option>
                <option value="30m">30 Minutes</option>
                <option value="1h">1 Hour</option>
                <option value="4h">4 Hours</option>
                <option value="1d">1 Day</option>
                <option value="1w">1 Week</option>
              </select>
            </div>

            <div>
              <label htmlFor="defaultCurrency" className="block text-sm font-medium text-slate-700 mb-2">
                Default Currency
              </label>
              <select
                id="defaultCurrency"
                name="defaultCurrency"
                value={preferences.defaultCurrency}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="JPY">JPY - Japanese Yen</option>
                <option value="AUD">AUD - Australian Dollar</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="CHF">CHF - Swiss Franc</option>
              </select>
            </div>
          </div>
        </div>

        {/* Trading Behavior */}
        <div className="border-t border-slate-200 pt-6">
          <h4 className="text-md font-medium text-slate-900 mb-4">Trading Behavior</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Auto-calculate Position Size</p>
                <p className="text-sm text-slate-500">Automatically calculate position size based on risk percentage</p>
              </div>
              <ToggleSwitch
                enabled={preferences.autoCalculatePositionSize}
                onToggle={() => handleToggle('autoCalculatePositionSize')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Show P&L in Percentage</p>
                <p className="text-sm text-slate-500">Display profit/loss as percentage instead of currency</p>
              </div>
              <ToggleSwitch
                enabled={preferences.showPnLInPercentage}
                onToggle={() => handleToggle('showPnLInPercentage')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Risk Management Alerts</p>
                <p className="text-sm text-slate-500">Get notified when approaching risk limits</p>
              </div>
              <ToggleSwitch
                enabled={preferences.riskManagementAlerts}
                onToggle={() => handleToggle('riskManagementAlerts')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Trading Hours Only</p>
                <p className="text-sm text-slate-500">Only allow trading during market hours</p>
              </div>
              <ToggleSwitch
                enabled={preferences.tradingHoursOnly}
                onToggle={() => handleToggle('tradingHoursOnly')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Confirm Before Closing</p>
                <p className="text-sm text-slate-500">Require confirmation before closing positions</p>
              </div>
              <ToggleSwitch
                enabled={preferences.confirmBeforeClosing}
                onToggle={() => handleToggle('confirmBeforeClosing')}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-6 border-t border-slate-200">
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <FiLoader className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Saving...
              </>
            ) : (
              <>
                <FiSave className="-ml-1 mr-2 h-4 w-4" />
                Save Preferences
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
