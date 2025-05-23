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
  // Use window.innerWidth to determine if we're on mobile
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        align: 'center' as const,
        labels: {
          usePointStyle: true,
          padding: isMobile ? 10 : 20,
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
        displayColors: !isMobile
      }
    },
    scales: {
      x: {
        stacked: true,
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
        stacked: true,
        beginAtZero: true,
        ticks: {
          precision: 0,
          font: {
            size: isMobile ? 10 : 12
          }
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
      <Bar options={options} data={data} />
    </div>
  );
};

export default ProgressChart;
