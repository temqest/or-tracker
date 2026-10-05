'use client';

import React, { useState } from 'react';
import { FilterOptions } from '../types/receipt';
import { BRANCH_OPTIONS, STATUS_OPTIONS } from '../data/sampleReceipts';
import { 
  Search, 
  X, 
  Calendar, 
  RotateCcw
} from 'lucide-react';

interface FilterToolbarProps {
  filters: FilterOptions;
  onFilterChange: (newFilters: FilterOptions) => void;
  onResetFilters: () => void;
  resultCount: number;
  totalCount: number;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  resultCount,
  totalCount
}) => {
  const [showDatePanel, setShowDatePanel] = useState(false);

  const hasActiveFilters = 
    Boolean(filters.searchQuery) ||
    filters.branch !== 'All Branches' ||
    filters.status !== 'All Statuses' ||
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, searchQuery: e.target.value });
  };

  const handleStatusSegment = (status: string) => {
    onFilterChange({ ...filters, status });
  };

  return (
    <div className="space-y-3.5 mb-4">
      {/* Top Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Field */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            placeholder="Search OR-Number, Assessment No, Payor, Case No..."
            value={filters.searchQuery}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-slate-900 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-[#4361EE] focus:outline-none focus:ring-2 focus:ring-[#4361EE]/15 transition"
          />
          {filters.searchQuery && (
            <button
              onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Branch Selector */}
        <select
          value={filters.branch}
          onChange={(e) => onFilterChange({ ...filters, branch: e.target.value })}
          aria-label="Filter by branch"
          className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-medium focus:outline-none focus:border-[#4361EE] focus:ring-2 focus:ring-[#4361EE]/15 cursor-pointer shadow-2xs"
        >
          {BRANCH_OPTIONS.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        {/* Date Filter Button */}
        <button
          type="button"
          onClick={() => setShowDatePanel(!showDatePanel)}
          className={`inline-flex items-center space-x-1.5 text-xs px-3.5 py-2 rounded-xl font-medium transition cursor-pointer border ${
            showDatePanel || Boolean(filters.dateFrom || filters.dateTo)
              ? 'bg-[#EEF2FF] border-[#4361EE]/30 text-[#4361EE]'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Date</span>
          {(filters.dateFrom || filters.dateTo) && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#4361EE]" />
          )}
        </button>

        {/* Reset */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center space-x-1 text-xs px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Status Segmented Buttons */}
      <div className="flex items-center justify-between gap-3 pt-0.5">
        <div className="inline-flex p-1 bg-slate-100 rounded-xl space-x-1 text-xs">
          {STATUS_OPTIONS.map((status) => {
            const isSelected = filters.status === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => handleStatusSegment(status)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {status === 'All Statuses' ? 'All' : status}
              </button>
            );
          })}
        </div>

        <div className="text-xs text-slate-400 font-medium">
          Showing {resultCount} of {totalCount} records
        </div>
      </div>

      {/* Expandable Date Drawer */}
      {showDatePanel && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs animate-in fade-in duration-100">
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Date From
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => onFilterChange({ ...filters, dateFrom: e.target.value })}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#4361EE]"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-slate-500 block mb-1">
              Date To
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => onFilterChange({ ...filters, dateTo: e.target.value })}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:border-[#4361EE]"
            />
          </div>
        </div>
      )}
    </div>
  );
};
