'use client';

import React, { useState, useRef } from 'react';
import { ReceiptRecord, ReceiptStatus } from '../types/receipt';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  FileCode, 
  CheckCircle2, 
  AlertCircle,
  RotateCcw
} from 'lucide-react';

interface ImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (imported: ReceiptRecord[]) => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onResetData: () => void;
  currentCount: number;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  isOpen,
  onClose,
  onImport,
  onExportCSV,
  onExportJSON,
  onResetData,
  currentCount
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [importStatus, setImportStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) throw new Error('File is empty.');

        let parsedRecords: ReceiptRecord[] = [];

        if (file.name.endsWith('.json')) {
          const json = JSON.parse(text);
          if (!Array.isArray(json)) throw new Error('JSON must contain an array of receipts.');
          parsedRecords = json.map((item, idx) => ({
            id: item.id || `imported-${Date.now()}-${idx}`,
            orNumber: item.orNumber || `OR-${idx + 1}`,
            assessmentNo: item.assessmentNo || `ASN-${idx + 1}`,
            date: item.date || new Date().toISOString().slice(0, 10),
            amount: parseFloat(item.amount) || 0,
            payorName: item.payorName || 'Unknown Payor',
            branch: item.branch || 'Makati Branch',
            status: (item.status as ReceiptStatus) || 'Pending',
            caseNo: item.caseNo || 'N/A',
            remarks: item.remarks || ''
          }));
        } else if (file.name.endsWith('.csv')) {
          const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
          if (lines.length < 2) throw new Error('CSV file contains no data rows.');
          
          const dataRows = lines.slice(1);
          parsedRecords = dataRows.map((line, idx) => {
            const cols = line.split(',').map(c => c.replace(/^"|"$/g, '').trim());
            return {
              id: `imported-${Date.now()}-${idx}`,
              orNumber: cols[0] || `OR-IMP-${idx + 1}`,
              assessmentNo: cols[1] || `ASN-IMP-${idx + 1}`,
              date: cols[2] || new Date().toISOString().slice(0, 10),
              amount: parseFloat(cols[3]) || 0,
              payorName: cols[4] || 'Unknown Payor',
              branch: cols[5] || 'Makati Branch',
              status: (cols[6] as ReceiptStatus) || 'Pending',
              caseNo: cols[7] || 'N/A',
              remarks: cols[8] || ''
            };
          });
        } else {
          throw new Error('Please select a valid .json or .csv file.');
        }

        if (parsedRecords.length === 0) {
          throw new Error('No valid records found in the uploaded file.');
        }

        onImport(parsedRecords);
        setImportStatus({
          type: 'success',
          message: `Imported ${parsedRecords.length} records.`
        });
      } catch (err: any) {
        setImportStatus({
          type: 'error',
          message: err.message || 'Failed to parse file.'
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#F2F2F7] rounded-[24px] shadow-2xl border border-black/10 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-md px-5 py-3.5 border-b border-black/5 flex items-center justify-between">
          <div className="font-semibold text-sm text-neutral-900">
            Export / Import Data
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm font-semibold text-[#007AFF] hover:opacity-80 transition cursor-pointer"
          >
            Done
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3.5 text-xs text-neutral-700">
          {importStatus.type && (
            <div
              className={`p-3 rounded-xl flex items-center space-x-2 ${
                importStatus.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {importStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{importStatus.message}</span>
            </div>
          )}

          {/* Export Group */}
          <div className="bg-white rounded-2xl border border-black/5 overflow-hidden shadow-2xs divide-y divide-black/[0.04]">
            <button
              onClick={onExportCSV}
              className="w-full p-3.5 flex items-center justify-between hover:bg-neutral-50 transition cursor-pointer text-left"
            >
              <div className="flex items-center space-x-3">
                <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="font-semibold text-neutral-900">Export CSV</div>
                  <div className="text-[11px] text-neutral-400">{currentCount} records</div>
                </div>
              </div>
              <span className="text-xs text-[#007AFF] font-medium">Download</span>
            </button>

            <button
              onClick={onExportJSON}
              className="w-full p-3.5 flex items-center justify-between hover:bg-neutral-50 transition cursor-pointer text-left"
            >
              <div className="flex items-center space-x-3">
                <FileCode className="w-5 h-5 text-[#007AFF]" />
                <div>
                  <div className="font-semibold text-neutral-900">Export JSON</div>
                  <div className="text-[11px] text-neutral-400">Full backup</div>
                </div>
              </div>
              <span className="text-xs text-[#007AFF] font-medium">Download</span>
            </button>
          </div>

          {/* Import Box */}
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="bg-white rounded-2xl border-2 border-dashed border-neutral-300 hover:border-[#007AFF] p-6 text-center cursor-pointer transition shadow-2xs"
          >
            <UploadCloud className="w-6 h-6 text-neutral-400 mx-auto mb-1.5" />
            <div className="font-semibold text-neutral-800">Upload .csv or .json</div>
            <div className="text-[11px] text-neutral-400 mt-0.5">Click to select file from device</div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Reset Demo Button */}
          <div className="bg-white rounded-2xl border border-black/5 p-3 flex items-center justify-between shadow-2xs">
            <div>
              <div className="font-semibold text-neutral-900">Sample Records</div>
              <div className="text-[11px] text-neutral-400">Restore default demo data</div>
            </div>
            <button
              onClick={() => {
                onResetData();
                setImportStatus({
                  type: 'success',
                  message: 'Sample records restored.'
                });
              }}
              className="px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-medium flex items-center space-x-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-neutral-500" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
