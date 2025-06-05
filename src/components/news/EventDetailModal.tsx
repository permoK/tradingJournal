'use client';

import React from 'react';
import { EconomicEvent } from '@/lib/newsService';
import { FiX, FiClock, FiGlobe, FiTrendingUp, FiTrendingDown, FiMinus, FiBarChart, FiInfo, FiTarget, FiBookOpen } from 'react-icons/fi';
import { format, parseISO } from 'date-fns';

interface EventDetailModalProps {
  event: EconomicEvent;
  onClose: () => void;
}

export default function EventDetailModal({ event, onClose }: EventDetailModalProps) {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getMovementIcon = (movement: string) => {
    switch (movement) {
      case 'bullish':
        return <FiTrendingUp className="w-4 h-4 text-green-600" />;
      case 'bearish':
        return <FiTrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <FiMinus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 8) return 'text-green-600 bg-green-50';
    if (confidence >= 6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getVolatilityBars = (volatility: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <div
        key={i}
        className={`w-2 h-4 rounded-sm ${
          i < volatility ? 'bg-orange-500' : 'bg-gray-200'
        }`}
      />
    ));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="w-12 h-8 bg-slate-100 rounded flex items-center justify-center text-sm font-bold text-slate-700">
              {event.currency}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{event.title}</h2>
              <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                <div className="flex items-center gap-1">
                  <FiGlobe className="w-4 h-4" />
                  {event.country}
                </div>
                <div className="flex items-center gap-1">
                  <FiClock className="w-4 h-4" />
                  {format(parseISO(event.date), 'MMM d, yyyy')} at {event.time}
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Impact Level */}
            <div className={`p-4 rounded-lg border ${getImpactColor(event.impact)}`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Impact Level</span>
                <FiTarget className="w-4 h-4" />
              </div>
              <div className="text-lg font-bold capitalize">{event.impact}</div>
            </div>

            {/* Volatility */}
            <div className="p-4 rounded-lg border border-orange-200 bg-orange-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-orange-800">Volatility</span>
                <FiBarChart className="w-4 h-4 text-orange-600" />
              </div>
              <div className="flex items-center gap-1">
                {getVolatilityBars(event.volatility)}
                <span className="ml-2 text-sm text-orange-700">{event.volatility}/5</span>
              </div>
            </div>

            {/* Frequency */}
            <div className="p-4 rounded-lg border border-blue-200 bg-blue-50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-800">Frequency</span>
                <FiClock className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-lg font-bold text-blue-900 capitalize">{event.frequency}</div>
            </div>
          </div>

          {/* Data Values */}
          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FiInfo className="w-5 h-5" />
              Economic Data
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {event.actual && (
                <div className="text-center p-3 bg-white rounded border">
                  <div className="text-sm text-slate-500 mb-1">Actual</div>
                  <div className="text-xl font-bold text-green-600">{event.actual}</div>
                </div>
              )}
              {event.forecast && (
                <div className="text-center p-3 bg-white rounded border">
                  <div className="text-sm text-slate-500 mb-1">Forecast</div>
                  <div className="text-xl font-bold text-slate-700">{event.forecast}</div>
                </div>
              )}
              {event.previous && (
                <div className="text-center p-3 bg-white rounded border">
                  <div className="text-sm text-slate-500 mb-1">Previous</div>
                  <div className="text-xl font-bold text-slate-600">{event.previous}</div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <FiBookOpen className="w-5 h-5" />
              Description
            </h3>
            <p className="text-slate-700 leading-relaxed">{event.description}</p>
            <div className="mt-3 text-sm text-slate-600">
              <strong>Source:</strong> {event.source}
              {event.unit && (
                <>
                  <span className="mx-2">•</span>
                  <strong>Unit:</strong> {event.unit}
                </>
              )}
            </div>
          </div>

          {/* Market Impact */}
          {event.marketImpact && event.marketImpact.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Expected Market Impact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {event.marketImpact.map((impact, index) => (
                  <div key={index} className="p-3 border border-slate-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900">{impact.currency}</span>
                        {getMovementIcon(impact.expectedMovement)}
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(impact.confidence)}`}>
                        {impact.confidence}/10
                      </span>
                    </div>
                    <div className="text-sm text-slate-600 capitalize">
                      {impact.expectedMovement} bias
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Market Relevance */}
          {event.marketRelevance && event.marketRelevance.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Market Relevance</h3>
              <div className="flex flex-wrap gap-2">
                {event.marketRelevance.map((market, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm font-medium rounded-full"
                  >
                    {market}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Trading Tips */}
          {event.tradingTips && event.tradingTips.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Trading Tips</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <ul className="space-y-2">
                  {event.tradingTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-blue-800">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Historical Data */}
          {event.historicalData && event.historicalData.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Recent Historical Data</h3>
              <div className="bg-slate-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {event.historicalData.slice(-3).map((data, index) => (
                    <div key={index} className="text-center p-3 bg-white rounded border">
                      <div className="text-sm text-slate-500 mb-1">
                        {format(parseISO(data.date), 'MMM yyyy')}
                      </div>
                      <div className="text-lg font-bold text-slate-700">{data.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Related Events */}
          {event.relatedEvents && event.relatedEvents.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Related Events</h3>
              <div className="flex flex-wrap gap-2">
                {event.relatedEvents.map((relatedEvent, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full border"
                  >
                    {relatedEvent}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
