'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Download, 
  UploadCloud, 
  RotateCcw,
  FileSpreadsheet,
  Receipt
} from 'lucide-react';

interface NavbarProps {
  onNewReceipt: () => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
  onOpenImportModal: () => void;
  onResetData: () => void;
  totalCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewReceipt,
  onExportCSV,
  onExportJSON,
  onOpenImportModal,
  onResetData,
  totalCount
}) => {
  const [showToolsMenu, setShowToolsMenu] = useState(false);

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-black/5 sticky top-0 z-30 transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Brand / App Title */}
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#007AFF] flex items-center justify-center text-white shadow-xs">
              <Receipt className="w-4 h-4" />
            </div>
            <div className="flex items-baseline space-x-2">
              <span className="font-semibold text-base text-black tracking-tight">
                OR Tracker
              </span>
              <span className="text-xs text-neutral-400 font-medium">
                {totalCount} {totalCount === 1 ? 'record' : 'records'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {/* Tools Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowToolsMenu(!showToolsMenu)}
                className="inline-flex items-center space-x-1 text-xs font-medium px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export / Import</span>
              </button>

              {showToolsMenu && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-xl border border-black/10 rounded-2xl shadow-xl py-1.5 z-50 text-xs text-neutral-800 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setShowToolsMenu(false)}
                >
                  <button
                    onClick={() => {
                      onExportCSV();
                      setShowToolsMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-neutral-100/80 flex items-center space-x-2.5 cursor-pointer text-neutral-800"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={() => {
                      onExportJSON();
                      setShowToolsMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-neutral-100/80 flex items-center space-x-2.5 cursor-pointer text-neutral-800"
                  >
                    <Download className="w-4 h-4 text-[#007AFF]" />
                    <span>Export JSON</span>
                  </button>
                  <button
                    onClick={() => {
                      onOpenImportModal();
                      setShowToolsMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-neutral-100/80 flex items-center space-x-2.5 cursor-pointer text-neutral-800"
                  >
                    <UploadCloud className="w-4 h-4 text-amber-600" />
                    <span>Import File</span>
                  </button>
                  <div className="border-t border-black/5 my-1" />
                  <button
                    onClick={() => {
                      onResetData();
                      setShowToolsMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 hover:bg-rose-50 text-rose-600 flex items-center space-x-2.5 cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4 text-rose-500" />
                    <span>Reset Sample Data</span>
                  </button>
                </div>
              )}
            </div>

            {/* New OR Primary Action */}
            <button
              type="button"
              onClick={onNewReceipt}
              className="inline-flex items-center space-x-1.5 text-xs font-semibold px-3.5 py-1.5 rounded-full bg-[#007AFF] hover:bg-[#0062CC] active:scale-95 text-white shadow-xs transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New OR</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
