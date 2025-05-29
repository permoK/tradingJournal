'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStrategies } from '@/lib/hooks';
import AppLayout from '@/components/AppLayout';
import { FiArrowLeft, FiBarChart2, FiTrendingUp, FiTrendingDown, FiTarget, FiDollarSign } from 'react-icons/fi';
import Link from 'next/link';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ComparisonData {
  strategies: Array<{
    strategy: any;
    metrics: {
      totalTrades: number;
      profitableTrades: number;
      losingTrades: number;
      successRate: number;
      netProfitLoss: number;
      totalProfit: number;
      totalLoss: number;
      averageWin: number;
      averageLoss: number;
      profitFactor: number;
    };
    marketPerformance: Record<string, any>;
    monthlyPerformance: Record<string, any>;
    bestMarkets: Array<{ market: string; totalTrades: number; totalProfitLoss: number; successRate: number }>;
  }>;
  summary: {
    bestPerformer: any;
    mostConsistent: any;
    mostActive: any;
    bestProfitFactor: any;
  };
  marketComparison: Record<string, any>;
  timeComparison: Record<string, any>;
}

export default function StrategyComparison() {
  const { user } = useAuth();
  const { strategies } = useStrategies(user?.id);
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStrategyToggle = (strategyId: string) => {
    setSelectedStrategies(prev => {
      if (prev.includes(strategyId)) {
        return prev.filter(id => id !== strategyId);
      } else if (prev.length < 5) { // Limit to 5 strategies for comparison
        return [...prev, strategyId];
      }
      return prev;
    });
  };

  const handleCompare = async () => {
    if (selectedStrategies.length < 2) {
      setError('Please select at least 2 strategies to compare');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/strategies/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          strategyIds: selectedStrategies,
          userId: user?.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch comparison data');
      }

      const data = await response.json();
      setComparisonData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 70) return 'text-emerald-600';
    if (rate >= 50) return 'text-amber-600';
    return 'text-red-600';
  };

  const getProfitLossColor = (value: number) => {
    if (value > 0) return 'text-emerald-600';
    if (value < 0) return 'text-red-600';
    return 'text-slate-600';
  };

  // Prepare chart data
  const chartData = comparisonData ? {
    labels: comparisonData.strategies.map(s => s.strategy.name),
    datasets: [
      {
        label: 'Net P/L',
        data: comparisonData.strategies.map(s => s.metrics.netProfitLoss),
        backgroundColor: 'rgba(79, 70, 229, 0.8)',
        borderColor: '#4F46E5',
        borderWidth: 1
      },
      {
        label: 'Success Rate (%)',
        data: comparisonData.strategies.map(s => s.metrics.successRate),
        backgroundColor: 'rgba(16, 185, 129, 0.8)',
        borderColor: '#10B981',
        borderWidth: 1,
        yAxisID: 'y1'
      }
    ]
  } : null;

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Strategy Performance Comparison'
      }
    },
    scales: {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Net P/L'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Success Rate (%)'
        },
        grid: {
          drawOnChartArea: false,
        },
      }
    }
  };

  return (
    <AppLayout>
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Link
            href="/strategies"
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          >
            <FiArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Compare Strategies</h1>
        </div>
        <p className="text-slate-700 font-medium text-sm sm:text-base ml-11">
          Select strategies to compare their performance side by side
        </p>
      </div>

      {/* Strategy Selection */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 mb-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Select Strategies to Compare</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {strategies.map(strategy => (
            <div
              key={strategy.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedStrategies.includes(strategy.id)
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
              onClick={() => handleStrategyToggle(strategy.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-slate-900">{strategy.name}</h3>
                  <p className="text-sm text-slate-600">{strategy.category || 'No category'}</p>
                  <p className="text-sm text-slate-500">{strategy.total_trades} trades</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-medium ${getSuccessRateColor(strategy.success_rate)}`}>
                    {strategy.success_rate.toFixed(1)}%
                  </p>
                  <div className={`w-4 h-4 rounded border-2 ${
                    selectedStrategies.includes(strategy.id)
                      ? 'bg-indigo-500 border-indigo-500'
                      : 'border-slate-300'
                  }`}>
                    {selectedStrategies.includes(strategy.id) && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Selected: {selectedStrategies.length}/5 strategies
            {selectedStrategies.length >= 2 && (
              <span className="text-emerald-600 ml-2">Ready to compare!</span>
            )}
          </p>
          <button
            onClick={handleCompare}
            disabled={selectedStrategies.length < 2 || loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Comparing...' : 'Compare Strategies'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Comparison Results */}
      {comparisonData && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Best Performer</p>
                  <p className="font-semibold text-slate-900">{comparisonData.summary.bestPerformer.strategy.name}</p>
                  <p className={`text-sm ${getProfitLossColor(comparisonData.summary.bestPerformer.metrics.netProfitLoss)}`}>
                    {comparisonData.summary.bestPerformer.metrics.netProfitLoss > 0 ? '+' : ''}
                    {comparisonData.summary.bestPerformer.metrics.netProfitLoss.toFixed(2)}
                  </p>
                </div>
                <FiTrendingUp className="h-8 w-8 text-emerald-600" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Most Consistent</p>
                  <p className="font-semibold text-slate-900">{comparisonData.summary.mostConsistent.strategy.name}</p>
                  <p className={`text-sm ${getSuccessRateColor(comparisonData.summary.mostConsistent.metrics.successRate)}`}>
                    {comparisonData.summary.mostConsistent.metrics.successRate.toFixed(1)}%
                  </p>
                </div>
                <FiTarget className="h-8 w-8 text-indigo-600" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Most Active</p>
                  <p className="font-semibold text-slate-900">{comparisonData.summary.mostActive.strategy.name}</p>
                  <p className="text-sm text-slate-600">
                    {comparisonData.summary.mostActive.metrics.totalTrades} trades
                  </p>
                </div>
                <FiBarChart2 className="h-8 w-8 text-amber-600" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Best Profit Factor</p>
                  <p className="font-semibold text-slate-900">{comparisonData.summary.bestProfitFactor.strategy.name}</p>
                  <p className="text-sm text-slate-600">
                    {comparisonData.summary.bestProfitFactor.metrics.profitFactor === Infinity
                      ? '∞'
                      : comparisonData.summary.bestProfitFactor.metrics.profitFactor.toFixed(2)
                    }
                  </p>
                </div>
                <FiDollarSign className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Performance Chart */}
          {chartData && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Performance Overview</h2>
              <div className="h-80">
                <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
          )}

          {/* Detailed Comparison Table */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Detailed Metrics Comparison</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Strategy</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Total Trades</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Success Rate</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Net P/L</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Avg Win</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Avg Loss</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Profit Factor</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.strategies.map((strategyData) => (
                    <tr key={strategyData.strategy.id} className="border-b border-slate-100">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-slate-900">{strategyData.strategy.name}</p>
                          <p className="text-sm text-slate-600">{strategyData.strategy.category || 'No category'}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{strategyData.metrics.totalTrades}</td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${getSuccessRateColor(strategyData.metrics.successRate)}`}>
                          {strategyData.metrics.successRate.toFixed(1)}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-medium ${getProfitLossColor(strategyData.metrics.netProfitLoss)}`}>
                          {strategyData.metrics.netProfitLoss > 0 ? '+' : ''}
                          {strategyData.metrics.netProfitLoss.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-emerald-600 font-medium">
                        +{strategyData.metrics.averageWin.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-red-600 font-medium">
                        -{strategyData.metrics.averageLoss.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {strategyData.metrics.profitFactor === Infinity
                          ? '∞'
                          : strategyData.metrics.profitFactor.toFixed(2)
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Best Markets Comparison */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Best Performing Markets by Strategy</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {comparisonData.strategies.map((strategyData) => (
                <div key={strategyData.strategy.id} className="border border-slate-200 rounded-lg p-4">
                  <h3 className="font-medium text-slate-900 mb-3">{strategyData.strategy.name}</h3>
                  <div className="space-y-2">
                    {strategyData.bestMarkets.slice(0, 3).map((market, index) => (
                      <div key={market.market} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 bg-indigo-100 text-indigo-800 rounded-full flex items-center justify-center text-xs font-bold">
                            {index + 1}
                          </span>
                          <span className="text-slate-700">{market.market}</span>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${getProfitLossColor(market.totalProfitLoss)}`}>
                            {market.totalProfitLoss > 0 ? '+' : ''}{market.totalProfitLoss.toFixed(2)}
                          </p>
                          <p className="text-xs text-slate-500">{market.totalTrades} trades</p>
                        </div>
                      </div>
                    ))}
                    {strategyData.bestMarkets.length === 0 && (
                      <p className="text-slate-500 text-sm">No market data available</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
