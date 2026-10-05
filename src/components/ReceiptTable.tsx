'use client';

import React, { useState } from 'react';
import { ReceiptRecord, SortField, SortOrder, ReceiptStatus } from '../types/receipt';
import { formatCurrency, formatDate } from '../lib/formatters';
import { 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  Edit3, 
  Trash2, 
  Printer, 
  ChevronLeft,
  ChevronRight,
  Receipt
} from 'lucide-react';

interface ReceiptTableProps {
  receipts: ReceiptRecord[];
  sortField: SortField;
  sortOrder: SortOrder;
  onSort: (field: SortField) => void;
  onView: (receipt: ReceiptRecord) => void;
  onEdit: (receipt: ReceiptRecord) => void;
  onDelete: (receipt: ReceiptRecord) => void;
  onPrint: (receipt: ReceiptRecord) => void;
  onBulkStatusChange: (ids: string[], newStatus: ReceiptStatus) => void;
  onBulkDelete: (ids: string[]) => void;
}

export const ReceiptTable: React.FC<ReceiptTableProps> = ({
  receipts,
  sortField,
  sortOrder,
  onSort,
  onView,
  onEdit,
  onDelete,
  onPrint,
  onBulkStatusChange,
  onBulkDelete
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.ceil(receipts.length / pageSize) || 1;
  const currentSafePage = Math.min(currentPage, totalPages);
  const startIndex = (currentSafePage - 1) * pageSize;
  const paginatedReceipts = receipts.slice(startIndex, startIndex + pageSize);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(paginatedReceipts.map(r => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectRow = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const isAllSelected = paginatedReceipts.length > 0 && paginatedReceipts.every(r => selectedIds.includes(r.id));
  const isSomeSelected = paginatedReceipts.some(r => selectedIds.includes(r.id)) && !isAllSelected;

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 text-neutral-300 group-hover:text-neutral-500 transition" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-[#007AFF]" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[#007AFF]" />
    );
  };

  const getStatusBadge = (status: ReceiptStatus) => {
    switch (status) {
      case 'Cleared':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#34C759]/10 text-[#28a745]">
            Cleared
          </span>
        );
      case 'Paid':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#007AFF]/10 text-[#007AFF]">
            Paid
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#FF9500]/10 text-[#d97706]">
            Pending
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-neutral-100 text-neutral-500">
            Cancelled
          </span>
        );
      default:
        return <span className="text-xs text-neutral-600">{status}</span>;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-black/[0.06] shadow-xs overflow-hidden flex flex-col">
      {/* iOS Floating Bulk Action Header */}
      {selectedIds.length > 0 && (
        <div className="bg-neutral-900 text-white px-4 py-2.5 flex items-center justify-between transition-all">
          <div className="flex items-center space-x-3 text-xs">
            <span className="font-semibold text-neutral-200">
              {selectedIds.length} selected
            </span>
            <span className="text-neutral-600">|</span>
            <span className="text-neutral-400">Set:</span>
            <button
              onClick={() => {
                onBulkStatusChange(selectedIds, 'Cleared');
                setSelectedIds([]);
              }}
              className="px-2.5 py-1 rounded-full bg-[#34C759] hover:bg-[#2fb34f] text-white font-medium cursor-pointer"
            >
              Cleared
            </button>
            <button
              onClick={() => {
                onBulkStatusChange(selectedIds, 'Paid');
                setSelectedIds([]);
              }}
              className="px-2.5 py-1 rounded-full bg-[#007AFF] hover:bg-[#0062CC] text-white font-medium cursor-pointer"
            >
              Paid
            </button>
            <button
              onClick={() => {
                onBulkStatusChange(selectedIds, 'Pending');
                setSelectedIds([]);
              }}
              className="px-2.5 py-1 rounded-full bg-[#FF9500] hover:bg-[#e08300] text-white font-medium cursor-pointer"
            >
              Pending
            </button>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onBulkDelete(selectedIds);
                setSelectedIds([]);
              }}
              className="px-3 py-1 rounded-full bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white flex items-center space-x-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-neutral-400 hover:text-white px-2 py-1 cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-black/[0.06] text-[11px] uppercase tracking-wider font-semibold text-neutral-400 select-none bg-neutral-50/50">
              <th className="py-3 px-3 w-10 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={el => {
                    if (el) el.indeterminate = isSomeSelected;
                  }}
                  onChange={handleSelectAll}
                  aria-label="Select all"
                  className="rounded border-neutral-300 text-[#007AFF] focus:ring-[#007AFF] cursor-pointer"
                />
              </th>

              {/* Date */}
              <th 
                onClick={() => onSort('date')}
                className="py-3 px-3 cursor-pointer hover:text-neutral-700 transition group whitespace-nowrap"
              >
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  {renderSortIcon('date')}
                </div>
              </th>

              {/* OR-Number */}
              <th 
                onClick={() => onSort('orNumber')}
                className="py-3 px-3 cursor-pointer hover:text-neutral-700 transition group whitespace-nowrap"
              >
                <div className="flex items-center space-x-1">
                  <span>OR-Number</span>
                  {renderSortIcon('orNumber')}
                </div>
              </th>

              {/* Assessment No */}
              <th 
                onClick={() => onSort('assessmentNo')}
                className="py-3 px-3 cursor-pointer hover:text-neutral-700 transition group whitespace-nowrap"
              >
                <div className="flex items-center space-x-1">
                  <span>Assessment No</span>
                  {renderSortIcon('assessmentNo')}
                </div>
              </th>

              {/* Name of Payor */}
              <th 
                onClick={() => onSort('payorName')}
                className="py-3 px-3 cursor-pointer hover:text-neutral-700 transition group"
              >
                <div className="flex items-center space-x-1">
                  <span>Name of Payor</span>
                  {renderSortIcon('payorName')}
                </div>
              </th>

              {/* Amount */}
              <th 
                onClick={() => onSort('amount')}
                className="py-3 px-3 cursor-pointer hover:text-neutral-700 transition group text-right whitespace-nowrap"
              >
                <div className="flex items-center justify-end space-x-1">
                  <span>Amount</span>
                  {renderSortIcon('amount')}
                </div>
              </th>

              {/* Branch */}
              <th 
                onClick={() => onSort('branch')}
                className="py-3 px-3 cursor-pointer hover:text-neutral-700 transition group"
              >
                <div className="flex items-center space-x-1">
                  <span>Branch</span>
                  {renderSortIcon('branch')}
                </div>
              </th>

              {/* Case No. */}
              <th 
                onClick={() => onSort('caseNo')}
                className="py-3 px-3 cursor-pointer hover:text-neutral-700 transition group whitespace-nowrap"
              >
                <div className="flex items-center space-x-1">
                  <span>Case No.</span>
                  {renderSortIcon('caseNo')}
                </div>
              </th>

              {/* Status */}
              <th 
                onClick={() => onSort('status')}
                className="py-3 px-3 cursor-pointer hover:text-neutral-700 transition group text-center whitespace-nowrap"
              >
                <div className="flex items-center justify-center space-x-1">
                  <span>Status</span>
                  {renderSortIcon('status')}
                </div>
              </th>

              {/* Remarks */}
              <th className="py-3 px-3">Remarks</th>

              {/* Actions */}
              <th className="py-3 px-3 text-right whitespace-nowrap">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-black/[0.04] text-xs">
            {paginatedReceipts.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-14 text-center text-neutral-400">
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <Receipt className="w-8 h-8 text-neutral-300 stroke-1" />
                    <div className="text-sm font-medium text-neutral-700">No receipts found</div>
                    <p className="text-xs text-neutral-400 max-w-xs">
                      Try clearing search or filters to see all records.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedReceipts.map((receipt) => {
                const isSelected = selectedIds.includes(receipt.id);
                return (
                  <tr
                    key={receipt.id}
                    onClick={() => onView(receipt)}
                    className={`hover:bg-neutral-50/90 transition-colors py-2.5 cursor-pointer ${
                      isSelected ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    {/* Checkbox */}
                    <td 
                      className="py-3 px-3 text-center"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(receipt.id)}
                        aria-label={`Select receipt ${receipt.orNumber}`}
                        className="rounded border-neutral-300 text-[#007AFF] focus:ring-[#007AFF] cursor-pointer"
                      />
                    </td>

                    {/* Date */}
                    <td className="py-3 px-3 text-neutral-600 whitespace-nowrap">
                      {formatDate(receipt.date)}
                    </td>

                    {/* OR-Number */}
                    <td className="py-3 px-3 font-mono font-semibold text-neutral-900 whitespace-nowrap">
                      <span className="text-[#007AFF] hover:underline font-semibold">
                        {receipt.orNumber}
                      </span>
                    </td>

                    {/* Assessment No */}
                    <td className="py-3 px-3 font-mono text-neutral-500 whitespace-nowrap">
                      {receipt.assessmentNo}
                    </td>

                    {/* Name of Payor */}
                    <td className="py-3 px-3 font-medium text-neutral-900 max-w-[180px] truncate" title={receipt.payorName}>
                      {receipt.payorName}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3 font-mono font-semibold text-neutral-900 text-right tabular-nums whitespace-nowrap">
                      {formatCurrency(receipt.amount)}
                    </td>

                    {/* Branch */}
                    <td className="py-3 px-3 text-neutral-600 max-w-[140px] truncate" title={receipt.branch}>
                      {receipt.branch}
                    </td>

                    {/* Case No. */}
                    <td className="py-3 px-3 font-mono text-neutral-700 whitespace-nowrap">
                      {receipt.caseNo}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {getStatusBadge(receipt.status)}
                    </td>

                    {/* Remarks */}
                    <td className="py-3 px-3 text-neutral-500 max-w-[180px] truncate" title={receipt.remarks}>
                      {receipt.remarks || '—'}
                    </td>

                    {/* Actions */}
                    <td 
                      className="py-3 px-3 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          type="button"
                          onClick={() => onView(receipt)}
                          title="View"
                          className="p-1 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onPrint(receipt)}
                          title="Print"
                          className="p-1 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onEdit(receipt)}
                          title="Edit"
                          className="p-1 rounded-md text-neutral-500 hover:text-[#007AFF] hover:bg-neutral-100 transition cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(receipt)}
                          title="Delete"
                          className="p-1 rounded-md text-neutral-500 hover:text-rose-600 hover:bg-neutral-100 transition cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="bg-neutral-50/50 border-t border-black/[0.04] px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-neutral-500">
        <div className="flex items-center space-x-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            aria-label="Rows per page"
            className="bg-white border border-black/10 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-[#007AFF] cursor-pointer"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span className="text-neutral-300">|</span>
          <span>
            {receipts.length === 0 ? 0 : startIndex + 1}&ndash;
            {Math.min(startIndex + pageSize, receipts.length)} of {receipts.length}
          </span>
        </div>

        {/* Page Nav */}
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentSafePage <= 1}
            aria-label="Previous page"
            className="p-1.5 rounded-lg border border-black/5 bg-white hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-neutral-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-medium">
            {currentSafePage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentSafePage >= totalPages}
            aria-label="Next page"
            className="p-1.5 rounded-lg border border-black/5 bg-white hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer text-neutral-700"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
