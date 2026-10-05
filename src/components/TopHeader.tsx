'use client';

import React from 'react';
import { Search, Bell, Plus, X } from 'lucide-react';

interface TopHeaderProps {
  title: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onNewReceipt: () => void;
  totalReceiptsCount: number;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title,
  searchQuery,
  onSearchChange,
  onNewReceipt,
  totalReceiptsCount
}) => {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          {title}
        </h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-3.5">
        {/* Search Bar */}
        <div className="relative w-64 md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            placeholder="Search anything here ..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-7 py-2 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-800 placeholder-slate-400 rounded-full border border-slate-200/80 focus:border-[#4361EE] focus:outline-none focus:ring-2 focus:ring-[#4361EE]/15 transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* New OR Button */}
        <button
          onClick={onNewReceipt}
          className="inline-flex items-center space-x-1.5 bg-[#4361EE] hover:bg-[#3A53D0] active:scale-95 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-sm shadow-[#4361EE]/25 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New OR</span>
        </button>

        {/* Notification Bell */}
        <button
          type="button"
          onClick={() => alert(`System has ${totalReceiptsCount} registered receipts.`)}
          className="relative p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </button>

        {/* User Profile Avatar */}
        <div className="pl-1 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#4361EE] to-sky-400 text-white font-bold text-xs flex items-center justify-center shadow-xs ring-2 ring-white">
            JD
          </div>
        </div>
      </div>
    </header>
  );
};
