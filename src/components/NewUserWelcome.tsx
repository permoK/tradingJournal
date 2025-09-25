'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FiBook, FiBarChart2, FiFileText, FiX, FiCheckCircle } from 'react-icons/fi';

interface NewUserWelcomeProps {
  onDismiss: () => void;
}

export default function NewUserWelcome({ onDismiss }: NewUserWelcomeProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Welcome to TradeFlow!",
      description: "Let's get you started on your trading journey. This quick tour will show you the main features.",
      icon: <FiCheckCircle className="h-8 w-8 text-green-500" />,
      action: null
    },
    {
      title: "Start Learning",
      description: "Begin with our structured learning modules to build your trading knowledge step by step.",
      icon: <FiBook className="h-8 w-8 text-indigo-500" />,
      action: {
        text: "Go to Learning",
        href: "/learning"
      }
    },
    {
      title: "Record Your Trades",
      description: "Track your trading performance and analyze your results to improve over time.",
      icon: <FiBarChart2 className="h-8 w-8 text-emerald-500" />,
      action: {
        text: "Record a Trade",
        href: "/trading/new"
      }
    },
    {
      title: "Keep a Journal",
      description: "Document your trading thoughts, strategies, and lessons learned to accelerate your growth.",
      icon: <FiFileText className="h-8 w-8 text-violet-500" />,
      action: {
        text: "Write Entry",
        href: "/journal/new"
      }
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onDismiss();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
        <button
          onClick={onDismiss}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <FiX className="h-5 w-5" />
        </button>

        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            {steps[currentStep].icon}
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {steps[currentStep].title}
          </h2>
          <p className="text-gray-600">
            {steps[currentStep].description}
          </p>
        </div>

        {steps[currentStep].action && (
          <div className="mb-6">
            <Link
              href={steps[currentStep].action!.href}
              onClick={onDismiss}
              className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {steps[currentStep].action!.text}
            </Link>
          </div>
        )}

        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full ${
                  index === currentStep ? 'bg-indigo-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextStep}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          </button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={onDismiss}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Skip tour
          </button>
        </div>
      </div>
    </div>
  );
}
