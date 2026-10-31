'use client';

import React, { useState } from 'react';
import { Project, DeliverableItem, UserRole, DeliverableStatus } from '../../types';
import { Icons } from '../ui/Icons';
import { formatINR } from '../../utils/formatters';

interface DeliverablesViewProps {
  projects: Project[];
  currentUserRole: UserRole;
  onUpdateDeliverableStatus: (projectId: string, deliverableId: string, status: DeliverableStatus, feedback?: string) => void;
  onUpdateDeliverableLink: (projectId: string, deliverableId: string, link: string, notes?: string) => void;
  onAddComment: (projectId: string, deliverableId: string, text: string) => void;
  onAddBillableScope: (projectId: string, amount: number) => void;
  onSelectProject?: (projectId: string) => void;
  onBackToOverview?: () => void;
}

export const DeliverablesView: React.FC<DeliverablesViewProps> = ({
  projects = [],
  currentUserRole = 'freelancer',
  onUpdateDeliverableStatus,
  onUpdateDeliverableLink,
  onAddComment,
  onAddBillableScope,
  onSelectProject,
  onBackToOverview,
}) => {
  const [subTab, setSubTab] = useState<'all' | 'needs_review' | 'approved' | 'scope_guard'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState('all');

  // Modals & Drawers state
  const [selectedVersionHistory, setSelectedVersionHistory] = useState<{
    item: DeliverableItem;
    projectTitle: string;
  } | null>(null);

  const [activeNewVersionModal, setActiveNewVersionModal] = useState<{
    projectId: string;
    deliverable: DeliverableItem;
  } | null>(null);
  const [newVersionUrl, setNewVersionUrl] = useState('');
  const [newVersionNotes, setNewVersionNotes] = useState('');

  const [expandedCommentsId, setExpandedCommentsId] = useState<string | null>(null);
  const [newCommentText, setNewCommentText] = useState<{ [key: string]: string }>({});

  const [revisionFeedbackModal, setRevisionFeedbackModal] = useState<{
    projectId: string;
    deliverableId: string;
    deliverableTitle: string;
  } | null>(null);
  const [revisionFeedbackText, setRevisionFeedbackText] = useState('');

  // Flatten deliverables with project context
  const allDeliverables = projects.flatMap((p) =>
    (p.deliverables || []).map((d) => ({
      ...d,
      projectId: p.id,
      projectTitle: p.title,
      clientName: p.clientName,
      clientCompany: p.clientCompany,
      deadline: p.deadline,
    }))
  );

  // Filter based on tab & search
  const filteredDeliverables = allDeliverables.filter((item) => {
    // Project filter
    if (projectFilter !== 'all' && item.projectId !== projectFilter) return false;

    // Search query
    const matchSearch =
      (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.projectTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.clientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.assignedToName || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchSearch) return false;

    // Sub-tab filter
    if (subTab === 'needs_review') {
      return item.status === 'Submitted' || item.status === 'Sent to Client' || item.status === 'Draft';
    }
    if (subTab === 'approved') {
      return item.status === 'Approved' || item.status === 'Freelancer Approved';
    }
    return true;
  });

  // KPI calculations
  const totalCount = allDeliverables.length;
  const needsReviewCount = allDeliverables.filter(
    (d) => d.status === 'Submitted' || d.status === 'Sent to Client'
  ).length;
  const approvedCount = allDeliverables.filter((d) => d.status === 'Approved').length;
  const changesCount = allDeliverables.filter((d) => d.status === 'Changes Requested').length;

  const handleOpenVersionModal = (item: DeliverableItem, projectTitle: string) => {
    setSelectedVersionHistory({ item, projectTitle });
  };

  const handleSubmitNewVersion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNewVersionModal || !newVersionUrl.trim()) return;

    onUpdateDeliverableLink(
      activeNewVersionModal.projectId,
      activeNewVersionModal.deliverable.id,
      newVersionUrl.trim(),
      newVersionNotes.trim() || 'New revision cut uploaded.'
    );

    setActiveNewVersionModal(null);
    setNewVersionUrl('');
    setNewVersionNotes('');
  };

  const handlePostComment = (projectId: string, deliverableId: string) => {
    const text = (newCommentText[deliverableId] || '').trim();
    if (!text) return;
    onAddComment(projectId, deliverableId, text);
    setNewCommentText((prev) => ({ ...prev, [deliverableId]: '' }));
  };

  const handleConfirmRevisionRequest = () => {
    if (!revisionFeedbackModal) return;
    onUpdateDeliverableStatus(
      revisionFeedbackModal.projectId,
      revisionFeedbackModal.deliverableId,
      'Changes Requested',
      revisionFeedbackText.trim() || 'Client requested edits on this cut.'
    );
    setRevisionFeedbackModal(null);
    setRevisionFeedbackText('');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
                Work & Delivery
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">Version Control & Sign-offs</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 mt-1 tracking-tight">
              Deliverables & Asset Reviews
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Manage work links, version history (v1, v2, v3), client approvals, and scope creep revision limits.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {currentUserRole !== 'client' && (
              <button
                type="button"
                onClick={() => {
                  const firstProj = projects[0];
                  const firstDeliv = firstProj?.deliverables?.[0];
                  if (firstProj && firstDeliv) {
                    setActiveNewVersionModal({ projectId: firstProj.id, deliverable: firstDeliv });
                  }
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Icons.Plus className="w-3.5 h-3.5" />
                <span>Submit New Version Cut</span>
              </button>
            )}
            {onBackToOverview && (
              <button
                type="button"
                onClick={onBackToOverview}
                className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors"
              >
                Dashboard
              </button>
            )}
          </div>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5">
          <div className="bg-slate-50/80 rounded-xl p-3 border border-slate-200/60">
            <span className="text-[11px] font-medium text-slate-400 block">Total Work Items</span>
            <span className="text-lg font-bold text-slate-900 mt-0.5 block">{totalCount} Assets</span>
          </div>

          <div className="bg-amber-50/60 rounded-xl p-3 border border-amber-200/60">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-amber-800">Awaiting Review</span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </div>
            <span className="text-lg font-bold text-amber-900 mt-0.5 block">{needsReviewCount} Items</span>
          </div>

          <div className="bg-emerald-50/60 rounded-xl p-3 border border-emerald-200/60">
            <span className="text-[11px] font-medium text-emerald-800 block">Approved & Signed-off</span>
            <span className="text-lg font-bold text-emerald-900 mt-0.5 block">{approvedCount} Locked</span>
          </div>

          <div className="bg-rose-50/60 rounded-xl p-3 border border-rose-200/60">
            <span className="text-[11px] font-medium text-rose-800 block">Changes Requested</span>
            <span className="text-lg font-bold text-rose-900 mt-0.5 block">{changesCount} In Revision</span>
          </div>
        </div>

        {/* Sub-Tabs & Filter Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-5 mt-4 border-t border-slate-100">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/70 overflow-x-auto text-xs font-medium">
            <button
              type="button"
              onClick={() => setSubTab('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                subTab === 'all' ? 'bg-white text-slate-900 font-bold shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Deliverables ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setSubTab('needs_review')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                subTab === 'needs_review'
                  ? 'bg-white text-amber-800 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>Needs Action</span>
              {needsReviewCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                  {needsReviewCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => setSubTab('approved')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                subTab === 'approved'
                  ? 'bg-white text-emerald-800 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Approved ({approvedCount})
            </button>
            <button
              type="button"
              onClick={() => setSubTab('scope_guard')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                subTab === 'scope_guard'
                  ? 'bg-white text-indigo-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icons.ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Scope Creep Guard</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Icons.Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 w-44 sm:w-52"
              />
            </div>

            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.clientCompany}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* VIEW 1: SCOPE CREEP GUARD PAGE */}
      {subTab === 'scope_guard' ? (
        <div className="space-y-5">
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5 max-w-xl">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                Solopreneur Scope Protection
              </span>
              <h2 className="text-xl font-bold tracking-tight">Revision Quotas & Out-of-Scope Revenue</h2>
              <p className="text-xs text-indigo-200 leading-relaxed">
                Protects solo creators from endless free client revisions. Every contract comes standard with 2 free
                revisions. Revisions beyond that automatically trigger a +₹5,000 add-on to the next milestone invoice.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl border border-white/15 text-center min-w-[160px]">
              <span className="text-[10px] text-indigo-200 uppercase tracking-wider block font-medium">
                Standard Scope Add-on
              </span>
              <span className="text-2xl font-extrabold text-white mt-0.5 block">+₹5,000</span>
              <span className="text-[10px] text-emerald-400 block mt-0.5">Auto-appended to invoice</span>
            </div>
          </div>

          {/* Project-by-project Scope Audit Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {projects.map((proj) => {
              const projDelivs = proj.deliverables || [];
              const totalRevsUsed = projDelivs.reduce((acc, d) => acc + (d.revisionsUsed || 0), 0);
              const maxFreeAllowed = projDelivs.length * 2;
              const hasExceeded = totalRevsUsed >= maxFreeAllowed || projDelivs.some((d) => (d.revisionsUsed || 0) >= 2);

              return (
                <div
                  key={proj.id}
                  className={`bg-white rounded-2xl border p-5 shadow-xs space-y-4 ${
                    hasExceeded ? 'border-amber-300 ring-2 ring-amber-500/10' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                        {proj.clientCompany}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-0.5">{proj.title}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">Client: {proj.clientName}</p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        hasExceeded
                          ? 'bg-amber-50 text-amber-800 border border-amber-300'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {hasExceeded ? 'Quota Limit Reached' : 'Within Quota'}
                    </span>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <span className="text-xs font-semibold text-slate-700 block">Deliverables Revision Breakdown:</span>
                    {projDelivs.map((d) => {
                      const quotaReached = (d.revisionsUsed || 0) >= (d.freeRevisionsLimit || 2);
                      return (
                        <div
                          key={d.id}
                          className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200/80"
                        >
                          <div>
                            <span className="font-semibold text-slate-800 block">{d.title}</span>
                            <span className="text-[10px] text-slate-400">Current Cut: {d.currentVersion || 'v1'}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`text-[11px] font-mono font-bold ${
                                quotaReached ? 'text-rose-600' : 'text-slate-700'
                              }`}
                            >
                              {d.revisionsUsed || 0}/{d.freeRevisionsLimit || 2} used
                            </span>
                            {quotaReached && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                                Limit
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase">Extra Billable Scope</span>
                      <span className="text-sm font-bold text-slate-900">
                        {formatINR(proj.extraScopeAmount || 0)}
                      </span>
                    </div>

                    {currentUserRole === 'freelancer' && (
                      <button
                        type="button"
                        onClick={() => onAddBillableScope(proj.id, 5000)}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
                      >
                        <Icons.Plus className="w-3.5 h-3.5" />
                        <span>+ Add ₹5,000 Scope Creep</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* VIEW 2: ASSET REVIEWS & VERSION WORKSPACE */
        <div className="space-y-4">
          {filteredDeliverables.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-2">
              <Icons.FileText className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="font-semibold text-slate-700">No deliverables match this filter.</p>
              <p className="text-xs text-slate-400">Try switching tabs or resetting your search term.</p>
            </div>
          ) : (
            filteredDeliverables.map((item) => {
              const isQuotaExceeded = (item.revisionsUsed || 0) >= (item.freeRevisionsLimit || 2);
              const versionsCount = (item.versions || []).length || 1;
              const isCommentsOpen = expandedCommentsId === item.id;
              const commentsList = item.comments || [];

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition-all p-5 space-y-4"
                >
                  {/* Top Line: Project info, Version Pill, Status Pill */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 uppercase tracking-wider">
                        {item.clientCompany}
                      </span>
                      <span className="text-xs text-slate-400">•</span>
                      <span className="text-xs font-semibold text-slate-600">{item.projectTitle}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Version Pill with clickable history trigger */}
                      <button
                        type="button"
                        onClick={() => handleOpenVersionModal(item, item.projectTitle)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-mono text-xs font-semibold transition-colors border border-slate-200"
                        title="Click to view full version history"
                      >
                        <Icons.History className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{item.currentVersion || item.version || 'v1'}</span>
                        <span className="text-[10px] text-slate-400 font-sans">({versionsCount} cuts)</span>
                      </button>

                      {/* Status Badge */}
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
                          item.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : item.status === 'Changes Requested'
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : item.status === 'Submitted'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Deliverable Title & Metadata */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1 max-w-2xl">
                      <h3 className="text-base font-bold text-slate-900 tracking-tight">{item.title}</h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span>Assigned to: <strong className="text-slate-700">{item.assignedToName || 'Rohan Mehta'}</strong></span>
                        <span>•</span>
                        <span>{item.assignedToRole || 'Video Editor'}</span>
                      </div>
                    </div>

                    {/* Revision Counter Pill */}
                    <div className="flex items-center gap-1.5 text-xs shrink-0 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                      <span className="text-slate-500 font-medium">Revisions:</span>
                      <span
                        className={`font-mono font-bold ${
                          isQuotaExceeded ? 'text-amber-600' : 'text-slate-800'
                        }`}
                      >
                        {item.revisionsUsed || 0}/{item.freeRevisionsLimit || 2} free used
                      </span>
                    </div>
                  </div>

                  {/* Work Asset Box */}
                  <div className="bg-slate-50/90 rounded-xl p-3.5 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                        <Icons.Play className="w-4 h-4 fill-indigo-600 text-indigo-600" />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[11px] font-medium text-slate-400 block">External Work Asset</span>
                        <a
                          href={item.workLink || 'https://youtu.be/unlisted_cred_hero_v2'}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-mono text-indigo-600 hover:underline truncate block"
                        >
                          {item.workLink || 'https://youtu.be/unlisted_cred_hero_v2'}
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <a
                        href={item.workLink || 'https://youtu.be/unlisted_cred_hero_v2'}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-2xs transition-colors"
                      >
                        <Icons.ArrowUpRight className="w-3.5 h-3.5" />
                        <span>Open Cut Link</span>
                      </a>
                    </div>
                  </div>

                  {/* Scope Alert if limit exceeded */}
                  {isQuotaExceeded && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-900 gap-3">
                      <div className="flex items-center gap-2">
                        <Icons.AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>
                          <strong>Free Revision Quota Reached ({item.revisionsUsed}/{item.freeRevisionsLimit} used).</strong>{' '}
                          Further edits are billable out-of-scope work.
                        </span>
                      </div>
                      {currentUserRole === 'freelancer' && (
                        <button
                          type="button"
                          onClick={() => onAddBillableScope(item.projectId, 5000)}
                          className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors shrink-0"
                        >
                          + Add ₹5k Billable Scope
                        </button>
                      )}
                    </div>
                  )}

                  {/* Actions & Threaded Comments Row */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setExpandedCommentsId(isCommentsOpen ? null : item.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      <Icons.MessageSquare className="w-4 h-4 text-slate-400" />
                      <span>{commentsList.length} Comments & Notes</span>
                      <span className="text-slate-400">{isCommentsOpen ? '▲' : '▼'}</span>
                    </button>

                    {/* Role-specific Actions */}
                    <div className="flex items-center gap-2">
                      {currentUserRole === 'client' ? (
                        <>
                          <button
                            type="button"
                            onClick={() => onUpdateDeliverableStatus(item.projectId, item.id, 'Approved')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-2xs transition-colors"
                          >
                            <Icons.Check className="w-3.5 h-3.5" />
                            <span>Approve Cut</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setRevisionFeedbackModal({
                                projectId: item.projectId,
                                deliverableId: item.id,
                                deliverableTitle: item.title,
                              })
                            }
                            className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors"
                          >
                            Request Changes
                          </button>
                        </>
                      ) : currentUserRole === 'freelancer' ? (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setActiveNewVersionModal({ projectId: item.projectId, deliverable: item })
                            }
                            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                          >
                            + Submit Next Version
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateDeliverableStatus(item.projectId, item.id, 'Approved')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors"
                          >
                            Mark Approved
                          </button>
                          <button
                            type="button"
                            onClick={() => onUpdateDeliverableStatus(item.projectId, item.id, 'Sent to Client')}
                            className="px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold transition-colors"
                          >
                            Push to Client
                          </button>
                        </>
                      ) : (
                        /* Team member (Editor Rohan) */
                        <button
                          type="button"
                          onClick={() =>
                            setActiveNewVersionModal({ projectId: item.projectId, deliverable: item })
                          }
                          className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold transition-colors shadow-2xs"
                        >
                          + Upload New Version Cut
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expandable Threaded Comments Drawer */}
                  {isCommentsOpen && (
                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-3 bg-slate-50/60 p-4 rounded-xl">
                      <span className="text-xs font-bold text-slate-800 block">Feedback & Version Notes</span>

                      <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                        {commentsList.length === 0 ? (
                          <p className="text-xs text-slate-400 italic">No feedback comments yet on this deliverable.</p>
                        ) : (
                          commentsList.map((comm) => (
                            <div key={comm.id} className="flex items-start gap-2.5 text-xs bg-white p-3 rounded-lg border border-slate-200/70">
                              <img
                                src={comm.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=60&auto=format&fit=crop&q=80'}
                                alt={comm.author}
                                className="w-6 h-6 rounded-full object-cover shrink-0 mt-0.5"
                              />
                              <div className="flex-1 space-y-0.5">
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-slate-900">{comm.author}</span>
                                  <span className="text-[10px] text-slate-400">{comm.timestamp}</span>
                                </div>
                                <p className="text-slate-700 leading-relaxed">{comm.text}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add Comment Input */}
                      <div className="flex items-center gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="Write feedback or revision notes..."
                          value={newCommentText[item.id] || ''}
                          onChange={(e) =>
                            setNewCommentText({ ...newCommentText, [item.id]: e.target.value })
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handlePostComment(item.projectId, item.id);
                            }
                          }}
                          className="flex-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handlePostComment(item.projectId, item.id)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
                        >
                          Post
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* MODAL 1: VERSION HISTORY INSPECTOR */}
      {selectedVersionHistory && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-600">Version History Log</span>
                <h3 className="font-bold text-slate-900 text-base">{selectedVersionHistory.item.title}</h3>
                <p className="text-xs text-slate-400">{selectedVersionHistory.projectTitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVersionHistory(null)}
                className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {(selectedVersionHistory.item.versions || []).map((ver, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded font-mono font-bold bg-indigo-600 text-white text-xs">
                        {ver.version}
                      </span>
                      <span className="font-semibold text-slate-800">By {ver.submittedBy}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">{ver.submittedAt}</span>
                  </div>

                  <p className="text-slate-600 leading-relaxed">{ver.notes || 'Cut revision submitted.'}</p>

                  <div className="pt-1">
                    <a
                      href={ver.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:underline font-mono text-[11px] inline-flex items-center gap-1"
                    >
                      <Icons.Link2 className="w-3.5 h-3.5" />
                      <span>{ver.link}</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedVersionHistory(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SUBMIT NEW VERSION FORM */}
      {activeNewVersionModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSubmitNewVersion}
            className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-indigo-600">Submit New Cut</span>
                <h3 className="font-bold text-slate-900 text-sm mt-0.5">
                  {activeNewVersionModal.deliverable.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveNewVersionModal(null)}
                className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Google Drive / YouTube / Frame.io Asset Link *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://youtu.be/unlisted_v3_cut"
                  value={newVersionUrl}
                  onChange={(e) => setNewVersionUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Change Notes (What was revised?)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Color graded Davinci master, tighter cut at 0:15, Dolby Atmos audio mix..."
                  value={newVersionNotes}
                  onChange={(e) => setNewVersionNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-indigo-500 text-xs"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveNewVersionModal(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Submit Version Cut
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL 3: REVISION FEEDBACK MODAL (CLIENT) */}
      {revisionFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] uppercase font-bold text-rose-600">Request Revision</span>
                <h3 className="font-bold text-slate-900 text-sm mt-0.5">
                  {revisionFeedbackModal.deliverableTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRevisionFeedbackModal(null)}
                className="w-7 h-7 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-semibold text-slate-700 block">
                Provide timestamped feedback for the editing team:
              </label>
              <textarea
                rows={4}
                placeholder="e.g. At 0:18 the audio dip is too sharp. Can we increase pacing of the title cards?"
                value={revisionFeedbackText}
                onChange={(e) => setRevisionFeedbackText(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-rose-500 text-xs"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRevisionFeedbackModal(null)}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmRevisionRequest}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                Send Revision Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

