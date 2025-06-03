'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TradingPairsChartProps {
  pairData: Record<string, number>;
}

const TradingPairsChart: React.FC<TradingPairsChartProps> = ({ pairData }) => {
  // Sort pairs by trade count and take top 10
  const sortedPairs = Object.entries(pairData)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const labels = sortedPairs.map(([pair]) => pair);
  const data = sortedPairs.map(([, count]) => count);

  // Use window.innerWidth to determine if we're on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: isMobile ? 8 : 12,
        titleFont: {
          size: isMobile ? 12 : 14
        },
        bodyFont: {
          size: isMobile ? 11 : 13
        },
        cornerRadius: 4,
        callbacks: {
          label: function(context: any) {
            return `Trades: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          },
          maxRotation: isMobile ? 45 : 0,
          minRotation: isMobile ? 45 : 0
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          },
          stepSize: 1
        }
      }
    }
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Number of Trades',
        data,
        backgroundColor: 'rgba(16, 185, 129, 0.8)', // emerald-500 with opacity
        borderColor: '#10B981', // emerald-500
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      }
    ]
  };

  return (
    <div className="h-64 md:h-72">
      <Bar options={options} data={chartData} />
    </div>
  );
};

export default TradingPairsChart;
