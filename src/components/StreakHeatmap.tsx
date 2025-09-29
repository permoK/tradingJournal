'use client';

import React, { useState, useEffect } from 'react';
import { format, addDays, startOfWeek, subMonths, parseISO } from 'date-fns';
import { useActivityLogs } from '@/lib/hooks';
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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedActivities, setSelectedActivities] = useState<Activity[]>([]);

  const { activities, loading } = useActivityLogs(userId);

  useEffect(() => {
    if (!activities.length) {
      setActivityData([]);
      return;
    }

    // Group activities by date
    const groupedByDate = activities.reduce((acc, activity) => {
      const dateStr = activity.activity_date;
      if (!acc[dateStr]) {
        acc[dateStr] = [];
      }

      // Convert database activity to component format
      let timeString = 'Unknown';
      try {
        const parsedDate = parseISO(activity.created_at);
        if (!isNaN(parsedDate.getTime())) {
          timeString = format(parsedDate, 'HH:mm');
        }
      } catch {
        timeString = 'Unknown';
      }

      acc[dateStr].push({
        id: activity.id,
        type: activity.activity_type,
        title: activity.activity_title,
        time: timeString
      });

      return acc;
    }, {} as Record<string, Activity[]>);

    // Convert to ActivityData format
    const data: ActivityData[] = Object.entries(groupedByDate).map(([date, dateActivities]) => {
      const activities = dateActivities as Activity[];
      return {
        date,
        count: activities.length,
        activities
      };
    });

    setActivityData(data);
  }, [activities]);

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
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    for (let d = 0; d < days; d++) {
      const day = addDays(startDay, d);
      dayLabels.push(
        <div key={`label-${d}`} className="text-[10px] sm:text-xs text-slate-600 h-3 sm:h-4 flex items-center justify-start w-3 sm:w-4 pr-1 sm:pr-2">
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
            className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${bgColor} ${border} rounded-sm m-[1px] cursor-pointer hover:ring-1 hover:ring-slate-400 transition-all`}
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
        <div className="flex mb-1 ml-5 sm:ml-6">
          {monthLabels.map((label, index) => (
            <div
              key={`month-${index}`}
              className="text-[10px] sm:text-xs text-slate-600"
              style={{
                position: 'absolute',
                left: `${label.position * (window.innerWidth < 640 ? 14 : 16) + 20}px`
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
      <div className="mt-4 bg-white p-3 sm:p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="flex items-center mb-2 sm:mb-3">
          <div className="w-1 h-5 sm:h-6 bg-indigo-600 rounded-full mr-2"></div>
          <h4 className="font-semibold text-slate-900 text-sm sm:text-base">
            Activities on {(() => {
              try {
                const parsedDate = new Date(date);
                if (isNaN(parsedDate.getTime())) {
                  return 'Invalid date';
                }
                return format(parsedDate, window.innerWidth < 640 ? 'MMM d, yyyy' : 'MMMM d, yyyy');
              } catch {
                return 'Invalid date';
              }
            })()}
          </h4>
        </div>
        <ul className="space-y-2">
          {selectedActivities.map(activity => {
            let iconColor = 'text-indigo-700';
            let bgColor = 'bg-indigo-50';
            let borderColor = 'border-indigo-100';
            let icon = null;

            if (activity.type === 'learning') {
              icon = <FiBook className={`${iconColor} mr-1.5 sm:mr-2 text-xs sm:text-sm`} />;
            } else if (activity.type === 'trading') {
              iconColor = 'text-emerald-700';
              bgColor = 'bg-emerald-50';
              borderColor = 'border-emerald-100';
              icon = <FiBarChart2 className={`${iconColor} mr-1.5 sm:mr-2 text-xs sm:text-sm`} />;
            } else if (activity.type === 'journal') {
              iconColor = 'text-violet-700';
              bgColor = 'bg-violet-50';
              borderColor = 'border-violet-100';
              icon = <FiFileText className={`${iconColor} mr-1.5 sm:mr-2 text-xs sm:text-sm`} />;
            }

            return (
              <li
                key={activity.id}
                className={`${bgColor} p-1.5 sm:p-2 rounded-md flex justify-between items-center border ${borderColor} hover:shadow-sm transition-shadow`}
              >
                <div className="flex items-center">
                  {icon}
                  <span className="text-slate-900 font-medium text-xs sm:text-sm">{activity.title}</span>
                </div>
                <span className={`text-[10px] sm:text-xs ${iconColor} font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-white border ${borderColor}`}>
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

      <div className="bg-white p-3 sm:p-4 rounded-lg border border-slate-200 shadow-sm">
        <div className="overflow-x-auto relative">
          <div className="flex justify-start sm:justify-center w-full min-w-[500px]">
            {generateCalendarGrid()}
          </div>
        </div>

        <div className="flex justify-between sm:justify-end items-center mt-3 sm:mt-4 text-xs">
          <span className="text-slate-600 mr-1 sm:mr-2">Less</span>
          <div className="flex">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-slate-100 mr-[2px] sm:mr-[3px] border border-slate-200 rounded-sm"></div>
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-200 mr-[2px] sm:mr-[3px] border border-slate-200 rounded-sm"></div>
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-300 mr-[2px] sm:mr-[3px] border border-slate-200 rounded-sm"></div>
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-400 mr-[2px] sm:mr-[3px] border border-slate-200 rounded-sm"></div>
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-emerald-600 border border-slate-200 rounded-sm"></div>
          </div>
          <span className="text-slate-600 ml-1 sm:ml-2">More</span>
        </div>
      </div>

      {renderActivityDetails()}
    </div>
  );
};

export default StreakHeatmap;
