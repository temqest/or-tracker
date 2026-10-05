'use client';

import React from 'react';
import { LayoutGrid, Receipt, FileSpreadsheet, Building2, Settings } from 'lucide-react';

export type SubTab = 'overview' | 'receipts' | 'assessments' | 'branches' | 'settings';

interface NavigationTabsProps {
  currentTab: SubTab;
  onSelectTab: (tab: SubTab) => void;
}

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
  currentTab,
  onSelectTab
}) => {
  const tabs = [
    { id: 'overview' as SubTab, label: 'Overview', icon: LayoutGrid },
    { id: 'receipts' as SubTab, label: 'Official Receipts', icon: Receipt },
    { id: 'assessments' as SubTab, label: 'Assessments', icon: FileSpreadsheet },
    { id: 'branches' as SubTab, label: 'Branch Summary', icon: Building2 },
    { id: 'settings' as SubTab, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="flex items-center space-x-6 border-b border-slate-200/80 mb-5">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex items-center space-x-2 py-2.5 text-xs font-semibold border-b-2 transition cursor-pointer -mb-[1px] ${
              isActive
                ? 'border-[#4361EE] text-[#4361EE]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-[#4361EE]' : 'text-slate-400'}`} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
