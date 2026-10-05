'use client';

import React from 'react';
import { ReceiptRecord } from '../types/receipt';
import { formatCurrency, formatDate } from '../lib/formatters';

interface RecentTransactionsCardProps {
  receipts: ReceiptRecord[];
  onView: (receipt: ReceiptRecord) => void;
  onViewAll: () => void;
}

export const RecentTransactionsCard: React.FC<RecentTransactionsCardProps> = ({
  receipts,
  onView,
  onViewAll
}) => {
  const recentReceipts = receipts.slice(0, 5);

  const getAvatarColors = (index: number) => {
    const colors = [
      'bg-indigo-50 text-indigo-700',
      'bg-emerald-50 text-emerald-700',
      'bg-sky-50 text-sky-700',
      'bg-amber-50 text-amber-700',
      'bg-purple-50 text-purple-700'
    ];
    return colors[index % colors.length];
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
          Recent Official Receipts
        </h3>
        <button
          onClick={onViewAll}
          className="text-xs font-semibold text-[#4361EE] hover:underline cursor-pointer"
        >
          View all
        </button>
      </div>

      {/* Transactions List */}
      <div className="space-y-3.5 divide-y divide-slate-50">
        {recentReceipts.map((receipt, idx) => {
          return (
            <div
              key={receipt.id}
              onClick={() => onView(receipt)}
              className="pt-3 first:pt-0 flex items-center justify-between gap-3 group cursor-pointer hover:bg-slate-50/80 -mx-2 px-2 py-1 rounded-xl transition"
            >
              {/* Left: Avatar + Payor info */}
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[11px] shrink-0 ${getAvatarColors(idx)}`}>
                  {getInitials(receipt.payorName)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-slate-900 truncate" title={receipt.payorName}>
                    {receipt.payorName}
                  </div>
                  <div className="text-[10px] font-mono text-slate-400 truncate">
                    {receipt.orNumber} &bull; {receipt.caseNo}
                  </div>
                </div>
              </div>

              {/* Right: Amount & Date */}
              <div className="text-right shrink-0">
                <div className="text-xs font-bold font-mono text-slate-900 tabular-nums">
                  {formatCurrency(receipt.amount)}
                </div>
                <div className="text-[10px] text-slate-400">
                  {formatDate(receipt.date)}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
