'use client';

import React from 'react';
import { ReceiptRecord } from '../types/receipt';
import { formatCurrency } from '../lib/formatters';

interface StatsCardsProps {
  receipts: ReceiptRecord[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ receipts }) => {
  const totalAmount = receipts.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  
  const clearedReceipts = receipts.filter(r => r.status === 'Cleared' || r.status === 'Paid');
  const clearedAmount = clearedReceipts.reduce((acc, curr) => acc + (curr.amount || 0), 0);
  
  const pendingReceipts = receipts.filter(r => r.status === 'Pending');
  const pendingAmount = pendingReceipts.reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-5">
      {/* Total Amount Card */}
      <div className="bg-white rounded-2xl p-4 border border-black/[0.04] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="text-[13px] font-medium text-neutral-500">
          Total Amount
        </div>
        <div className="text-2xl font-bold font-mono text-neutral-900 tracking-tight mt-1">
          {formatCurrency(totalAmount)}
        </div>
        <div className="text-xs text-neutral-400 mt-0.5">
          {receipts.length} total receipts
        </div>
      </div>

      {/* Cleared & Paid Card */}
      <div className="bg-white rounded-2xl p-4 border border-black/[0.04] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="text-[13px] font-medium text-emerald-600">
          Cleared &amp; Paid
        </div>
        <div className="text-2xl font-bold font-mono text-neutral-900 tracking-tight mt-1">
          {formatCurrency(clearedAmount)}
        </div>
        <div className="text-xs text-neutral-400 mt-0.5">
          {totalAmount > 0 ? Math.round((clearedAmount / totalAmount) * 100) : 0}% settled ({clearedReceipts.length} records)
        </div>
      </div>

      {/* Pending Card */}
      <div className="bg-white rounded-2xl p-4 border border-black/[0.04] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="text-[13px] font-medium text-amber-600">
          Pending
        </div>
        <div className="text-2xl font-bold font-mono text-neutral-900 tracking-tight mt-1">
          {formatCurrency(pendingAmount)}
        </div>
        <div className="text-xs text-neutral-400 mt-0.5">
          {pendingReceipts.length} awaiting settlement
        </div>
      </div>
    </div>
  );
};
