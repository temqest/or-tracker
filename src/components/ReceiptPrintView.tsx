'use client';

import React from 'react';
import { ReceiptRecord } from '../types/receipt';
import { formatCurrency, formatDate } from '../lib/formatters';
import { Printer, X } from 'lucide-react';

interface ReceiptPrintViewProps {
  receipt: ReceiptRecord | null;
  onClose: () => void;
}

export const ReceiptPrintView: React.FC<ReceiptPrintViewProps> = ({
  receipt,
  onClose
}) => {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 print:p-0 print:bg-white print:static">
      <div className="bg-white rounded-2xl shadow-2xl border border-black/10 w-full max-w-xl overflow-hidden print:border-none print:shadow-none print:w-full print:max-w-none">
        {/* Top Bar */}
        <div className="bg-neutral-900 text-white px-5 py-3.5 flex items-center justify-between print:hidden">
          <span className="text-xs font-medium text-neutral-300">Official Receipt Preview</span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-[#007AFF] hover:bg-[#0062CC] text-white rounded-full text-xs font-semibold flex items-center space-x-1.5 transition cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-full text-xs font-medium transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

        {/* Printable Document */}
        <div className="p-8 text-neutral-900 bg-white font-sans text-xs print:p-4">
          {/* Header */}
          <div className="text-center pb-4 border-b border-neutral-200">
            <h1 className="text-lg font-bold tracking-tight uppercase text-neutral-900">
              OFFICIAL RECEIPT
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Branch: <span className="font-semibold text-neutral-800">{receipt.branch}</span>
            </p>
          </div>

          {/* Key Reference Grid */}
          <div className="py-4 grid grid-cols-2 gap-4 border-b border-neutral-200">
            <div>
              <div className="text-[10px] text-neutral-400 font-semibold uppercase">OR-Number</div>
              <div className="text-sm font-mono font-bold text-neutral-900">{receipt.orNumber}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-neutral-400 font-semibold uppercase">Assessment No</div>
              <div className="text-sm font-mono font-bold text-neutral-900">{receipt.assessmentNo}</div>
            </div>
            <div>
              <div className="text-[10px] text-neutral-400 font-semibold uppercase">Date</div>
              <div className="font-semibold text-neutral-800">{formatDate(receipt.date)}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-neutral-400 font-semibold uppercase">Status</div>
              <div className="font-semibold text-neutral-800">{receipt.status}</div>
            </div>
          </div>

          {/* Payor & Case */}
          <div className="py-4 space-y-2 border-b border-neutral-200">
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Name of Payor:</span>
              <span className="font-semibold text-neutral-900">{receipt.payorName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Case No.:</span>
              <span className="font-mono font-semibold text-neutral-900">{receipt.caseNo}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-neutral-400">Branch:</span>
              <span className="text-neutral-800">{receipt.branch}</span>
            </div>
          </div>

          {/* Amount Box */}
          <div className="py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50 p-4 rounded-xl mt-3">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-600">Total Amount:</span>
            <span className="text-xl font-mono font-bold text-neutral-900">
              {formatCurrency(receipt.amount)}
            </span>
          </div>

          {/* Remarks */}
          <div className="pt-4 text-xs">
            <div className="text-[10px] font-semibold uppercase text-neutral-400 mb-1">Remarks:</div>
            <p className="text-neutral-700 bg-neutral-50 p-3 rounded-xl border border-neutral-200">
              {receipt.remarks || 'None.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
