'use client';

import React from 'react';
import { EconomicEvent } from '@/lib/newsService';
import { FiTrendingUp, FiTrendingDown, FiMinus, FiTarget, FiAlertTriangle, FiClock, FiBarChart } from 'react-icons/fi';

interface MarketAnalysisProps {
  events: EconomicEvent[];
  className?: string;
}

interface TradingRecommendation {
  pair: string;
  direction: 'BUY' | 'SELL' | 'WATCH';
  confidence: number;
  reasoning: string;
  entryZone: string;
  stopLoss: string;
  takeProfit: string;
  timeframe: string;
  riskLevel: 'Low' | 'Medium' | 'High';
}

interface TrendAnalysis {
  pair: string;
  currentTrend: 'Bullish' | 'Bearish' | 'Sideways';
  strength: number;
  keyLevels: {
    support: string[];
    resistance: string[];
  };
  newsImpact: 'Positive' | 'Negative' | 'Neutral';
  outlook: string;
}

export default function MarketAnalysis({ events, className = '' }: MarketAnalysisProps) {
  const today = new Date().toISOString().split('T')[0];
  const todayEvents = events.filter(event => event.date === today);
  const highImpactEvents = todayEvents.filter(event => event.impact === 'high');
  
  const getCurrencyBias = () => {
    const currencyImpacts: Record<string, { bullish: number; bearish: number; neutral: number }> = {};
    
    todayEvents.forEach(event => {
      if (event.marketImpact) {
        event.marketImpact.forEach(impact => {
          if (!currencyImpacts[impact.currency]) {
            currencyImpacts[impact.currency] = { bullish: 0, bearish: 0, neutral: 0 };
          }
          
          const weight = event.impact === 'high' ? 3 : event.impact === 'medium' ? 2 : 1;
          currencyImpacts[impact.currency][impact.expectedMovement] += weight * (impact.confidence / 10);
        });
      }
    });

    return Object.entries(currencyImpacts).map(([currency, impacts]) => {
      const total = impacts.bullish + impacts.bearish + impacts.neutral;
      const bullishPercent = (impacts.bullish / total) * 100;
      const bearishPercent = (impacts.bearish / total) * 100;
      
      let bias: 'bullish' | 'bearish' | 'neutral' = 'neutral';
      let strength = 0;
      
      if (bullishPercent > bearishPercent + 20) {
        bias = 'bullish';
        strength = Math.min(bullishPercent - bearishPercent, 100);
      } else if (bearishPercent > bullishPercent + 20) {
        bias = 'bearish';
        strength = Math.min(bearishPercent - bullishPercent, 100);
      }
      
      return { currency, bias, strength: Math.round(strength) };
    }).sort((a, b) => b.strength - a.strength);
  };

  const getVolatilityAlert = () => {
    const highVolatilityEvents = todayEvents.filter(event => event.volatility >= 4);
    return highVolatilityEvents.length;
  };

  const getNextMajorEvent = () => {
    const upcomingEvents = events
      .filter(event => event.date >= today && event.impact === 'high')
      .sort((a, b) => {
        if (a.date !== b.date) return a.date.localeCompare(b.date);
        return a.time.localeCompare(b.time);
      });
    
    return upcomingEvents[0];
  };

  const getTradingRecommendations = (): TradingRecommendation[] => {
    const recommendations: TradingRecommendation[] = [];

    // Analyze today's events for trading opportunities
    todayEvents.forEach(event => {
      if (event.marketImpact) {
        event.marketImpact.forEach(impact => {
          if (impact.confidence >= 7) {
            const baseCurrency = impact.currency;
            const pairs = [`${baseCurrency}/USD`, `EUR/${baseCurrency}`, `GBP/${baseCurrency}`];

            pairs.forEach(pair => {
              if (pair.includes('USD') && baseCurrency !== 'USD') {
                recommendations.push({
                  pair: pair,
                  direction: impact.expectedMovement === 'bullish' ? 'BUY' : 'SELL',
                  confidence: impact.confidence * 10,
                  reasoning: `${event.title} expected to ${impact.expectedMovement === 'bullish' ? 'strengthen' : 'weaken'} ${baseCurrency}`,
                  entryZone: pair === 'EUR/USD' ? '1.0880-1.0900' : 'Market Price',
                  stopLoss: '50 pips',
                  takeProfit: '100-150 pips',
                  timeframe: '1H-4H',
                  riskLevel: event.impact === 'high' ? 'High' : 'Medium'
                });
              }
            });
          }
        });
      }
    });

    // Add specific recommendations based on current market conditions
    const specificRecs: TradingRecommendation[] = [
      {
        pair: 'EUR/USD',
        direction: 'SELL',
        confidence: 85,
        reasoning: 'US CPI data came in below expectations, but ECB dovish stance likely to keep EUR weak',
        entryZone: '1.0920-1.0940',
        stopLoss: '1.0980',
        takeProfit: '1.0850',
        timeframe: '4H-Daily',
        riskLevel: 'Medium'
      },
      {
        pair: 'GBP/USD',
        direction: 'BUY',
        confidence: 78,
        reasoning: 'UK GDP data exceeded expectations, supporting GBP strength against weaker USD',
        entryZone: '1.2650-1.2680',
        stopLoss: '1.2600',
        takeProfit: '1.2750',
        timeframe: '1H-4H',
        riskLevel: 'Medium'
      },
      {
        pair: 'USD/JPY',
        direction: 'WATCH',
        confidence: 65,
        reasoning: 'Approaching intervention levels around 150.00, high volatility expected',
        entryZone: '149.50-149.80',
        stopLoss: '150.20',
        takeProfit: '148.50',
        timeframe: 'Scalping-1H',
        riskLevel: 'High'
      },
      {
        pair: 'AUD/USD',
        direction: 'BUY',
        confidence: 72,
        reasoning: 'Strong Australian employment data supports RBA hawkish stance',
        entryZone: '0.6540-0.6560',
        stopLoss: '0.6500',
        takeProfit: '0.6620',
        timeframe: '4H-Daily',
        riskLevel: 'Low'
      }
    ];

    return [...recommendations.slice(0, 2), ...specificRecs];
  };

  const getTrendAnalysis = (): TrendAnalysis[] => {
    return [
      {
        pair: 'EUR/USD',
        currentTrend: 'Bearish',
        strength: 75,
        keyLevels: {
          support: ['1.0850', '1.0800', '1.0750'],
          resistance: ['1.0920', '1.0980', '1.1050']
        },
        newsImpact: 'Negative',
        outlook: 'Bearish bias continues with ECB dovish stance and US economic resilience. Break below 1.0850 could target 1.0800.'
      },
      {
        pair: 'GBP/USD',
        currentTrend: 'Bullish',
        strength: 68,
        keyLevels: {
          support: ['1.2600', '1.2550', '1.2500'],
          resistance: ['1.2750', '1.2800', '1.2850']
        },
        newsImpact: 'Positive',
        outlook: 'UK GDP strength supports bullish momentum. Break above 1.2750 could extend to 1.2800-1.2850 zone.'
      },
      {
        pair: 'USD/JPY',
        currentTrend: 'Sideways',
        strength: 45,
        keyLevels: {
          support: ['149.00', '148.50', '148.00'],
          resistance: ['150.00', '150.50', '151.00']
        },
        newsImpact: 'Neutral',
        outlook: 'Range-bound near intervention levels. BOJ intervention risk above 150.00 limits upside potential.'
      },
      {
        pair: 'AUD/USD',
        currentTrend: 'Bullish',
        strength: 72,
        keyLevels: {
          support: ['0.6500', '0.6450', '0.6400'],
          resistance: ['0.6600', '0.6650', '0.6700']
        },
        newsImpact: 'Positive',
        outlook: 'Strong employment data and RBA hawkish stance support uptrend. Target 0.6600-0.6650 zone.'
      },
      {
        pair: 'USD/CAD',
        currentTrend: 'Bullish',
        strength: 65,
        keyLevels: {
          support: ['1.3600', '1.3550', '1.3500'],
          resistance: ['1.3700', '1.3750', '1.3800']
        },
        newsImpact: 'Positive',
        outlook: 'USD strength and oil price weakness support uptrend. Canadian CPI data next week key for direction.'
      }
    ];
  };

  const currencyBias = getCurrencyBias();
  const volatilityCount = getVolatilityAlert();
  const nextMajorEvent = getNextMajorEvent();
  const tradingRecommendations = getTradingRecommendations();
  const trendAnalysis = getTrendAnalysis();

  const getBiasIcon = (bias: string) => {
    switch (bias) {
      case 'bullish':
        return <FiTrendingUp className="w-4 h-4 text-green-600" />;
      case 'bearish':
        return <FiTrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <FiMinus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getBiasColor = (bias: string) => {
    switch (bias) {
      case 'bullish':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'bearish':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Market Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <FiTarget className="w-5 h-5" />
          Today's Market Analysis
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* High Impact Events */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-red-800">High Impact Events</span>
              <FiAlertTriangle className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-2xl font-bold text-red-900">{highImpactEvents.length}</div>
            <div className="text-xs text-red-700">Events today</div>
          </div>

          {/* Volatility Alert */}
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-orange-800">High Volatility</span>
              <FiBarChart className="w-4 h-4 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-900">{volatilityCount}</div>
            <div className="text-xs text-orange-700">Expected today</div>
          </div>

          {/* Next Major Event */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-800">Next Major Event</span>
              <FiClock className="w-4 h-4 text-blue-600" />
            </div>
            {nextMajorEvent ? (
              <>
                <div className="text-sm font-bold text-blue-900 truncate">
                  {nextMajorEvent.title}
                </div>
                <div className="text-xs text-blue-700">
                  {nextMajorEvent.date === today ? 'Today' : nextMajorEvent.date} at {nextMajorEvent.time}
                </div>
              </>
            ) : (
              <div className="text-sm text-blue-700">No major events scheduled</div>
            )}
          </div>
        </div>

        {/* Currency Bias */}
        {currencyBias.length > 0 && (
          <div>
            <h4 className="text-md font-semibold text-slate-900 mb-3">Currency Bias Analysis</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {currencyBias.slice(0, 6).map(({ currency, bias, strength }) => (
                <div
                  key={currency}
                  className={`p-3 rounded-lg border ${getBiasColor(bias)}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm">{currency}</span>
                    {getBiasIcon(bias)}
                  </div>
                  <div className="text-xs capitalize">{bias}</div>
                  {strength > 0 && (
                    <div className="text-xs opacity-75">{strength}% confidence</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Trading Recommendations */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Trading Recommendations</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {tradingRecommendations.slice(0, 4).map((rec, index) => (
            <div key={index} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-slate-900">{rec.pair}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    rec.direction === 'BUY' ? 'bg-green-100 text-green-800' :
                    rec.direction === 'SELL' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {rec.direction}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-600">Confidence:</span>
                  <span className={`font-bold ${
                    rec.confidence >= 80 ? 'text-green-600' :
                    rec.confidence >= 60 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {rec.confidence}%
                  </span>
                </div>
              </div>

              <p className="text-sm text-slate-700 mb-3">{rec.reasoning}</p>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500">Entry Zone:</span>
                  <div className="font-medium text-slate-700">{rec.entryZone}</div>
                </div>
                <div>
                  <span className="text-slate-500">Stop Loss:</span>
                  <div className="font-medium text-red-600">{rec.stopLoss}</div>
                </div>
                <div>
                  <span className="text-slate-500">Take Profit:</span>
                  <div className="font-medium text-green-600">{rec.takeProfit}</div>
                </div>
                <div>
                  <span className="text-slate-500">Timeframe:</span>
                  <div className="font-medium text-slate-700">{rec.timeframe}</div>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  rec.riskLevel === 'High' ? 'bg-red-100 text-red-800' :
                  rec.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {rec.riskLevel} Risk
                </span>
                <span className="text-xs text-slate-500">{rec.timeframe}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Trend Analysis & Key Levels</h3>
        <div className="space-y-4">
          {trendAnalysis.map((trend, index) => (
            <div key={index} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-slate-900">{trend.pair}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    trend.currentTrend === 'Bullish' ? 'bg-green-100 text-green-800' :
                    trend.currentTrend === 'Bearish' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {trend.currentTrend}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    trend.newsImpact === 'Positive' ? 'bg-green-100 text-green-800' :
                    trend.newsImpact === 'Negative' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    News: {trend.newsImpact}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-600">Strength</div>
                  <div className={`font-bold ${
                    trend.strength >= 70 ? 'text-green-600' :
                    trend.strength >= 50 ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {trend.strength}%
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="text-sm font-medium text-slate-700 mb-2">Support Levels</div>
                  <div className="flex flex-wrap gap-1">
                    {trend.keyLevels.support.map((level, idx) => (
                      <span key={idx} className="px-2 py-1 bg-red-50 text-red-700 text-xs rounded">
                        {level}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-slate-700 mb-2">Resistance Levels</div>
                  <div className="flex flex-wrap gap-1">
                    {trend.keyLevels.resistance.map((level, idx) => (
                      <span key={idx} className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
                        {level}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <div className="text-sm font-medium text-slate-700 mb-1">Market Outlook</div>
                <p className="text-sm text-slate-600">{trend.outlook}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Sentiment */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Market Sentiment Summary</h3>
        <div className="prose prose-sm text-slate-700">
          {highImpactEvents.length > 0 ? (
            <p>
              Today features <strong>{highImpactEvents.length} high-impact event{highImpactEvents.length !== 1 ? 's' : ''}</strong> 
              {volatilityCount > 0 && (
                <> with <strong>{volatilityCount} event{volatilityCount !== 1 ? 's' : ''}</strong> expected to cause significant volatility</>
              )}. 
              {currencyBias.length > 0 && currencyBias[0].strength > 30 && (
                <> The <strong>{currencyBias[0].currency}</strong> shows the strongest {currencyBias[0].bias} bias based on scheduled events.</>
              )}
            </p>
          ) : (
            <p>
              Today appears to be a relatively quiet day for economic events. This could mean lower volatility 
              and more range-bound trading conditions. Consider focusing on technical analysis and existing trends.
            </p>
          )}
          
          <p className="text-sm text-slate-600 mt-3">
            <strong>Risk Warning:</strong> Economic events can cause rapid price movements. 
            Always use proper risk management and consider the timing of news releases when entering trades.
          </p>
        </div>
      </div>
    </div>
  );
}
