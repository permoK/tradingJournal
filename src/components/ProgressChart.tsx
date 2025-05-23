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

interface ProgressChartProps {
  categories: string[];
  completedCounts: number[];
  inProgressCounts: number[];
  notStartedCounts: number[];
}

const ProgressChart: React.FC<ProgressChartProps> = ({
  categories,
  completedCounts,
  inProgressCounts,
  notStartedCounts
}) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
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
        cornerRadius: 4
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false
        }
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  const data = {
    labels: categories,
    datasets: [
      {
        label: 'Completed',
        data: completedCounts,
        backgroundColor: '#10B981', // emerald-500
        borderRadius: 4
      },
      {
        label: 'In Progress',
        data: inProgressCounts,
        backgroundColor: '#4F46E5', // indigo-600
        borderRadius: 4
      },
      {
        label: 'Not Started',
        data: notStartedCounts,
        backgroundColor: '#64748B', // slate-500
        borderRadius: 4
      }
    ]
  };

  return (
    <div className="h-64">
      <Bar options={options} data={data} />
    </div>
  );
};

export default ProgressChart;
