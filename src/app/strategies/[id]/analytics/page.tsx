'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import { FiArrowLeft, FiTrendingUp, FiTrendingDown, FiBarChart2, FiTarget, FiCalendar, FiDollarSign } from 'react-icons/fi';
import Link from 'next/link';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface StrategyAnalytics {
  strategy: any;
  overview: {
    totalTrades: number;
    openTrades: number;
    profitableTrades: number;
    losingTrades: number;
    breakEvenTrades: number;
    successRate: number;
    netProfitLoss: number;
    totalProfit: number;
    totalLoss: number;
    averageWin: number;
    averageLoss: number;
    profitFactor: number;
    recentSuccessRate: number;
    maxWinStreak: number;
    maxLossStreak: number;
    currentWinStreak: number;
    currentLossStreak: number;
  };
  marketPerformance: Record<string, any>;
  tradeTypePerformance: {
    buy: { totalTrades: number; profitableTrades: number; totalProfitLoss: number; successRate: number };
    sell: { totalTrades: number; profitableTrades: number; totalProfitLoss: number; successRate: number };
  };
  monthlyPerformance: Record<string, any>;
  bestMarkets: Array<{ market: string; totalTrades: number; totalProfitLoss: number; successRate: number }>;
  worstMarkets: Array<{ market: string; totalTrades: number; totalProfitLoss: number; successRate: number }>;
  recentTrades: Array<{ id: string; market: string; trade_type: string; profit_loss: number; trade_date: string }>;
}

