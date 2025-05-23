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

  // Use window.innerWidth to determine if we're on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          boxWidth: isMobile ? 8 : 10,
          boxHeight: isMobile ? 8 : 10,
          font: {
            size: isMobile ? 10 : 12
          }
        }
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
            return `Profit/Loss: ${context.raw.toFixed(2)}`;
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
          minRotation: isMobile ? 45 : 0,
          // Show fewer labels on mobile
          callback: function(value: any, index: number, values: any[]) {
            if (isMobile) {
              return index % 2 === 0 ? this.getLabelForValue(value) : '';
            }
            return this.getLabelForValue(value);
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        },
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.3 // Smoother curve
      },
      point: {
        radius: isMobile ? 3 : 4,
        hoverRadius: isMobile ? 5 : 6
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

  // Use useEffect to handle window resize events for responsive charts
  const [windowWidth, setWindowWidth] = React.useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );

  React.useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="h-64 md:h-72">
      <Line options={options} data={data} />
    </div>
  );
};

export default TradePerformanceChart;
