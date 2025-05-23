'use client';

import React from 'react';
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

interface TradePerformanceChartProps {
  labels: string[];
  profitLossData: number[];
}

const TradePerformanceChart: React.FC<TradePerformanceChartProps> = ({
  labels,
  profitLossData
}) => {
  // Calculate cumulative profit/loss
  const cumulativeProfitLoss = profitLossData.reduce(
    (acc: number[], value: number, index: number) => {
      const prevValue = index > 0 ? acc[index - 1] : 0;
      acc.push(prevValue + value);
      return acc;
    },
    []
  );

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 14
        },
        bodyFont: {
          size: 13
        },
        cornerRadius: 4,
        callbacks: {
          label: function(context: any) {
            return `Profit/Loss: ${context.raw.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      }
    },
    elements: {
      line: {
        tension: 0.3 // Smoother curve
      },
      point: {
        radius: 4,
        hoverRadius: 6
      }
    }
  };

  const data = {
    labels,
    datasets: [
      {
        label: 'Cumulative Profit/Loss',
        data: cumulativeProfitLoss,
        borderColor: '#4F46E5', // indigo-600
        backgroundColor: 'rgba(79, 70, 229, 0.1)', // indigo-600 with opacity
        fill: true,
        pointBackgroundColor: '#4F46E5',
        pointBorderColor: '#fff',
        pointBorderWidth: 2
      }
    ]
  };

  return (
    <div className="h-64">
      <Line options={options} data={data} />
    </div>
  );
};

export default TradePerformanceChart;
