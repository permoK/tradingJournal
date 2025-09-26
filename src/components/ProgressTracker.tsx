'use client';

import React, { useState, useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format, subDays, subMonths, startOfDay, endOfDay } from 'date-fns';
import { FiFilter } from 'react-icons/fi';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface Trade {
  id: string;
  trade_date: string;
  market: string;
  profit_loss: number | null;
  status: string;
}

interface ProgressTrackerProps {
  trades: Trade[];
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ trades }) => {
  const [timeFilter, setTimeFilter] = useState('30d');
  const [profitLossFilter, setProfitLossFilter] = useState('all');

  // Filter trades based on selected filters
  const filteredTrades = useMemo(() => {
    let filtered = trades.filter(trade =>
      trade.status === 'closed' && trade.profit_loss !== null
    );

    // Apply time filter
    const now = new Date();
    let startDate: Date;

    switch (timeFilter) {
      case '7d':
        startDate = subDays(now, 7);
        break;
      case '30d':
        startDate = subDays(now, 30);
        break;
      case '3m':
        startDate = subMonths(now, 3);
        break;
      case '6m':
        startDate = subMonths(now, 6);
        break;
      case '1y':
        startDate = subMonths(now, 12);
        break;
      default:
        startDate = subDays(now, 30);
    }

    filtered = filtered.filter(trade =>
      new Date(trade.trade_date) >= startDate
    );

    // Apply profit/loss filter
    if (profitLossFilter === 'profit') {
      filtered = filtered.filter(trade => (trade.profit_loss || 0) > 0);
    } else if (profitLossFilter === 'loss') {
      filtered = filtered.filter(trade => (trade.profit_loss || 0) < 0);
    }

    return filtered.sort((a, b) =>
      new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime()
    );
  }, [trades, timeFilter, profitLossFilter]);

  // Calculate cumulative profit/loss
  const chartData = useMemo(() => {
    if (filteredTrades.length === 0) return { labels: [], data: [] };

    const labels = filteredTrades.map(trade =>
      format(new Date(trade.trade_date), 'MMM d')
    );

    const cumulativeData = filteredTrades.reduce(
      (acc: number[], trade, index) => {
        const prevValue = index > 0 ? acc[index - 1] : 0;
        acc.push(prevValue + (trade.profit_loss || 0));
        return acc;
      },
      []
    );

    return { labels, data: cumulativeData };
  }, [filteredTrades]);

  // Use window.innerWidth to determine if we're on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        titleColor: '#F8FAFC',
        bodyColor: '#F8FAFC',
        borderColor: 'rgba(148, 163, 184, 0.2)',
        borderWidth: 1,
        padding: isMobile ? 12 : 16,
        titleFont: {
          size: isMobile ? 13 : 15,
          weight: 'bold' as const
        },
        bodyFont: {
          size: isMobile ? 12 : 14
        },
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: function(context: any) {
            return `Trade ${context[0].dataIndex + 1} - ${context[0].label}`;
          },
          label: function(context: any) {
            const value = context.raw;
            const isProfit = value >= 0;
            const prefix = isProfit ? '+$' : '-$';
            const color = isProfit ? '🟢' : '🔴';
            return `${color} Cumulative P/L: ${prefix}${Math.abs(value).toFixed(2)}`;
          },
          afterLabel: function(context: any) {
            const currentIndex = context.dataIndex;
            if (currentIndex > 0) {
              const currentValue = context.raw;
              const previousValue = chartData.data[currentIndex - 1];
              const change = currentValue - previousValue;
              const changePrefix = change >= 0 ? '+$' : '-$';
              return `Trade P/L: ${changePrefix}${Math.abs(change).toFixed(2)}`;
            }
            return `Starting P/L: $${context.raw.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        border: {
          display: false
        },
        ticks: {
          font: {
            size: isMobile ? 11 : 13,
            weight: 'normal' as const
          },
          color: '#64748B',
          maxRotation: isMobile ? 45 : 0,
          minRotation: isMobile ? 45 : 0,
          padding: 8,
          callback: function(value: any, index: number, values: any[]) {
            if (isMobile) {
              return index % 2 === 0 ? value : '';
            }
            return value;
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          lineWidth: 1
        },
        border: {
          display: false
        },
        ticks: {
          font: {
            size: isMobile ? 11 : 13,
            weight: 'normal' as const
          },
          color: '#64748B',
          padding: 12,
          callback: function(value: any) {
            const numValue = Number(value);
            if (numValue >= 0) {
              return `+$${numValue.toFixed(0)}`;
            } else {
              return `-$${Math.abs(numValue).toFixed(0)}`;
            }
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.3
      },
      point: {
        radius: isMobile ? 3 : 4,
        hoverRadius: isMobile ? 5 : 6
      }
    }
  };

  // Create dynamic colors based on profit/loss
  const lineChartData = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Cumulative Profit/Loss',
        data: chartData.data,
        borderColor: (context: any) => {
          const value = context.parsed?.y || 0;
          return value >= 0 ? '#10B981' : '#EF4444'; // green for profit, red for loss
        },
        backgroundColor: (context: any) => {
          const chart = context.chart;
          const {ctx, chartArea} = chart;

          if (!chartArea) return null;

          // Create gradient based on current value
          const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          const currentValue = chartData.data[chartData.data.length - 1] || 0;

          if (currentValue >= 0) {
            gradient.addColorStop(0, 'rgba(16, 185, 129, 0.1)'); // emerald with opacity
            gradient.addColorStop(1, 'rgba(16, 185, 129, 0.3)');
          } else {
            gradient.addColorStop(0, 'rgba(239, 68, 68, 0.1)'); // red with opacity
            gradient.addColorStop(1, 'rgba(239, 68, 68, 0.3)');
          }

          return gradient;
        },
        borderWidth: 3,
        fill: true,
        pointBackgroundColor: chartData.data.map(value => value >= 0 ? '#10B981' : '#EF4444'),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.4,
        segment: {
          borderColor: (ctx: any) => {
            const currentValue = ctx.p1.parsed.y;
            const previousValue = ctx.p0.parsed.y;

            if (currentValue >= previousValue) {
              return currentValue >= 0 ? '#10B981' : '#F59E0B'; // green or amber
            } else {
              return '#EF4444'; // red for declining
            }
          }
        }
      }
    ]
  };

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1">
          <label className="block text-xs sm:text-sm font-medium text-slate-800 mb-1">
            <FiFilter className="inline mr-1" /> Time Period
          </label>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="w-full p-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="3m">Last 3 months</option>
            <option value="6m">Last 6 months</option>
            <option value="1y">Last year</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs sm:text-sm font-medium text-slate-800 mb-1">
            <FiFilter className="inline mr-1" /> Profit/Loss
          </label>
          <select
            value={profitLossFilter}
            onChange={(e) => setProfitLossFilter(e.target.value)}
            className="w-full p-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
          >
            <option value="all">All Trades</option>
            <option value="profit">Profitable Only</option>
            <option value="loss">Losses Only</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      {chartData.labels.length > 0 ? (
        <div className="h-64 md:h-72">
          <Line options={options} data={lineChartData} />
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-slate-700 font-medium">
          No data available for the selected filters
        </div>
      )}
    </div>
  );
};

export default ProgressTracker;
