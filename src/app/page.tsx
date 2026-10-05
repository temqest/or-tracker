'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ReceiptRecord, FilterOptions, SortField, SortOrder, ReceiptStatus } from '../types/receipt';
import { exportToCSV, exportToJSON } from '../lib/storage';
import { 
  fetchReceiptsApi, 
  createReceiptApi, 
  updateReceiptApi, 
  deleteReceiptApi, 
  bulkDeleteReceiptsApi, 
  bulkUpdateReceiptStatusApi,
  fetchBranchesApi,
  createBranchApi,
  deleteBranchApi,
  renameBranchApi,
  bulkInsertReceiptsApi
} from '../lib/api';
import { Sidebar, NavSection } from '../components/Sidebar';
import { TopHeader } from '../components/TopHeader';
import { NavigationTabs, SubTab } from '../components/NavigationTabs';
import { KpiCards } from '../components/KpiCards';
import { BarChartCard } from '../components/BarChartCard';
import { StatusDonutCard } from '../components/StatusDonutCard';
import { RecentTransactionsCard } from '../components/RecentTransactionsCard';
import { FilterToolbar } from '../components/FilterToolbar';
import { ReceiptTable } from '../components/ReceiptTable';
import { ReceiptFormModal } from '../components/ReceiptFormModal';
import { ReceiptDetailModal } from '../components/ReceiptDetailModal';
import { ReceiptPrintView } from '../components/ReceiptPrintView';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { ImportExportModal } from '../components/ImportExportModal';
import { NotificationToast, ToastMessage } from '../components/NotificationToast';
import { formatCurrency } from '../lib/formatters';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Edit2, 
  Check, 
  X, 
  RotateCcw, 
  Layers, 
  FileSpreadsheet, 
  Database,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CloudCheck
} from 'lucide-react';