export default function StrategyAnalytics() {
  const params = useParams();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<StrategyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!params.id) return;

      try {
        const response = await fetch(`/api/strategies/${params.id}/analytics`);
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        const data = await response.json();
        setAnalytics(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [params.id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-slate-700 font-medium">Loading analytics...</div>
        </div>
      </AppLayout>
    );
  }

  if (error || !analytics) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Analytics Not Available</h2>
          <p className="text-slate-600 mb-4">{error || 'Unable to load strategy analytics.'}</p>
          <Link
            href={`/strategies/${params.id}`}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <FiArrowLeft className="mr-2 h-4 w-4" />
            Back to Strategy
          </Link>
        </div>
      </AppLayout>
    );
  }

  const { strategy, overview, marketPerformance, tradeTypePerformance, monthlyPerformance, bestMarkets, worstMarkets } = analytics;

  // Prepare chart data
  const monthlyLabels = Object.keys(monthlyPerformance).sort();
  const monthlyProfitLoss = monthlyLabels.map(month => monthlyPerformance[month].totalProfitLoss);
  const monthlySuccessRates = monthlyLabels.map(month => monthlyPerformance[month].successRate);

  const marketLabels = Object.keys(marketPerformance).slice(0, 10);
  const marketTradeCounts = marketLabels.map(market => marketPerformance[market].totalTrades);
  const marketSuccessRates = marketLabels.map(market => marketPerformance[market].successRate);

  const performanceData = {
    labels: monthlyLabels.map(month => new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })),
    datasets: [
      {
        label: 'Monthly P/L',
        data: monthlyProfitLoss,
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const marketData = {
    labels: marketLabels,
    datasets: [
      {
        label: 'Total Trades',
        data: marketTradeCounts,
        backgroundColor: 'rgba(79, 70, 229, 0.8)',
        borderColor: '#4F46E5',
        borderWidth: 1
      }
    ]
  };

  const tradeTypeData = {
    labels: ['Buy Trades', 'Sell Trades'],
    datasets: [
      {
        data: [tradeTypePerformance.buy.totalTrades, tradeTypePerformance.sell.totalTrades],
        backgroundColor: ['#10B981', '#EF4444'],
        borderColor: ['#10B981', '#EF4444'],
        borderWidth: 1
      }
    ]
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

  return (
    <AppLayout>
      <div className="mb-4 sm:mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Link
            href={`/strategies/${strategy.id}`}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
          >
            <FiArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{strategy.name} Analytics</h1>
        </div>
        <p className="text-slate-700 font-medium text-sm sm:text-base ml-11">
          Comprehensive performance analysis and insights
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Trades</p>
              <p className="text-2xl font-bold text-slate-900">{overview.totalTrades}</p>
            </div>
            <FiBarChart2 className="h-8 w-8 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Success Rate</p>
              <p className={`text-2xl font-bold ${getSuccessRateColor(overview.successRate)}`}>
                {overview.successRate.toFixed(1)}%
              </p>
            </div>
            <FiTarget className="h-8 w-8 text-emerald-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Net P/L</p>
              <p className={`text-2xl font-bold ${getProfitLossColor(overview.netProfitLoss)}`}>
                {overview.netProfitLoss > 0 ? '+' : ''}{overview.netProfitLoss.toFixed(2)}
              </p>
            </div>
            <FiDollarSign className="h-8 w-8 text-slate-600" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Profit Factor</p>
              <p className="text-2xl font-bold text-slate-900">
                {overview.profitFactor === Infinity ? '∞' : overview.profitFactor.toFixed(2)}
              </p>
            </div>
            <FiTrendingUp className="h-8 w-8 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Monthly Performance */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Monthly Performance</h2>
          <div className="h-64">
            <Line
              data={performanceData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (context) => `P/L: ${context.parsed.y.toFixed(2)}`
                    }
                  }
                },
                scales: {
                  y: { beginAtZero: true }
                }
              }}
            />
          </div>
        </div>

        {/* Market Distribution */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Market Distribution</h2>
          <div className="h-64">
            <Bar
              data={marketData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (context) => `Trades: ${context.parsed.y}`
                    }
                  }
                },
                scales: {
                  y: { beginAtZero: true }
                }
              }}
            />
          </div>
        </div>
      </div>

      {/* Trade Type Performance & Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Trade Type Performance */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Buy vs Sell Performance</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-lg">
              <div>
                <p className="font-medium text-emerald-800">Buy Trades</p>
                <p className="text-sm text-emerald-600">
                  {tradeTypePerformance.buy.totalTrades} trades • {tradeTypePerformance.buy.successRate.toFixed(1)}% success
                </p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${getProfitLossColor(tradeTypePerformance.buy.totalProfitLoss)}`}>
                  {tradeTypePerformance.buy.totalProfitLoss > 0 ? '+' : ''}{tradeTypePerformance.buy.totalProfitLoss.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
              <div>
                <p className="font-medium text-red-800">Sell Trades</p>
                <p className="text-sm text-red-600">
                  {tradeTypePerformance.sell.totalTrades} trades • {tradeTypePerformance.sell.successRate.toFixed(1)}% success
                </p>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${getProfitLossColor(tradeTypePerformance.sell.totalProfitLoss)}`}>
                  {tradeTypePerformance.sell.totalProfitLoss > 0 ? '+' : ''}{tradeTypePerformance.sell.totalProfitLoss.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Metrics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Advanced Metrics</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Average Win</span>
              <span className="font-semibold text-emerald-600">+{overview.averageWin.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Average Loss</span>
              <span className="font-semibold text-red-600">-{overview.averageLoss.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Profit Factor</span>
              <span className="font-semibold text-slate-900">
                {overview.profitFactor === Infinity ? '∞' : overview.profitFactor.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Max Win Streak</span>
              <span className="font-semibold text-emerald-600">{overview.maxWinStreak}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Max Loss Streak</span>
              <span className="font-semibold text-red-600">{overview.maxLossStreak}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Recent Success Rate</span>
              <span className={`font-semibold ${getSuccessRateColor(overview.recentSuccessRate)}`}>
                {overview.recentSuccessRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Best & Worst Markets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Best Performing Markets */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Best Performing Markets</h2>
          <div className="space-y-3">
            {bestMarkets.slice(0, 5).map((market, index) => (
              <div key={market.market} className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-slate-900">{market.market}</p>
                    <p className="text-sm text-slate-600">{market.totalTrades} trades</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${getProfitLossColor(market.totalProfitLoss)}`}>
                    {market.totalProfitLoss > 0 ? '+' : ''}{market.totalProfitLoss.toFixed(2)}
                  </p>
                  <p className={`text-sm ${getSuccessRateColor(market.successRate)}`}>
                    {market.successRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Worst Performing Markets */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Worst Performing Markets</h2>
          <div className="space-y-3">
            {worstMarkets.slice(0, 5).map((market, index) => (
              <div key={market.market} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-slate-900">{market.market}</p>
                    <p className="text-sm text-slate-600">{market.totalTrades} trades</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${getProfitLossColor(market.totalProfitLoss)}`}>
                    {market.totalProfitLoss > 0 ? '+' : ''}{market.totalProfitLoss.toFixed(2)}
                  </p>
                  <p className={`text-sm ${getSuccessRateColor(market.successRate)}`}>
                    {market.successRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Trades */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Trades</h2>
        {analytics.recentTrades.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-3 font-semibold text-slate-700 text-sm">Market</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-700 text-sm">Type</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-700 text-sm">P/L</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-700 text-sm">Date</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentTrades.map((trade) => (
                  <tr key={trade.id} className="border-b border-slate-100">
                    <td className="py-2 px-3 font-medium text-slate-900">{trade.market}</td>
                    <td className="py-2 px-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        trade.trade_type === 'buy' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {trade.trade_type.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      <span className={`font-semibold ${getProfitLossColor(trade.profit_loss)}`}>
                        {trade.profit_loss > 0 ? '+' : ''}{trade.profit_loss.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-600 text-sm">
                      {new Date(trade.trade_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-600 text-center py-8">No recent trades available</p>
        )}
      </div>
    </AppLayout>
  );
}
