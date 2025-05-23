'use client';

import React, { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, subMonths, parseISO } from 'date-fns';
import { FiBook, FiBarChart2, FiFileText } from 'react-icons/fi';

interface Activity {
  id: string;
  type: 'learning' | 'trading' | 'journal';
  title: string;
  time: string;
}

interface ActivityData {
  date: string;
  count: number;
  activities: Activity[];
}

interface StreakHeatmapProps {
  userId: string;
}

const StreakHeatmap: React.FC<StreakHeatmapProps> = ({ userId }) => {
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // In a real app, this would fetch data from your API
    const fetchActivityData = async () => {
      setLoading(true);

      // For demo purposes, we'll generate random activity data for the last 3 months
      const endDate = new Date();
      const startDate = subMonths(endDate, 3);

      // Generate random activity
      const data: ActivityData[] = [];
      let currentDate = startDate;

      const activityTypes = ['learning', 'trading', 'journal'] as const;
      const learningTitles = [
        'Completed "Introduction to Deriv"',
        'Started "Technical Analysis Basics"',
        'Completed "Risk Management Strategies"',
        'Reviewed "Trading Psychology"'
      ];
      const tradingTitles = [
        'Recorded EUR/USD trade',
        'Closed BTC/USD position',
        'Opened Gold trade',
        'Updated trade journal'
      ];
      const journalTitles = [
        'Added new journal entry',
        'Updated trading reflections',
        'Documented market analysis',
        'Noted trading mistakes'
      ];

      while (currentDate <= endDate) {
        // Higher probability of activity on weekdays
        const isWeekday = currentDate.getDay() > 0 && currentDate.getDay() < 6;
        const randomFactor = isWeekday ? 0.7 : 0.3;

        // Random activity level (0-4)
        if (Math.random() < randomFactor) {
          const count = Math.floor(Math.random() * 4) + 1; // 1-4 activities
          const dateActivities: Activity[] = [];

          // Generate random activities for this day
          for (let i = 0; i < count; i++) {
            const typeIndex = Math.floor(Math.random() * activityTypes.length);
            const type = activityTypes[typeIndex];

            let title = '';
            if (type === 'learning') {
              title = learningTitles[Math.floor(Math.random() * learningTitles.length)];
            } else if (type === 'trading') {
              title = tradingTitles[Math.floor(Math.random() * tradingTitles.length)];
            } else {
              title = journalTitles[Math.floor(Math.random() * journalTitles.length)];
            }

            // Random time between 8am and 6pm
            const hour = 8 + Math.floor(Math.random() * 10);
            const minute = Math.floor(Math.random() * 60);
            const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;

            dateActivities.push({
              id: `activity-${format(currentDate, 'yyyyMMdd')}-${i}`,
              type,
              title,
              time: timeStr
            });
          }

          data.push({
            date: format(currentDate, 'yyyy-MM-dd'),
            count,
            activities: dateActivities
          });
        }

        // Move to next day
        currentDate = addDays(currentDate, 1);
      }

      setActivityData(data);
      setLoading(false);
    };

    fetchActivityData();
  }, [userId]);

  // Handle cell click
  const handleCellClick = (dateStr: string, activities: Activity[]) => {
    setSelectedDate(dateStr);
    setSelectedActivities(activities);
  };

  // Generate calendar grid
  const generateCalendarGrid = () => {
    const weeks = 53; // Show 53 weeks (approximately 1 year) like GitHub
    const days = 7;
    const today = new Date();
    const startDay = startOfWeek(subMonths(today, 12), { weekStartsOn: 1 }); // Start from Monday, 12 months ago

    const grid = [];

    // Generate day labels (Mon, Tue, etc.)
    const dayLabels = [];
    for (let d = 0; d < days; d++) {
      const day = addDays(startDay, d);
      dayLabels.push(
        <div key={`label-${d}`} className="text-xs text-slate-600 h-4 flex items-center justify-start w-4 pr-2">
          {format(day, 'EEE').charAt(0)}
        </div>
      );
    }

    // Generate the grid
    for (let w = 0; w < weeks; w++) {
      const weekCells = [];

      for (let d = 0; d < days; d++) {
        const date = addDays(startDay, d + w * 7);
        const dateStr = format(date, 'yyyy-MM-dd');
        const activityEntry = activityData.find(a => a.date === dateStr);
        const level = activityEntry ? Math.min(activityEntry.count, 4) : 0;
        const activities = activityEntry?.activities || [];

        // Determine color based on activity level
        let bgColor = 'bg-slate-100';
        if (level === 1) bgColor = 'bg-emerald-200';
        if (level === 2) bgColor = 'bg-emerald-300';
        if (level === 3) bgColor = 'bg-emerald-400';
        if (level === 4) bgColor = 'bg-emerald-600';

        const isToday = format(today, 'yyyy-MM-dd') === dateStr;
        const isSelected = selectedDate === dateStr;
        let border = 'border-0';

        if (isToday) {
          border = 'outline outline-1 outline-indigo-600';
        } else if (isSelected) {
          border = 'outline outline-1 outline-amber-500';
        }

        weekCells.push(
          <div
            key={`cell-${w}-${d}`}
            className={`w-3.5 h-3.5 ${bgColor} ${border} rounded-sm m-[1px] cursor-pointer hover:ring-1 hover:ring-slate-400 transition-all`}
            title={`${format(date, 'MMM d, yyyy')}: ${activities.length} activities`}
            onClick={() => handleCellClick(dateStr, activities)}
          />
        );
      }

      grid.push(
        <div key={`week-${w}`} className="flex flex-col gap-[1px]">
          {weekCells}
        </div>
      );
    }

    // Generate month labels
    const monthLabels = [];
    let currentMonth = '';
    let monthStartWeek = 0;

    for (let w = 0; w < weeks; w++) {
      const date = addDays(startDay, w * 7);
      const month = format(date, 'MMM');

      if (month !== currentMonth) {
        currentMonth = month;
        monthStartWeek = w;
        monthLabels.push({
          month,
          position: monthStartWeek
        });
      }
    }

    return (
      <div className="flex flex-col">
        {/* Month labels */}
        <div className="flex mb-1 ml-6">
          {monthLabels.map((label, index) => (
            <div
              key={`month-${index}`}
              className="text-xs text-slate-600"
              style={{
                position: 'absolute',
                left: `${label.position * 16 + 20}px`
              }}
            >
              {label.month}
            </div>
          ))}
        </div>

        {/* Day labels and grid */}
        <div className="flex mt-2 relative">
          <div className="flex flex-col mr-1 mt-1">
            {dayLabels}
          </div>
          <div className="flex gap-[1px]">
            {grid}
          </div>
        </div>
      </div>
    );
  };

  // Render activity details for selected date
  const renderActivityDetails = () => {
    if (!selectedDate || selectedActivities.length === 0) {
      return null;
    }

    const date = parseISO(selectedDate);

    return (
      <div className="mt-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center mb-3">
          <div className="w-1 h-6 bg-indigo-600 rounded-full mr-2"></div>
          <h4 className="font-semibold text-slate-900 text-base">
            Activities on {format(date, 'MMMM d, yyyy')}
          </h4>
        </div>
        <ul className="space-y-2">
          {selectedActivities.map(activity => {
            let iconColor = 'text-indigo-700';
            let bgColor = 'bg-indigo-50';
            let borderColor = 'border-indigo-100';
            let icon = null;

            if (activity.type === 'learning') {
              icon = <FiBook className={`${iconColor} mr-2 text-sm`} />;
            } else if (activity.type === 'trading') {
              iconColor = 'text-emerald-700';
              bgColor = 'bg-emerald-50';
              borderColor = 'border-emerald-100';
              icon = <FiBarChart2 className={`${iconColor} mr-2 text-sm`} />;
            } else if (activity.type === 'journal') {
              iconColor = 'text-violet-700';
              bgColor = 'bg-violet-50';
              borderColor = 'border-violet-100';
              icon = <FiFileText className={`${iconColor} mr-2 text-sm`} />;
            }

            return (
              <li
                key={activity.id}
                className={`${bgColor} p-2 rounded-md flex justify-between items-center border ${borderColor} hover:shadow-sm transition-shadow`}
              >
                <div className="flex items-center">
                  {icon}
                  <span className="text-slate-900 font-medium text-sm">{activity.title}</span>
                </div>
                <span className={`text-xs ${iconColor} font-semibold px-2 py-1 rounded-full bg-white border ${borderColor}`}>
                  {activity.time}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  if (loading) {
    return <div className="h-24 flex items-center justify-center text-slate-800 font-medium">Loading activity data...</div>;
  }

  return (
    <div className="streak-heatmap">
      <div className="flex items-center mb-4">
        <div className="w-1 h-6 bg-emerald-600 rounded-full mr-2"></div>
        <h3 className="text-lg font-semibold text-slate-900">Activity Heatmap</h3>
      </div>

      <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="overflow-x-auto relative">
          <div className="flex justify-center w-full">
            {generateCalendarGrid()}
          </div>
        </div>

        <div className="flex justify-end items-center mt-4 text-xs">
          <span className="text-slate-600 mr-2">Less</span>
          <div className="flex">
            <div className="w-3 h-3 bg-slate-100 mr-[3px] border border-slate-200 rounded-sm"></div>
            <div className="w-3 h-3 bg-emerald-200 mr-[3px] border border-slate-200 rounded-sm"></div>
            <div className="w-3 h-3 bg-emerald-300 mr-[3px] border border-slate-200 rounded-sm"></div>
            <div className="w-3 h-3 bg-emerald-400 mr-[3px] border border-slate-200 rounded-sm"></div>
            <div className="w-3 h-3 bg-emerald-600 border border-slate-200 rounded-sm"></div>
          </div>
          <span className="text-slate-600 ml-2">More</span>
        </div>
      </div>

      {renderActivityDetails()}
    </div>
  );
};

export default StreakHeatmap;
