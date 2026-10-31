'use client';

import React from 'react';
import { TabType } from '../../types';
import { Icons } from '../ui/Icons';

interface HeaderProps {
  activeTab: TabType;
  onOpenShareReputation: () => void;
  onQuickInvoice: () => void;
  onNewProposal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenShareReputation,
  onQuickInvoice,
  onNewProposal,
}) => {
  const getHeaderInfo = () => {
    switch (activeTab) {
      case 'overview':
        return {
          title: 'Financial Pulse & Overview',
          subtitle: 'Real-time UPI settlements, proposal status, and verified client trust.',
        };
      case 'proposals':
        return {
          title: 'Milestone Proposals & E-Signatures',
          subtitle: 'Scope lock-in with legally binding digital sign-off and milestone escrow.',
        };
      case 'invoices':
        return {
          title: 'UPI Invoicing & Instant Links',
          subtitle: 'Generate zero-fee UPI QR codes and Razorpay direct payment links.',
        };
      case 'trust':
        return {
          title: 'Verified Client Trust Score',
          subtitle: 'Mutual ratings across craftsmanship, punctuality, and scope discipline.',
        };
      default:
        return {
          title: 'Dashboard',
          subtitle: 'Manage your freelance business.',
        };
    }
  };

  const info = getHeaderInfo();

  return (
    <header className="bg-white border-b border-slate-200/90 px-5 sm:px-8 py-4 sticky top-0 z-20">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Title Area */}
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{info.title}</h1>
            <div className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>UPI Autopay Ready</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{info.subtitle}</p>
        </div>

        {/* Action Header Controls */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenShareReputation}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors shadow-2xs"
          >
            <Icons.Share2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Share Reputation Profile</span>
          </button>

          <button
            onClick={onNewProposal}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200 rounded-lg transition-colors"
          >
            <Icons.PenTool className="w-3.5 h-3.5 text-indigo-600" />
            <span>+ Proposal</span>
          </button>

          <button
            onClick={onQuickInvoice}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] rounded-lg shadow-sm transition-all"
          >
            <Icons.Plus className="w-3.5 h-3.5" />
            <span>+ Quick UPI Invoice</span>
          </button>
        </div>
      </div>
    </header>
  );
};

