'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Receipt, 
  FileText, 
  BarChart3, 
  FileSpreadsheet, 
  Settings, 
  LogOut,
  Layers
} from 'lucide-react';

export type NavSection = 'dashboard' | 'receipts' | 'assessments' | 'analytics' | 'export' | 'settings';

interface SidebarProps {
  currentSection: NavSection;
  onSelectSection: (section: NavSection) => void;
  onOpenExportModal: () => void;
  receiptCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentSection,
  onSelectSection,
  onOpenExportModal,
  receiptCount
}) => {
  const navItems = [
    { id: 'dashboard' as NavSection, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'receipts' as NavSection, label: 'Official Receipts', icon: Receipt, badge: receiptCount },
    { id: 'assessments' as NavSection, label: 'Assessments', icon: FileText },
    { id: 'analytics' as NavSection, label: 'Analytics', icon: BarChart3 },
    { id: 'export' as NavSection, label: 'Data & Export', icon: FileSpreadsheet, action: onOpenExportModal },
    { id: 'settings' as NavSection, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-60 bg-white border-r border-slate-100 flex flex-col justify-between h-screen sticky top-0 shrink-0 z-20 select-none">
      {/* Brand & Nav */}
      <div className="p-4 flex flex-col">
        {/* Brand Header */}
        <div className="flex items-center space-x-3 px-2 py-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-[#4361EE] flex items-center justify-center text-white shadow-sm shadow-[#4361EE]/25 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-sm text-slate-900 tracking-tight block">
              OR Tracker
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 block -mt-0.5">
              Legal Ledger
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.action) {
                    item.action();
                  } else {
                    onSelectSection(item.id);
                  }
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#EEF2FF] text-[#4361EE] font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#4361EE]' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-[#4361EE] text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Logout with ample bottom margin so it doesn't get covered by dev badges */}
      <div className="p-4 pb-8 border-t border-slate-100">
        <button
          onClick={() => alert('Local management mode.')}
          className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-50 rounded-xl transition cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  );
};
