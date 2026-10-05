'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ReceiptRecord, FilterOptions, SortField, SortOrder, ReceiptStatus } from '../types/receipt';
import { loadReceipts, saveReceipts, resetToDefaultReceipts, exportToCSV, exportToJSON } from '../lib/storage';
import { INITIAL_RECEIPTS, BRANCH_OPTIONS } from '../data/sampleReceipts';
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
import { Building2, Plus } from 'lucide-react';

export default function Home() {
  const [receipts, setReceipts] = useState<ReceiptRecord[]>(INITIAL_RECEIPTS);
  const [currentSection, setCurrentSection] = useState<NavSection>('dashboard');
  const [currentSubTab, setCurrentSubTab] = useState<SubTab>('overview');

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

  // Initial Load from localStorage
  useEffect(() => {
    const loaded = loadReceipts();
    setReceipts(loaded);
  }, []);

  // Sync to localStorage
  const updateReceiptsState = (updater: ReceiptRecord[] | ((prev: ReceiptRecord[]) => ReceiptRecord[])) => {
    setReceipts(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      saveReceipts(next);
      return next;
    });
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

  // CRUD Operations
  const handleSaveReceipt = (record: ReceiptRecord) => {
    if (receiptToEdit) {
      updateReceiptsState(prev => prev.map(r => (r.id === record.id ? record : r)));
      addToast('Receipt Updated', `${record.orNumber} has been updated.`);
    } else {
      updateReceiptsState(prev => [record, ...prev]);
      addToast('Receipt Created', `${record.orNumber} added.`);
    }
    setIsFormModalOpen(false);
    setReceiptToEdit(null);
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

  const handleConfirmSingleDelete = () => {
    if (!deletingReceipt) return;
    const targetOr = deletingReceipt.orNumber;
    updateReceiptsState(prev => prev.filter(r => r.id !== deletingReceipt.id));
    addToast('Receipt Deleted', `${targetOr} removed.`);
    setDeletingReceipt(null);
    if (viewingReceipt?.id === deletingReceipt.id) {
      setViewingReceipt(null);
    }
  };

  const handleStatusChangeFromDetail = (receipt: ReceiptRecord, newStatus: ReceiptStatus) => {
    const updated = { ...receipt, status: newStatus };
    updateReceiptsState(prev => prev.map(r => (r.id === receipt.id ? updated : r)));
    setViewingReceipt(updated);
    addToast('Status Updated', `${receipt.orNumber} status updated to ${newStatus}.`);
  };

  const handleBulkStatusChange = (ids: string[], newStatus: ReceiptStatus) => {
    updateReceiptsState(prev =>
      prev.map(r => (ids.includes(r.id) ? { ...r, status: newStatus } : r))
    );
    addToast('Bulk Status Updated', `${ids.length} records updated.`);
  };

  const handleOpenBulkDelete = (ids: string[]) => {
    setBulkDeleteIds(ids);
    setDeletingReceipt(null);
  };

  const handleConfirmBulkDelete = () => {
    if (bulkDeleteIds.length === 0) return;
    const count = bulkDeleteIds.length;
    updateReceiptsState(prev => prev.filter(r => !bulkDeleteIds.includes(r.id)));
    addToast('Records Deleted', `${count} records removed.`);
    setBulkDeleteIds([]);
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

  const handleImportRecords = (imported: ReceiptRecord[]) => {
    updateReceiptsState(imported);
    addToast('Records Imported', `Imported ${imported.length} receipts.`);
  };

  const handleResetToSample = () => {
    const sample = resetToDefaultReceipts();
    setReceipts(sample);
    addToast('Reset Complete', 'Sample receipts restored.');
  };

  const handleSidebarSelect = (section: NavSection) => {
    setCurrentSection(section);
    if (section === 'dashboard') setCurrentSubTab('overview');
    if (section === 'receipts') setCurrentSubTab('receipts');
    if (section === 'assessments') setCurrentSubTab('assessments');
    if (section === 'analytics') setCurrentSubTab('branches');
  };

  const handleSubTabSelect = (tab: SubTab) => {
    setCurrentSubTab(tab);
    if (tab === 'overview') setCurrentSection('dashboard');
    if (tab === 'receipts') setCurrentSection('receipts');
    if (tab === 'assessments') setCurrentSection('assessments');
    if (tab === 'branches') setCurrentSection('analytics');
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
              : 'Branch Analytics'
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
                        Manage, sort, and filter recorded official receipts
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
                      Full database of official receipts and case dockets
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {BRANCH_OPTIONS.filter(b => b !== 'All Branches').map((branchName) => {
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
        onResetData={handleResetToSample}
        currentCount={receipts.length}
      />

      {/* Notifications */}
      <NotificationToast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
