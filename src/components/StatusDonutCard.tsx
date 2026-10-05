'use client';

import React from 'react';
import { ReceiptRecord } from '../types/receipt';

interface StatusDonutCardProps {
  receipts: ReceiptRecord[];
}

export const StatusDonutCard: React.FC<StatusDonutCardProps> = ({ receipts }) => {
  const total = receipts.length;
  const clearedCount = receipts.filter(r => r.status === 'Cleared').length;
  const paidCount = receipts.filter(r => r.status === 'Paid').length;
  const pendingCount = receipts.filter(r => r.status === 'Pending').length;
  const cancelledCount = receipts.filter(r => r.status === 'Cancelled').length;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between h-full">
      <div className="text-sm font-bold text-slate-900 tracking-tight">
        Status Distribution
      </div>

      {/* Semi-Donut Gauge */}
      <div className="relative flex items-center justify-center my-auto py-2">
        <svg viewBox="0 0 200 120" className="w-48 h-28 overflow-visible">
          {/* Background Track */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#F1F5F9"
            strokeWidth="18"
            strokeLinecap="round"
          />
          {/* Cleared Segment */}
          <path
            d="M 20 100 A 80 80 0 0 1 100 20"
            fill="none"
            stroke="#4361EE"
            strokeWidth="18"
            strokeLinecap="round"
          />
          {/* Paid Segment */}
          <path
            d="M 100 20 A 80 80 0 0 1 145 35"
            fill="none"
            stroke="#38BDF8"
            strokeWidth="18"
            strokeLinecap="round"
          />
          {/* Pending Segment */}
          <path
            d="M 145 35 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="#FB923C"
            strokeWidth="18"
            strokeLinecap="round"
          />
        </svg>

        {/* Center Numbers */}
        <div className="absolute inset-x-0 bottom-1 text-center">
          <span className="text-[10px] font-semibold uppercase text-slate-400 block tracking-wider">
            Total Receipts
          </span>
          <span className="text-2xl font-bold font-mono text-slate-900 tracking-tight block">
            {total}
          </span>
        </div>
      </div>

      {/* Legend Row */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs">
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-[#4361EE]" />
          <span className="text-slate-600 text-[11px] font-medium">Cleared ({clearedCount})</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
          <span className="text-slate-600 text-[11px] font-medium">Paid ({paidCount})</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-[#FB923C]" />
          <span className="text-slate-600 text-[11px] font-medium">Pending ({pendingCount})</span>
        </div>
        {cancelledCount > 0 && (
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-300" />
            <span className="text-slate-600 text-[11px] font-medium">Cancelled ({cancelledCount})</span>
          </div>
        )}
      </div>
    </div>
  );
};
