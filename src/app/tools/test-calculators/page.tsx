'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AppLayout from '@/components/AppLayout';
import { FiPlay, FiCheckCircle, FiXCircle, FiArrowLeft } from 'react-icons/fi';
import Link from 'next/link';
import { runCalculatorTests } from '@/utils/calculatorTests';

export default function TestCalculators() {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = () => {
    setIsRunning(true);
    setTestResults([]);

    // Capture console.log output
    const originalLog = console.log;
    const logs: string[] = [];
    
    console.log = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      logs.push(message);
      originalLog(...args);
    };

    try {
      runCalculatorTests();
      setTestResults(logs);
    } catch (error) {
      logs.push(`❌ Error running tests: ${error}`);
      setTestResults(logs);
    } finally {
      console.log = originalLog;
      setIsRunning(false);
    }
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-4">Please sign in to access calculator tests</h1>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link 
              href="/tools" 
              className="flex items-center text-slate-600 hover:text-slate-900 transition-colors"
            >
              <FiArrowLeft className="w-5 h-5 mr-2" />
              Back to Tools
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Calculator Tests</h1>
              <p className="text-slate-600 mt-2">
                Test the accuracy of all trading calculators
              </p>
            </div>
            <button
              onClick={runTests}
              disabled={isRunning}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <FiPlay className="w-4 h-4 mr-2" />
              {isRunning ? 'Running Tests...' : 'Run Tests'}
            </button>
          </div>

          {/* Test Results */}
          {testResults.length > 0 && (
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Test Results</h3>
              <div className="space-y-2 font-mono text-sm">
                {testResults.map((result, index) => (
                  <div 
                    key={index} 
                    className={`p-2 rounded ${
                      result.includes('✅') 
                        ? 'bg-green-100 text-green-800' 
                        : result.includes('❌') 
                        ? 'bg-red-100 text-red-800'
                        : result.includes('🧪') || result.includes('📊') || result.includes('📏') || result.includes('⚖️') || result.includes('💰') || result.includes('🔍')
                        ? 'bg-blue-100 text-blue-800 font-semibold'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {result}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Test Information */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">What We Test</h3>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-center">
                  <FiCheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  P&L Calculation Accuracy
                </li>
                <li className="flex items-center">
                  <FiCheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Position Size Calculations
                </li>
                <li className="flex items-center">
                  <FiCheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Risk/Reward Ratios
                </li>
                <li className="flex items-center">
                  <FiCheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Pip Value Calculations
                </li>
                <li className="flex items-center">
                  <FiCheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Trade Setup Validation
                </li>
              </ul>
            </div>

            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Recent Fixes</h3>
              <ul className="space-y-2 text-slate-600">
                <li className="flex items-center">
                  <FiCheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Fixed pip movement direction
                </li>
                <li className="flex items-center">
                  <FiCheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Improved currency conversion
                </li>
                <li className="flex items-center">
                  <FiCheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Corrected percentage calculations
                </li>
                <li className="flex items-center">
                  <FiCheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Enhanced position sizing logic
                </li>
                <li className="flex items-center">
                  <FiCheckCircle className="w-4 h-4 mr-2 text-green-500" />
                  Fixed break-even win rate formula
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
