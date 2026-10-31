'use client';

import React, { useState } from 'react';
import { Project, DeliverableItem, UserRole, ActivityLogItem } from '../../types';
import { formatINR, getDeadlineStatus } from '../../utils/formatters';
import { Icons } from '../ui/Icons';

interface ProjectDetailModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  currentUserRole: UserRole;
  isTeamMemberTrusted?: boolean;
  onUpdateProject: (updated: Project) => void;
  onAddBillableScope?: (amount: number, description: string) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  isOpen,
  onClose,
  currentUserRole,
  isTeamMemberTrusted = false,
  onUpdateProject,
  onAddBillableScope,
}) => {
  const [activeTab, setActiveTab] = useState<'deliverables' | 'activity'>('deliverables');
  const [selectedDeliverableFilter, setSelectedDeliverableFilter] = useState<string>('all');
  const [newVersionInput, setNewVersionInput] = useState<{ [delId: string]: string }>({});
  const [newVersionNotes, setNewVersionNotes] = useState<{ [delId: string]: string }>({});
  const [commentInputs, setCommentInputs] = useState<{ [delId: string]: string }>({});
  const [showNewVersionForm, setShowNewVersionForm] = useState<{ [delId: string]: boolean }>({});
  const [billableScopeAdded, setBillableScopeAdded] = useState<{ [delId: string]: boolean }>({});

  if (!isOpen || !project) return null;

  const deadlineInfo = getDeadlineStatus(project.deadline);
  const progressPercent = Math.round(
    project.totalDeliverables > 0
      ? (project.completedDeliverables / project.totalDeliverables) * 100
      : 0
  );

  // Status transitions
  const handleStatusChange = (
    deliverableId: string,
    newStatus: DeliverableItem['status'],
    reasonNotes?: string
  ) => {
    const updatedDeliverables = project.deliverables.map((d) => {
      if (d.id === deliverableId) {
        let revUsed = d.revisionsUsed;
        let billableRev = d.billableRevisionsCount;

        if (newStatus === 'Changes Requested') {
          revUsed += 1;
          if (revUsed > d.freeRevisionsLimit) {
            billableRev += 1;
          }
        }

        return {
          ...d,
          status: newStatus,
          revisionsUsed: revUsed,
          billableRevisionsCount: billableRev,
        };
      }
      return d;
    });

    // Count newly completed deliverables
    const completedCount = updatedDeliverables.filter((d) => d.status === 'Approved').length;

    // Create activity log entry
    const targetDel = (project.deliverables || []).find((d) => d.id === deliverableId);
    let personName = 'Arjun Verma';
    let roleLabel = 'Lead Freelancer';
    let badgeType: ActivityLogItem['badgeType'] = 'approval';

    if (currentUserRole === 'team_member') {
      personName = 'Rohan Mehta';
      roleLabel = 'Video Editor';
      badgeType = 'submission';
    } else if (currentUserRole === 'client') {
      personName = project.clientName;
      roleLabel = 'Client';
      badgeType = newStatus === 'Changes Requested' ? 'changes' : 'approval';
    }

    const newLogItem: ActivityLogItem = {
      id: `act_${Date.now()}`,
      projectId: project.id,
      deliverableId,
      person: personName,
      role: roleLabel,
      action: `${newStatus === 'Changes Requested' ? 'requested changes on' : 'updated'} ${
        targetDel?.title || 'deliverable'
      } to ${newStatus}`,
      detail: reasonNotes || undefined,
      timestamp: 'Just now',
      badgeType,
    };

    const updatedProject: Project = {
      ...project,
      deliverables: updatedDeliverables,
      completedDeliverables: completedCount,
      status: completedCount === project.totalDeliverables ? 'Completed' : project.status,
      activityLog: [newLogItem, ...(project.activityLog || [])],
    };

    onUpdateProject(updatedProject);
  };

  // Submit a new version
  const handleSubmitNewVersion = (deliverableId: string) => {
    const workLink = newVersionInput[deliverableId];
    if (!workLink) return;

    const targetDel = (project.deliverables || []).find((d) => d.id === deliverableId);
    if (!targetDel) return;

    const currentVNum = parseInt(targetDel.currentVersion.replace('v', ''), 10) || 1;
    const nextVersionStr = `v${currentVNum + 1}`;

    const newVersionObj = {
      version: nextVersionStr,
      link: workLink,
      submittedBy: currentUserRole === 'team_member' ? 'Rohan Mehta' : 'Arjun Verma',
      submittedAt: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      notes: newVersionNotes[deliverableId] || 'New version upload with latest cuts & assets.',
    };

    // If team member is trusted, bypass freelancer approval and send straight to client!
    const targetStatus: DeliverableItem['status'] =
      currentUserRole === 'team_member'
        ? isTeamMemberTrusted
          ? 'Sent to Client'
          : 'Submitted'
        : 'Sent to Client';

    const updatedDeliverables = project.deliverables.map((d) => {
      if (d.id === deliverableId) {
        return {
          ...d,
          currentVersion: nextVersionStr,
          workLink,
          status: targetStatus,
          versions: [newVersionObj, ...d.versions],
        };
      }
      return d;
    });

    const newLog: ActivityLogItem = {
      id: `act_${Date.now()}`,
      projectId: project.id,
      deliverableId,
      person: currentUserRole === 'team_member' ? 'Rohan Mehta' : 'Arjun Verma',
      role: currentUserRole === 'team_member' ? 'Video Editor' : 'Lead',
      action: `submitted ${nextVersionStr} [${workLink}]`,
      detail: isTeamMemberTrusted && currentUserRole === 'team_member'
        ? 'Trusted mode active: Pushed directly to client view!'
        : undefined,
      timestamp: 'Just now',
      badgeType: 'submission',
    };

    const updatedProject: Project = {
      ...project,
      deliverables: updatedDeliverables,
      activityLog: [newLog, ...(project.activityLog || [])],
    };

    onUpdateProject(updatedProject);

    // Reset inputs
    setNewVersionInput({ ...newVersionInput, [deliverableId]: '' });
    setNewVersionNotes({ ...newVersionNotes, [deliverableId]: '' });
    setShowNewVersionForm({ ...showNewVersionForm, [deliverableId]: false });
  };

  // Add a threaded comment
  const handleAddComment = (deliverableId: string) => {
    const text = commentInputs[deliverableId];
    if (!text?.trim()) return;

    let authorName = 'Arjun Verma';
    let avatarUrl = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80';

    if (currentUserRole === 'team_member') {
      authorName = 'Rohan Mehta';
      avatarUrl = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=80&auto=format&fit=crop&q=80';
    } else if (currentUserRole === 'client') {
      authorName = project.clientName;
      avatarUrl = project.clientAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&auto=format&fit=crop&q=80';
    }

    const newComment = {
      id: `comm_${Date.now()}`,
      author: authorName,
      authorRole: currentUserRole,
      avatar: avatarUrl,
      text: text.trim(),
      timestamp: 'Just now',
    };

    const updatedDeliverables = project.deliverables.map((d) => {
      if (d.id === deliverableId) {
        return {
          ...d,
          comments: [...d.comments, newComment],
        };
      }
      return d;
    });

    onUpdateProject({
      ...project,
      deliverables: updatedDeliverables,
    });

    setCommentInputs({ ...commentInputs, [deliverableId]: '' });
  };

  // Add billable scope creep
  const handleAddBillableScopeClick = (deliverable: DeliverableItem) => {
    if (onAddBillableScope) {
      onAddBillableScope(
        5000,
        `Out-of-Scope Revision Sprint for ${deliverable.title} (${deliverable.currentVersion})`
      );
    }

    const newLog: ActivityLogItem = {
      id: `act_${Date.now()}`,
      projectId: project.id,
      deliverableId: deliverable.id,
      person: 'Arjun Verma',
      role: 'Lead',
      action: 'added billable revision scope (+₹5,000) to next invoice',
      detail: `Free revision quota (2/2) exceeded on ${deliverable.title}`,
      timestamp: 'Just now',
      badgeType: 'scope',
    };

    onUpdateProject({
      ...project,
      activityLog: [newLog, ...(project.activityLog || [])],
    });

    setBillableScopeAdded({ ...billableScopeAdded, [deliverable.id]: true });
  };

  const filteredLogs = (project.activityLog || []).filter((log) => {
    if (selectedDeliverableFilter === 'all') return true;
    return log.deliverableId === selectedDeliverableFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                {project.clientCompany}
              </span>

              {/* Deadline Threshold Badge */}
              {deadlineInfo.color === 'red' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                  <span>Overdue ({Math.abs(deadlineInfo.daysDiff)}d ago)</span>
                </span>
              )}
              {deadlineInfo.color === 'amber' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>At risk (Due in {deadlineInfo.daysDiff}d)</span>
                </span>
              )}
              {deadlineInfo.color === 'emerald' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>On track</span>
                </span>
              )}

              {/* Role Indicator Banner */}
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                Viewing as: {currentUserRole.replace('_', ' ')}
              </span>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {project.title}
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {/* Confidential Budget Tag - Hidden for Team Member! */}
            {currentUserRole !== 'team_member' ? (
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Total Budget</span>
                <span className="text-base font-extrabold text-slate-900">
                  {formatINR(project.totalBudget)}
                </span>
              </div>
            ) : (
              <div className="text-right">
                <span className="text-xs text-slate-400 flex items-center gap-1 justify-end">
                  <Icons.Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Budget</span>
                </span>
                <span className="text-xs font-semibold text-slate-400 italic">
                  Confidential (Client/Lead only)
                </span>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors ml-2"
            >
              <Icons.X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Progress & Navigation Bar */}
        <div className="px-5 py-3 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
          {/* Visual Progress Bar */}
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <span className="text-xs font-bold text-slate-700 whitespace-nowrap">
              Progress: {progressPercent}%
            </span>
            <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-400 whitespace-nowrap">
              {project.completedDeliverables}/{project.totalDeliverables} Done
            </span>
          </div>

          {/* Sub-Tabs: Deliverables vs Activity Log */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('deliverables')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                activeTab === 'deliverables'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Deliverables ({project.deliverables.length})
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'activity'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Icons.History className="w-3.5 h-3.5" />
              <span>Activity Log ({(project.activityLog || []).length})</span>
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          {/* TAB 1: DELIVERABLES LIST */}
          {activeTab === 'deliverables' && (
            <div className="space-y-4">
              {project.deliverables.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No deliverables defined yet for this project.
                </div>
              ) : (
                project.deliverables.map((del) => {
                  const isLimitReached = del.revisionsUsed >= del.freeRevisionsLimit;

                  return (
                    <div
                      key={del.id}
                      className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs space-y-3 hover:border-slate-300 transition-colors"
                    >
                      {/* Top Row: Title, Type, Status Pill & Revision Counter */}
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-sm font-bold text-slate-900">{del.title}</h4>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-mono">
                              {del.currentVersion}
                            </span>
                            <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                              {del.type}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 mt-0.5 block">
                            Assigned to: {del.assignedToName} ({del.assignedToRole})
                          </span>
                        </div>

                        {/* Status Flow Badge */}
                        <div className="flex items-center gap-2 self-start sm:self-auto">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                              del.status === 'Approved'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : del.status === 'Changes Requested'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : del.status === 'Sent to Client'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                : del.status === 'Freelancer Approved'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : del.status === 'Submitted'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-slate-100 text-slate-700 border-slate-200'
                            }`}
                          >
                            <span>{del.status}</span>
                          </span>

                          {/* Revision Counter Badge */}
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isLimitReached
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                            title="Revisions used out of free quota"
                          >
                            {del.revisionsUsed}/{del.freeRevisionsLimit} Free Revs Used
                          </span>
                        </div>
                      </div>

                      {/* Work Link View */}
                      <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                        <Icons.Link2 className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span className="font-semibold text-slate-500 shrink-0">Work Link:</span>
                        <a
                          href={del.workLink}
                          target="_blank"
                          rel="noreferrer"
                          className="font-mono text-indigo-600 hover:underline truncate flex-1"
                        >
                          {del.workLink}
                        </a>
                        <button
                          onClick={() => {
                            navigator.clipboard?.writeText?.(del.workLink);
                          }}
                          className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs shrink-0"
                        >
                          Copy
                        </button>
                      </div>

                      {/* Feature 5: Scope Creep Alert Banner */}
                      {isLimitReached && (
                        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-rose-900">
                          <div className="flex items-center gap-2">
                            <Icons.AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                            <span className="font-semibold">
                              Free revision limit reached ({del.revisionsUsed}/{del.freeRevisionsLimit} used). Further revisions are billable scope!
                            </span>
                          </div>

                          {currentUserRole !== 'client' && (
                            <button
                              onClick={() => handleAddBillableScopeClick(del)}
                              disabled={billableScopeAdded[del.id]}
                              className={`px-3 py-1 rounded-md text-xs font-bold transition-all shrink-0 ${
                                billableScopeAdded[del.id]
                                  ? 'bg-emerald-600 text-white cursor-default'
                                  : 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                              }`}
                            >
                              {billableScopeAdded[del.id]
                                ? '✓ Added to Next Invoice'
                                : '+ Add Billable Scope (₹5,000)'}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Version Submission Trigger & Form */}
                      <div>
                        {!showNewVersionForm[del.id] ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                setShowNewVersionForm({
                                  ...showNewVersionForm,
                                  [del.id]: true,
                                })
                              }
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 px-2.5 py-1 rounded-md border border-indigo-100 transition-colors"
                            >
                              <Icons.Plus className="w-3.5 h-3.5" />
                              <span>Submit New Version (v{parseInt(del.currentVersion.replace('v', ''), 10) + 1})</span>
                            </button>
                          </div>
                        ) : (
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
                            <div className="flex items-center justify-between font-bold text-slate-800">
                              <span>
                                Upload Version v{parseInt(del.currentVersion.replace('v', ''), 10) + 1}
                              </span>
                              <button
                                onClick={() =>
                                  setShowNewVersionForm({
                                    ...showNewVersionForm,
                                    [del.id]: false,
                                  })
                                }
                                className="text-slate-400 hover:text-slate-600"
                              >
                                ✕
                              </button>
                            </div>
                            <input
                              type="url"
                              placeholder="Paste Google Drive or unlisted YouTube link..."
                              value={newVersionInput[del.id] || ''}
                              onChange={(e) =>
                                setNewVersionInput({
                                  ...newVersionInput,
                                  [del.id]: e.target.value,
                                })
                              }
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 font-mono text-xs"
                            />
                            <input
                              type="text"
                              placeholder="Version notes (e.g., Color graded DaVinci cut with sound sync)..."
                              value={newVersionNotes[del.id] || ''}
                              onChange={(e) =>
                                setNewVersionNotes({
                                  ...newVersionNotes,
                                  [del.id]: e.target.value,
                                })
                              }
                              className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-md focus:outline-none focus:border-indigo-500 text-xs"
                            />
                            <div className="flex justify-end gap-2 pt-1">
                              <button
                                onClick={() =>
                                  setShowNewVersionForm({
                                    ...showNewVersionForm,
                                    [del.id]: false,
                                  })
                                }
                                className="px-2.5 py-1 text-slate-500 hover:bg-slate-200 rounded text-xs font-semibold"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSubmitNewVersion(del.id)}
                                className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold shadow-xs"
                              >
                                Submit Version
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Approval Actions by Role */}
                      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-400">
                          {del.versions.length} version(s) in history
                        </span>

                        <div className="flex items-center gap-2">
                          {/* Freelancer actions when status is 'Submitted' */}
                          {currentUserRole === 'freelancer' && del.status === 'Submitted' && (
                            <button
                              onClick={() =>
                                handleStatusChange(
                                  del.id,
                                  'Sent to Client',
                                  'Approved editor cut and forwarded to Kunal Shah.'
                                )
                              }
                              className="inline-flex items-center gap-1 px-3 py-1 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-colors"
                            >
                              <Icons.Check className="w-3.5 h-3.5" />
                              <span>Approve & Forward to Client</span>
                            </button>
                          )}

                          {/* Client approval buttons when status is 'Sent to Client' or 'Submitted' */}
                          {currentUserRole === 'client' && (
                            <>
                              <button
                                onClick={() =>
                                  handleStatusChange(
                                    del.id,
                                    'Changes Requested',
                                    'Client requested revision cycle.'
                                  )
                                }
                                className="px-3 py-1 text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg transition-colors"
                              >
                                Request Changes
                              </button>
                              <button
                                onClick={() =>
                                  handleStatusChange(
                                    del.id,
                                    'Approved',
                                    'Client signed off on final cut!'
                                  )
                                }
                                className="px-3 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors"
                              >
                                Approve Deliverable
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Threaded Comments & Inline Feedback */}
                      <div className="bg-slate-50/70 rounded-lg p-3 space-y-2.5">
                        <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                          Version Feedback & Discussion ({del.comments.length})
                        </span>

                        {del.comments.map((comm) => (
                          <div key={comm.id} className="flex items-start gap-2.5 text-xs">
                            <img
                              src={comm.avatar}
                              alt={comm.author}
                              className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 mt-0.5"
                            />
                            <div className="flex-1 bg-white p-2 rounded-lg border border-slate-200 space-y-0.5">
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-800">{comm.author}</span>
                                <span className="text-[10px] text-slate-400">{comm.timestamp}</span>
                              </div>
                              <p className="text-slate-600">{comm.text}</p>
                            </div>
                          </div>
                        ))}

                        {/* Add Comment Input */}
                        <div className="flex items-center gap-2 pt-1">
                          <input
                            type="text"
                            placeholder="Add timestamped note (e.g., Adjust pacing at 0:45)..."
                            value={commentInputs[del.id] || ''}
                            onChange={(e) =>
                              setCommentInputs({
                                ...commentInputs,
                                [del.id]: e.target.value,
                              })
                            }
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleAddComment(del.id);
                            }}
                            className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs focus:outline-none focus:border-indigo-500"
                          />
                          <button
                            onClick={() => handleAddComment(del.id)}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md text-xs font-bold transition-colors"
                          >
                            Post
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* TAB 2: AUDIT ACTIVITY LOG */}
          {activeTab === 'activity' && (
            <div className="space-y-3">
              {/* Deliverable Quick Filter */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-700">Immutable Audit Trail</span>
                <select
                  value={selectedDeliverableFilter}
                  onChange={(e) => setSelectedDeliverableFilter(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 focus:outline-none font-medium"
                >
                  <option value="all">All Deliverables</option>
                  {project.deliverables.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Log Items Feed */}
              <div className="space-y-2.5">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-white rounded-xl border border-slate-200 text-xs flex items-start justify-between gap-3 shadow-2xs hover:border-slate-300 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{log.person}</span>
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-semibold">
                          {log.role}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            log.badgeType === 'submission'
                              ? 'bg-indigo-50 text-indigo-700'
                              : log.badgeType === 'approval'
                              ? 'bg-emerald-50 text-emerald-700'
                              : log.badgeType === 'changes'
                              ? 'bg-rose-50 text-rose-700'
                              : log.badgeType === 'payment'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-purple-50 text-purple-700'
                          }`}
                        >
                          {log.action}
                        </span>
                      </div>
                      {log.detail && (
                        <p className="text-slate-500 pl-1 italic">{log.detail}</p>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono shrink-0">
                      {log.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Protected by PaidFlow Immutable Scope Audit</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

