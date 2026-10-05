'use client';

import React from 'react';
import { ReceiptRecord, ReceiptStatus } from '../types/receipt';
import { formatCurrency, formatDate } from '../lib/formatters';
import { Printer, Edit3, Trash2 } from 'lucide-react';

interface ReceiptDetailModalProps {
  receipt: ReceiptRecord | null;
  onClose: () => void;
  onEdit: (receipt: ReceiptRecord) => void;
  onDelete: (receipt: ReceiptRecord) => void;
  onPrint: (receipt: ReceiptRecord) => void;
  onStatusChange: (receipt: ReceiptRecord, newStatus: ReceiptStatus) => void;
}

export const ReceiptDetailModal: React.FC<ReceiptDetailModalProps> = ({
  receipt,
  onClose,
  onEdit,
  onDelete,
  onPrint,
  onStatusChange
}) => {
  if (!receipt) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#F2F2F7] rounded-[24px] shadow-2xl border border-black/10 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* iOS Modal Header */}
        <div className="bg-white/80 backdrop-blur-md px-5 py-3.5 border-b border-black/5 flex items-center justify-between">
          <div className="text-xs font-mono text-neutral-400">
            {receipt.orNumber}
          </div>
          <div className="font-semibold text-sm text-neutral-900">
            Receipt Details
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold text-[#007AFF] hover:opacity-80 transition cursor-pointer"
          >
            Done
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3.5 overflow-y-auto flex-1">
          {/* Hero Amount Inset Card */}
          <div className="bg-white rounded-2xl p-4 border border-black/5 shadow-2xs text-center">
            <div className="text-xs text-neutral-400 font-medium">Total Amount</div>
            <div className="text-3xl font-bold font-mono text-neutral-900 mt-0.5">
              {formatCurrency(receipt.amount)}
            </div>
            <div className="mt-2 flex items-center justify-center">
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                receipt.status === 'Cleared'
                  ? 'bg-[#34C759]/10 text-[#28a745]'
                  : receipt.status === 'Paid'
                  ? 'bg-[#007AFF]/10 text-[#007AFF]'
                  : receipt.status === 'Pending'
                  ? 'bg-[#FF9500]/10 text-[#d97706]'
                  : 'bg-neutral-100 text-neutral-500'
              }`}>
                {receipt.status}
              </span>
            </div>
          </div>

          {/* Quick Status Segmented Picker */}
          <div className="bg-white rounded-2xl p-3 border border-black/5 shadow-2xs">
            <div className="text-[11px] font-medium text-neutral-400 mb-2">Change Status</div>
            <div className="grid grid-cols-4 gap-1 p-1 bg-neutral-100 rounded-xl text-xs">
              {(['Pending', 'Paid', 'Cleared', 'Cancelled'] as ReceiptStatus[]).map((s) => (
                <button
                  key={s}
                  onClick={() => onStatusChange(receipt, s)}
                  className={`py-1 rounded-lg font-medium transition cursor-pointer ${
                    receipt.status === s
                      ? 'bg-white text-black font-semibold shadow-xs'
                      : 'text-neutral-600 hover:text-black'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Information Inset List */}
          <div className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-2xs divide-y divide-black/[0.04] text-xs">
            <div className="p-3 flex items-center justify-between">
              <span className="text-neutral-400">OR-Number</span>
              <span className="font-mono font-semibold text-neutral-900">{receipt.orNumber}</span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-neutral-400">Assessment No</span>
              <span className="font-mono text-neutral-900">{receipt.assessmentNo}</span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-neutral-400">Date</span>
              <span className="text-neutral-900">{formatDate(receipt.date)}</span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-neutral-400">Name of Payor</span>
              <span className="font-medium text-neutral-900 text-right">{receipt.payorName}</span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-neutral-400">Case No.</span>
              <span className="font-mono text-neutral-900">{receipt.caseNo}</span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-neutral-400">Branch</span>
              <span className="text-neutral-900">{receipt.branch}</span>
            </div>
            <div className="p-3 flex flex-col gap-1">
              <span className="text-neutral-400">Remarks</span>
              <span className="text-neutral-700 whitespace-pre-wrap">{receipt.remarks || 'None'}</span>
            </div>
          </div>
        </div>

        {/* Action Bar Footer */}
        <div className="bg-white/80 backdrop-blur-md border-t border-black/5 px-5 py-3 flex items-center justify-between gap-2">
          <button
            onClick={() => onPrint(receipt)}
            className="px-3.5 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-xs font-medium text-neutral-800 flex items-center space-x-1.5 transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-neutral-600" />
            <span>Print</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onClose();
                onEdit(receipt);
              }}
              className="px-4 py-1.5 rounded-full bg-[#007AFF] hover:bg-[#0062CC] text-white text-xs font-medium flex items-center space-x-1.5 shadow-xs transition cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => {
                onClose();
                onDelete(receipt);
              }}
              className="p-1.5 rounded-full text-rose-600 hover:bg-rose-50 transition cursor-pointer"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
