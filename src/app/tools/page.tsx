'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import { FiGrid, FiDollarSign, FiTarget, FiTrendingUp, FiPieChart, FiArrowRight } from 'react-icons/fi';
import Link from 'next/link';

export default function ToolsPage() {
  const { user } = useAuth();

  const calculators = [
    {
      id: 'profit-loss',
      name: 'Profit & Loss Calculator',
      description: 'Calculate potential profit or loss before entering a trade. Supports Forex, Commodities, Indices, and Crypto.',
      icon: FiDollarSign,
      href: '/tools/profit-loss',
      color: 'emerald',
      features: ['Real-time P&L calculation', 'Multi-asset support', 'Pip value calculation', 'Risk percentage']
    },
    {
      id: 'position-size',
      name: 'Position Size Calculator',
      description: 'Determine the optimal position size based on your risk tolerance and account balance.',
      icon: FiPieChart,
      href: '/tools/position-size',
      color: 'blue',
      features: ['Risk-based sizing', 'Account balance protection', 'Stop loss integration', 'Multiple lot sizes']
    },
    {
      id: 'risk-reward',
      name: 'Risk/Reward Calculator',
      description: 'Analyze the risk-to-reward ratio of your trades to improve your trading strategy.',
      icon: FiTarget,
      href: '/tools/risk-reward',
      color: 'violet',
      features: ['R:R ratio calculation', 'Breakeven analysis', 'Win rate requirements', 'Strategy optimization']
    },
    {
      id: 'pip-value',
      name: 'Pip Value Calculator',
      description: 'Calculate the monetary value of each pip movement for different currency pairs and position sizes.',
      icon: FiTrendingUp,
      href: '/tools/pip-value',
      color: 'amber',
      features: ['Multi-currency support', 'Cross-pair calculations', 'Lot size variations', 'Real-time conversion']
    }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      emerald: {
        bg: 'bg-emerald-50',
        border: 'border-emerald-100',
        hover: 'hover:bg-emerald-100 hover:border-emerald-200',
        icon: 'text-emerald-700',
        text: 'text-emerald-800'
      },
      blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-100',
        hover: 'hover:bg-blue-100 hover:border-blue-200',
        icon: 'text-blue-700',
        text: 'text-blue-800'
      },
      violet: {
        bg: 'bg-violet-50',
        border: 'border-violet-100',
        hover: 'hover:bg-violet-100 hover:border-violet-200',
        icon: 'text-violet-700',
        text: 'text-violet-800'
      },
      amber: {
        bg: 'bg-amber-50',
        border: 'border-amber-100',
        hover: 'hover:bg-amber-100 hover:border-amber-200',
        icon: 'text-amber-700',
        text: 'text-amber-800'
      }
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <FiGrid className="text-indigo-600 mr-3 text-2xl" />
          <h1 className="text-3xl font-bold text-slate-900">Trading Tools</h1>
        </div>
        <p className="text-slate-700 text-lg">
          Professional trading calculators to help you make informed decisions and improve your trading accuracy.
        </p>
      </div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {calculators.map((calculator) => {
          const colors = getColorClasses(calculator.color);
          const IconComponent = calculator.icon;

          return (
            <Link
              key={calculator.id}
              href={calculator.href}
              className={`block p-6 rounded-lg border transition-all duration-200 ${colors.bg} ${colors.border} ${colors.hover} group`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${colors.bg} border ${colors.border}`}>
                    <IconComponent className={`text-xl ${colors.icon}`} />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-slate-900 group-hover:text-slate-800">
                      {calculator.name}
                    </h3>
                  </div>
                </div>
                <FiArrowRight className="text-slate-400 group-hover:text-slate-600 transition-colors" />
              </div>

              <p className="text-slate-700 mb-4 leading-relaxed">
                {calculator.description}
              </p>

              <div className="space-y-2">
                <h4 className="text-sm font-medium text-slate-800">Key Features:</h4>
                <ul className="grid grid-cols-2 gap-1">
                  {calculator.features.map((feature, index) => (
                    <li key={index} className="text-sm text-slate-600 flex items-center">
                      <div className={`w-1.5 h-1.5 rounded-full ${colors.bg} border ${colors.border} mr-2`}></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Development Tools */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-8">
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Development Tools</h3>
            <Link
              href="/tools/test-calculators"
              className="inline-flex items-center px-4 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 transition-colors"
            >
              Test Calculator Accuracy
              <FiArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Tips Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Trading Calculator Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-slate-800 mb-2">Before Every Trade</h3>
            <ul className="space-y-1 text-sm text-slate-600">
              <li>• Calculate your position size based on risk tolerance</li>
              <li>• Determine your profit/loss potential</li>
              <li>• Set appropriate stop loss and take profit levels</li>
              <li>• Verify the risk-to-reward ratio meets your criteria</li>
            </ul>
          </div>
          <div>
            <h3 className="font-medium text-slate-800 mb-2">Risk Management</h3>
            <ul className="space-y-1 text-sm text-slate-600">
              <li>• Never risk more than 1-2% of your account per trade</li>
              <li>• Use position sizing to control your exposure</li>
              <li>• Maintain consistent risk across all trades</li>
              <li>• Calculate pip values for accurate risk assessment</li>
            </ul>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
