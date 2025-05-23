'use client';

import React, { useState, useEffect } from 'react';
import ReactCalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { Tooltip } from 'react-tooltip';
import { subDays, format, startOfYear, endOfYear } from 'date-fns';

interface ActivityData {
  date: string;
  count: number;
}

interface StreakHeatmapProps {
  userId: string;
  year?: number;
}

const StreakHeatmap: React.FC<StreakHeatmapProps> = ({ userId, year = new Date().getFullYear() }) => {
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would fetch data from your API
    const fetchActivityData = async () => {
      setLoading(true);
      
      // For demo purposes, we'll generate random activity data
      const startDate = startOfYear(new Date(year, 0, 1));
      const endDate = endOfYear(new Date(year, 0, 1));
      const today = new Date();
      
      // Generate random activity for the past year
      const data: ActivityData[] = [];
      let currentDate = startDate;
      
      while (currentDate <= endDate && currentDate <= today) {
        // Higher probability of activity on weekdays
        const isWeekday = currentDate.getDay() > 0 && currentDate.getDay() < 6;
        const randomFactor = isWeekday ? 0.7 : 0.3;
        
        // Random activity level (0-4)
        if (Math.random() < randomFactor) {
          const count = Math.floor(Math.random() * 5);
          if (count > 0) {
            data.push({
              date: format(currentDate, 'yyyy-MM-dd'),
              count
            });
          }
        }
        
        // Move to next day
        currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
      }
      
      setActivityData(data);
      setLoading(false);
    };
    
    fetchActivityData();
  }, [userId, year]);

  const getTooltipDataAttrs = (value: { date: string; count: number }) => {
    if (!value || !value.date) {
      return { 'data-tooltip-id': 'heatmap-tooltip' };
    }
    
    const dateFormatted = new Date(value.date).toLocaleDateString();
    const count = value.count || 0;
    
    return {
      'data-tooltip-id': 'heatmap-tooltip',
      'data-tooltip-content': `${dateFormatted}: ${count} ${count === 1 ? 'activity' : 'activities'}`
    };
  };

  const getClassForValue = (value: { date: string; count: number }) => {
    if (!value || !value.count) {
      return 'color-empty';
    }
    
    // Scale from 1-4
    return `color-scale-${Math.min(value.count, 4)}`;
  };

  if (loading) {
    return <div className="h-24 flex items-center justify-center">Loading activity data...</div>;
  }

  return (
    <div className="streak-heatmap">
      <style jsx>{`
        .streak-heatmap {
          margin-bottom: 1rem;
        }
        
        :global(.react-calendar-heatmap) {
          width: 100%;
        }
        
        :global(.react-calendar-heatmap .color-empty) {
          fill: #ebedf0;
        }
        
        :global(.react-calendar-heatmap .color-scale-1) {
          fill: #c6f6d5;
        }
        
        :global(.react-calendar-heatmap .color-scale-2) {
          fill: #9ae6b4;
        }
        
        :global(.react-calendar-heatmap .color-scale-3) {
          fill: #68d391;
        }
        
        :global(.react-calendar-heatmap .color-scale-4) {
          fill: #38a169;
        }
        
        :global(.react-calendar-heatmap rect:hover) {
          stroke: #555;
          stroke-width: 1px;
        }
      `}</style>
      
      <h3 className="text-lg font-semibold mb-2 text-slate-800">Activity Heatmap</h3>
      
      <ReactCalendarHeatmap
        startDate={startOfYear(new Date(year, 0, 1))}
        endDate={endOfYear(new Date(year, 0, 1))}
        values={activityData}
        classForValue={getClassForValue}
        tooltipDataAttrs={getTooltipDataAttrs}
        showWeekdayLabels
        titleForValue={(value) => value ? `${value.date}: ${value.count}` : ''}
      />
      
      <Tooltip id="heatmap-tooltip" />
      
      <div className="flex justify-end items-center mt-2 text-sm">
        <span className="text-slate-600 mr-2">Less</span>
        <div className="flex">
          <div className="w-3 h-3 bg-[#ebedf0]"></div>
          <div className="w-3 h-3 bg-[#c6f6d5]"></div>
          <div className="w-3 h-3 bg-[#9ae6b4]"></div>
          <div className="w-3 h-3 bg-[#68d391]"></div>
          <div className="w-3 h-3 bg-[#38a169]"></div>
        </div>
        <span className="text-slate-600 ml-2">More</span>
      </div>
    </div>
  );
};

export default StreakHeatmap;