export default function Home() {
  const [receipts, setReceipts] = useState<ReceiptRecord[]>([]);
  const [branches, setBranches] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isMutating, setIsMutating] = useState<boolean>(false);
  const [currentSection, setCurrentSection] = useState<NavSection>('dashboard');
  const [currentSubTab, setCurrentSubTab] = useState<SubTab>('overview');

  // Branch Management State in Settings
  const [newBranchInput, setNewBranchInput] = useState<string>('');
  const [branchError, setBranchError] = useState<string | null>(null);
  const [editingBranchName, setEditingBranchName] = useState<string | null>(null);
  const [editingBranchInput, setEditingBranchInput] = useState<string>('');

  // Search & Filters State
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    branch: 'All Branches',
    status: 'All Statuses',
    dateFrom: '',
    dateTo: ''
  });

  // Sorting
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [receiptToEdit, setReceiptToEdit] = useState<ReceiptRecord | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<ReceiptRecord | null>(null);
  const [printingReceipt, setPrintingReceipt] = useState<ReceiptRecord | null>(null);
  const [deletingReceipt, setDeletingReceipt] = useState<ReceiptRecord | null>(null);
  const [bulkDeleteIds, setBulkDeleteIds] = useState<string[]>([]);
  const [isImportExportOpen, setIsImportExportOpen] = useState<boolean>(false);

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((title: string, description?: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Initial Load from Supabase Backend
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [fetchedReceipts, fetchedBranches] = await Promise.all([
        fetchReceiptsApi().catch(err => {
          console.error('Failed to fetch receipts:', err);
          addToast('Database Error', 'Could not load receipts from Supabase. Verify your table setup and policies.', 'error');
          return [] as ReceiptRecord[];
        }),
        fetchBranchesApi().catch(err => {
          console.error('Failed to fetch branches:', err);
          return [] as string[];
        })
      ]);

      setReceipts(fetchedReceipts);
      setBranches(fetchedBranches);
    } catch (err: any) {
      console.error('Initial data load error:', err);
      addToast('Connection Error', err.message || 'Failed to connect to backend.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Branch CRUD via Supabase API
  const handleAddBranch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = newBranchInput.trim();
    if (!trimmed) {
      setBranchError('Branch name cannot be empty.');
      return;
    }
    const isDuplicate = branches.some(
      b => b.toLowerCase() === trimmed.toLowerCase()
    );
    if (isDuplicate) {
      setBranchError(`Branch "${trimmed}" already exists.`);
      return;
    }

    try {
      setIsMutating(true);
      await createBranchApi(trimmed);
      setBranches(prev => [...prev, trimmed]);
      setNewBranchInput('');
      setBranchError(null);
      addToast('Branch Added', `"${trimmed}" saved to Supabase database.`);
    } catch (err: any) {
      // Fallback local update if branches table isn't migrated yet
      setBranches(prev => [...prev, trimmed]);
      setNewBranchInput('');
      setBranchError(null);
      addToast('Branch Added Locally', `"${trimmed}" added (note: migrate branches table in Supabase for persistence).`, 'info');
    } finally {
      setIsMutating(false);
    }
  };

  const handleDeleteBranch = async (branchToDelete: string) => {
    const receiptsUsingBranch = receipts.filter(r => r.branch === branchToDelete).length;
    if (receiptsUsingBranch > 0) {
      const confirmDelete = window.confirm(
        `Warning: There are ${receiptsUsingBranch} receipt(s) assigned to "${branchToDelete}". Deleting this branch will keep those receipts but remove "${branchToDelete}" from future options. Do you want to proceed?`
      );
      if (!confirmDelete) return;
    }

    try {
      setIsMutating(true);
      await deleteBranchApi(branchToDelete);
      setBranches(prev => prev.filter(b => b !== branchToDelete));
      addToast('Branch Removed', `"${branchToDelete}" removed from Supabase.`, 'info');
    } catch (err) {
      setBranches(prev => prev.filter(b => b !== branchToDelete));
      addToast('Branch Removed', `"${branchToDelete}" removed.`, 'info');
    } finally {
      setIsMutating(false);
    }
  };

  const handleStartEditBranch = (branchName: string) => {
    setEditingBranchName(branchName);
    setEditingBranchInput(branchName);
    setBranchError(null);
  };

  const handleSaveEditBranch = async (oldName: string) => {
    const trimmed = editingBranchInput.trim();
    if (!trimmed) {
      setBranchError('Branch name cannot be empty.');
      return;
    }
    if (trimmed.toLowerCase() !== oldName.toLowerCase()) {
      const isDuplicate = branches.some(
        b => b.toLowerCase() === trimmed.toLowerCase()
      );
      if (isDuplicate) {
        setBranchError(`Branch "${trimmed}" already exists.`);
        return;
      }
    }

    try {
      setIsMutating(true);
      await renameBranchApi(oldName, trimmed);
      setBranches(prev => prev.map(b => (b === oldName ? trimmed : b)));
      setReceipts(prev => prev.map(r => (r.branch === oldName ? { ...r, branch: trimmed } : r)));
      setEditingBranchName(null);
      setEditingBranchInput('');
      setBranchError(null);
      addToast('Branch Renamed', `"${oldName}" was updated to "${trimmed}" across database.`);
    } catch (err: any) {
      setBranches(prev => prev.map(b => (b === oldName ? trimmed : b)));
      setReceipts(prev => prev.map(r => (r.branch === oldName ? { ...r, branch: trimmed } : r)));
      setEditingBranchName(null);
      setEditingBranchInput('');
      setBranchError(null);
      addToast('Branch Updated', `"${oldName}" updated to "${trimmed}".`);
    } finally {
      setIsMutating(false);
    }
  };

  const handleResetBranches = async () => {
    try {
      const dbBranches = await fetchBranchesApi();
      setBranches(dbBranches);
      addToast('Branches Synced', 'Refreshed branch directory from database.');
    } catch {
      setBranches([]);
    }
  };

  const handleReloadFromDatabase = () => {
    loadData();
    addToast('Database Synced', 'Reloaded all records from Supabase.');
  };

  // Filter and Sort Logic
  const filteredReceipts = useMemo(() => {
    return receipts.filter((r) => {
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase().trim();
        const matchesQuery =
          r.orNumber.toLowerCase().includes(query) ||
          r.assessmentNo.toLowerCase().includes(query) ||
          r.payorName.toLowerCase().includes(query) ||
          r.caseNo.toLowerCase().includes(query) ||
          r.branch.toLowerCase().includes(query) ||
          (r.remarks && r.remarks.toLowerCase().includes(query));

        if (!matchesQuery) return false;
      }

      if (filters.branch !== 'All Branches' && r.branch !== filters.branch) {
        return false;
      }

      if (filters.status !== 'All Statuses' && r.status !== filters.status) {
        return false;
      }

      if (filters.dateFrom && r.date < filters.dateFrom) {
        return false;
      }
      if (filters.dateTo && r.date > filters.dateTo) {
        return false;
      }

      return true;
    });
  }, [receipts, filters]);

  const sortedReceipts = useMemo(() => {
    return [...filteredReceipts].sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'date':
          comparison = a.date.localeCompare(b.date);
          break;
        case 'amount':
          comparison = (a.amount || 0) - (b.amount || 0);
          break;
        case 'orNumber':
          comparison = a.orNumber.localeCompare(b.orNumber, undefined, { numeric: true });
          break;
        case 'assessmentNo':
          comparison = a.assessmentNo.localeCompare(b.assessmentNo, undefined, { numeric: true });
          break;
        case 'payorName':
          comparison = a.payorName.localeCompare(b.payorName);
          break;
        case 'caseNo':
          comparison = a.caseNo.localeCompare(b.caseNo);
          break;
        case 'branch':
          comparison = a.branch.localeCompare(b.branch);
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredReceipts, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      branch: 'All Branches',
      status: 'All Statuses',
      dateFrom: '',
      dateTo: ''
    });
  };

  // CRUD Operations via Supabase Backend
  const handleSaveReceipt = async (record: ReceiptRecord) => {
    try {
      setIsMutating(true);
      if (receiptToEdit) {
        const updated = await updateReceiptApi(record);
        setReceipts(prev => prev.map(r => (r.id === updated.id ? updated : r)));
        addToast('Receipt Updated', `${updated.orNumber} saved to Supabase.`);
      } else {
        const created = await createReceiptApi(record);
        setReceipts(prev => [created, ...prev]);
        addToast('Receipt Created', `${created.orNumber} recorded in Supabase.`);
      }
      setIsFormModalOpen(false);
      setReceiptToEdit(null);
    } catch (err: any) {
      console.error('Save receipt error:', err);
      addToast('Save Failed', err.message || 'Could not save receipt to Supabase.', 'error');
    } finally {
      setIsMutating(false);
    }
  };

  const handleOpenEdit = (receipt: ReceiptRecord) => {
    setReceiptToEdit(receipt);
    setIsFormModalOpen(true);
  };

  const handleOpenNew = () => {
    setReceiptToEdit(null);
    setIsFormModalOpen(true);
  };

  const handleOpenView = (receipt: ReceiptRecord) => {
    setViewingReceipt(receipt);
  };

  const handleOpenPrint = (receipt: ReceiptRecord) => {
    setPrintingReceipt(receipt);
  };

  const handleOpenDelete = (receipt: ReceiptRecord) => {
    setDeletingReceipt(receipt);
    setBulkDeleteIds([]);
  };

  const handleConfirmSingleDelete = async () => {
    if (!deletingReceipt) return;
    const targetId = deletingReceipt.id;
    const targetOr = deletingReceipt.orNumber;
    try {
      setIsMutating(true);
      await deleteReceiptApi(targetId);
      setReceipts(prev => prev.filter(r => r.id !== targetId));
      addToast('Receipt Deleted', `${targetOr} removed from Supabase.`);
      setDeletingReceipt(null);
      if (viewingReceipt?.id === targetId) {
        setViewingReceipt(null);
      }
    } catch (err: any) {
      console.error('Delete error:', err);
      addToast('Delete Failed', err.message || 'Could not delete receipt.', 'error');
    } finally {
      setIsMutating(false);
    }
  };

  const handleStatusChangeFromDetail = async (receipt: ReceiptRecord, newStatus: ReceiptStatus) => {
    try {
      const updated = await updateReceiptApi({ ...receipt, status: newStatus });
      setReceipts(prev => prev.map(r => (r.id === updated.id ? updated : r)));
      setViewingReceipt(updated);
      addToast('Status Updated', `${receipt.orNumber} status updated to ${newStatus}.`);
    } catch (err: any) {
      addToast('Update Failed', err.message || 'Could not update status.', 'error');
    }
  };

  const handleBulkStatusChange = async (ids: string[], newStatus: ReceiptStatus) => {
    try {
      setIsMutating(true);
      await bulkUpdateReceiptStatusApi(ids, newStatus);
      setReceipts(prev =>
        prev.map(r => (ids.includes(r.id) ? { ...r, status: newStatus } : r))
      );
      addToast('Bulk Status Updated', `${ids.length} records updated in Supabase.`);
    } catch (err: any) {
      addToast('Bulk Update Failed', err.message || 'Could not update records.', 'error');
    } finally {
      setIsMutating(false);
    }
  };

  const handleOpenBulkDelete = (ids: string[]) => {
    setBulkDeleteIds(ids);
    setDeletingReceipt(null);
  };

  const handleConfirmBulkDelete = async () => {
    if (bulkDeleteIds.length === 0) return;
    const count = bulkDeleteIds.length;
    try {
      setIsMutating(true);
      await bulkDeleteReceiptsApi(bulkDeleteIds);
      setReceipts(prev => prev.filter(r => !bulkDeleteIds.includes(r.id)));
      addToast('Records Deleted', `${count} records removed from Supabase.`);
      setBulkDeleteIds([]);
    } catch (err: any) {
      addToast('Bulk Delete Failed', err.message || 'Could not delete records.', 'error');
    } finally {
      setIsMutating(false);
    }
  };

  // Data Actions
  const handleExportCSV = () => {
    exportToCSV(sortedReceipts);
    addToast('Exported CSV', `Downloaded ${sortedReceipts.length} records.`);
  };

  const handleExportJSON = () => {
    exportToJSON(receipts);
    addToast('Backup Created', `Downloaded JSON backup.`);
  };

  const handleImportRecords = async (imported: ReceiptRecord[]) => {
    try {
      setIsMutating(true);
      const inserted = await bulkInsertReceiptsApi(imported);
      setReceipts(prev => [...inserted, ...prev]);
      addToast('Records Imported', `Imported ${inserted.length} receipts into Supabase.`);
    } catch (err: any) {
      addToast('Import Failed', err.message || 'Failed to bulk insert receipts.', 'error');
    } finally {
      setIsMutating(false);
    }
  };

  const handleSidebarSelect = (section: NavSection) => {
    setCurrentSection(section);
    if (section === 'dashboard') setCurrentSubTab('overview');
    if (section === 'receipts') setCurrentSubTab('receipts');
    if (section === 'assessments') setCurrentSubTab('assessments');
    if (section === 'analytics') setCurrentSubTab('branches');
    if (section === 'settings') setCurrentSubTab('settings');
  };

  const handleSubTabSelect = (tab: SubTab) => {
    setCurrentSubTab(tab);
    if (tab === 'overview') setCurrentSection('dashboard');
    if (tab === 'receipts') setCurrentSection('receipts');
    if (tab === 'assessments') setCurrentSection('assessments');
    if (tab === 'branches') setCurrentSection('analytics');
    if (tab === 'settings') setCurrentSection('settings');
  };

  return (
    <div className="min-h-screen bg-[#F4F6FC] flex font-sans antialiased text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar
        currentSection={currentSection}
        onSelectSection={handleSidebarSelect}
        onOpenExportModal={() => setIsImportExportOpen(true)}
        receiptCount={receipts.length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-y-auto">
        {/* Top Header */}
        <TopHeader
          title={
            currentSubTab === 'overview'
              ? 'Dashboard'
              : currentSubTab === 'receipts'
              ? 'Official Receipts'
              : currentSubTab === 'assessments'
              ? 'Assessments & Dockets'
              : currentSubTab === 'branches'
              ? 'Branch Analytics'
              : 'System Settings'
          }
          searchQuery={filters.searchQuery}
          onSearchChange={(query) => setFilters(prev => ({ ...prev, searchQuery: query }))}
          onNewReceipt={handleOpenNew}
          totalReceiptsCount={receipts.length}
        />

        {/* Main Content Container */}
        <main className="flex-1 px-8 py-6 w-full max-w-[1550px] mx-auto space-y-6">
          {/* Sub Navigation Tabs */}
          <NavigationTabs
            currentTab={currentSubTab}
            onSelectTab={handleSubTabSelect}
          />

          {isLoading ? (
            <div className="bg-white rounded-2xl p-16 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col items-center justify-center space-y-4 text-center animate-in fade-in duration-200">
              <div className="w-12 h-12 rounded-2xl bg-[#EEF2FF] text-[#4361EE] flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-[#4361EE]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Connecting to Supabase</h3>
                <p className="text-xs text-slate-400 mt-1">Retrieving official receipts and branch records from database...</p>
              </div>
            </div>
          ) : (
            <>
              {/* TAB 1: OVERVIEW DASHBOARD */}
              {currentSubTab === 'overview' && (
                <div className="space-y-6">
                  {/* 4 KPI Metric Cards */}
                  <KpiCards receipts={receipts} />

              {/* Middle Section: Bar Chart (70%) + Status Donut Gauge (30%) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-8 flex flex-col">
                  <BarChartCard receipts={receipts} />
                </div>
                <div className="lg:col-span-4 flex flex-col">
                  <StatusDonutCard receipts={receipts} />
                </div>
              </div>

              {/* Bottom Section: Master Table (70%) + Recent Receipts Feed (30%) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Master Table Card */}
                <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">
                        Official Receipts Ledger
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Manage, sort, and filter recorded official receipts (click any row to view details)
                      </p>
                    </div>
                  </div>

                  {/* Filter Toolbar */}
                  <FilterToolbar
                    filters={filters}
                    onFilterChange={setFilters}
                    onResetFilters={handleResetFilters}
                    resultCount={sortedReceipts.length}
                    totalCount={receipts.length}
                    branchOptions={branches}
                  />

                  {/* Master Table */}
                  <ReceiptTable
                    receipts={sortedReceipts}
                    sortField={sortField}
                    sortOrder={sortOrder}
                    onSort={handleSort}
                    onView={handleOpenView}
                    onEdit={handleOpenEdit}
                    onDelete={handleOpenDelete}
                    onPrint={handleOpenPrint}
                    onBulkStatusChange={handleBulkStatusChange}
                    onBulkDelete={handleOpenBulkDelete}
                  />
                </div>

                {/* Right Column: Recent Transactions Feed */}
                <div className="lg:col-span-4 flex flex-col">
                  <RecentTransactionsCard
                    receipts={receipts}
                    onView={handleOpenView}
                    onViewAll={() => handleSubTabSelect('receipts')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FULL RECEIPTS LEDGER */}
          {currentSubTab === 'receipts' && (
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Official Receipts Registry
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Full database of official receipts and case dockets (click any row to view details)
                    </p>
                  </div>
                  <button
                    onClick={handleOpenNew}
                    className="inline-flex items-center space-x-1.5 bg-[#4361EE] hover:bg-[#3A53D0] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Record New OR</span>
                  </button>
                </div>

                <FilterToolbar
                  filters={filters}
                  onFilterChange={setFilters}
                  onResetFilters={handleResetFilters}
                  resultCount={sortedReceipts.length}
                  totalCount={receipts.length}
                  branchOptions={branches}
                />

                <ReceiptTable
                  receipts={sortedReceipts}
                  sortField={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                  onView={handleOpenView}
                  onEdit={handleOpenEdit}
                  onDelete={handleOpenDelete}
                  onPrint={handleOpenPrint}
                  onBulkStatusChange={handleBulkStatusChange}
                  onBulkDelete={handleOpenBulkDelete}
                />
              </div>
            </div>
          )}

          {/* TAB 3: ASSESSMENTS BREAKDOWN */}
          {currentSubTab === 'assessments' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {receipts.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => handleOpenView(r)}
                    className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {r.assessmentNo}
                        </span>
                        <h3 className="font-semibold text-xs text-slate-900 mt-2 line-clamp-1" title={r.payorName}>
                          {r.payorName}
                        </h3>
                        <p className="text-[11px] font-mono text-slate-400">{r.caseNo}</p>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        r.status === 'Cleared'
                          ? 'bg-emerald-50 text-emerald-700'
                          : r.status === 'Paid'
                          ? 'bg-sky-50 text-sky-700'
                          : r.status === 'Pending'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {r.status}
                      </span>
                    </div>

                    <div className="border-t border-slate-100 pt-3 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">{r.branch}</span>
                      <span className="font-bold font-mono text-slate-900">
                        {formatCurrency(r.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: BRANCH SUMMARY */}
          {currentSubTab === 'branches' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Branch Performance & Collections</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Overview of active branches and settlement metrics</p>
                </div>
                <button
                  onClick={() => handleSubTabSelect('settings')}
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-[#4361EE] bg-[#EEF2FF] hover:bg-[#4361EE] hover:text-white px-3.5 py-2 rounded-xl transition cursor-pointer"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Manage Branches in Settings</span>
                </button>
              </div>

              {branches.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">No Branches Registered</h3>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                      You have not configured any branch offices in Supabase yet.
                    </p>
                  </div>
                  <button
                    onClick={() => handleSubTabSelect('settings')}
                    className="inline-flex items-center space-x-1.5 bg-[#4361EE] hover:bg-[#3A53D0] text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add First Branch</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {branches.map((branchName) => {
                    const branchReceipts = receipts.filter(r => r.branch === branchName);
                    const branchTotal = branchReceipts.reduce((sum, r) => sum + (r.amount || 0), 0);
                    const clearedCount = branchReceipts.filter(r => r.status === 'Cleared' || r.status === 'Paid').length;

                    return (
                      <div
                        key={branchName}
                        className="bg-white rounded-2xl p-6 border border-slate-100 shadow-xs flex flex-col justify-between space-y-4"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#4361EE] flex items-center justify-center font-bold">
                              <Building2 className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-bold text-sm text-slate-800">{branchName}</h3>
                              <p className="text-xs text-slate-400">{branchReceipts.length} total receipts</p>
                            </div>
                          </div>
                          <div className="text-right font-mono font-bold text-base text-slate-900">
                            {formatCurrency(branchTotal)}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                          <span>Settlement Progress:</span>
                          <span className="font-semibold text-emerald-600">
                            {branchReceipts.length > 0 ? Math.round((clearedCount / branchReceipts.length) * 100) : 0}% cleared
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: SETTINGS & BRANCH MANAGEMENT */}
          {currentSubTab === 'settings' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Branch Directory Management Card */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-5">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EEF2FF] text-[#4361EE] flex items-center justify-center font-bold shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className="text-base font-bold text-slate-900">
                          Branch Locations Directory
                        </h2>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#EEF2FF] text-[#4361EE]">
                          {branches.length} Active
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Add and configure branches. These options immediately populate the New/Edit OR modal and filters.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleResetBranches}
                    className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 transition cursor-pointer self-start sm:self-auto"
                    title="Restore standard default branches"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                    <span>Reset Defaults</span>
                  </button>
                </div>

                {/* Add New Branch Input */}
                <form onSubmit={handleAddBranch} className="space-y-2">
                  <label htmlFor="new-branch-name" className="text-xs font-semibold text-slate-700 block">
                    Add New Branch
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        id="new-branch-name"
                        type="text"
                        placeholder="e.g. Alabang Branch, Ortigas Tower, Manila Port Office..."
                        value={newBranchInput}
                        onChange={(e) => {
                          setNewBranchInput(e.target.value);
                          if (branchError) setBranchError(null);
                        }}
                        className="w-full pl-3.5 pr-4 py-2.5 text-xs bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-slate-900 placeholder-slate-400 rounded-xl border border-slate-200 focus:border-[#4361EE] focus:outline-none focus:ring-2 focus:ring-[#4361EE]/15 transition"
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex items-center space-x-1.5 bg-[#4361EE] hover:bg-[#3A53D0] active:scale-95 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm shadow-[#4361EE]/25 transition cursor-pointer shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Branch</span>
                    </button>
                  </div>
                  {branchError && (
                    <div className="flex items-center space-x-1.5 text-xs text-rose-600 pt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{branchError}</span>
                    </div>
                  )}
                </form>

                {/* Existing Branches List */}
                <div className="space-y-3 pt-2">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Current Branch Options ({branches.length})
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {branches.map((bName) => {
                      const isEditingThis = editingBranchName === bName;
                      const receiptCount = receipts.filter(r => r.branch === bName).length;

                      return (
                        <div
                          key={bName}
                          className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                            isEditingThis
                              ? 'bg-blue-50/50 border-[#4361EE]/40 ring-2 ring-[#4361EE]/10'
                              : 'bg-slate-50/60 border-slate-200/80 hover:bg-white hover:border-slate-300'
                          }`}
                        >
                          {isEditingThis ? (
                            <div className="flex-1 flex items-center gap-2">
                              <input
                                type="text"
                                value={editingBranchInput}
                                onChange={(e) => setEditingBranchInput(e.target.value)}
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') handleSaveEditBranch(bName);
                                  if (e.key === 'Escape') setEditingBranchName(null);
                                }}
                                className="flex-1 text-xs font-semibold bg-white border border-[#4361EE] rounded-lg px-2.5 py-1 text-slate-900 focus:outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveEditBranch(bName)}
                                className="p-1 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                                title="Save changes"
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingBranchName(null)}
                                className="p-1 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
                                title="Cancel"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center space-x-3 min-w-0">
                                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#4361EE] shrink-0 shadow-2xs">
                                  <Building2 className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <div className="font-bold text-xs text-slate-800 truncate" title={bName}>
                                    {bName}
                                  </div>
                                  <div className="text-[11px] text-slate-400">
                                    {receiptCount} {receiptCount === 1 ? 'receipt' : 'receipts'}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center space-x-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => handleStartEditBranch(bName)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-[#4361EE] hover:bg-white transition cursor-pointer"
                                  title="Rename branch"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBranch(bName)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                                  title="Delete branch"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Data Management & System Card */}
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
                <div className="flex items-center space-x-3 border-b border-slate-100 pb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold shrink-0">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Data Storage & Backup
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Export records, manage backups, or reload standard data.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#4361EE]/40 hover:shadow-xs transition text-left cursor-pointer group"
                  >
                    <FileSpreadsheet className="w-5 h-5 text-[#4361EE] mb-2" />
                    <div className="text-xs font-bold text-slate-800 group-hover:text-[#4361EE]">
                      Export CSV Ledger
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Download spreadsheet compatible file
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportJSON}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#4361EE]/40 hover:shadow-xs transition text-left cursor-pointer group"
                  >
                    <Database className="w-5 h-5 text-indigo-600 mb-2" />
                    <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-600">
                      Backup JSON
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Full system backup snapshot
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsImportExportOpen(true)}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-[#4361EE]/40 hover:shadow-xs transition text-left cursor-pointer group"
                  >
                    <Layers className="w-5 h-5 text-sky-600 mb-2" />
                    <div className="text-xs font-bold text-slate-800 group-hover:text-sky-600">
                      Import & Restore
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Upload JSON or restore sample dataset
                    </div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </main>
      </div>

      {/* Modals & Sheets */}
      <ReceiptFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setReceiptToEdit(null);
        }}
        onSave={handleSaveReceipt}
        receiptToEdit={receiptToEdit}
        existingReceipts={receipts}
        branchOptions={branches}
        onOpenSettings={() => handleSubTabSelect('settings')}
      />

      <ReceiptDetailModal
        receipt={viewingReceipt}
        onClose={() => setViewingReceipt(null)}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onPrint={handleOpenPrint}
        onStatusChange={handleStatusChangeFromDetail}
      />

      <ReceiptPrintView
        receipt={printingReceipt}
        onClose={() => setPrintingReceipt(null)}
      />

      <DeleteConfirmModal
        isOpen={Boolean(deletingReceipt)}
        onClose={() => setDeletingReceipt(null)}
        onConfirm={handleConfirmSingleDelete}
        receiptToDelete={deletingReceipt}
      />

      <DeleteConfirmModal
        isOpen={bulkDeleteIds.length > 0}
        onClose={() => setBulkDeleteIds([])}
        onConfirm={handleConfirmBulkDelete}
        bulkCount={bulkDeleteIds.length}
      />

      <ImportExportModal
        isOpen={isImportExportOpen}
        onClose={() => setIsImportExportOpen(false)}
        onImport={handleImportRecords}
        onExportCSV={handleExportCSV}
        onExportJSON={handleExportJSON}
        onResetData={handleReloadFromDatabase}
        currentCount={receipts.length}
      />

      {/* Notifications */}
      <NotificationToast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
