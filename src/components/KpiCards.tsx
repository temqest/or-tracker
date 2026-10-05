'use client';

import React from 'react';
import { ReceiptRecord } from '../types/receipt';
import { formatCurrency } from '../lib/formatters';
import { ArrowUpRight } from 'lucide-react';

interface KpiCardsProps {
  receipts: ReceiptRecord[];
}

export const KpiCards: React.FC<KpiCardsProps> = ({ receipts }) => {
  const totalAmount = receipts.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  
  const clearedReceipts = receipts.filter(r => r.status === 'Cleared' || r.status === 'Paid');
  const clearedAmount = clearedReceipts.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  
  const pendingReceipts = receipts.filter(r => r.status === 'Pending');
  const pendingAmount = pendingReceipts.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
      {/* Card 1: Total Collections */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Total Collections
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 tracking-tight mt-1.5 truncate" title={formatCurrency(totalAmount)}>
              {formatCurrency(totalAmount)}
            </div>
          </div>
          {/* Sparkline */}
          <div className="w-14 h-7 text-[#4361EE] shrink-0 mt-1">
            <svg viewBox="0 0 56 28" className="w-full h-full stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 2 20 Q 14 26 22 14 T 38 12 T 54 4" />
            </svg>
          </div>
        </div>
        <div className="mt-4 pt-2 border-t border-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">All receipts</span>
          <span className="inline-flex items-center text-emerald-600 font-semibold text-[11px] bg-emerald-50 px-1.5 py-0.5 rounded-md">
            +18.4% <ArrowUpRight className="w-3 h-3 ml-0.5" />
          </span>
        </div>
      </div>

      {/* Card 2: Official Receipts */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Official Receipts
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 tracking-tight mt-1.5">
              {receipts.length}
            </div>
          </div>
          {/* Sparkline */}
          <div className="w-14 h-7 text-sky-500 shrink-0 mt-1">
            <svg viewBox="0 0 56 28" className="w-full h-full stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 2 18 Q 12 8 24 20 T 42 8 T 54 6" />
            </svg>
          </div>
        </div>
        <div className="mt-4 pt-2 border-t border-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">Active records</span>
          <span className="inline-flex items-center text-sky-600 font-semibold text-[11px] bg-sky-50 px-1.5 py-0.5 rounded-md">
            +4.1% <ArrowUpRight className="w-3 h-3 ml-0.5" />
          </span>
        </div>
      </div>

      {/* Card 3: Cleared & Settled */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Cleared &amp; Settled
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 tracking-tight mt-1.5 truncate" title={formatCurrency(clearedAmount)}>
              {formatCurrency(clearedAmount)}
            </div>
          </div>
          {/* Sparkline */}
          <div className="w-14 h-7 text-emerald-500 shrink-0 mt-1">
            <svg viewBox="0 0 56 28" className="w-full h-full stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 2 22 Q 14 16 24 10 T 42 8 T 54 4" />
            </svg>
          </div>
        </div>
        <div className="mt-4 pt-2 border-t border-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">{clearedReceipts.length} settled</span>
          <span className="inline-flex items-center text-emerald-600 font-semibold text-[11px] bg-emerald-50 px-1.5 py-0.5 rounded-md">
            {totalAmount > 0 ? Math.round((clearedAmount / totalAmount) * 100) : 0}% <ArrowUpRight className="w-3 h-3 ml-0.5" />
          </span>
        </div>
      </div>

      {/* Card 4: Pending Reviews */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Pending Reviews
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 tracking-tight mt-1.5 truncate" title={formatCurrency(pendingAmount)}>
              {formatCurrency(pendingAmount)}
            </div>
          </div>
          {/* Sparkline */}
          <div className="w-14 h-7 text-amber-500 shrink-0 mt-1">
            <svg viewBox="0 0 56 28" className="w-full h-full stroke-current fill-none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 2 6 Q 14 20 26 16 T 40 18 T 54 10" />
            </svg>
          </div>
        </div>
        <div className="mt-4 pt-2 border-t border-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">{pendingReceipts.length} awaiting</span>
          <span className="inline-flex items-center text-amber-600 font-semibold text-[11px] bg-amber-50 px-1.5 py-0.5 rounded-md">
            Review
          </span>
        </div>
      </div>
    </div>
  );
};
