'use client';

import React from 'react';
import { TabType } from '../../types';
import { Icons } from '../ui/Icons';
import { mockFreelancerProfile } from '../../data/mockData';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onNewProposal: () => void;
  onQuickInvoice: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onNewProposal,
  onQuickInvoice,
}) => {
  const navItems: { id: TabType; label: string; icon: React.FC<any>; badge?: string }[] = [
    { id: 'overview', label: 'Overview', icon: Icons.Dashboard },
    { id: 'proposals', label: 'Proposals & E-Sign', icon: Icons.FileText, badge: 'Live' },
    { id: 'invoices', label: 'UPI Invoicing', icon: Icons.QrCode, badge: 'Instant' },
    { id: 'trust', label: 'Trust & Reputation', icon: Icons.ShieldCheck, badge: '4.9 ★' },
  ];

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 border-r border-slate-200 bg-white min-h-screen p-5 select-none shrink-0">
      {/* Brand Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
            <span className="font-bold text-lg tracking-tight">₹</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-900 tracking-tight text-base">PaidFlow</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                Solo Pro
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Fintech for Freelancers</p>
          </div>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="pt-5 pb-4 space-y-2">
        <button
          onClick={onQuickInvoice}
          className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-semibold py-2.5 px-3.5 rounded-lg shadow-sm transition-all"
        >
          <Icons.Plus className="w-4 h-4" />
          <span>Quick UPI Invoice</span>
        </button>

        <button
          onClick={onNewProposal}
          className="w-full flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold py-2 px-3.5 rounded-lg transition-colors"
        >
          <Icons.PenTool className="w-3.5 h-3.5 text-slate-500" />
          <span>New Proposal & Scope</span>
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 pt-3 space-y-1">
        <p className="px-3 text-[11px] font-semibold tracking-wider uppercase text-slate-400 mb-2">
          Workspace
        </p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-indigo-600' : 'text-slate-400'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                    isActive
                      ? 'bg-indigo-200/60 text-indigo-800'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Trust & Reputation Fast Card */}
      <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <Icons.ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-slate-800">Trust Badge Active</span>
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
            98% On-Time
          </span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Zero fee deduction on UPI P2M payments. Client escrow verification enabled.
        </p>
      </div>

      {/* Freelancer Profile Footer */}
      <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
        <img
          src={mockFreelancerProfile.avatar}
          alt={mockFreelancerProfile.name}
          className="w-9 h-9 rounded-full object-cover ring-2 ring-indigo-100"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <p className="text-xs font-semibold text-slate-900 truncate">
              {mockFreelancerProfile.name}
            </p>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" title="Online" />
          </div>
          <p className="text-[11px] text-slate-400 truncate">{mockFreelancerProfile.upiId}</p>
        </div>
      </div>
    </aside>
  );
};

