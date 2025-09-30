'use client';

import React, { useState } from 'react';
import { FiSearch, FiX } from 'react-icons/fi';
import { useSession } from 'next-auth/react';

interface AdvancedSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdvancedSearch({ isOpen, onClose }: AdvancedSearchProps) {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-20">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Advanced Search</h2>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          {/* Search Input */}
          <div className="relative mb-4">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search functionality coming soon..."
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800"
              autoFocus
              disabled
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          <FiSearch className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Advanced Search Coming Soon</h3>
          <p className="text-slate-500 mb-4">
            We're working on bringing you powerful search capabilities across your trades, journal entries, and strategies.
          </p>
          <div className="text-sm text-slate-400 space-y-1">
            <p>• Search across all your trading data</p>
            <p>• Filter by date, market, and performance</p>
            <p>• Find specific journal entries and strategies</p>
          </div>
        </div>
      </div>
    </div>
  );
}
