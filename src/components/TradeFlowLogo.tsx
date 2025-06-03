'use client';

import React from 'react';

interface TradeFlowLogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon' | 'text';
  className?: string;
}

export default function TradeFlowLogo({ 
  size = 'md', 
  variant = 'full',
  className = '' 
}: TradeFlowLogoProps) {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-3xl'
  };

  // Icon component - represents flow/trading chart
  const LogoIcon = () => (
    <div className={`${sizeClasses[size]} aspect-square relative`}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Background circle */}
        <circle
          cx="16"
          cy="16"
          r="15"
          fill="url(#gradient)"
          stroke="#3B82F6"
          strokeWidth="1"
        />
        
        {/* Trading chart line representing "flow" */}
        <path
          d="M6 20 L10 16 L14 18 L18 12 L22 14 L26 8"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        
        {/* Data points */}
        <circle cx="10" cy="16" r="1.5" fill="white" />
        <circle cx="14" cy="18" r="1.5" fill="white" />
        <circle cx="18" cy="12" r="1.5" fill="white" />
        <circle cx="22" cy="14" r="1.5" fill="white" />
        
        {/* Gradient definition */}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );

  // Text component
  const LogoText = () => (
    <span className={`font-bold text-slate-900 ${textSizeClasses[size]} tracking-tight`}>
      Trade<span className="text-blue-600">Flow</span>
    </span>
  );

  if (variant === 'icon') {
    return <LogoIcon />;
  }

  if (variant === 'text') {
    return <LogoText />;
  }

  // Full logo (icon + text)
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LogoIcon />
      <LogoText />
    </div>
  );
}

// Alternative minimal logo for very small spaces
export function TradeFlowMini({ className = '' }: { className?: string }) {
  return (
    <div className={`w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center ${className}`}>
      <span className="text-white text-xs font-bold">TF</span>
    </div>
  );
}
