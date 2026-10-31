'use client';

import React, { useState } from 'react';
import {
  initialProjects,
  initialTeamMembers,
  initialActivityLogs,
  mockTransactions,
  mockFreelancerProfile,
  mockClientConcentration,
  mockInitialInvoice,
  mockTrustMetrics,
  mockPendingClientReviews,
} from '../data/mockData';
import {
  Project,
  UserRole,
  ActivityLogItem,
  TeamMember,
  Transaction,
  TabType,
  DeliverableStatus,
} from '../types';
import { OverviewDashboard } from '../components/dashboard/OverviewDashboard';
import { DeliverablesView } from '../components/deliverables/DeliverablesView';
import { ProjectsView } from '../components/projects/ProjectsView';
import { ProjectDetailModal } from '../components/projects/ProjectDetailModal';
import { ProposalCreator } from '../components/proposals/ProposalCreator';
import { UPIInvoiceView } from '../components/invoices/UPIInvoiceView';
import { TrustReviewView } from '../components/trust/TrustReviewView';
import { Icons } from '../components/ui/Icons';
import {
  formatINR,
  calculateDelayImpact,
  generateWhatsAppShareUrl,
  getAppBaseUrl,
} from '../utils/formatters';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [currentRole, setCurrentRole] = useState<UserRole>('freelancer');

  // Core application state
  const defaultProjects: Project[] = Array.isArray(initialProjects) && initialProjects.length > 0 ? initialProjects : [];
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    Array.isArray(mockTransactions) ? mockTransactions : []
  );
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() =>
    Array.isArray(initialTeamMembers) ? initialTeamMembers : []
  );
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>(() =>
    Array.isArray(initialActivityLogs) ? initialActivityLogs : []
  );

  const [activeProjectId, setActiveProjectId] = useState<string>('proj_cred_video');
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTeamDrawer, setShowTeamDrawer] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Delay Impact Simulator State
  const [simDelayDays, setSimDelayDays] = useState<number>(30);
  const [simTone, setSimTone] = useState<'friendly' | 'firm' | 'final'>('friendly');
  const delayedCredAmount = 145000;
  const simImpact = calculateDelayImpact(delayedCredAmount, simDelayDays);

  // Toast feedback helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const safeProjects = Array.isArray(projects) && projects.length > 0 ? projects : defaultProjects;
  const activeProject = safeProjects.find((p) => p && p.id === activeProjectId) || safeProjects[0];

  // Dynamic metrics calculation
  const metrics = {
    totalSettledRevenue: 1485000,
    settledGrowthPercent: '+18.4%',
    pendingInvoicesCount: 3,
    pendingInvoicesAmount: 182500,
    activeProjectsCount: safeProjects.length,
    verifiedTrustScore: 4.92,
    maxTrustScore: 5.0,
    trustReviewsCount: 38,
    onTimePaymentRate: 98,
  };

  const addActivityLog = (projectId: string, person: string, role: string, action: string, deliverableId?: string) => {
    const newLog: ActivityLogItem = {
      id: `log-${Date.now()}`,
      projectId,
      timestamp: 'Just now',
      person,
      role,
      action,
      deliverableId,
      badgeType: 'submission',
    };
    setActivityLogs((prev) => [newLog, ...(Array.isArray(prev) ? prev : [])]);
  };

  // Deliverable status transition
  const handleUpdateDeliverableStatus = (projectId: string, deliverableId: string, newStatus: DeliverableStatus, feedback?: string) => {
    setProjects((prevProjects) =>
      (Array.isArray(prevProjects) ? prevProjects : []).map((project) => {
        if (project.id !== projectId) return project;

        let revisionsUsed = project.freeRevisionsUsed || 0;
        if (newStatus === 'Changes Requested') {
          revisionsUsed += 1;
        }

        const updatedDeliverables = (project.deliverables || []).map((deliv) => {
          if (deliv.id !== deliverableId) return deliv;
          let delivRevs = deliv.revisionsUsed || 0;
          if (newStatus === 'Changes Requested') {
            delivRevs += 1;
          }

          return {
            ...deliv,
            status: newStatus,
            revisionsUsed: delivRevs,
            latestComment: feedback || deliv.latestComment,
          };
        });

        const completedCount = updatedDeliverables.filter((d) => d.status === 'Approved').length;

        return {
          ...project,
          deliverables: updatedDeliverables,
          freeRevisionsUsed: revisionsUsed,
          completedDeliverables: completedCount,
        };
      })
    );

    const person = currentRole === 'freelancer' ? 'Arjun (Lead)' : currentRole === 'team_member' ? 'Rohan (Editor)' : 'Kunal Shah (Client)';
    addActivityLog(projectId, person, currentRole, `Status updated to "${newStatus}"`, deliverableId);
    showToast(`Updated deliverable status to "${newStatus}"`);
  };

  // Submit new version
  const handleUpdateDeliverableLink = (projectId: string, deliverableId: string, link: string, notes?: string) => {
    if (!link.trim()) return;

    setProjects((prevProjects) =>
      (Array.isArray(prevProjects) ? prevProjects : []).map((project) => {
        if (project.id !== projectId) return project;
        const updatedDeliverables = (project.deliverables || []).map((deliv) => {
          if (deliv.id !== deliverableId) return deliv;
          const currentV = deliv.currentVersion || deliv.version || 'v1';
          const nextVNum = parseInt(currentV.replace('v', ''), 10) + 1;
          const nextVersion = `v${nextVNum}`;

          const newVersionObj = {
            version: nextVersion,
            link: link.trim(),
            submittedBy: currentRole === 'team_member' ? 'Rohan Mehta' : 'Arjun Verma',
            submittedAt: 'Today',
            notes: notes || 'Updated cut revision with color correction & audio stems.',
          };

          return {
            ...deliv,
            workLink: link.trim(),
            currentVersion: nextVersion,
            version: nextVersion,
            versions: [newVersionObj, ...(deliv.versions || [])],
            status: 'Submitted',
          };
        });
        return { ...project, deliverables: updatedDeliverables };
      })
    );

    const person = currentRole === 'freelancer' ? 'Arjun (Lead)' : 'Rohan (Editor)';
    addActivityLog(projectId, person, currentRole, `Submitted new version link for deliverable`, deliverableId);
    showToast(`✓ Submitted new version cut!`);
  };

  // Add threaded comment
  const handleAddDeliverableComment = (projectId: string, deliverableId: string, text: string) => {
    if (!text.trim()) return;

    const authorName = currentRole === 'freelancer' ? 'Arjun Verma' : currentRole === 'team_member' ? 'Rohan Mehta' : 'Kunal Shah';
    const avatarUrl =
      currentRole === 'freelancer'
        ? mockFreelancerProfile.avatar
        : currentRole === 'team_member'
        ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80';

    const newComment = {
      id: `comm_${Date.now()}`,
      author: authorName,
      authorRole: currentRole,
      avatar: avatarUrl,
      text: text.trim(),
      timestamp: 'Just now',
    };

    setProjects((prev) =>
      prev.map((proj) => {
        if (proj.id !== projectId) return proj;
        return {
          ...proj,
          deliverables: (proj.deliverables || []).map((d) => {
            if (d.id !== deliverableId) return d;
            return {
              ...d,
              comments: [...(d.comments || []), newComment],
            };
          }),
        };
      })
    );

    showToast('Feedback posted to deliverable!');
  };

  // Add billable scope creep
  const handleAddBillableScope = (projectId: string, amount: number) => {
    setProjects((prevProjects) =>
      (Array.isArray(prevProjects) ? prevProjects : []).map((project) => {
        if (project.id !== projectId) return project;
        const currentBudget = project.totalBudget || project.budget || 0;
        return {
          ...project,
          extraScopeAmount: (project.extraScopeAmount || 0) + amount,
          budget: currentBudget + amount,
          totalBudget: currentBudget + amount,
        };
      })
    );
    addActivityLog(projectId, 'Scope Guard', 'freelancer', `Added billable scope of ₹${amount.toLocaleString('en-IN')} for extra revision`);
    showToast(`⚡ Added +${formatINR(amount)} billable scope to next invoice!`);
  };

  // Trust toggle
  const handleToggleTrust = (memberId: string) => {
    setTeamMembers((prev) =>
      (Array.isArray(prev) ? prev : []).map((m) => {
        if (m.id === memberId) {
          const nextMode = m.trustMode === 'trusted' ? 'needs_approval' : 'trusted';
          showToast(`${m.name} trust mode: ${nextMode === 'trusted' ? 'Trusted (Direct Client Push)' : 'Needs Lead Review'}`);
          return { ...m, trustMode: nextMode };
        }
        return m;
      })
    );
  };

  const handleSelectProject = (id: string) => {
    setActiveProjectId(id);
    setIsDetailModalOpen(true);
  };

  // Generate Tone-Aware WhatsApp URL
  const getWhatsAppNudgeUrl = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : getAppBaseUrl();
    const checkoutLink = `${origin}/pay/inv_1042_t2?amount=${delayedCredAmount}&title=Tranche+2%3A+50%25+on+Final+Delivery&inv=INV-2026-1042`;

    let msg = '';
    if (simTone === 'friendly') {
      msg = `Hi Kunal, hope you're having a productive week! Just checking in on the pending milestone tranche for CRED Pulse (${formatINR(
        delayedCredAmount
      )}). The DaVinci color master & spatial audio stems are signed off and ready for release: ${checkoutLink}`;
    } else if (simTone === 'firm') {
      msg = `Hello Kunal, following up regarding the invoice for CRED Pulse (${formatINR(
        delayedCredAmount
      )}). As the deliverables are approved, settling the UPI tranche today helps us keep our upcoming motion sprint schedule intact: ${checkoutLink}`;
    } else {
      msg = `Urgent Notice: The UPI milestone invoice for CRED Pulse (${formatINR(
        delayedCredAmount
      )}) is past the payment agreement window. Please clear the payment immediately to avoid pausing production handoff: ${checkoutLink}`;
    }
    return generateWhatsAppShareUrl('+919079879010', msg);
  };

  // Count items awaiting review
  const pendingReviewCount = safeProjects
    .flatMap((p) => p.deliverables || [])
    .filter((d) => d.status === 'Submitted' || d.status === 'Sent to Client').length;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col text-slate-800 antialiased font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-top-2 border border-slate-700">
          <Icons.CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2">
            <Icons.X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* TOP HEADER: Clean, Restrained, Professional */}
      <header className="bg-white border-b border-slate-200/90 px-4 md:px-6 py-2.5 flex items-center justify-between gap-4 sticky top-0 z-40 shadow-2xs">
        {/* Brand Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
            ₹
          </div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 tracking-tight text-base">PaidFlow</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
              Pro
            </span>
          </div>
        </div>

        {/* Segmented Perspective Switcher (Apple/Linear Style) */}
        <div className="hidden sm:flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setCurrentRole('freelancer');
              showToast('Switched to Lead Freelancer (Arjun Verma)');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentRole === 'freelancer'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Icons.User className="w-3.5 h-3.5 text-indigo-600" />
            <span>Lead (Arjun)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCurrentRole('team_member');
              showToast('Switched to Editor (Rohan Mehta). Financials hidden.');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentRole === 'team_member'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Icons.Play className="w-3.5 h-3.5 text-amber-500" />
            <span>Editor (Rohan)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setCurrentRole('client');
              showToast('Switched to Client Portal (Kunal Shah - CRED)');
            }}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              currentRole === 'client'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Icons.Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Client (Kunal - CRED)</span>
          </button>
        </div>

        {/* Right Header Actions */}
        <div className="flex items-center gap-2">
          {currentRole === 'freelancer' && (
            <button
              type="button"
              onClick={() => setShowTeamDrawer(true)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Icons.Users className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Team Delegation</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </button>
          )}

          {/* Quick Menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <span>Navigation</span>
              <span className="text-[10px] text-slate-400">▾</span>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-200 p-3 z-50 text-xs space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-slate-900">Workspace Pages</span>
                  <button onClick={() => setIsMenuOpen(false)} className="text-slate-400 hover:text-slate-700">
                    ✕
                  </button>
                </div>

                <div className="space-y-1">
                  {[
                    { id: 'overview', label: 'Command Center', tag: 'Live' },
                    { id: 'deliverables', label: 'Deliverables & Versions', tag: `${pendingReviewCount} Action` },
                    { id: 'projects', label: 'Projects & Deadlines', tag: `${safeProjects.length}` },
                    { id: 'invoices', label: 'UPI Split Invoicing', tag: 'Tranches' },
                    { id: 'simulator', label: 'Delay Impact Simulator', tag: 'Runway' },
                    { id: 'concentration', label: 'Client Concentration Risk', tag: '66.5%' },
                    { id: 'trust', label: 'Verified Reviews & Trust', tag: '4.9 ★' },
                    { id: 'proposals', label: 'Proposals & E-Sign', tag: 'Scope' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setActiveTab(item.id as TabType);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition-colors ${
                        activeTab === item.id ? 'bg-indigo-50 text-indigo-700 font-bold' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span className="text-[10px] text-slate-400">{item.tag}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT: SIDEBAR + CONTENT AREA */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left Sidebar: Structured & Clean */}
        <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-slate-200/90 p-5 shrink-0 flex flex-col justify-between">
          <div className="space-y-6">
            {/* Quick Actions (Freelancer only) */}
            {currentRole === 'freelancer' && (
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('invoices')}
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Icons.Rupee className="w-3.5 h-3.5" />
                  <span>+ Quick UPI Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('proposals')}
                  className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Icons.Plus className="w-3.5 h-3.5" />
                  <span>New Scope Proposal</span>
                </button>
              </div>
            )}

            {/* Navigation Sections */}
            <nav className="space-y-4">
              {/* SECTION: WORKSPACE */}
              <div>
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 block mb-1.5">
                  Core
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-indigo-50 text-indigo-700 font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icons.Dashboard className="w-4 h-4" />
                    <span>Command Center</span>
                  </div>
                  <span className="text-[10px] text-slate-400">Live</span>
                </button>
              </div>

              {/* SECTION: WORK & DELIVERY */}
              <div>
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 block mb-1.5">
                  Work & Delivery
                </span>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('deliverables')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      activeTab === 'deliverables'
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icons.Play className="w-4 h-4 text-indigo-600" />
                      <span>Deliverables Hub</span>
                    </div>
                    {pendingReviewCount > 0 ? (
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-full">
                        {pendingReviewCount} review
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400">v1/v2/v3</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('projects')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      activeTab === 'projects'
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icons.Calendar className="w-4 h-4" />
                      <span>Projects & Deadlines</span>
                    </div>
                    <span className="text-[10px] bg-slate-100 text-slate-700 font-mono px-1.5 py-0.2 rounded">
                      {safeProjects.length}
                    </span>
                  </button>
                </div>
              </div>

              {/* SECTION: FINANCIAL RISK */}
              <div>
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 block mb-1.5">
                  Finances & Risk
                </span>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('invoices')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      activeTab === 'invoices'
                        ? 'bg-emerald-50 text-emerald-800 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icons.QrCode className="w-4 h-4 text-emerald-600" />
                      <span>UPI Invoices</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium">
                      Tranches
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('simulator')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      activeTab === 'simulator'
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icons.Sliders className="w-4 h-4 text-amber-500" />
                      <span>Delay Simulator</span>
                    </div>
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">Runway</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('concentration')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      activeTab === 'concentration'
                        ? 'bg-rose-50 text-rose-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icons.AlertTriangle className="w-4 h-4 text-rose-500" />
                      <span>Concentration Risk</span>
                    </div>
                    <span className="text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded font-bold">66.5%</span>
                  </button>
                </div>
              </div>

              {/* SECTION: TRUST & CONTRACTS */}
              <div>
                <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase px-3 block mb-1.5">
                  Reputation & Scopes
                </span>
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('trust')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      activeTab === 'trust'
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icons.ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Verified Reviews</span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">4.9 ★</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('proposals')}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      activeTab === 'proposals'
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icons.FileText className="w-4 h-4 text-indigo-600" />
                      <span>Proposals & E-Sign</span>
                    </div>
                    <span className="text-[10px] text-slate-400">Contracts</span>
                  </button>
                </div>
              </div>
            </nav>
          </div>

          {/* User Persona Profile in Sidebar Bottom */}
          <div className="pt-4 border-t border-slate-100 mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-xs ${
                  currentRole === 'freelancer' ? 'bg-indigo-600' : currentRole === 'team_member' ? 'bg-amber-600' : 'bg-emerald-600'
                }`}
              >
                {currentRole === 'freelancer' ? 'AV' : currentRole === 'team_member' ? 'RM' : 'KS'}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {currentRole === 'freelancer' ? 'Arjun Verma' : currentRole === 'team_member' ? 'Rohan Mehta' : 'Kunal Shah'}
                </p>
                <p className="text-[10px] text-slate-400">
                  {currentRole === 'freelancer' ? 'Lead Director' : currentRole === 'team_member' ? 'Video Editor' : 'CRED Founder'}
                </p>
              </div>
            </div>
            <span
              className={`w-2 h-2 rounded-full ${
                currentRole === 'freelancer' ? 'bg-emerald-500' : currentRole === 'team_member' ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
          </div>
        </aside>

        {/* Content Section: DEDICATED WORKING HUBS */}
        <section className="flex-1 p-4 md:p-8 overflow-y-auto max-w-7xl">
          {/* ================= PAGE 1: OVERVIEW COMMAND CENTER ================= */}
          {activeTab === 'overview' && (
            <OverviewDashboard
              metrics={metrics}
              transactions={transactions}
              projects={safeProjects}
              teamMembers={teamMembers}
              currentUserRole={currentRole}
              onSelectProject={handleSelectProject}
              onNavigateTab={(tab) => setActiveTab(tab as any)}
              onNewProposal={() => setActiveTab('proposals')}
              onQuickInvoice={() => setActiveTab('invoices')}
              onShareReputation={() => setActiveTab('trust')}
              onActionClick={() => setActiveTab('invoices')}
              onUpdateProject={(updated) => {
                setProjects((prev) => (Array.isArray(prev) ? prev.map((p) => (p.id === updated.id ? updated : p)) : [updated]));
              }}
              onToggleTrustMode={handleToggleTrust}
              onAddBillableScope={(amount) => handleAddBillableScope(activeProject.id, amount)}
            />
          )}

          {/* ================= PAGE 2: DEDICATED DELIVERABLES & VERSION CONTROL HUB ================= */}
          {activeTab === 'deliverables' && (
            <DeliverablesView
              projects={safeProjects}
              currentUserRole={currentRole}
              onUpdateDeliverableStatus={handleUpdateDeliverableStatus}
              onUpdateDeliverableLink={handleUpdateDeliverableLink}
              onAddComment={handleAddDeliverableComment}
              onAddBillableScope={handleAddBillableScope}
              onSelectProject={handleSelectProject}
              onBackToOverview={() => setActiveTab('overview')}
            />
          )}

          {/* ================= PAGE 3: DEDICATED PROJECTS & DEADLINES PAGE ================= */}
          {activeTab === 'projects' && (
            <ProjectsView
              projects={safeProjects}
              currentUserRole={currentRole}
              onSelectProject={handleSelectProject}
              onNavigateDeliverables={() => setActiveTab('deliverables')}
              onNewProposal={() => setActiveTab('proposals')}
              onAddBillableScope={handleAddBillableScope}
            />
          )}

          {/* ================= PAGE 4: DEDICATED INVOICES & TRANCHES PAGE ================= */}
          {activeTab === 'invoices' && (
            <UPIInvoiceView
              initialInvoice={mockInitialInvoice}
              currentUserRole={currentRole}
              onBackToDashboard={() => setActiveTab('overview')}
            />
          )}

          {/* ================= PAGE 5: DEDICATED DELAY IMPACT SIMULATOR PAGE ================= */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-800">
                      Cash Runway Forecasting
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 font-medium">Payment Delay Modeling</span>
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                    Client Delay Impact Simulator
                  </h1>
                  <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                    Model what late client milestone settlements do to your cash runway and generate tone-tailored WhatsApp nudges.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('concentration')}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    View Concentration Gauge →
                  </button>
                </div>
              </div>

              {/* Main Simulator Card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-6">
                  {/* Slider Section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-bold text-slate-900">
                        Simulate Payment Delay for Kunal Shah (CRED)
                      </label>
                      <span className="text-base font-mono font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                        +{simDelayDays} Days Late
                      </span>
                    </div>

                    <input
                      type="range"
                      min={0}
                      max={45}
                      step={1}
                      value={simDelayDays}
                      onChange={(e) => setSimDelayDays(Number(e.target.value))}
                      className="w-full accent-indigo-600 cursor-pointer h-2 bg-slate-200 rounded-lg"
                    />

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>0 Days (On Time)</span>
                      <span>15 Days</span>
                      <span>30 Days (Critical)</span>
                      <span>45 Days (Default Risk)</span>
                    </div>
                  </div>

                  {/* Runway Depletion Graphic */}
                  <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Cash Runway Depletion
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          simImpact.runwayDaysAfterDelay < 20
                            ? 'bg-rose-100 text-rose-800'
                            : simImpact.runwayDaysAfterDelay < 40
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {simImpact.runwayDaysAfterDelay < 20 ? 'CRITICAL RUNWAY' : 'MANAGEABLE'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                        <span className="text-[11px] text-slate-400 block">Baseline Runway</span>
                        <span className="text-2xl font-bold text-slate-900">{simImpact.baselineRunwayDays} Days</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">Based on ₹1.2L bank reserve</span>
                      </div>

                      <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                        <span className="text-[11px] text-slate-400 block">After {simDelayDays}d Delay</span>
                        <span
                          className={`text-2xl font-bold ${
                            simImpact.runwayDaysAfterDelay < 20 ? 'text-rose-600' : 'text-amber-600'
                          }`}
                        >
                          {simImpact.runwayDaysAfterDelay} Days
                        </span>
                        <span className="text-[10px] text-rose-600 block mt-0.5 font-semibold">
                          -{simImpact.baselineRunwayDays - simImpact.runwayDaysAfterDelay} Days Lost
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 flex items-start gap-2">
                      <Icons.AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <strong>Impact Warning:</strong> If Kunal Shah (CRED) delays payment by {simDelayDays} days,
                        your personal runway drops to <strong>{simImpact.runwayDaysAfterDelay} days</strong>.
                      </div>
                    </div>
                  </div>

                  {/* Financial Parameters */}
                  <div className="text-xs text-slate-500 space-y-1 bg-white p-4 rounded-xl border border-slate-200">
                    <span className="font-bold text-slate-800 block mb-1">Financial Runway Parameters</span>
                    <p>• Delayed Milestone Cash: <strong>{formatINR(delayedCredAmount)}</strong> (CRED Pulse Tranche 2)</p>
                    <p>• Monthly Operating Burn: <strong>₹60,000</strong> (₹2,000/day)</p>
                    <p>• Bank Balance Reserve: <strong>₹1,20,000</strong></p>
                  </div>
                </div>

                {/* Right Column: WhatsApp Reminder Generator */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-5">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">Tone-Tailored WhatsApp Reminder</h3>
                    <p className="text-xs text-slate-500">Select polite, firm, or urgent notification tone.</p>
                  </div>

                  {/* 3 Tone Selector Tabs */}
                  <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80">
                    <button
                      type="button"
                      onClick={() => setSimTone('friendly')}
                      className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        simTone === 'friendly' ? 'bg-white text-emerald-800 font-bold shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Friendly
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimTone('firm')}
                      className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        simTone === 'firm' ? 'bg-white text-indigo-800 font-bold shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Firm
                    </button>
                    <button
                      type="button"
                      onClick={() => setSimTone('final')}
                      className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        simTone === 'final' ? 'bg-white text-rose-800 font-bold shadow-2xs' : 'text-slate-600'
                      }`}
                    >
                      Final Notice
                    </button>
                  </div>

                  {/* Preview Box */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 font-mono space-y-2 whitespace-pre-line leading-relaxed">
                    {simTone === 'friendly'
                      ? `Hi Kunal, hope you're having a productive week! Just checking in on the pending milestone tranche for CRED Pulse (${formatINR(
                          delayedCredAmount
                        )}).\n\nThe DaVinci color master & spatial audio stems are signed off and ready for release:\n${
                          typeof window !== 'undefined' ? window.location.origin : 'https://paidflow.app'
                        }/pay/inv_1042_t2?amount=${delayedCredAmount}&title=Tranche+2%3A+50%25+on+Final+Delivery&inv=INV-2026-1042`
                      : simTone === 'firm'
                      ? `Hello Kunal, following up regarding the invoice for CRED Pulse (${formatINR(
                          delayedCredAmount
                        )}).\n\nAs the deliverables are approved, settling the UPI tranche today helps us keep our upcoming motion sprint schedule intact:\n${
                          typeof window !== 'undefined' ? window.location.origin : 'https://paidflow.app'
                        }/pay/inv_1042_t2?amount=${delayedCredAmount}&title=Tranche+2%3A+50%25+on+Final+Delivery&inv=INV-2026-1042`
                      : `Urgent Notice: The UPI milestone invoice for CRED Pulse (${formatINR(
                          delayedCredAmount
                        )}) is past the payment agreement window.\n\nPlease clear the payment immediately to avoid pausing production handoff:\n${
                          typeof window !== 'undefined' ? window.location.origin : 'https://paidflow.app'
                        }/pay/inv_1042_t2?amount=${delayedCredAmount}&title=Tranche+2%3A+50%25+on+Final+Delivery&inv=INV-2026-1042`}
                  </div>

                  {/* Direct WhatsApp Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const url = getWhatsAppNudgeUrl();
                      if (typeof window !== 'undefined') {
                        window.open(url, '_blank');
                      }
                      showToast(`Opening WhatsApp with ${simTone} message!`);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    <Icons.WhatsApp className="w-4 h-4 fill-white" />
                    <span>Send {simTone.toUpperCase()} Reminder via WhatsApp</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= PAGE 6: DEDICATED CLIENT CONCENTRATION GAUGE PAGE ================= */}
          {activeTab === 'concentration' && (
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700">
                      Solopreneur Fragility Guard
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 font-medium">Revenue Dependency Analysis</span>
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                    Client Concentration Risk Gauge
                  </h1>
                  <p className="text-xs md:text-sm text-slate-500 mt-0.5">
                    Analyzes revenue dependency across your client portfolio. Highlights clients representing &gt;60% of total pipeline.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('simulator')}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Icons.Sliders className="w-3.5 h-3.5" />
                  <span>Test Delay on Kunal Shah (CRED) →</span>
                </button>
              </div>

              {/* Concentration Meter Bar */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-800">Pipeline Revenue Distribution</span>
                  <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    ⚠️ 66.5% HIGH DEPENDENCY
                  </span>
                </div>

                {/* Combined Progress Distribution Bar */}
                <div className="h-4 w-full rounded-xl overflow-hidden flex shadow-inner bg-slate-100">
                  <div style={{ width: '66.5%' }} className="bg-rose-500 hover:bg-rose-600 transition-colors" title="Kunal Shah (CRED): 66.5%" />
                  <div style={{ width: '20.2%' }} className="bg-emerald-500 hover:bg-emerald-600 transition-colors" title="Neha Singhal (Finly.io): 20.2%" />
                  <div style={{ width: '13.3%' }} className="bg-teal-500 hover:bg-teal-600 transition-colors" title="Pooja Iyer (Aura): 13.3%" />
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span>Kunal Shah (CRED): <strong>66.5% (High Risk &gt;60%)</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>Neha Singhal: <strong>20.2% (Healthy)</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                    <span>Pooja Iyer: <strong>13.3% (Healthy)</strong></span>
                  </div>
                </div>
              </div>

              {/* Client Breakdown Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {(mockClientConcentration || []).map((client) => {
                  const isHighRisk = client.riskLevel === 'high';
                  return (
                    <div
                      key={client.clientName}
                      className={`bg-white rounded-2xl border p-5 shadow-xs space-y-4 ${
                        isHighRisk ? 'border-rose-300 ring-2 ring-rose-500/10' : 'border-slate-200/90'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={client.clientAvatar}
                            alt={client.clientName}
                            className="w-9 h-9 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <h4 className="font-bold text-slate-900 text-sm">{client.clientName}</h4>
                            <p className="text-[11px] text-slate-400">{client.clientCompany}</p>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isHighRisk ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isHighRisk ? 'High Risk' : 'Healthy'}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block uppercase">Pipeline Share</span>
                          <span className="text-xl font-bold text-slate-900">{client.percentage}%</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block uppercase">Total Revenue</span>
                          <span className="text-sm font-bold text-slate-900">{formatINR(client.totalRevenue)}</span>
                        </div>
                      </div>

                      {isHighRisk && (
                        <button
                          type="button"
                          onClick={() => setActiveTab('simulator')}
                          className="w-full py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Icons.Sliders className="w-3.5 h-3.5" />
                          <span>Simulate Delay Shock</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================= PAGE 7: DEDICATED VERIFIED TRUST & REVIEWS PAGE ================= */}
          {activeTab === 'trust' && (
            <TrustReviewView
              metrics={mockTrustMetrics}
              reviewsQueue={mockPendingClientReviews}
              onShareProfile={() => {
                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                  navigator.clipboard.writeText(mockFreelancerProfile.reputationUrl);
                  showToast('Copied tamper-proof reputation profile link!');
                }
              }}
              onBackToOverview={() => setActiveTab('overview')}
            />
          )}

          {/* ================= PAGE 8: DEDICATED PROPOSALS & E-SIGN SCOPE PAGE ================= */}
          {activeTab === 'proposals' && (
            <ProposalCreator
              initialProposal={{
                id: activeProject.id,
                title: activeProject.title,
                clientName: activeProject.clientName,
                clientCompany: activeProject.clientCompany,
                clientEmail: 'client@example.com',
                clientPhone: activeProject.clientPhone || '+91 90798 79010',
                createdAt: '2026-10-30',
                currency: 'INR',
                gstRate: 18,
                totalAmount: activeProject.totalBudget || activeProject.budget || 185000,
                subtotal: activeProject.totalBudget || activeProject.budget || 185000,
                discount: 0,
                gstApplicable: false,
                status: 'Approved',
                signedByClient: true,
                validUntil: activeProject.deadline,
                milestones: (activeProject.deliverables || []).map((d) => ({
                  id: d.id,
                  title: d.title,
                  description: d.workLink || 'Deliverable link asset',
                  deliverableDate: activeProject.deadline,
                  amount: Math.round((activeProject.totalBudget || activeProject.budget || 185000) / (activeProject.deliverables?.length || 1)),
                  status: (d.status === 'Approved' ? 'Completed' : 'In Progress') as any,
                })),
              }}
              onSaveProposal={(updated) => {
                showToast(`Saved proposal scope for "${updated.title}"!`);
              }}
            />
          )}
        </section>
      </div>

      {/* TEAM MEMBERS & TRUST TOGGLE DRAWER */}
      {showTeamDrawer && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/40 backdrop-blur-2xs">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Team Delegation & Trust Modes</h3>
                  <p className="text-xs text-slate-500">
                    Control whether member submissions need your approval before clients see them.
                  </p>
                </div>
                <button onClick={() => setShowTeamDrawer(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-700">
                  <Icons.X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {teamMembers.map((member) => {
                  const isTrusted = member.trustMode === 'trusted';
                  return (
                    <div key={member.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.avatar}
                            alt={member.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{member.name}</p>
                            <p className="text-[11px] text-slate-500">{member.role}</p>
                          </div>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            isTrusted ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isTrusted ? 'Trusted' : 'Needs Approval'}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold text-slate-800 block">Direct Client Delivery</span>
                          <span className="text-[10px] text-slate-400">
                            {isTrusted ? 'Can push version cuts directly to client' : 'Submissions held for Freelancer sign-off'}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleTrust(member.id)}
                          className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                            isTrusted ? 'bg-emerald-600' : 'bg-slate-300'
                          }`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                              isTrusted ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowTeamDrawer(false)}
                className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Detail Modal */}
      {isDetailModalOpen && (
        <ProjectDetailModal
          project={activeProject}
          isOpen={isDetailModalOpen}
          currentUserRole={currentRole}
          isTeamMemberTrusted={teamMembers.find((m) => m.id === 'member_rohan')?.trustMode === 'trusted'}
          onClose={() => setIsDetailModalOpen(false)}
          onUpdateProject={(updated) => {
            setProjects((prev) => (Array.isArray(prev) ? prev.map((p) => (p.id === updated.id ? updated : p)) : [updated]));
          }}
          onAddBillableScope={(amount) => handleAddBillableScope(activeProject.id, amount)}
        />
      )}
    </div>
  );
}
