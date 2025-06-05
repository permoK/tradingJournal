'use client';

import React from 'react';
import { FiFilter, FiX } from 'react-icons/fi';

export interface NewsFilters {
  category: string;
  importance: string;
  search: string;
}

interface NewsFiltersProps {
  filters: NewsFilters;
  onFiltersChange: (filters: NewsFilters) => void;
  onClearFilters: () => void;
}

export default function NewsFiltersComponent({ filters, onFiltersChange, onClearFilters }: NewsFiltersProps) {
  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'forex', label: 'Forex' },
    { value: 'economic', label: 'Economic Data' },
    { value: 'central-bank', label: 'Central Banks' },
    { value: 'market', label: 'Market News' },
    { value: 'general', label: 'General' },
  ];

  const importanceLevels = [
    { value: 'all', label: 'All Levels' },
    { value: 'high', label: 'High Impact' },
    { value: 'medium', label: 'Medium Impact' },
    { value: 'low', label: 'Low Impact' },
  ];

  const handleFilterChange = (key: keyof NewsFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters = filters.category !== 'all' || filters.importance !== 'all' || filters.search !== '';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FiFilter className="w-4 h-4 text-slate-600" />
          <h3 className="text-sm font-medium text-slate-900">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 transition-colors"
          >
            <FiX className="w-3 h-3" />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Search */}
        <div>
          <label htmlFor="search" className="block text-xs font-medium text-slate-700 mb-1">
            Search
          </label>
          <input
            type="text"
            id="search"
            placeholder="Search news..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        {/* Category */}
        <div>
          <label htmlFor="category" className="block text-xs font-medium text-slate-700 mb-1">
            Category
          </label>
          <select
            id="category"
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>

        {/* Importance */}
        <div>
          <label htmlFor="importance" className="block text-xs font-medium text-slate-700 mb-1">
            Impact Level
          </label>
          <select
            id="importance"
            value={filters.importance}
            onChange={(e) => handleFilterChange('importance', e.target.value)}
            className="w-full px-3 py-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {importanceLevels.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-600">Active filters:</span>
            
            {filters.category !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                {categories.find(c => c.value === filters.category)?.label}
                <button
                  onClick={() => handleFilterChange('category', 'all')}
                  className="hover:bg-indigo-200 rounded-full p-0.5"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.importance !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                {importanceLevels.find(l => l.value === filters.importance)?.label}
                <button
                  onClick={() => handleFilterChange('importance', 'all')}
                  className="hover:bg-yellow-200 rounded-full p-0.5"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}
            
            {filters.search && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                "{filters.search}"
                <button
                  onClick={() => handleFilterChange('search', '')}
                  className="hover:bg-green-200 rounded-full p-0.5"
                >
                  <FiX className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
