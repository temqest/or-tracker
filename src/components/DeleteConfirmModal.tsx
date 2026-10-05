'use client';

import React from 'react';
import { ReceiptRecord } from '../types/receipt';
import { formatCurrency } from '../lib/formatters';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  receiptToDelete?: ReceiptRecord | null;
  bulkCount?: number;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  receiptToDelete,
  bulkCount
}) => {
  if (!isOpen) return null;

  const isBulk = Boolean(bulkCount && bulkCount > 1);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-[22px] shadow-2xl border border-black/10 w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-center">
        <div className="p-6">
          <h3 className="text-base font-semibold text-neutral-900">
            {isBulk ? `Delete ${bulkCount} Receipts?` : 'Delete Receipt?'}
          </h3>
          <p className="text-xs text-neutral-500 mt-2 leading-relaxed">
            {isBulk
              ? `Are you sure you want to permanently remove these ${bulkCount} receipts?`
              : `Are you sure you want to delete OR ${receiptToDelete?.orNumber} (${formatCurrency(receiptToDelete?.amount || 0)})?`}
          </p>
        </div>

        {/* iOS style split button border */}
        <div className="grid grid-cols-2 border-t border-black/10 divide-x divide-black/10 text-sm">
          <button
            type="button"
            onClick={onClose}
            className="py-3 text-neutral-700 font-medium hover:bg-neutral-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="py-3 text-rose-600 font-semibold hover:bg-rose-50 transition cursor-pointer"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
