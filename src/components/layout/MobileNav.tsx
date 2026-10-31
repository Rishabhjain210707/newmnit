'use client';

import React from 'react';
import { TabType } from '../../types';
import { Icons } from '../ui/Icons';

interface MobileNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onQuickInvoice: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onTabChange,
  onQuickInvoice,
}) => {
  const items: { id: TabType; label: string; icon: React.FC<any> }[] = [
    { id: 'overview', label: 'Overview', icon: Icons.Dashboard },
    { id: 'proposals', label: 'Proposals', icon: Icons.FileText },
    { id: 'invoices', label: 'Invoices', icon: Icons.QrCode },
    { id: 'trust', label: 'Trust', icon: Icons.ShieldCheck },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 px-3 py-2 flex items-center justify-around shadow-lg">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-xs font-medium transition-colors ${
              isActive ? 'text-indigo-600 font-semibold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
            <span>{item.label}</span>
          </button>
        );
      })}

      <button
        onClick={onQuickInvoice}
        className="flex flex-col items-center justify-center p-2 rounded-xl bg-emerald-600 text-white shadow-sm"
        title="Quick Invoice"
      >
        <Icons.Plus className="w-5 h-5" />
      </button>
    </div>
  );
};

