'use client';

import React, { useState, useEffect } from 'react';
import { ReceiptRecord, ReceiptStatus } from '../types/receipt';
import { BRANCH_OPTIONS, STATUS_OPTIONS } from '../data/sampleReceipts';
import { AlertTriangle } from 'lucide-react';

interface ReceiptFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (receipt: ReceiptRecord) => void;
  receiptToEdit?: ReceiptRecord | null;
  existingReceipts: ReceiptRecord[];
}

export const ReceiptFormModal: React.FC<ReceiptFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  receiptToEdit,
  existingReceipts
}) => {
  const isEditing = Boolean(receiptToEdit);

  const [orNumber, setOrNumber] = useState('');
  const [assessmentNo, setAssessmentNo] = useState('');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState<number | string>('');
  const [payorName, setPayorName] = useState('');
  const [branch, setBranch] = useState(BRANCH_OPTIONS[1] || 'Makati Branch');
  const [status, setStatus] = useState<ReceiptStatus>('Pending');
  const [caseNo, setCaseNo] = useState('');
  const [remarks, setRemarks] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  useEffect(() => {
    if (receiptToEdit) {
      setOrNumber(receiptToEdit.orNumber);
      setAssessmentNo(receiptToEdit.assessmentNo || '');
      setDate(receiptToEdit.date);
      setAmount(receiptToEdit.amount);
      setPayorName(receiptToEdit.payorName);
      setBranch(receiptToEdit.branch);
      setStatus(receiptToEdit.status);
      setCaseNo(receiptToEdit.caseNo);
      setRemarks(receiptToEdit.remarks || '');
    } else {
      const today = new Date().toISOString().slice(0, 10);
      setOrNumber('');
      setAssessmentNo('');
      setDate(today);
      setAmount('');
      setPayorName('');
      setBranch(BRANCH_OPTIONS[1] || 'Makati Branch');
      setStatus('Pending');
      setCaseNo('');
      setRemarks('');
    }
    setErrors({});
    setDuplicateWarning(null);
  }, [receiptToEdit, isOpen]);

  const handleOrNumberChange = (value: string) => {
    setOrNumber(value);
    const isDuplicate = existingReceipts.some(
      r => r.orNumber.trim().toLowerCase() === value.trim().toLowerCase() && r.id !== receiptToEdit?.id
    );
    if (isDuplicate) {
      setDuplicateWarning(`OR-Number "${value}" already exists.`);
    } else {
      setDuplicateWarning(null);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!orNumber.trim()) newErrors.orNumber = 'OR-Number is required.';
    if (!assessmentNo.trim()) newErrors.assessmentNo = 'Assessment No is required.';
    if (!date) newErrors.date = 'Date is required.';
    if (amount === '' || isNaN(Number(amount)) || Number(amount) < 0) {
      newErrors.amount = 'Valid Amount is required.';
    }
    if (!payorName.trim()) newErrors.payorName = 'Name of Payor is required.';
    if (!branch.trim()) newErrors.branch = 'Branch is required.';
    if (!caseNo.trim()) newErrors.caseNo = 'Case No. is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const numericAmount = typeof amount === 'string' ? parseFloat(amount) || 0 : amount;

    const receiptData: ReceiptRecord = {
      id: receiptToEdit ? receiptToEdit.id : `rec-${Date.now()}`,
      orNumber: orNumber.trim(),
      assessmentNo: assessmentNo.trim(),
      date,
      amount: numericAmount,
      payorName: payorName.trim(),
      branch,
      status,
      caseNo: caseNo.trim(),
      remarks: remarks.trim()
    };

    onSave(receiptData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#F2F2F7] rounded-[24px] shadow-2xl border border-black/10 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* iOS Modal Header */}
        <div className="bg-white/80 backdrop-blur-md px-5 py-3.5 border-b border-black/5 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-[#007AFF] hover:opacity-80 transition cursor-pointer font-normal"
          >
            Cancel
          </button>
          <div className="font-semibold text-sm text-neutral-900">
            {isEditing ? 'Edit Receipt' : 'New Receipt'}
          </div>
          <button
            type="button"
            onClick={handleSubmit}
            className="text-sm text-[#007AFF] font-bold hover:opacity-80 transition cursor-pointer"
          >
            {isEditing ? 'Save' : 'Add'}
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto flex-1">
          {duplicateWarning && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center space-x-2 text-xs text-amber-800">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{duplicateWarning}</span>
            </div>
          )}

          {/* Group 1: Numbers & Date */}
          <div className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-2xs divide-y divide-black/[0.04]">
            {/* OR-Number */}
            <div className="p-3 flex items-center justify-between gap-2">
              <label htmlFor="form-or" className="text-xs font-medium text-neutral-500 w-28 shrink-0">
                OR-Number
              </label>
              <input
                id="form-or"
                type="text"
                placeholder="e.g. OR-2026-00841"
                value={orNumber}
                onChange={(e) => handleOrNumberChange(e.target.value)}
                className="w-full text-right text-xs font-mono font-medium text-neutral-900 focus:outline-none placeholder-neutral-300"
              />
            </div>
            {errors.orNumber && <p className="px-3 pb-2 text-[11px] text-rose-500">{errors.orNumber}</p>}

            {/* Assessment No */}
            <div className="p-3 flex items-center justify-between gap-2">
              <label htmlFor="form-asn" className="text-xs font-medium text-neutral-500 w-28 shrink-0">
                Assessment No
              </label>
              <input
                id="form-asn"
                type="text"
                placeholder="e.g. ASN-2026-9041"
                value={assessmentNo}
                onChange={(e) => setAssessmentNo(e.target.value)}
                className="w-full text-right text-xs font-mono text-neutral-900 focus:outline-none placeholder-neutral-300"
              />
            </div>
            {errors.assessmentNo && <p className="px-3 pb-2 text-[11px] text-rose-500">{errors.assessmentNo}</p>}

            {/* Date */}
            <div className="p-3 flex items-center justify-between gap-2">
              <label htmlFor="form-dt" className="text-xs font-medium text-neutral-500 w-28 shrink-0">
                Date
              </label>
              <input
                id="form-dt"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-right text-xs text-neutral-900 focus:outline-none bg-transparent"
              />
            </div>
            {errors.date && <p className="px-3 pb-2 text-[11px] text-rose-500">{errors.date}</p>}

            {/* Amount */}
            <div className="p-3 flex items-center justify-between gap-2">
              <label htmlFor="form-amt" className="text-xs font-medium text-neutral-500 w-28 shrink-0">
                Amount (₱)
              </label>
              <input
                id="form-amt"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-right text-xs font-mono font-bold text-neutral-900 focus:outline-none placeholder-neutral-300"
              />
            </div>
            {errors.amount && <p className="px-3 pb-2 text-[11px] text-rose-500">{errors.amount}</p>}
          </div>

          {/* Group 2: Payor, Case & Branch */}
          <div className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-2xs divide-y divide-black/[0.04]">
            {/* Name of Payor */}
            <div className="p-3 flex items-center justify-between gap-2">
              <label htmlFor="form-payor" className="text-xs font-medium text-neutral-500 w-28 shrink-0">
                Name of Payor
              </label>
              <input
                id="form-payor"
                type="text"
                placeholder="Payor name"
                value={payorName}
                onChange={(e) => setPayorName(e.target.value)}
                className="w-full text-right text-xs font-medium text-neutral-900 focus:outline-none placeholder-neutral-300"
              />
            </div>
            {errors.payorName && <p className="px-3 pb-2 text-[11px] text-rose-500">{errors.payorName}</p>}

            {/* Case No. */}
            <div className="p-3 flex items-center justify-between gap-2">
              <label htmlFor="form-case" className="text-xs font-medium text-neutral-500 w-28 shrink-0">
                Case No.
              </label>
              <input
                id="form-case"
                type="text"
                placeholder="e.g. CIV-2026-0418"
                value={caseNo}
                onChange={(e) => setCaseNo(e.target.value)}
                className="w-full text-right text-xs font-mono text-neutral-900 focus:outline-none placeholder-neutral-300"
              />
            </div>
            {errors.caseNo && <p className="px-3 pb-2 text-[11px] text-rose-500">{errors.caseNo}</p>}

            {/* Branch */}
            <div className="p-3 flex items-center justify-between gap-2">
              <label htmlFor="form-br" className="text-xs font-medium text-neutral-500 w-28 shrink-0">
                Branch
              </label>
              <select
                id="form-br"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="text-xs font-medium text-neutral-900 focus:outline-none bg-transparent cursor-pointer text-right"
              >
                {BRANCH_OPTIONS.filter(b => b !== 'All Branches').map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="p-3 flex items-center justify-between gap-2">
              <label htmlFor="form-st" className="text-xs font-medium text-neutral-500 w-28 shrink-0">
                Status
              </label>
              <select
                id="form-st"
                value={status}
                onChange={(e) => setStatus(e.target.value as ReceiptStatus)}
                className="text-xs font-medium text-neutral-900 focus:outline-none bg-transparent cursor-pointer text-right"
              >
                {STATUS_OPTIONS.filter(s => s !== 'All Statuses').map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Group 3: Remarks */}
          <div className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-2xs p-3">
            <label htmlFor="form-rm" className="text-xs font-medium text-neutral-500 block mb-1">
              Remarks
            </label>
            <textarea
              id="form-rm"
              rows={3}
              placeholder="Notes, breakdown, or case details..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full text-xs text-neutral-900 focus:outline-none bg-transparent placeholder-neutral-300 resize-none"
            />
          </div>
        </form>
      </div>
    </div>
  );
};
