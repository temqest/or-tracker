import { ReceiptRecord } from '../types/receipt';
import { INITIAL_RECEIPTS } from '../data/sampleReceipts';

const STORAGE_KEY = 'legal_or_tracker_records';

export function loadReceipts(): ReceiptRecord[] {
  if (typeof window === 'undefined') return INITIAL_RECEIPTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RECEIPTS));
      return INITIAL_RECEIPTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_RECEIPTS;
  } catch (err) {
    console.error('Failed to load receipts from localStorage:', err);
    return INITIAL_RECEIPTS;
  }
}

export function saveReceipts(receipts: ReceiptRecord[]): boolean {
  if (typeof window === 'undefined') return false;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
    return true;
  } catch (err) {
    console.error('Failed to save receipts to localStorage:', err);
    return false;
  }
}

export function resetToDefaultReceipts(): ReceiptRecord[] {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_RECEIPTS));
  }
  return INITIAL_RECEIPTS;
}

export function exportToCSV(receipts: ReceiptRecord[]): void {
  const headers = [
    'OR-Number',
    'Assessment No',
    'Date',
    'Amount',
    'Name of Payor',
    'Branch',
    'Status',
    'Case No.',
    'Remarks'
  ];

  const rows = receipts.map((r) => [
    `"${r.orNumber}"`,
    `"${r.assessmentNo}"`,
    `"${r.date}"`,
    r.amount.toFixed(2),
    `"${r.payorName.replace(/"/g, '""')}"`,
    `"${r.branch.replace(/"/g, '""')}"`,
    `"${r.status}"`,
    `"${r.caseNo.replace(/"/g, '""')}"`,
    `"${(r.remarks || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `or_records_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToJSON(receipts: ReceiptRecord[]): void {
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(receipts, null, 2));
  const link = document.createElement('a');
  link.setAttribute('href', dataStr);
  link.setAttribute('download', `or_records_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
