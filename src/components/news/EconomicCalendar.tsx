'use client';

import React, { useState } from 'react';
import { EconomicEvent } from '@/lib/newsService';
import { FiClock, FiTrendingUp, FiTrendingDown, FiMinus, FiInfo, FiBarChart, FiGlobe } from 'react-icons/fi';
import { format, isToday, isTomorrow, parseISO } from 'date-fns';

interface EconomicCalendarProps {
  events: EconomicEvent[];
  onEventClick?: (event: EconomicEvent) => void;
}

export default function EconomicCalendar({ events, onEventClick }: EconomicCalendarProps) {
  const [selectedEvent, setSelectedEvent] = useState<EconomicEvent | null>(null);
  const [filterImpact, setFilterImpact] = useState<string>('all');
  const [filterCurrency, setFilterCurrency] = useState<string>('all');

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-gray-400';
      default:
        return 'bg-gray-300';
    }
  };

  const getImpactDots = (impact: string) => {
    const dots = [];
    const count = impact === 'high' ? 3 : impact === 'medium' ? 2 : 1;
    
    for (let i = 0; i < 3; i++) {
      dots.push(
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${
            i < count ? getImpactColor(impact) : 'bg-gray-200'
          }`}
        />
      );
    }
    return dots;
  };

  const getMovementIcon = (movement: string) => {
    switch (movement) {
      case 'bullish':
        return <FiTrendingUp className="w-3 h-3 text-green-600" />;
      case 'bearish':
        return <FiTrendingDown className="w-3 h-3 text-red-600" />;
      default:
        return <FiMinus className="w-3 h-3 text-gray-500" />;
    }
  };

  const getDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    return format(date, 'MMM d, yyyy');
  };

  const getActualColor = (actual: string, forecast: string, previous: string) => {
    if (!actual || !forecast) return 'text-gray-600';
    
    const actualNum = parseFloat(actual.replace(/[^\d.-]/g, ''));
    const forecastNum = parseFloat(forecast.replace(/[^\d.-]/g, ''));
    
    if (actualNum > forecastNum) return 'text-green-600 font-semibold';
    if (actualNum < forecastNum) return 'text-red-600 font-semibold';
    return 'text-gray-600';
  };

  const filteredEvents = events.filter(event => {
    if (filterImpact !== 'all' && event.impact !== filterImpact) return false;
    if (filterCurrency !== 'all' && event.currency !== filterCurrency) return false;
    return true;
  });

  const groupedEvents = filteredEvents.reduce((groups, event) => {
    const date = event.date;
    if (!groups[date]) groups[date] = [];
    groups[date].push(event);
    return groups;
  }, {} as Record<string, EconomicEvent[]>);

  const currencies = Array.from(new Set(events.map(e => e.currency))).sort();

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Impact:</label>
            <select
              value={filterImpact}
              onChange={(e) => setFilterImpact(e.target.value)}
              className="text-sm border border-slate-300 rounded px-2 py-1"
            >
              <option value="all">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-slate-700">Currency:</label>
            <select
              value={filterCurrency}
              onChange={(e) => setFilterCurrency(e.target.value)}
              className="text-sm border border-slate-300 rounded px-2 py-1"
            >
              <option value="all">All</option>
              {currencies.map(currency => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-1 text-xs text-slate-600">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
              </div>
              <span>High</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-600">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <div className="w-2 h-2 rounded-full bg-gray-200"></div>
              </div>
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-600">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                <div className="w-2 h-2 rounded-full bg-gray-200"></div>
                <div className="w-2 h-2 rounded-full bg-gray-200"></div>
              </div>
              <span>Low</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="space-y-4">
        {Object.entries(groupedEvents).map(([date, dayEvents]) => (
          <div key={date} className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            {/* Date Header */}
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                <FiClock className="w-4 h-4" />
                {getDateLabel(date)}
                <span className="text-sm font-normal text-slate-600">
                  ({dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''})
                </span>
              </h3>
            </div>

            {/* Events */}
            <div className="divide-y divide-slate-100">
              {dayEvents
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((event) => (
                <div
                  key={event.id}
                  onClick={() => {
                    setSelectedEvent(event);
                    onEventClick?.(event);
                  }}
                  className="p-4 hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-4">
                    {/* Time */}
                    <div className="w-16 text-sm font-medium text-slate-600">
                      {event.time}
                    </div>

                    {/* Impact */}
                    <div className="flex gap-1">
                      {getImpactDots(event.impact)}
                    </div>

                    {/* Currency Flag */}
                    <div className="w-8 h-6 bg-slate-100 rounded flex items-center justify-center text-xs font-bold text-slate-700">
                      {event.currency}
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-slate-900 truncate">
                          {event.title}
                        </h4>
                        {event.volatility >= 4 && (
                          <FiBarChart className="w-4 h-4 text-orange-500" title="High Volatility Expected" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 truncate">
                        {event.description}
                      </p>
                    </div>

                    {/* Data */}
                    <div className="flex items-center gap-6 text-sm">
                      {event.actual && (
                        <div className="text-center">
                          <div className="text-xs text-slate-500">Actual</div>
                          <div className={getActualColor(event.actual, event.forecast || '', event.previous || '')}>
                            {event.actual}
                          </div>
                        </div>
                      )}
                      
                      {event.forecast && (
                        <div className="text-center">
                          <div className="text-xs text-slate-500">Forecast</div>
                          <div className="text-slate-700">{event.forecast}</div>
                        </div>
                      )}
                      
                      {event.previous && (
                        <div className="text-center">
                          <div className="text-xs text-slate-500">Previous</div>
                          <div className="text-slate-600">{event.previous}</div>
                        </div>
                      )}
                    </div>

                    {/* Market Impact */}
                    {event.marketImpact && event.marketImpact.length > 0 && (
                      <div className="flex items-center gap-1">
                        {event.marketImpact.slice(0, 3).map((impact, index) => (
                          <div key={index} className="flex items-center gap-1">
                            <span className="text-xs font-medium text-slate-600">
                              {impact.currency}
                            </span>
                            {getMovementIcon(impact.expectedMovement)}
                          </div>
                        ))}
                      </div>
                    )}

                    <FiInfo className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {Object.keys(groupedEvents).length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-slate-200">
          <FiGlobe className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">No events found</h3>
          <p className="text-slate-600">
            Try adjusting your filters to see more events.
          </p>
        </div>
      )}
    </div>
  );
}
