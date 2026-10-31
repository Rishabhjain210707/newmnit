'use client';

import React, { useState } from 'react';
import { Transaction, Project, TeamMember, UserRole } from '../../types';
import { formatINR, formatDate, getDeadlineStatus } from '../../utils/formatters';
import { Icons } from '../ui/Icons';
import {
  mockFreelancerProfile,
  mockClientConcentration,
  mockProjects,
  mockTeamMembers,
  mockMetrics,
  mockTransactions,
} from '../../data/mockData';
import { ProjectDetailModal } from '../projects/ProjectDetailModal';

interface OverviewDashboardProps {
  metrics?: {
    totalSettledRevenue?: number;
    settledGrowthPercent?: string;
    pendingInvoicesCount?: number;
    pendingInvoicesAmount?: number;
    activeProjectsCount?: number;
    verifiedTrustScore?: number;
    maxTrustScore?: number;
    trustReviewsCount?: number;
    onTimePaymentRate?: number;
  };
  transactions?: Transaction[];
  projects?: Project[];
  teamMembers?: TeamMember[];
  currentUserRole?: UserRole;
  onSelectProject?: (id: string) => void;
  onNewProposal?: () => void;
  onQuickInvoice?: () => void;
  onShareReputation?: () => void;
  onNavigateTab?: (tab: string) => void;
  onActionClick?: (tx: Transaction) => void;
  onUpdateProject?: (updated: Project) => void;
  onToggleTrustMode?: (memberId: string) => void;
  onAddBillableScope?: (amount: number, description?: string) => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = (props) => {
  const {
    metrics,
    transactions = [],
    projects = [],
    teamMembers = [],
    currentUserRole = 'freelancer',
    onSelectProject,
    onNewProposal,
    onQuickInvoice,
    onShareReputation,
    onNavigateTab,
    onActionClick,
    onUpdateProject,
    onToggleTrustMode,
    onAddBillableScope,
  } = props;

  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Defensive array checks
  const safeTransactions = Array.isArray(transactions) && transactions.length > 0 ? transactions : (mockTransactions || []);
  const safeProjects = Array.isArray(projects) && projects.length > 0 ? projects : (mockProjects || []);
  const safeTeamMembers = Array.isArray(teamMembers) && teamMembers.length > 0 ? teamMembers : (mockTeamMembers || []);
  const safeMetrics = metrics || mockMetrics;
  const safeRole = currentUserRole || 'freelancer';

  // Visible projects filtered by role
  const visibleProjects = safeProjects.filter((p) => {
    if (!p) return false;
    const clientName = (p.clientName || '').toLowerCase();
    const clientCompany = (p.clientCompany || '').toLowerCase();

    if (safeRole === 'client') {
      return clientName.includes('kunal') || clientCompany.includes('cred') || p.id === 'p1' || p.id === 'proj_cred_video';
    }
    if (safeRole === 'team_member') {
      return p.assignedTeamMemberId === 'member_rohan' || p.id === 'p1' || p.id === 'proj_cred_video';
    }
    return true;
  });

  // Collect active deliverables requiring attention
  const activeDeliverablesList = safeProjects.flatMap((p) =>
    (p.deliverables || []).map((d) => ({
      ...d,
      projectId: p.id,
      projectTitle: p.title,
      clientCompany: p.clientCompany,
    }))
  );

  const pendingReviewDeliverables = activeDeliverablesList.filter(
    (d) => d.status === 'Submitted' || d.status === 'Sent to Client'
  );

  const handleCardClick = (proj: Project) => {
    setSelectedProject(proj);
    if (onSelectProject) {
      onSelectProject(proj.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Role Banner Notification (Subtle & Clean) */}
      {safeRole !== 'freelancer' && (
        <div className="p-3.5 rounded-xl bg-slate-900 text-white flex items-center justify-between text-xs shadow-xs">
          <div className="flex items-center gap-2.5 font-medium">
            <span
              className={`w-2 h-2 rounded-full ${safeRole === 'team_member' ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
            />
            <span>
              {safeRole === 'team_member'
                ? 'Team Member Mode (Rohan Mehta): Viewing assigned video assets & tasks. Financials hidden.'
                : 'Client Portal Mode (Kunal Shah - CRED): Review deliverables, sign-off on versions, and clear milestone tranches.'}
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {String(safeRole).replace('_', ' ')}
          </span>
        </div>
      )}

      {/* Hero Welcome Bar: Clean, Calm & Professional */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
              Command Center
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 font-medium">
              VPA: {mockFreelancerProfile?.upiId || '9079879010@fam'}
            </span>
          </div>

          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
            {safeRole === 'team_member'
              ? 'Welcome back, Rohan 👋'
              : safeRole === 'client'
                ? 'Welcome back, Kunal Shah 👋'
                : 'Welcome back, Arjun 👋'}
          </h1>

          <p className="text-xs md:text-sm text-slate-500 max-w-2xl leading-relaxed">
            {safeRole === 'team_member'
              ? 'You have 1 deliverable awaiting review on the CRED 30s Brand Video cut. Upload new cuts or check feedback notes.'
              : safeRole === 'client'
                ? 'Review pending video cuts, request timestamped changes, and release instant zero-fee UPI milestone tranches.'
                : 'Zero-fee UPI settlement pipeline is active. 3 invoices pending clearance and 1 cut awaiting sign-off.'}
          </p>
        </div>

        {safeRole === 'freelancer' && (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={onQuickInvoice}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Icons.Rupee className="w-3.5 h-3.5" />
              <span>+ Quick Invoice</span>
            </button>

            <button
              type="button"
              onClick={onNewProposal}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Icons.Plus className="w-3.5 h-3.5" />
              <span>+ New Proposal</span>
            </button>

            <button
              type="button"
              onClick={onShareReputation}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors"
            >
              <Icons.Share2 className="w-3.5 h-3.5 text-indigo-600" />
              <span>Share Profile</span>
            </button>
          </div>
        )}
      </div>

      {/* Top Level Metric KPIs Strip */}
      {safeRole !== 'team_member' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Settled Revenue */}
          <div
            onClick={() => onNavigateTab && onNavigateTab('invoices')}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Settled Revenue</span>
              <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                ₹
              </span>
            </div>
            <div className="mt-2.5">
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                {formatINR(safeMetrics?.totalSettledRevenue || 1485000)}
              </div>
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-semibold">{safeMetrics?.settledGrowthPercent || '+18.4%'}</span>
                <span className="text-indigo-600 group-hover:underline text-[11px] font-medium">Invoices →</span>
              </div>
            </div>
          </div>

          {/* Card 2: Pending Invoices */}
          <div
            onClick={() => onNavigateTab && onNavigateTab('invoices')}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Pending Invoices</span>
              <Icons.Clock className="w-4 h-4 text-amber-500" />
            </div>
            <div className="mt-2.5">
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                {formatINR(safeMetrics?.pendingInvoicesAmount || 182500)}
              </div>
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-amber-800 font-medium bg-amber-50 px-1.5 py-0.2 rounded">
                  {safeMetrics?.pendingInvoicesCount || 3} Unsettled Tranches
                </span>
                <span className="text-indigo-600 group-hover:underline text-[11px] font-medium">Clear →</span>
              </div>
            </div>
          </div>

          {/* Card 3: Active Deliverables */}
          <div
            onClick={() => onNavigateTab && onNavigateTab('deliverables')}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Deliverables in Pipeline</span>
              <Icons.Play className="w-4 h-4 text-indigo-600" />
            </div>
            <div className="mt-2.5">
              <div className="text-2xl font-bold text-slate-900 tracking-tight">
                {activeDeliverablesList.length} Assets
              </div>
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  <strong className="text-amber-600">{pendingReviewDeliverables.length}</strong> Awaiting Review
                </span>
                <span className="text-indigo-600 group-hover:underline text-[11px] font-medium">Hub →</span>
              </div>
            </div>
          </div>

          {/* Card 4: Trust Score */}
          <div
            onClick={() => onNavigateTab && onNavigateTab('trust')}
            className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Verified Client Trust</span>
              <Icons.ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="mt-2.5">
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-slate-900 tracking-tight">
                  {(safeMetrics?.verifiedTrustScore || 4.9).toFixed(1)}
                </span>
                <span className="text-slate-400 text-xs font-medium">/ 5.0 ★</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-emerald-700 font-medium">
                  {safeMetrics?.trustReviewsCount || 38} Verified Ratings
                </span>
                <span className="text-indigo-600 group-hover:underline text-[11px] font-medium">Reviews →</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">Assigned Project</span>
            <span className="text-lg font-bold text-slate-900 mt-1 block">CRED Pulse: 30s Brand Video</span>
            <span className="text-xs text-indigo-600 mt-0.5 block">Role: Video Editor</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">Review Pipeline</span>
            <span className="text-lg font-bold text-amber-700 mt-1 block">v2 Cut Submitted</span>
            <span className="text-xs text-slate-400 mt-0.5 block">Awaiting Lead sign-off</span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs">
            <span className="text-xs font-medium text-slate-500 block">Deliverables Hub</span>
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('deliverables')}
              className="mt-1 text-xs font-semibold text-indigo-600 hover:underline block"
            >
              Open Deliverables & Version Control →
            </button>
            <span className="text-[11px] text-slate-400 mt-0.5 block">Upload revisions or read feedback</span>
          </div>
        </div>
      )}

      {/* Urgent Action Center: Deliverables Awaiting Review */}
      {pendingReviewDeliverables.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              <h3 className="text-sm font-bold text-amber-900">
                Action Required: Deliverable Waiting For Review
              </h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('deliverables')}
              className="text-xs font-semibold text-amber-800 hover:underline"
            >
              Open Deliverables Hub →
            </button>
          </div>

          <div className="space-y-2">
            {pendingReviewDeliverables.slice(0, 2).map((deliv) => (
              <div
                key={deliv.id}
                className="bg-white p-3.5 rounded-xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{deliv.title}</span>
                    <span className="px-1.5 py-0.2 rounded font-mono font-bold bg-slate-100 text-slate-700 text-[10px]">
                      {deliv.currentVersion || 'v1'}
                    </span>
                    <span className="text-[10px] text-slate-400">({deliv.clientCompany})</span>
                  </div>
                  <p className="text-slate-500 mt-0.5">
                    Submitted by <strong>{deliv.assignedToName || 'Rohan Mehta'}</strong> • Ready for quality review.
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onNavigateTab && onNavigateTab('deliverables')}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors text-xs"
                  >
                    Inspect & Sign-Off
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two-Column Section: Active Projects & Cashflow Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Active Projects Pulse */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Active Projects & Deadlines</h3>
              <p className="text-xs text-slate-500">Live progress calculated from approved deliverables.</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('projects')}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              View All ({visibleProjects.length}) →
            </button>
          </div>

          <div className="space-y-3">
            {visibleProjects.slice(0, 3).map((proj) => {
              const deadlineStatus = getDeadlineStatus(proj.deadline);
              const delivList = proj.deliverables || [];
              const totalDeliv = proj.totalDeliverables || delivList.length || 1;
              const completedDeliv =
                proj.completedDeliverables ||
                delivList.filter((d) => d && d.status === 'Approved').length ||
                0;
              const progress = Math.min(100, Math.round((completedDeliv / totalDeliv) * 100));

              return (
                <div
                  key={proj.id}
                  onClick={() => handleCardClick(proj)}
                  className="p-3.5 rounded-xl border border-slate-200/80 hover:border-indigo-300 transition-all cursor-pointer group space-y-2.5 bg-slate-50/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                        {proj.clientCompany}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs group-hover:text-indigo-600 transition-colors">
                        {proj.title}
                      </h4>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${deadlineStatus.color === 'red'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : deadlineStatus.color === 'amber'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                    >
                      {deadlineStatus.label}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{completedDeliv}/{totalDeliv} Deliverables Approved</span>
                      <span className="font-mono font-bold text-slate-900">{progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <span>Due: {formatDate(proj.deadline)}</span>
                    <span className="text-slate-700 font-semibold">
                      {safeRole === 'team_member' ? 'Confidential' : formatINR(proj.totalBudget || proj.budget || 0)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Financial Health & Risk Pulse */}
        <div className="lg:col-span-5 space-y-4">
          {safeRole === 'freelancer' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Runway & Dependency Pulse</h3>
                  <p className="text-xs text-slate-500">Protects cashflow from delayed payments.</p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateTab && onNavigateTab('simulator')}
                  className="text-xs font-semibold text-indigo-600 hover:underline"
                >
                  Simulator →
                </button>
              </div>

              {/* Concentration Highlight */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Top Client Share (CRED):</span>
                  <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    66.5% Pipeline Risk
                  </span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full rounded-full" style={{ width: '66.5%' }} />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Kunal Shah (CRED) holds &gt;60% of current revenue. If their milestone invoice is delayed by 30 days,
                  personal runway drops from 60 days to <strong>12 days</strong>.
                </p>
              </div>

              {/* Quick Actions to dedicated pages */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => onNavigateTab && onNavigateTab('simulator')}
                  className="p-2.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-colors text-center"
                >
                  Delay Simulator →
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateTab && onNavigateTab('concentration')}
                  className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors text-center"
                >
                  Concentration Gauge →
                </button>
              </div>
            </div>
          )}

          {/* Team Members Trust Snapshot */}
          {safeRole === 'freelancer' && (
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Team Delegation</h3>
                  <p className="text-xs text-slate-500">Members with 'Trusted' push cuts directly to clients.</p>
                </div>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-semibold">
                  {safeTeamMembers.length} Members
                </span>
              </div>

              <div className="space-y-2">
                {safeTeamMembers.map((member) => {
                  const isTrusted = member.trustMode === 'trusted';
                  return (
                    <div
                      key={member.id}
                      className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block leading-tight">{member.name}</span>
                          <span className="text-[10px] text-slate-400">{member.role}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onToggleTrustMode && onToggleTrustMode(member.id)}
                        className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors ${isTrusted
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          }`}
                      >
                        {isTrusted ? '✓ Trusted' : '⏱ Approval'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Clean Recent Invoices Table (Tone Down & Elevated) */}
      {safeRole !== 'team_member' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Recent UPI Milestone Invoices</h3>
              <p className="text-xs text-slate-500">Split advance and completion tranches with instant settlement.</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab && onNavigateTab('invoices')}
              className="text-xs font-semibold text-indigo-600 hover:underline"
            >
              View All Invoices ({safeTransactions.length}) →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-5">Client</th>
                  <th className="py-2.5 px-4">Project & Tranche</th>
                  <th className="py-2.5 px-4">Amount</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {safeTransactions.slice(0, 4).map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={tx.clientAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80'}
                          alt={tx.clientName}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{tx.clientName}</span>
                          <span className="text-[10px] text-slate-400">{tx.vpa || 'UPI Verified'}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-800 block">{tx.projectTitle}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {tx.invoiceNumber} {tx.trancheLabel ? `• ${tx.trancheLabel}` : ''}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                      {formatINR(tx.amount)}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${tx.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : tx.status === 'Pending'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                      >
                        {tx.status}
                      </span>
                    </td>

                    <td className="py-3 px-5 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => {
                          if (onActionClick) onActionClick(tx);
                          else if (onNavigateTab) onNavigateTab('invoices');
                        }}
                        className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      >
                        {tx.status === 'Paid' ? 'Receipt' : 'Inspect'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Interactive Project Detail Modal */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          isOpen={!!selectedProject}
          currentUserRole={safeRole}
          isTeamMemberTrusted={safeTeamMembers.find((m) => m.id === 'member_rohan')?.trustMode === 'trusted'}
          onClose={() => setSelectedProject(null)}
          onUpdateProject={(updated) => {
            setSelectedProject(updated);
            if (onUpdateProject) onUpdateProject(updated);
          }}
          onAddBillableScope={onAddBillableScope}
        />
      )}
    </div>
  );
};
