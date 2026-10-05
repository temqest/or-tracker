import { ReceiptRecord, ReceiptStatus } from '../types/receipt';

// Empty default array for production database use
export const INITIAL_RECEIPTS: ReceiptRecord[] = [];

export const BRANCH_OPTIONS: string[] = [];

export const STATUS_OPTIONS: (string | ReceiptStatus)[] = [
  'All Statuses',
  'Pending',
  'Paid',
  'Cleared',
  'Cancelled'
];

