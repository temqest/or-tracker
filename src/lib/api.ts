import { supabase } from './supabase';
import { ReceiptRecord, ReceiptStatus } from '../types/receipt';

export interface DbReceiptRow {
  id: string;
  or_number: string;
  assessment_no: string;
  date: string;
  amount: number;
  payor_name: string;
  branch: string;
  status: ReceiptStatus;
  case_no: string;
  remarks: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbBranchRow {
  id: string;
  name: string;
  created_at?: string;
}

// Convert DB row to frontend ReceiptRecord
export function mapDbToReceipt(row: DbReceiptRow): ReceiptRecord {
  return {
    id: row.id,
    orNumber: row.or_number,
    assessmentNo: row.assessment_no,
    date: row.date,
    amount: typeof row.amount === 'string' ? parseFloat(row.amount) : row.amount,
    payorName: row.payor_name,
    branch: row.branch,
    status: row.status,
    caseNo: row.case_no,
    remarks: row.remarks || ''
  };
}

// Convert frontend ReceiptRecord to DB row (for inserts / updates)
export function mapReceiptToDb(receipt: ReceiptRecord | Omit<ReceiptRecord, 'id'>): Partial<DbReceiptRow> {
  const data: Partial<DbReceiptRow> = {
    or_number: receipt.orNumber,
    assessment_no: receipt.assessmentNo,
    date: receipt.date,
    amount: Number(receipt.amount) || 0,
    payor_name: receipt.payorName,
    branch: receipt.branch,
    status: receipt.status,
    case_no: receipt.caseNo,
    remarks: receipt.remarks || '',
    updated_at: new Date().toISOString()
  };
  if ('id' in receipt && receipt.id && !receipt.id.startsWith('rec-temp-')) {
    data.id = receipt.id;
  }
  return data;
}

// ==========================================
// RECEIPTS API
// ==========================================

export async function fetchReceiptsApi(): Promise<ReceiptRecord[]> {
  const { data, error } = await supabase
    .from('receipts')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching receipts from Supabase:', error);
    throw new Error(error.message);
  }

  return (data || []).map(mapDbToReceipt);
}

export async function createReceiptApi(receipt: Omit<ReceiptRecord, 'id'> | ReceiptRecord): Promise<ReceiptRecord> {
  const dbPayload = mapReceiptToDb(receipt);
  // If id is a temporary string or not a valid UUID, remove it so Postgres creates a proper UUID
  if (dbPayload.id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(dbPayload.id)) {
    delete dbPayload.id;
  }

  const { data, error } = await supabase
    .from('receipts')
    .insert([dbPayload])
    .select()
    .single();

  if (error) {
    console.error('Error creating receipt in Supabase:', error);
    throw new Error(error.message);
  }

  return mapDbToReceipt(data);
}

export async function updateReceiptApi(receipt: ReceiptRecord): Promise<ReceiptRecord> {
  const dbPayload = mapReceiptToDb(receipt);

  const { data, error } = await supabase
    .from('receipts')
    .update(dbPayload)
    .eq('id', receipt.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating receipt in Supabase:', error);
    throw new Error(error.message);
  }

  return mapDbToReceipt(data);
}

export async function deleteReceiptApi(id: string): Promise<void> {
  const { error } = await supabase
    .from('receipts')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting receipt from Supabase:', error);
    throw new Error(error.message);
  }
}

export async function bulkDeleteReceiptsApi(ids: string[]): Promise<void> {
  const { error } = await supabase
    .from('receipts')
    .delete()
    .in('id', ids);

  if (error) {
    console.error('Error bulk deleting receipts from Supabase:', error);
    throw new Error(error.message);
  }
}

export async function bulkUpdateReceiptStatusApi(ids: string[], status: ReceiptStatus): Promise<void> {
  const { error } = await supabase
    .from('receipts')
    .update({ status, updated_at: new Date().toISOString() })
    .in('id', ids);

  if (error) {
    console.error('Error bulk updating receipt status in Supabase:', error);
    throw new Error(error.message);
  }
}

// ==========================================
// BRANCHES API
// ==========================================

export async function fetchBranchesApi(): Promise<string[]> {
  const { data, error } = await supabase
    .from('branches')
    .select('name')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching branches from Supabase:', error);
    throw new Error(error.message);
  }

  return (data || []).map(b => b.name);
}

export async function createBranchApi(name: string): Promise<string> {
  const { data, error } = await supabase
    .from('branches')
    .insert([{ name }])
    .select('name')
    .single();

  if (error) {
    console.error('Error adding branch to Supabase:', error);
    throw new Error(error.message);
  }

  return data.name;
}

export async function deleteBranchApi(name: string): Promise<void> {
  const { error } = await supabase
    .from('branches')
    .delete()
    .eq('name', name);

  if (error) {
    console.error('Error deleting branch from Supabase:', error);
    throw new Error(error.message);
  }
}

export async function renameBranchApi(oldName: string, newName: string): Promise<void> {
  // Update in branches table
  const { error: branchError } = await supabase
    .from('branches')
    .update({ name: newName })
    .eq('name', oldName);

  if (branchError) {
    console.error('Error renaming branch in Supabase:', branchError);
    throw new Error(branchError.message);
  }

  // Update associated receipts
  const { error: receiptError } = await supabase
    .from('receipts')
    .update({ branch: newName, updated_at: new Date().toISOString() })
    .eq('branch', oldName);

  if (receiptError) {
    console.error('Error updating branch name on receipts in Supabase:', receiptError);
    throw new Error(receiptError.message);
  }
}

export async function bulkInsertReceiptsApi(records: Omit<ReceiptRecord, 'id'>[] | ReceiptRecord[]): Promise<ReceiptRecord[]> {
  const payloads = records.map(r => {
    const p = mapReceiptToDb(r);
    if (p.id && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(p.id)) {
      delete p.id;
    }
    return p;
  });

  const { data, error } = await supabase
    .from('receipts')
    .insert(payloads)
    .select();

  if (error) {
    console.error('Error bulk importing receipts into Supabase:', error);
    throw new Error(error.message);
  }

  return (data || []).map(mapDbToReceipt);
}
