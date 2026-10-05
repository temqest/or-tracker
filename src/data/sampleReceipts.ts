import { ReceiptRecord } from '../types/receipt';

export const INITIAL_RECEIPTS: ReceiptRecord[] = [
  {
    id: 'rec-001',
    orNumber: 'OR-2026-00841',
    assessmentNo: 'ASN-2026-9041',
    date: '2026-10-02',
    amount: 350000.00,
    payorName: 'Monarch Infrastructure & Development Corp.',
    branch: 'Makati Branch',
    status: 'Cleared',
    caseNo: 'SEC-ARB-2025-0914',
    remarks: 'Full settlement of arbitral tribunal retainer and filing assessment.'
  },
  {
    id: 'rec-002',
    orNumber: 'OR-2026-00842',
    assessmentNo: 'ASN-2026-9042',
    date: '2026-10-03',
    amount: 85500.00,
    payorName: 'Clarissa Mendoza',
    branch: 'BGC Branch',
    status: 'Cleared',
    caseNo: 'CIV-2026-0418',
    remarks: 'Judicial filing fee remittance and sheriff operational assessment.'
  },
  {
    id: 'rec-003',
    orNumber: 'OR-2026-00843',
    assessmentNo: 'ASN-2026-9043',
    date: '2026-10-03',
    amount: 1200000.00,
    payorName: 'Pacific Rim Logistics International Ltd.',
    branch: 'Makati Branch',
    status: 'Paid',
    caseNo: 'CTA-EB-2026-0088',
    remarks: 'Tax assessment defense deposit and court bond.'
  },
  {
    id: 'rec-004',
    orNumber: 'OR-2026-00844',
    assessmentNo: 'ASN-2026-9044',
    date: '2026-10-04',
    amount: 45000.00,
    payorName: 'Roberto Alcantara',
    branch: 'Ortigas Branch',
    status: 'Pending',
    caseNo: 'NLRC-NCR-10-0199',
    remarks: 'Labor arbitration appearance fee and position paper preparation.'
  },
  {
    id: 'rec-005',
    orNumber: 'OR-2026-00845',
    assessmentNo: 'ASN-2026-9045',
    date: '2026-10-04',
    amount: 620000.00,
    payorName: 'Aegis BioPharmaceuticals Phils.',
    branch: 'Cebu Branch',
    status: 'Cleared',
    caseNo: 'IP-PAT-2026-0031',
    remarks: 'Patent infringement preliminary injunction deposit.'
  },
  {
    id: 'rec-006',
    orNumber: 'OR-2026-00846',
    assessmentNo: 'ASN-2026-9046',
    date: '2026-10-05',
    amount: 150000.00,
    payorName: 'City Government of Pasay',
    branch: 'Makati Branch',
    status: 'Pending',
    caseNo: 'EXPR-2026-0112',
    remarks: 'Expropriation special commissioner appraisal deposit.'
  },
  {
    id: 'rec-007',
    orNumber: 'OR-2026-00847',
    assessmentNo: 'ASN-2026-9047',
    date: '2026-10-05',
    amount: 275000.00,
    payorName: 'Vanguard Realty & Property Ventures',
    branch: 'Davao Branch',
    status: 'Cleared',
    caseNo: 'LRC-REC-2026-440',
    remarks: 'Land Registration Authority petition assessment.'
  },
  {
    id: 'rec-008',
    orNumber: 'OR-2026-00848',
    assessmentNo: 'ASN-2026-9048',
    date: '2026-09-28',
    amount: 95000.00,
    payorName: 'Gabriel Montemayor',
    branch: 'BGC Branch',
    status: 'Cleared',
    caseNo: 'GEN-ADVISORY-2026',
    remarks: 'Advisory retainer and notarization dues.'
  }
];

export const BRANCH_OPTIONS = [
  'All Branches',
  'Makati Branch',
  'BGC Branch',
  'Ortigas Branch',
  'Cebu Branch',
  'Davao Branch'
];

export const STATUS_OPTIONS = [
  'All Statuses',
  'Pending',
  'Paid',
  'Cleared',
  'Cancelled'
];
