export type ReceiptStatus = 'Pending' | 'Paid' | 'Cleared' | 'Cancelled';

export interface ReceiptRecord {
  id: string;
  orNumber: string;       // OR-Number
  assessmentNo: string;   // Assessment No
  date: string;           // Date (YYYY-MM-DD)
  amount: number;         // Amount
  payorName: string;      // Name of Payor
  branch: string;         // Branch
  status: ReceiptStatus;  // Status
  caseNo: string;         // Case No.
  remarks: string;        // Remarks
}

export interface FilterOptions {
  searchQuery: string;
  branch: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

export type SortField = 'date' | 'orNumber' | 'assessmentNo' | 'amount' | 'payorName' | 'branch' | 'status' | 'caseNo';
export type SortOrder = 'asc' | 'desc';
